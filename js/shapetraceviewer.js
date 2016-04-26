/**
 * Created by sonal on 16-04-25.
 */
// Set up the scene, camera, and renderer as global variables.

    var shptrace = {};


    //var scene, camera, renderer,
    var obj, light;

    var lastMeshMaterial, lastMeshID, lastObjectMaterial, lastObjectID;
    shptrace.fname = 'models/treehouse_logo.js';
    var projector;
    var targetList = [];

    //Sets up the scene
    function init(fname){
        var geometry, material, mesh;
        lastMeshMaterial = -1;
        lastMeshID = -1;
        lastObjectMaterial = -1;
        lastObjectID = -1;

        document.body.style.cssText = 'font: 600 12 pt monospace; margin: 0; overflow: hidden';
        shptrace.info = document.body.appendChild(document.createElement('div'));

        shptrace.info.style.cssText = 'background-color: #ccc; left: 20px; opacity: 0.85; position: absolute; top: 35px;';
        shptrace.info.innerHTML = '<h1>'+document.title + '</h1>'+
            '<div id=msg style=font-size:10pt;padding:8px;></div>';

        shptrace.stats = new Stats();
        shptrace.stats.domElement.style.cssText = 'bottom: 0; position: absolute; left: 0; zIndex:100;';
        document.body.appendChild(shptrace.stats.domElement);

        //Create the webgl renderer and add it to the DOM
        shptrace.renderer = new THREE.WebGLRenderer({alpha: 1,antialias:true, clearColor: 0xffffff});
        shptrace.renderer.setSize(window.innerWidth, window.innerHeight);
        shptrace.renderer.shadowMapEnabled = true;
        document.body.appendChild(shptrace.renderer.domElement);
        shptrace.scene = new THREE.Scene();

        //Create a camera, zoom it out from the model a bit, and add it to the scene.
        shptrace.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,1, 100000); //45 degree angle, aspect ratio, draw distance near, far
        shptrace.camera.position.set(0,0,0);
        shptrace.controls = new THREE.OrbitControls(shptrace.camera,shptrace.renderer.domElement);

        projector = new THREE.Projector();
        document.addEventListener('click',clickHandler,false);


        loadJS(fname);
    }


    //Load function to add it to the scene
    function loadJS(fname){
        alert(fname);
        if (shptrace.scene) shptrace.scene.remove( obj );
        targetlist = [];
        var loader = new THREE.ObjectLoader();
        loader.load( fname, function( result ){
            shptrace.scene = result;

// lights
        shptrace.scene.add( new THREE.AmbientLight( 0x444444 ) );
        updateLight();


// axes
            shptrace.scene.add( new THREE.ArrowHelper( v(1, 0, 0), v(0, 0, 0), 30, 0xcc0000) );
            shptrace.scene.add( new THREE.ArrowHelper( v(0, 1, 0), v(0, 0, 0), 30, 0x00cc00) );
            shptrace.scene.add( new THREE.ArrowHelper( v(0, 0, 1), v(0, 0, 0), 30, 0x0000cc) );

// ground box
            geometry = new THREE.BoxGeometry( 20000, 100, 20000 );
            material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, -10, 0 );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            shptrace.scene.add( mesh );

            //call compute function
            computeNormalsAndFaces();
        });

    }

    function updateLight(){
        if ( light ) {shptrace.scene.remove(light);}
        light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        shptrace.scene.add(light);
    }

    function resetCamera(){
        shptrace.controls.target.set(0,0,0);
        shptrace.camera.position.set(0,1,0);
        shptrace.camera.up = v(0,1,0);
    }

    function v(x,y,z){return new THREE.Vector3(x,y,z);}

    function animate(){
        requestAnimationFrame( animate);
        shptrace.renderer.render(shptrace.scene, shptrace.camera);
        shptrace.controls.update();
        shptrace.stats.update();
    }

    function computeNormalsAndFaces() {
        for(var i=0; i<shptrace.scene.children.length; i++){
            if( shptrace.scene.children[i].hasOwnProperty("geometry")){
                shptrace.scene.children[i].geometry.mergeVertices();
                shptrace.scene.children[i].castShadow = true;
                shptrace.scene.children[i].geometry.computeFaceNormals();
                targetList.push( shptrace.scene.children[i] );
            }
            if( shptrace.scene.children[i].children.length > 0 ){
                for (var k=0; k<shptrace.scene.children[i].children.length ; k++){
                    if(shptrace.scene.children[i].children[k].hasOwnProperty("geometry")){
                        targetList.push(shptrace.scene.children[i].children[k]);
                    }
                }
            }
        }
    }

    var selMaterial;

    function displayAttributes(obj){
        msg.innerHTML = '';
        var arr = Object.keys(obj);
        for (var i = 0, len = arr.length; i < len; i++){
            if ( obj[arr[i]] != undefined) {
                if ( obj[arr[i]].indexOf('http')==0){
                    msg.innerHTML += '<a href="'+obj[arr[i]]+'">Click here</a><br>';
                } else {
                    msg.innerHTML += arr[i] + ': ' + obj[arr[i]]+'<br>';
                }
            }
        }
    }

    function clickHandler(event){
        event.preventDefault();
        selMaterial = new THREE.MeshBasicMaterial({color: 'blue',side:'2'});


        //When clicking without selecting object, replace temp material for meshes and object3D
        if(lastMeshMaterial!=-1)
        {
            //reset last material for last lastMeshID
            for(var i = 0; i < shptrace.scene.children.length;i++)
            {
                if (shptrace.scene.children[i].id == lastMeshID)
                {
                    shptrace.scene.children[i].material = lastMeshMaterial;
                }
            }
        }

        if(lastObjectMaterial!=-1)
        {
            //reset last material for last lastObjectID
            for(var i = 0; i < shptrace.scene.children.length;i++)
            {
                if (shptrace.scene.children[i].id == lastObjectID)
                {
                    for (var ii = 0; ii < shptrace.scene.children[i].children.length;ii++)
                    {
                        shptrace.scene.children[i].children[ii].material = lastObjectMaterial;
                    }

                }
            }
        }


        var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        projector.unprojectVector( vector, shptrace.camera );

        var raycaster = new THREE.Raycaster( shptrace.camera.position, vector.sub( shptrace.camera.position ).normalize() );
        //var raycaster = new THREE.Raycaster( VA3C.camera.position, vector.sub( ).normalize() );

        var intersects = raycaster.intersectObjects( targetList );
        //var intersects = raycaster.intersectObjects( VA3C.scene.children.geometry );

        if ( intersects.length > 0 ) {

            //   intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
            //console.log(intersects[0].object.userData);

            var j =0;
            while(j<intersects.length){
                //FOR MESHES:
                if(!$.isEmptyObject(intersects[j].object.userData)){
                    console.log(intersects[j].object.userData);


                    if(lastMeshMaterial!=-1)
                    {
                        //reset last material for last lastMeshID
                        for(var i = 0; i < shptrace.scene.children.length;i++)
                        {
                            if (shptrace.scene.children[i].id == lastMeshID)
                            {
                                shptrace.scene.children[i].material = lastMeshMaterial;
                            }
                        }
                    }

                    //set lastMaterial
                    lastMeshMaterial = intersects[j].object.material;

                    //set lastMeshID
                    lastMeshID = intersects[j].object.id;

                    //apply SelMaterial
                    intersects[j].object.material = selMaterial;


                    displayAttributes( intersects[j].object.userData );

                    break;
                }
                //FOR OBJECT3D
                if(!$.isEmptyObject(intersects[j].object.parent.userData)){
                    console.log(intersects[j].object.parent.userData);

                    if(lastObjectMaterial!=-1)
                    {
                        //reset last material for last lastObjectID
                        for(var i = 0; i < shptrace.scene.children.length;i++)
                        {
                            if (shptrace.scene.children[i].id == lastObjectID)
                            {
                                for (var ii = 0; ii < shptrace.scene.children[i].children.length;ii++)
                                {
                                    shptrace.scene.children[i].children[ii].material = lastObjectMaterial;
                                }

                            }
                        }
                    }

                    //set lastMaterial
                    lastObjectMaterial = intersects[j].object.material;

                    //set lastObjectID
                    lastObjectID = intersects[j].object.parent.id;

                    //apply SelMaterial
                    intersects[j].object.material = selMaterial;

                    displayAttributes( intersects[j].object.parent.userData );
                    break;
                }
                j++;
            }

        } else {
            msg.innerHTML = '';
        }
    }


