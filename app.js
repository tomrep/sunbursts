function loadScene() {
    
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000);
    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial(
        {
            color: 0xFF00FF,
            wireframe: false
        });
    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 3;
    let update = function () {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.005;
    };

    let render = function () {
        renderer.render(scene, camera);
    };

    let GameLoop = function () {
        requestAnimationFrame(GameLoop);

        update();
        render();
    }

    GameLoop();
}