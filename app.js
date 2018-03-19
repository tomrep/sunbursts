 let scene, camera, height, width, renderer, controls;
 let rotation;
 let cube;
 let update,render,loop;

 function loadScene() {
    width = window.innerWidth;
    height = window.innerHeight;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
}

function loadListeners() {

    window.addEventListener('resize', function() {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    window.addEventListener('mousedown', function(event) {
        rotation = false;
    });
    window.addEventListener('mouseup', function(event) {        
        rotation = true;       
    });

    controls = new THREE.OrbitControls(camera, renderer.domElement);
}
function loadObjects() {
    const link = 'https://static.pexels.com/photos/242616/pexels-photo-242616.jpeg'
    // const link = 'data/image1.png'
    let geometry = new THREE.CubeGeometry(5, 5, 5);

    let materials = [
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
        })
    ];
    // let material = new THREE.MeshFaceMaterial(materials);
    // let material = new THREE.MeshBasicMaterial(
    //     {
    //         color: 0xFF00FF
    //     });
    cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    camera.position.z = 2;
}

function loadFunctions() {

    update = function () {
        if(rotation) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.005;
        } else {
            cube.rotation.x += 0;
            cube.rotation.y += 0;
        }
        
    };

    render = function () {
        renderer.render(scene, camera);
    };

    loop = function () {
        requestAnimationFrame(loop);

        update();
        render();
    }
}    

function initialize(){
    rotation = true;
    loadScene();
    loadListeners();
    loadObjects();
    loadFunctions()

    loop();
    
}