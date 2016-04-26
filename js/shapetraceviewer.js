    /**
     * Created by sonal on 16-04-25.
     */
    // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer, Stats, obj;
    //Sets up the scene
    function init(path){

        //Create the scene and set the screen size
        scene = new THREE.Scene();
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;

        //Create the webgl renderer and add it to the DOM
        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(WIDTH, HEIGHT);
        document.body.appendChild(renderer.domElement);

        //Create a camera, zoom it out from the model a bit, and add it to the scene.
        camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT,0.1, 20000); //45 degree angle, aspect ratio, draw distance near, far
        camera.position.set(0,6,0);
        scene.add(camera);

        //Create an event listener that resizes the renderer with the browser window
        window.addEventListener('resize', function(){
            var WIDTH = window.innerWidth,
                HEIGHT = window.innerHeight;
            renderer.setSize(WIDTH, HEIGHT);
            camera.aspect = WIDTH / HEIGHT;
            camera.updateProjectionMatrix();
        });

        // set background color of the scene
        renderer.setClearColor(0xffffff, 1);

        //Create a light, set its position, and add it to the scene
        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        light.position.set(-100,200,100);
        scene.add(light);

        //loadJS('models/stairs_blender.json');
        // Add OrbitControls so that we can pan around with the mouse
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        loadJS(path);
    }

    function animate(){
        //request the animation
        requestAnimationFrame(animate);

        //render the scene
        renderer.render(scene,camera);
        controls.update();
    }

    //Load function to add it to the scene
    function loadJS(path){
        if (scene) removeLastObj();
        var loader = new THREE.JSONLoader();
        loader.load(path, function (geometry){
            var material = new THREE.MeshLambertMaterial({color: 0x55B663});
            mesh = new THREE.Mesh(geometry,material);
            scene.add(mesh);
        });
        animate();
    }

    function clearObj(){
        var l = scene.children.length;
        while(l--) {
            if (scene.children[l] instanceof THREE.Camera) continue;
            scene.remove(scene.children[l]);
        }
    }

    function removeLastObj(){
        var allChildren = scene.children;
        var lastObject = allChildren[allChildren.length-1];
        if (lastObject instanceof THREE.Mesh){
            scene.remove(lastObject);

        }
    }