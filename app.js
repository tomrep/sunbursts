//  DEFINE ALL USED VARIABLES NEED IN FUNCTIONS
// WEBGL
var scene, renderer, camera, controls;
// WINDOW
var height, widht;
// USER VARIABLES
var data, default_level, root;
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
    camera = new THREE.PerspectiveCamera(
        75,
        width / height,
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

    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

// helper function to assign color to elements
function getColor(type) {
    if(type === 1){
        return 0xff0000;
    } else if (type === 2) {
        return 0xedff2d
    } else if (type === 3) {
        return 0x18af1d
    } else if( type === 4) {
        return 0x9e1284
    } else if( type === 5) {
        return 0x848484
    } else {
        return 0x00ff00;
    }
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

// main function to create all objects
function loadObjects() {

    const link = 'screen.png';

    root = $.grep(data, function (file) {
        return file.level === default_level
    });
    
    // createText(root);
    
    var circleG = new THREE.CircleGeometry(30, 64,64);
    var mesh = new THREE.Mesh(circleG, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    scene.add(mesh);

    for(j = 0; j < 1; j++) {

        var layer = $.grep(data, function (file) {
            return file.level === default_level + 1 + j
        });

        var file_count =  layer.reduce((value, file) => value + file.count, 0);
        var rotation = 0;
        var start_angle = 0;
        var end_angle = 0;
        var inRad = 30;
        var outRad = 50;
        for (i = 0; i < 6; i++) {

            var countP = layer[i].count / file_count;           
            angle = Math.PI*2*countP - 0.02;
            var size = Math.round(layer[i].size/(1024*1024));

            // OUTER CYLINDER
            var cylinderGeometry = new THREE.CylinderGeometry(outRad, outRad, size, 32, 32,false, start_angle, angle);
            var cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            var cylinderBSP = new ThreeBSP(cylinderMesh);    

            // INNER CYLINDER
            cylinderGeometry = new THREE.CylinderGeometry(inRad, inRad, size, 32, 32,false, start_angle, angle);
            cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            var cylinderBSPIn = new ThreeBSP(cylinderMesh);

            var finalBSP = cylinderBSP.subtract(cylinderBSPIn);

            // SIDES
            var planeGeometry = new THREE.PlaneGeometry(500, 500);
            var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })); 
            planeMesh.rotation.y = Math.PI/2 + start_angle;
            var planeBSP = new ThreeBSP(planeMesh);

            finalBSP = finalBSP.subtract(planeBSP);
            var material = new THREE.MeshBasicMaterial( { color: getColor(i), side: THREE.DoubleSide } );
            var final = finalBSP.toMesh( material );
            final.rotation.x = Math.PI/2;
            final.position.z = -1*size/2;
            scene.add(final);

            start_angle += angle + 0.02;
        }
    }
    camera.position.z = 300;
}

// rendering fuction
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

    loadData();

    loadScene();
    loadListeners();
    loadObjects();
    loadFunctions();

    loop();
}