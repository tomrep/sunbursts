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
        url: '../python/data.json',
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
    text += 'Size : '+ size + 'MB\n';
    if (file.type === 'Directory')
        text += 'Number of files : ' + file[0].count;

    var textGeometry;
    var loader = new THREE.FontLoader();
    loader.load( 'fonts/helvetiker_bold.typeface.json', function (font) {
        textGeometry= new THREE.TextGeometry( text, {
            font: font,
            size: 0.3,
            height: 0,
            curveSegments: 36
        });
        var material = new THREE.MeshBasicMaterial( {
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(textGeometry, material);
        mesh.position.x = -3;
        mesh.position.y = 1.5;
        mesh.position.z = 0;
        scene.add(mesh);
    });
}

// main function to create all objects
function loadObjects() {

    const link = 'screen.png';

    root = $.grep(data, function (file) {
        return file.level === default_level
    });
    
    createText(root);

    // var cubeGeo = new THREE.CubeGeometry(7, 5, 0);
    // var material = [
    //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}),
    //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}),
    //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}),
    //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}),
    //     new THREE.MeshBasicMaterial({
    //                 map: new THREE.TextureLoader().load(link), side: THREE.DoubleSide
    //             }),
    //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0})
    // ];

    // var mesh = new THREE.Mesh(cubeGeo, material);
    // mesh.position.z = -0.7;
    // scene.add(mesh);

    for(j = 0; j < 1; j++) {

        var layer = $.grep(data, function (file) {
            return file.level === default_level + 1 + j
        });

        var file_count =  layer.reduce((value, file) => value + file.count, 0);
        var rotation = 0;
        var start_angle = 0;
        var end_angle = 0;

        for (i = 0; i < layer.length; i++) {

            var countP = layer[i].count / file_count;
            end_angle = start_angle + Math.PI * 2 * countP;

            var size = Math.round(layer[i].size/(1024*1024));

            var arcShape = new THREE.Shape();
            arcShape.moveTo( 0, 0 );
            arcShape.absarc( 0, 0, 7, start_angle, end_angle, true );
            
            var holePath = new THREE.Path();
            holePath.moveTo( 0, 0 );
            holePath.absarc( 0, 0, 5, start_angle, end_angle, true );
            arcShape.holes.push( holePath );
            
            var extrudeSettings = { curveSegments: 50, amount: size, bevelEnabled: false};
            
            geometry = new THREE.ExtrudeGeometry( arcShape, extrudeSettings );
            
            var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: getColor(layer[i].type) }) );
            mesh.position.z = i;
            scene.add(mesh);
            
            start_angle = end_angle;
            // torus( polomer vnutra, polomer trubky, ako kruhove je vnutro, ako kruhova je trubka, kolko stupnov
            // var geometry = new THREE.TorusGeometry(5, 0.2, 50, 100, angle - 0.01);
            // var color = getColor(layer[i].type);
            // material = new THREE.MeshBasicMaterial( {
            //         color: color,
            //         side: THREE.DoubleSide
            // });
            // var torus = new THREE.Mesh(geometry, material);
            // torus.position.z = j;
            // torus.rotation.z = rotation;
            // scene.add(torus);
        }
    }
 

    //----------------------------------
    // TOTO JE POUZITELNE
    // var arcShape = new THREE.Shape();
    // arcShape.moveTo( 50, 10 );
    // arcShape.absarc( 10, 10, 40, 0, Math.PI * 2, false );
    //
    // var holePath = new THREE.Path();
    // holePath.moveTo( 20, 10 );
    // holePath.absarc( 10, 10, 10, 0, Math.PI * 2, true );
    // arcShape.holes.push( holePath );
    //
    // var extrudeSettings = { amount: 0, bevelEnabled: false};
    //
    // geometry = new THREE.ExtrudeGeometry( arcShape, extrudeSettings );
    //
    // var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: 0xffffff }) );
    // mesh.position.z = 5;
    // scene.add(mesh);
    //---------------------------------------


    // arcShape.autoClose = true;
    // var holePath = new THREE.Path();
    // holePath.moveTo( 20, 10 );
    // holePath.absarc( 10, 10, 10, 0, Math.PI * 2, true );
    //
    // var circleRadius = 2;
    // var circleShape = new THREE.Shape();
    // circleShape.moveTo( 0, circleRadius );
    // circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
    // circleShape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius );
    // circleShape.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 );
    // circleShape.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );
    //
    // var points = arcShape.getPoints();
    // var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    //
    // var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 3 } ) );
    // scene.add(line);
    // points = holePath.getPoints();
    // geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 3 } ) );
    // scene.add(line);


    camera.position.z = 10;
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