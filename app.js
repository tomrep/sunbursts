//  DEFINE ALL USED VARIABLES NEED IN FUNCTIONS
// WEBGL
var scene, renderer, camera, controls, raycaster, mouse;
// WINDOW
var height, width;
// USER VARIABLES
var data, filtered_data, default_level, root_path, previous_paths,previous_levels, objects, intersected, layout, max_level, clicked;
// FUNCTIONS
var update, render, loop;

// SUGGESTIONS

// David: pouzi extrude shape, svetlo aby bolo vidno lepsie ked to otacam

//  -------------------------------------------------------------------------------------------

// function to load data form DataSet
function loadData() {
    $.ajax({
        url: 'data.json',
        dataType: 'json',
        async: false,
        success: function(json) {
            data = json;
        }
    });
}

// fucntion to load scene, camera and renderer
function loadScene() {
    width = window.innerWidth;
    height = window.innerHeight;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        - width / 2,
        width / 2,
        - height / 2,
        height / 2,
        0.1,
        1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
}

// function to add listeners and controls
function loadListeners() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('resize', function() {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener( 'mousemove', onHover, false);
    window.addEventListener( 'mousedown', onClick, false);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

//build filter menu function
function addFilterOptions() {

    var first = $('#filterBy');
    var value = first[0].value;
    var div = $('#addOptions');
    div.empty();
    var html;
    if( value !== "") {
        switch(value) {
            case "time":
                html = `<div class="form-group">
                        <input type="date" id="date" class="form-control">
                        <label class="radio-inline"><input type="radio" id="min" name="optradio">Min</label>
                        <label class="radio-inline"><input type="radio" id="max" name="optradio">Max</label>
                        </div>
                        <button type="button" class="btn btn-default" onclick="filter()">Filter</button>`;
                div.append(html);
                break;
            case "type":
                html = `<div class="form-group">
                        <select class="form-control" id="typeFilter">
                            <option value="Audio">Audio</option>
                            <option value="Text">Text</option>
                            <option value="Code">Code</option>
                            <option value="Picture">Pictures</option>
                            <option value="Video">Video</option>
                            <option value="Other">Other</option>
                        </select>
                        </div>
                        <button type="button" class="btn btn-default" onclick="filter()">Filter</button>`;
                div.append(html);
                break;
            case "size":
            case "count":
                html = `<div class="form-group">
                        <input type="number" id="num" class="form-control">
                        <label class="radio-inline"><input type="radio" id="min" name="optradio">Min</label>
                        <label class="radio-inline"><input type="radio" id="max" name="optradio">Max</label>
                        </div>
                        <button type="button" class="btn btn-default" onclick="filter()">Filter</button>`;
                div.append(html);
        }
    }
}

function filter() {

    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }

    var value = $("#filterBy")[0].value;
    var thresh;
    var min = $('#min').is(':checked');
    switch(value){
        case "time":
            thresh = $("#date")[0].value;
            if(min){
                filtered_data = data.filter(file => file.ctime >= thresh);
            } else {
                filtered_data = data.filter(file => file.ctime <= thresh);
            }
            break;
        case "type":
            thresh = $("#typeFilter")[0].value;
            filtered_data = data.filter(file => file.type === thresh || file.type === "Directory");
            break;
        case "count":
            thresh = $("#num")[0].value;
            if(min){
                filtered_data = data.filter(file => file.count >= thresh);
            } else {
                filtered_data = data.filter(file => file.count <= thresh);
            }
            break;
        case "size":
            thresh = $("#num")[0].value;
            if(min){
                filtered_data = data.filter(file => file.size >= thresh);
            } else {
                filtered_data = data.filter(file => file.size <= thresh);
            }
    }

    loadObjects();
}
function changeLayout() {

    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    var value = $("#viewType")[0].value;
    switch(value) {
        case "1":
            layout = 1;
            break;
        case "2":
            layout = 2;
            break;
        case "3":
            layout = 3;
            break;
    }
    loadObjects();
}
function onClick(event){

    var type = event.button;
    if(type === 0) {
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            var info = intersects[0].object.info;
            if(info.clicked !== true){
                var div = $('#popups');
                // var length =  $('#popups > div').length;
                // if( length > 3) {
                //     $('#popups').find('div:first').remove();
                // }
                div.append(`<div class="well well-sm popup" style="top:${event.clientY};left:${event.clientX}">${info.name}</div>`);
                info.clicked = true;
            } else {
                    if(info.type === "Directory") {
                    var div = $('#popups');
                    div.empty();
                    while (scene.children.length > 0) {
                        scene.remove(scene.children[0]);
                    }
                    previous_paths.push(root_path);
                    previous_levels.push(default_level);
                    default_level = info.level;
                    root_path = info.path;
                    loadObjects();
                }
            }
        }
    } else {
        if(previous_paths.length !== 0){
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
            root_path = previous_paths.pop();
            default_level = previous_levels.pop();
            loadObjects();
        }
    }
}
// helper function to create onHover text

function onHover(event) {

    event.preventDefault();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    var div = $('#details');
    div.empty();
    if ( intersects.length > 0 ) {
        if(intersected !== intersects[0]) {
            intersected = intersects[0];
            var info = intersects[0].object.info;
            var date = new Date(info.ctime);
            var ctime = date.toLocaleString();
            date = new Date(info.mtime);
            var mtime = date.toLocaleString();

            div.append(`<div class="well well-sm details">
            <ul class="list-group">
                <li>Name: ${info.name}</li>
                <li>Type: ${info.type}</li>
                <li>Size: ${Math.round(info.size * 100 / (1024 * 1024)) / 100} MB</li>
                <li>Create time: ${ctime}</li>
                <li>Modify time: ${mtime}</li>
                <li># of files: ${info.count}</li>
            </ul>
        </div>`);
        }
    }
}

function changeLayers() {
    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    max_level = $("#maxLvl")[0].value;
    loadObjects();
}

// helper function to assign color to elements
function getColor(type) {

    if(type === "Directory") {
        return 0x5191f7
    } else if (type === 'Text') {
        return 0xf7db50
    } else if (type === 'Code') {
        return 0xa0f74f
    } else if (type === 'Video') {
        return 0xf74fd2
    } else if (type === 'Audio') {
        return 0xce1e1e
    } else if (type === 'Picture') {
        return 0xd8d8d6
    } else {
        return 0x353535
    }
}

function getColorHeat(p) {
    var r = Math.floor(0xff*p).toString(16);
    var g = Math.floor(0xff*(1-p)).toString(16);
    if(r.length === 1)
        r = '0' + r;
    if(g.length === 1)
        g = '0' + g;
    var result = '0x' + r + g + '00';
    return parseInt(result, 16);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// main function to create all objects
function loadObjects() {

    objects = [];
    var tmp = filtered_data.filter(file => file.path === root_path);
    var root = tmp[0];
    root.startAngle = 0;
    root.endAngle = Math.PI*2;
    root.rendered = true;

    var i,j;
    var outRad;
    for(i = 0; i < max_level; i++) {
        var inRad = 30 + i * 20 + 5;
        outRad = 50 + i * 20;
        var layer_roots = filtered_data.filter(file => file.level === default_level + i && file.path.includes(root_path) && file.type === "Directory");
        for (j = 0; j < layer_roots.length; j++) {
            if(layer_roots[j].rendered){
                var layer_path = layer_roots[j].path;
                var startAngle = layer_roots[j].startAngle;
                var endAngle = layer_roots[j].endAngle;
                var layer = filtered_data.filter(file => file.level === default_level + 1 + i && file.path.includes(layer_path));
                if (layout === 1) {
                    renderWithCount(layer, outRad, inRad, startAngle, endAngle);
                } else if (layout === 2) {
                    renderWithSize(layer, outRad, inRad, startAngle, endAngle);
                } else {
                    renderWithHeat(layer, outRad, inRad, startAngle, endAngle);
                }
            }
        }
    }
    var circleGeometry = new THREE.CircleGeometry(outRad, 64,64);
    var mesh = new THREE.Mesh(circleGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
    mesh.position.z = - 0.2;
    scene.add(mesh);
    camera.position.z = 200;
}
function renderWithCount(layer, outRad, inRad, startAngle, endAngle) {
    var k;
    var start = startAngle;
    var file_count = layer.reduce((value, file) => value + file.count, 0);
    for (k = 0; k < layer.length; k++) {
        var countP = layer[k].count / file_count;
        if (countP > 0.01) {
            var angle = (endAngle - startAngle) * countP - 0.02;
            var size = Math.round(layer[k].size / (1024 * 1024));

            layer[k].startAngle = start;
            layer[k].endAngle = start + angle;
            layer[k].rendered = true;

            // OUTER CYLINDER
            var cylinderGeometry = new THREE.CylinderGeometry(outRad, outRad, size, 32, 32, false, start, angle);
            var cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            }));
            var cylinderBSP = new ThreeBSP(cylinderMesh);

            // INNER CYLINDER
            cylinderGeometry = new THREE.CylinderGeometry(inRad, inRad, size, 32, 32, false, start, angle);
            cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            }));
            var cylinderBSPIn = new ThreeBSP(cylinderMesh);

            var finalBSP = cylinderBSP.subtract(cylinderBSPIn);

            // // SIDES
            // var planeGeometry = new THREE.PlaneGeometry(5000, 5000);
            // var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            // planeMesh.rotation.y = Math.PI/2 + start;
            // var planeBSP = new ThreeBSP(planeMesh);

            // finalBSP = finalBSP.subtract(planeBSP);
            var material = new THREE.MeshBasicMaterial({color: getColor(layer[k].type), side: THREE.DoubleSide});
            var final = finalBSP.toMesh(material);
            final.rotation.x = Math.PI / 2;
            final.position.z = -1 * size / 2;
            final.info = layer[k];
            scene.add(final);
            objects.push(final);
            start += angle + 0.02;
        } else {
            layer[k].renderer = false;
        }
    }
}

function renderWithSize(layer, outRad, inRad, startAngle, endAngle){
    var start = startAngle;
    var k;
    var file_size = layer.reduce((value, file) => value + file.size, 0);

    for (k = 0; k < layer.length; k++) {
        var sizeP = layer[k].size / file_size;
        if(sizeP > 0.01){
            var angle = (endAngle - startAngle)*sizeP - 0.02;
            var count =layer[k].count;

            layer[k].startAngle = start;
            layer[k].endAngle = start + angle;
            layer[k].rendered = true;
            // OUTER CYLINDER
            var cylinderGeometry = new THREE.CylinderGeometry(outRad, outRad, count, 32, 32,false, start, angle);
            var cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            var cylinderBSP = new ThreeBSP(cylinderMesh);

            // INNER CYLINDER
            cylinderGeometry = new THREE.CylinderGeometry(inRad, inRad, count, 32, 32,false, start, angle);
            cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            var cylinderBSPIn = new ThreeBSP(cylinderMesh);

            var finalBSP = cylinderBSP.subtract(cylinderBSPIn);

            // // SIDES
            // var planeGeometry = new THREE.PlaneGeometry(5000, 5000);
            // var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            // planeMesh.rotation.y = Math.PI/2 + start;
            // var planeBSP = new ThreeBSP(planeMesh);

            // finalBSP = finalBSP.subtract(planeBSP);
            var material = new THREE.MeshBasicMaterial( { color: getColor(layer[k].type), side: THREE.DoubleSide } );
            var final = finalBSP.toMesh( material );
            final.rotation.x = Math.PI/2;
            final.position.z = -1*count/2;
            final.info = layer[k];
            scene.add(final);
            objects.push(final);
            start += angle + 0.02;

        } else {
            layer[k].rendered = false;
        }
    }
}

function renderWithHeat(layer, outRad, inRad, startAngle, endAngle) {
    var k;
    var start = startAngle;
    var file_count = layer.reduce((value, file) => value + file.count, 0);
    var file_size = layer.reduce((value, file) => value + file.size, 0);
    for (k = 0; k < layer.length; k++) {
        var countP = layer[k].count / file_count;
        var sizeP = layer[k].size / file_size;
        if (countP > 0.01) {
            var angle = (endAngle - startAngle) * countP - 0.02;
            var size = Math.round(layer[k].size / (1024 * 1024));

            layer[k].startAngle = start;
            layer[k].endAngle = start + angle;
            layer[k].rendered = true;

            // OUTER CYLINDER
            var cylinderGeometry = new THREE.CylinderGeometry(outRad, outRad, 1, 32, 32, false, start, angle);
            var cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            }));
            var cylinderBSP = new ThreeBSP(cylinderMesh);

            // INNER CYLINDER
            cylinderGeometry = new THREE.CylinderGeometry(inRad, inRad, 1, 32, 32, false, start, angle);
            cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            }));
            var cylinderBSPIn = new ThreeBSP(cylinderMesh);

            var finalBSP = cylinderBSP.subtract(cylinderBSPIn);

            // // SIDES
            // var planeGeometry = new THREE.PlaneGeometry(5000, 5000);
            // var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            // planeMesh.rotation.y = Math.PI/2 + start;
            // var planeBSP = new ThreeBSP(planeMesh);

            // finalBSP = finalBSP.subtract(planeBSP);
            var material = new THREE.MeshBasicMaterial({color: getColorHeat(sizeP), side: THREE.DoubleSide});
            var final = finalBSP.toMesh(material);
            final.rotation.x = Math.PI / 2;
            final.position.z = -1 * 1 / 2;
            final.info = layer[k];
            scene.add(final);
            objects.push(final);
            start += angle + 0.02;
        } else {
            layer[k].renderer = false;
        }
    }
}
// rendering function
function loadFunctions() {

    update = function () {

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


// INITIALIZATION
function initialize(){

    default_level = 4;
    previous_paths = [];
    previous_levels = [];
    max_level = 2;
    root_path = "C:\\Users\\Pipi\\Desktop\\Skola\\";
    layout = 1;

    loadData();
    filtered_data = data;
    loadScene();
    loadListeners();
    loadObjects();
    loadFunctions();

    loop();
}