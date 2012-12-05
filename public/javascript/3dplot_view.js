// Simple Pareto front view

var camera, scene, renderer, controls, intersector;
var projector, plane, cube;
var mouse2D, mouse3D, ray,
    rollOveredFace, isShiftDown = false,
    theta = 45, isCtrlDown = false;

var rollOverMesh, rollOverMaterial;
var voxelPosition = new THREE.Vector3(),
    tmpVec = new THREE.Vector3();
var particles = new THREE.Geometry();

var i;
var radius = 71;
var voxels = new Array();

// add navigation and container
var container        = document.getElementById( 'front' );
var info             = document.createElement( 'div' );
info.style.top       = '10px';
info.style.width     = '100%';
info.style.textAlign = 'center';
info.innerHTML  = '<a href="javascript:redraw();">redraw</a>';
info.innerHTML += ' | <a href="javascript:save();return false;">save png</a>';
info.innerHTML += ' | split view';
container.appendChild( info );

// and draw data with default numbers
init();
animate();


function redraw() {

    scene.remove(parts);
    delete particles;
    particles = new THREE.Geometry();
    delete parts;

    // load voxels from file
    loadVoxels();

    attributes = {
      //size: { type: 'f', value: [] },
      //customColor: { type: 'c', value: [] }
    };

    uniforms = {
      color:     { type: "c", value: new THREE.Color( 0xffffff ) },
      texture:   { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "spark1.png" ) },
    };

    vShader = [
      "void main() {",
        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "gl_PointSize = 40.0 * ( 300.0 / length( mvPosition.xyz ) );",
        "gl_Position = projectionMatrix * mvPosition;",
      "}"
    ];
    fShader =  [
      "uniform vec3 color;",
      "uniform sampler2D texture;",

      "void main() {",
        "gl_FragColor = vec4( color, 1.0 );",
        "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
      "}"
    ];

    var shaderMaterial = new THREE.ShaderMaterial( {
      uniforms:       uniforms,
      attributes:     attributes,
      depthTest:      false,
      transparent:    true,
      vertexShader:   vShader.join('\n'),
      fragmentShader: fShader.join('\n')
    });

    parts = new THREE.ParticleSystem( particles, shaderMaterial );
    scene.add(parts);
}


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 50, 1e7 );
    camera.position.z = radius * 7;
    scene.add( camera );

    // picking
    projector = new THREE.Projector();


    // grid
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ),
        new THREE.MeshBasicMaterial( { color: 0xff6600, opacity:0.2, transparent: true, wireframe: true } ) );
    scene.add( plane );

    plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ),
        new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity:0.2, transparent: true, wireframe: true } ) );
    plane.rotation.x += Math.PI/2;
    scene.add( plane );

    plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ),
        new THREE.MeshBasicMaterial( { color: 0xff0000, opacity:0.2, tansparent: true, wireframe: true } ) );
    plane.rotation.z += Math.PI/2;
    scene.add( plane );


    // load voxels from file
    loadVoxels();

    attributes = {
      //size: { type: 'f', value: [] },
      //customColor: { type: 'c', value: [] }
    };

    uniforms = {
      color:     { type: "c", value: new THREE.Color( 0xffffff ) },
      texture:   { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "spark1.png" ) },
    };

    vShader = [
      "void main() {",
        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "gl_PointSize = 40.0 * ( 300.0 / length( mvPosition.xyz ) );",
        "gl_Position = projectionMatrix * mvPosition;",
      "}"
    ];
    fShader =  [
      "uniform vec3 color;",
      "uniform sampler2D texture;",

      "void main() {",
        "gl_FragColor = vec4( color, 1.0 );",
        "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
      "}"
    ];

    var shaderMaterial = new THREE.ShaderMaterial( {
      uniforms:       uniforms,
      attributes:     attributes,
      depthTest:      false,
      transparent:    true,
      vertexShader:   vShader.join('\n'),
      fragmentShader: fShader.join('\n')
    });

    parts = new THREE.ParticleSystem( particles, shaderMaterial );
    scene.add(parts);



    mouse2D = new THREE.Vector3( 0, 10000, 0.5 );


    // Lights
    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );


    renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer : true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );



    //FIXME: use composer?
    //var renderModel       = new THREE.RenderPass( scene, camera );
    //var visibilityPass    = new VisibilityPass();
    //var ewaPass           = new EWAPass();
    //var normalizationPass = new normalizationPass();

    //composer = new THREE.EffectComposer( renderer );

    //composer.addPass( renderModel );
    //composer.addPass( visibilityPass );
    //composer.addPass( ewaPass );
    //composer.addPass( normalizationPass );



    controls = new THREE.TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.2;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = radius * 1.0;
    controls.maxDistance = radius * 150;

    controls.keys = [ 16, 83, 17 ]; //[ rotateKey, zoomKey, panKey ]

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    //container.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'dblclick', onDocumentMouseDblClick, false );
}


function animate() {

    requestAnimationFrame(animate);
    render();
}

function render() {

    //ray = projector.pickingRay( mouse2D.clone(), camera );
    //var intersects = ray.intersectObjects( scene.children );

    //if(intersects.length > 0) {

        //intersector = getRealIntersector( intersects );
        //if(intersector) {

            //console.log(intersector);

            ////setVoxelPosition( intersector );
            //////rollOverMesh.position = voxelPosition;

        //}

    //}

    controls.update()
    renderer.clear();
    renderer.render( scene, camera );
}


function save() {
    window.open( renderer.domElement.toDataURL('image/png'), 'mywindow' );
}



// loading point data from table
function loadVoxels() {

    var x_col = parseInt(document.getElementById('x_data_col').value);
    var y_col = parseInt(document.getElementById('y_data_col').value);
    var z_col = parseInt(document.getElementById('z_data_col').value);

    var x_factor = parseFloat(document.getElementById('x_scale_factor').value);
    var y_factor = parseFloat(document.getElementById('y_scale_factor').value);
    var z_factor = parseFloat(document.getElementById('z_scale_factor').value);

    var x_limit = [1e9, -1e9];
    var y_limit = [1e9, -1e9];
    var z_limit = [1e9, -1e9];

    pareto_data_tbl = document.getElementById('paretoData');
    for (var i = 1, row; row = pareto_data_tbl.rows[i]; i++) {

        var x = parseFloat(row.cells[x_col].innerText);
        var y = parseFloat(row.cells[y_col].innerText);
        var z = parseFloat(row.cells[z_col].innerText);

        x_limit[0] = Math.min(x, x_limit[0]);
        x_limit[1] = Math.max(x, x_limit[1]);
        y_limit[0] = Math.min(y, y_limit[0]);
        y_limit[1] = Math.max(y, y_limit[1]);
        z_limit[0] = Math.min(z, z_limit[0]);
        z_limit[1] = Math.max(z, z_limit[1]);
    }

    pareto_data_tbl = document.getElementById('paretoData');
    for (var i = 1, row; row = pareto_data_tbl.rows[i]; i++) {

        var x = parseFloat(row.cells[x_col].innerText);
        var y = parseFloat(row.cells[y_col].innerText);
        var z = parseFloat(row.cells[z_col].innerText);

        x = 50.0 * (x - x_limit[0]) / (x_limit[1] - x_limit[0]) * x_factor;
        y = 50.0 * (y - y_limit[0]) / (y_limit[1] - y_limit[0]) * y_factor;
        z = 50.0 * (z - z_limit[0]) / (z_limit[1] - z_limit[0]) * z_factor;

        addVoxel(new THREE.Vector3(x, y, z));
    }
}


function addVoxel( pos ) {

    var vertex = new THREE.Vector3();
    vertex.x = pos.x;
    vertex.y = pos.y;
    vertex.z = pos.z;

    particles.vertices.push(vertex);
}


function getRealIntersector( intersects ) {

    for( i = 0; i < intersects.length; i++ ) {

        intersector = intersects[ i ];
        if ( intersector.object != rollOverMesh ) {
            return intersector;
        }
    }

    return null;
}


function onDocumentMouseMove( event ) {

    //event.preventDefault();

    mouse2D.x =   ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function onDocumentMouseDblClick(event) {

    ray = projector.pickingRay(mouse2D.clone(), camera);

    var intersects = getIntersection(ray);
    console.log(intersects);

    // threejs intersector does not work with particle systems
    //var intersects = ray.intersectObjects(scene.children);
    //if ( intersects.length > 0 ) {
        //intersector = getRealIntersector(intersects);
        //console.log(intersector);
    //}
}


function getIntersection(ray){

    var closest_point = false;
    var point_dist    = 1e9;

    var orig = vec3.createFrom(ray.origin.x, ray.origin.y, ray.origin.z);
    var dir  = vec3.createFrom(ray.direction.x, ray.direction.y, ray.origin.z);

    for(var j=0; j < parts.geometry.vertices.length; j++) {

          var tmp   = parts.geometry.vertices[j];
          var point = vec3.createFrom(tmp.x, tmp.y, tmp.z);

          var d1 = vec3.createFrom(0.0, 0.0, 0.0);
          var d2 = vec3.createFrom(0.0, 0.0, 0.0);
          vec3.subtract(point, orig, d1);
          vec3.subtract(point, dir,  d2);
          vec3.cross(d1, d2);

          var dist = vec3.length(d1) / vec3.length(dir);

          if(point_dist > dist){
              point_dist    = dist;
              closest_point = point;
          }
    }

    return closest_point;
}




//XXX: Unoptimized version from Zicker et. al. paper
//function EWASplatting() {

    ////FIXME
    //var WVkWt = mat3.create();

    //for( i = 0; i < voxels.length; i++ ) {

        ////FIXME apply_viewing_transformation(voxels[i]); to go to ray
        ////space
        //var tk = vec3.create(0,0,0);

        //// evaluate_Jacobian
        //var l = vec3.norm(voxels[i]);
        //var tksq = tk[2]*tk[2];
        //var jacobian = mat3.create(
            //1/tk[2], 0      , -tk[0]/tksq,
            //0      , 1/tk[2], -tk[1]/tksq,
            //tk[0]/l, tk[1]/l, tk[2]/l
        //);

        //var Vk = mat3.create();
        //var jacobian_transposed = mat3.create();
        //mat3.multiply(jacobian, WVkWt, Vk);
        //mat3.transpose(jacobian, jacobian_transposed);
        //mat3.multiply(Vk, jacobian_transposed, Vk);

        ////FIXME: project tk from camera to screen coords -> x_k
        //var xk = vec3.create(tk[0]/tk[2], tk[1]/tk[2], 0.0);

        ////FIXME: setup resampling filter rho_k
        //var det_jac =  0.0;
        //mat3.inverse(jacobian, jacobian);
        //mat3.determinant(jacobian, det_jac);
        //det_jac = 1.0 / det_jac;

        //var Mk = mat3.createFrom(Vk);
        //Mk[1] += 1; Mk[2] = 0.0;
        //Mk[4] += 1; Mk[5] = 0.0;
        //Mk[6] = Mk[7] = Mk[8] = 0.0;



        ////FIXME: rasterize and accumulate rho_k

    //}
//}

