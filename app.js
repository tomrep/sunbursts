//  DEFINE ALL USED VARIABLES NEED IN FUNCTIONS
// WEBGL
var scene, renderer, camera, controls, raycaster, mouse;
// WINDOW
var height, width;
// USER VARIABLES
var data, filtered_data, default_level, root, root_path, objects, intersected;
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
    // window.addEventListener( 'mousedown', onClick, false);

    

    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function onChange() {

    var first = $('#firstF');
    var value = first[0].value;
    var div = $('#secondF');
    div.empty();
    if( value !== "") {
        switch(value) {
            case "time":
                div.append(`<input type="date"/>
                <p>Min</p><input class="inline"type="checkbox"/> 
                <p class="inline">Max</p><input type="checkbox"/>`);
                break;
            case "type":
                div.append(`<select id="typeF">
                <option value=""></option>
                <option value="Directory">Directory</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="coude">Code</option>
              </select>`);
                break;
            case "size":
            case "count":
                div.append(`<input type="number">
                <p>Min</p><input class="inline"type="checkbox"/> 
                <p class="inline">Max</p><input type="checkbox"/>`);

        }
        div.append(`<a href="#" onClick="filter()">Filter</a>`)
        console.log(value);
    }
}

function filter() {
    value = $("#typeF")[0].value;
    filtered_data = data.filter(file => file.type === value);
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    loadObjects();
}

function onClick(event){
    console.log("hereIam");
    // event.preventDefault();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
        // console.log("hereIam");
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        var info = intersects[0].object.info;
        default_level = info.level;
        objects = [];
        root_path = info.path;
        loadObjects();
    }
}
// helper function to create onHover text

function onHover(event) {

    event.preventDefault();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    var div = $('.main');
    div.empty();
    if ( intersects.length > 0 ) {
        if(intersected !== intersects[0]){
            intersected = intersects[0];
        }

        var info = intersects[0].object.info;
        var date = new Date(info.ctime);
        var ctime = date.toLocaleString();
        date = new Date(info.mtime);
        var mtime = date.toLocaleString();
       
        div.append(`<ul>
            <li>Name: ${info.name}</li>
            <li>Type: ${info.type}</li>
            <li>Path: ${info.path}</li>
            <li>Size: ${Math.round(info.size*100/(1024*1024))/100} MB</li>
            <li>Create time: ${ctime}</li>
            <li>Modify time: ${mtime}</li>
            <li># of files: ${info.count}</li>
        </ul>`);
    }
}

// helper function to assign color to elements
function getColor(type) {

    if(type === "Directory") {
        return 0x22309b
    } else if (type === 'Text') {
        return 0xedff2d
    } else if (type === 'Code') {
        return 0x18af1d
    } else if (type === 'Video') {
        return 0x9e1284
    } else {
        return 0x848484
    }
}

// helper function to create detail text
function createText(file){
    var date;
    var text= '';
    text += 'Name : ' + file[0].name + '\n';
    text += 'Type : ' + file[0].type + '\n';
    date = new Date(file[0].ctime);
    text += 'Created : ' + date.toLocaleString() + '\n';
    date = new Date(file[0].mtime);
    text += 'Modified : ' + date.toLocaleString() + '\n';
    var size = Math.round(file[0].size*100/(1024*1024))/100;
    text += 'Size : '+ size + ' MB\n';
    if (file.type === 'Directory')
        text += 'Number of files : ' + file[0].count;

    var textGeometry;
    var loader = new THREE.FontLoader();
    loader.load( 'fonts/helvetiker_bold.typeface.json', function (font) {
        textGeometry= new THREE.TextGeometry( text, {
            font: font,
            size: 3,
            height: 0,
            curveSegments: 36
        });
        var material = new THREE.MeshBasicMaterial( {
            color: 0x0000ff,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(textGeometry, material);
        mesh.position.x = -20;
        mesh.position.y = 1.5;
        mesh.position.z = 0.1;
        scene.add(mesh);
    });
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

    const link = 'screen.png';

    root = $.grep(filtered_data, function (file) {
        return file.path === root_path
    });

    // createText(root);


    // mesh.info = root[0];
    // objects.push(mesh);
    var i,j;

    for(j = 0; j < 2; j++) {

        var layer = $.grep(filtered_data, function (file) {
            return (file.level === default_level + 1 + j) && (file.path.includes(root_path))
        });

        layer.sort(function(a,b){
            var aText, bText;
            if(a.type === 'Directory'){
                aText = a.path.split('\\');
                aText = aText[aText.length -3];
            } else {
                aText = a.path.split('\\');
                aText = aText[aText.length -2];
            }
            if(b.type === 'Directory'){
                bText = b.path.split('\\');
                bText = bText[bText.length -3];
            } else {
                bText = b.path.split('\\');
                bText = bText[bText.length -2];
            }
            console.log(aText);
            console.log(bText);
            return aText - bText;
        });
        var file_count =  layer.reduce((value, file) => value + file.count, 0);
        console.log(layer.length);
        var rotation = 0;
        var start_angle = 0;
        var end_angle = 0;
        var inRad = 30 + j*20 + 5;
        var outRad = 50 + j*20;
        for (i = 0; i < layer.length; i++) {

            var countP = layer[i].count / file_count;
            var angle = Math.PI*2*countP - 0.02;
            var size = Math.round(layer[i].size/(1024*1024));

            // OUTER CYLINDER
            var cylinderGeometry = new THREE.CylinderGeometry(outRad, outRad, size, 32, 32,false, start_angle, angle);
            var cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            var cylinderBSP = new ThreeBSP(cylinderMesh);

            // INNER CYLINDER
            cylinderGeometry = new THREE.CylinderGeometry(inRad, inRad, size, 32, 32,false, start_angle, angle);
            cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            var cylinderBSPIn = new ThreeBSP(cylinderMesh);

            var finalBSP = cylinderBSP.subtract(cylinderBSPIn);

            // SIDES
            var planeGeometry = new THREE.PlaneGeometry(5000, 5000);
            var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
            planeMesh.rotation.y = Math.PI/2 + start_angle;
            var planeBSP = new ThreeBSP(planeMesh);

            finalBSP = finalBSP.subtract(planeBSP);
            var material = new THREE.MeshBasicMaterial( { color: getRandomColor(), side: THREE.DoubleSide } );
            var final = finalBSP.toMesh( material );
            final.rotation.x = Math.PI/2;
            final.position.z = -1*size/2;
            final.info = layer[i];
            scene.add(final);
            objects.push(final);
            start_angle += angle + 0.02;
        }
    }
    var circleGeometry = new THREE.CircleGeometry(outRad, 64,64);
    var mesh = new THREE.Mesh(circleGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
    mesh.position.z = - 0.2;
    scene.add(mesh);
    camera.position.z = 300;
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
    root_path = "C:\\Users\\Pipi\\Desktop\\Skola\\"
    objects = [];
    
    loadData();
    filtered_data = data;
    loadScene();
    loadListeners();
    loadObjects();
    loadFunctions();

    loop();
}