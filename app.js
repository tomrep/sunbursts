 let scene, camera, height, width, renderer, controls;
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

    controls = new THREE.OrbitControls(camera, renderer.domElement);
}
function loadObjects() {
    let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    let material = new THREE.MeshBasicMaterial(
        {
            color: 0xFF00FF
        });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 40;
}

function loadFunctions() {

    update = function () {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.005;
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
    loadScene();
    loadListeners();
    loadObjects();
    loadFunctions()

    loop();
    
}