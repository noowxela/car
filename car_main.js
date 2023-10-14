import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

var camera, cameraControls;
var scene, renderer;

let dirLight, spotLight;
let dirLight2, dirLight3, dirLight4;
let torusKnot, cube;
let dirLightShadowMapViewer, spotLightShadowMapViewer;

var matStdObjects = new THREE.MeshStandardMaterial({
  color: 0xA00000,
  roughness: 0,
  metalness: 0
});

var settings = {
  'cameraRotate': false,
  'body': 9,
  'glass': 0,
  'carbody': matStdObjects.color.getHex(),
  'carglass': matStdObjects.color.getHex(),
  'opacity': 0.3,
  'isMeshPhysicalMaterial': false,
  'clearCoat': 1.000,
  'clearCoatRoughness': 0.520,
  'reflectivity': 0.428,
  'roughness': 0.485,
  'metalness': 0.660,
  'shininess': 0.660,
  'envMap_01': false,

  'tire_roughness': 0.485,
  'tire_metalness': 0.660,
  'rims_roughness': 0.485,
  'rims_metalness': 0.660,

  'front_bulb_roughness': 0.485,
  'front_bulb_metalness': 0.660,
  'bulub_black_roughness': 0.485,
  'bulub_black_metalness': 0.660,
  'front_bulb_opacity': 0.660,
  'front_bulb_opacity': 0.660,

  'front_bulb_gray': matStdObjects.color.getHex(),
  'front_bulb_gray_type': 0,
  'envMapIntensity': 1,
  'refractionRatio': 1,
};;

// var cartire;

var carModel, materialsLib;
var envMap_01, envMap_02;

var dirLightHeper, hemiLight, hemiLightHelper;
// var lightHolder = new THREE.Group();


// var car = new THREE.Car();
// car.turningRadius = 75;
// var wholecar = new THREE.Group();
// var typeee = new THREE.Group();


var bodyMatSelect = document.getElementById('body-mat');
var rimMatSelect = document.getElementById('rim-mat');
var glassMatSelect = document.getElementById('glass-mat');

var carParts = {
  body: [],
  black_part: [],
  side_logo: [],
  side_nameplate_insise: [],
  side_nameplate_plus: [],
  side_nameplate_word: [],
  interior: [],
  interior_handle: [],
  sliver: [],
  side: [],
  gray: [],

  glass: [],
  side_signal_glass: [],
  front_glass: [],
  back_glass: [],

  front_bulb: [],
  front_bulb_gray: [],
  front_bulb_inside_black: [],
  bulub_black: [],
  signal_red: [],
  signal_white_base: [],



  mirror: [],

  tire: [],
  rims: [],

  floor: [],
  etc: [],
  cartire: [],
};

var clock = new THREE.Clock();
var stats;


var rgb;


init();
animate();

function init() {

  const container = document.createElement('div');
  document.body.appendChild(container);

  stats = new Stats();
  container.appendChild(stats.dom);

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.appendChild(renderer.domElement);

  const environment = new RoomEnvironment(renderer);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);


  // // SCENE
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xbbbbbb);
  // scene.background = new THREE.Color(0xffffff);
  scene.environment = pmremGenerator.fromScene(environment).texture;



  // initscence();
  // initlight();


  // CAMERA
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 80000);
  camera.position.set(-400, 300.0, 800);

  // CONTROLS
  cameraControls = new OrbitControls(camera, renderer.domElement);


  initMaterials();
  setupGui();


  // const loader = new GLTFLoader();

  // const url = "https://github.com/noowxela/car/raw/master/models/gltf/mer55.glb";
  // const url = "https://noowxela.github.io/car/models/mer55.glb";
  // const url = "https://github.com/noowxela/car/blob/master/models/mer55.glb";
  // const url = "https://raw.githubusercontent.com/noowxela/car/master/models/mer55.glb";
  // const url = "https://drive.google.com/uc?export=download&id=1QUZjqiFhgMM7SQUdiMf8HMTAyo-zxVQO";
  // const url = "https://github.com/noowxela/noowxela.github.io/car/master/models/gltf/mer55.glb";
  // const url = "models/gltf/mer55.glb";

  // model
  // loader.load(url, function(gltf) {
  const loader = new GLTFLoader().setPath('models/');
    
  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);

  loader.load('mer55_test1.gltf', function(gltf) {
  // loader.load('mer55.glb', function(gltf) {

    carModel = gltf.scene.children[0];

    carModel.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.envMap = envMap_01;
      }
    });
    console.log("carModel : ", carModel)
    console.log("carModel.position : ", carModel.position)
    scene.add(carModel);


    carParts.body.push(
      carModel.getObjectByName('body_01'),
      carModel.getObjectByName('body_02'),
      carModel.getObjectByName('body_03'),
      carModel.getObjectByName('body_04'),
      carModel.getObjectByName('body_05'),
      carModel.getObjectByName('body_06'),
      carModel.getObjectByName('body_07'),
      carModel.getObjectByName('body_08'),
      carModel.getObjectByName('body_09'),
      carModel.getObjectByName('body_10'),
      carModel.getObjectByName('body_11'),
      carModel.getObjectByName('body_12'),
      carModel.getObjectByName('body_13'),
      carModel.getObjectByName('body_14'),
      carModel.getObjectByName('Exterior_side_hander'),
      carModel.getObjectByName('Exterior_back_01'),
      carModel.getObjectByName('Exterior_side_03'),
      carModel.getObjectByName('Exterior_front_03'),

    );

    carParts.side_logo.push(

      carModel.getObjectByName('Exterior_side_logo'),


    );

    carParts.side_nameplate_word.push(

      carModel.getObjectByName('nameplate_v8'),
      carModel.getObjectByName('nameplate_BITURBO'),
      carModel.getObjectByName('nameplate_boader'),
      carModel.getObjectByName('nameplate_4matic'),

      carModel.getObjectByName('nameplate_v009'),
      carModel.getObjectByName('nameplate_BITURBO001'),
      carModel.getObjectByName('nameplate_4matic001'),
      carModel.getObjectByName('nameplate_boader001'),


    );

    carParts.side_nameplate_plus.push(

      carModel.getObjectByName('nameplate_+001'),
      carModel.getObjectByName('nameplate_+'),


    );

    carParts.side_nameplate_insise.push(

      carModel.getObjectByName('nameplate_inside'),
      carModel.getObjectByName('nameplate_inside001'),


    );

    carParts.black_part.push(
      carModel.getObjectByName('Exterior_front_01'),
      carModel.getObjectByName('Exterior_front_02'),
      carModel.getObjectByName('Exterior_front_04'),
      carModel.getObjectByName('Exterior_front_06'),
      carModel.getObjectByName('Exterior_front_09'),
      carModel.getObjectByName('Exterior_front_11'),
      carModel.getObjectByName('Exterior_front_13'),
      carModel.getObjectByName('Exterior_front_14'),
      carModel.getObjectByName('Exterior_front_16'),
      carModel.getObjectByName('Exterior_front_17'),
      carModel.getObjectByName('Exterior_front_18'),
      carModel.getObjectByName('Exterior_front_19'),
      carModel.getObjectByName('Exterior_front_20'),
      carModel.getObjectByName('Exterior_front_21'),
      carModel.getObjectByName('Exterior_front_22'),
      carModel.getObjectByName('Exterior_front_27'),
      carModel.getObjectByName('Exterior_front_28'),
      carModel.getObjectByName('Exterior_front_logo03'),

      carModel.getObjectByName('Exterior_back_lower_01'),
      carModel.getObjectByName('Exterior_back_lower_02'),
      carModel.getObjectByName('Exterior_back_lower_03'),
      carModel.getObjectByName('Exterior_back_lower_04'),
      carModel.getObjectByName('Exterior_back_lower_05'),
      carModel.getObjectByName('Exterior_back_lower_06'),
      carModel.getObjectByName('Exterior_plate_02'),
      carModel.getObjectByName('Exterior_plate_03'),
      carModel.getObjectByName('Exterior_plate_01'),

      carModel.getObjectByName('Exterior_side_01'),


      // near the bulb got a thing  ## unkown usessage but real car got it

      // shoule de gray be lazy liao
      carModel.getObjectByName('Exterior_side_signal'),

      // shoulde be check agian
      carModel.getObjectByName('Exterior_back_red_011'),
      carModel.getObjectByName('Exterior_back_red_021'),
      carModel.getObjectByName('Exterior_back_red_031'),
      carModel.getObjectByName('Exterior_back_red_041'),

    );



    carParts.front_bulb_inside_black.push(
      carModel.getObjectByName('Exterior_front_bulb_004'),
      carModel.getObjectByName('Exterior_front_bulb_002'),

    )

    carParts.interior.push(
      carModel.getObjectByName('Interior_01'),
      carModel.getObjectByName('Interior_02'),
      carModel.getObjectByName('Interior_03'),
      carModel.getObjectByName('Interior_04'),
      carModel.getObjectByName('Interior_05'),
      carModel.getObjectByName('Interior_06'),
      carModel.getObjectByName('Interior_07'),
      carModel.getObjectByName('Interior_08'),
      carModel.getObjectByName('Interior_09'),
      carModel.getObjectByName('steering_wheel'),
      carModel.getObjectByName('Interior_11'),
      carModel.getObjectByName('Interior_12'),
      carModel.getObjectByName('Interior_13'),
      // carModel.getObjectByName( '' ),

      // carModel.getObjectByName( 'Line001' ),
      // carModel.getObjectByName( 'Line002' ),


    );
    // carParts.interior_handle.push(
    // 	carModel.getObjectByName( 'sadlife_button' ),
    // 	carModel.getObjectByName( 'sadlife_buttei' ),
    // 	carModel.getObjectByName( 'sadlife__line01' ),
    // 	carModel.getObjectByName( 'sadcircle' ),
    // 	carModel.getObjectByName( 'sadllifeset' ),
    // 	carModel.getObjectByName( '' ),
    // 	carModel.getObjectByName( 'sadcircle001' ),
    // 	carModel.getObjectByName( 'sadlife__line002' ),

    // 	carModel.getObjectByName( 'sadlife_button001' ),
    // 	carModel.getObjectByName( 'sadllifeset001' ),
    // 	carModel.getObjectByName( '' ),
    // 	carModel.getObjectByName( '' ),
    // 	carModel.getObjectByName( '' ),


    // );


    carParts.side.push(
      carModel.getObjectByName('Exterior_side_07'),
      carModel.getObjectByName('Exterior_side_02'),
      carModel.getObjectByName('Exterior_side_04'),
      carModel.getObjectByName('Exterior_side_05'),
      carModel.getObjectByName('Exterior_side_06'),

    );




    carParts.sliver.push(
      carModel.getObjectByName('Exterior_front_logo01'),
      carModel.getObjectByName('Exterior_front_logo02'),
      carModel.getObjectByName('Exterior_back_logo_01'),
      carModel.getObjectByName('Exterior_back_logo_02'),
      carModel.getObjectByName('tire_logo_01'),
      carModel.getObjectByName('tire_logo_02'),
      carModel.getObjectByName('tire_logo_03'),
      carModel.getObjectByName('tire_logo_04'),
      carModel.getObjectByName('Exterior_front_silver_05'),
      // carModel.getObjectByName( 'tire_brakedisk_01' ),
      // carModel.getObjectByName( 'tire_brakedisk_02' ),
      // carModel.getObjectByName( 'tire_brakedisk_03' ),
      // carModel.getObjectByName( 'tire_brakedisk_04' ),
      // carModel.getObjectByName( 'tire_brakedisk_05' ),
      // carModel.getObjectByName( 'tire_brakedisk_06' ),
      // carModel.getObjectByName( 'tire_brakedisk_07' ),
      // carModel.getObjectByName( 'tire_brakedisk_08' ),
    );

    carParts.mirror.push(
      carModel.getObjectByName('Exterior_side_mirror'),

    );


    carParts.glass.push(
      carModel.getObjectByName('Exterior_glass_01'),
      carModel.getObjectByName('Exterior_glass_02'),
      carModel.getObjectByName('Exterior_glass_03'),
    );

    carParts.front_glass.push(
      carModel.getObjectByName('Exterior_front_glass_01'),
      carModel.getObjectByName('Exterior_front_glass_02'),

      // cincaila , need change de
      carModel.getObjectByName('Exterior_side_glass_01'),

    );
    carParts.front_bulb.push(

      carModel.getObjectByName('Exterior_back_glass_04'),

      // ##need eject de,but lazy liao

    );
    carParts.front_bulb_gray.push(
      carModel.getObjectByName('Exterior_front_bulb_00'),
      carModel.getObjectByName('Exterior_front_bulb_001'),


      // ##need eject de,but lazy liao

    );
    carParts.bulub_black.push(
      carModel.getObjectByName('Exterior_front_bulb_005'),
      carModel.getObjectByName('Exterior_front_bulb_006'),
      carModel.getObjectByName('Exterior_front_bulb_007'),

    );

    carParts.back_glass.push(
      carModel.getObjectByName('Exterior_back_glass_01'),

    );

    carParts.signal_red.push(
      carModel.getObjectByName('Exterior_back_red_02'),
      carModel.getObjectByName('Exterior_back_red_011'),
      carModel.getObjectByName('Exterior_back_red_021'),

    );
    carParts.signal_white_base.push(
      carModel.getObjectByName('Exterior_front_bulb_003'),

      carModel.getObjectByName('Exterior_back_red_01'),
      carModel.getObjectByName('Exterior_back_04'),
    );



    carParts.tire.push(
      carModel.getObjectByName('tire_01'),
      carModel.getObjectByName('tire_02'),
      carModel.getObjectByName('tire_03'),
      carModel.getObjectByName('tire_04'),

    );

    carParts.rims.push(
      carModel.getObjectByName('tire_rims_01'),
      carModel.getObjectByName('tire_rims_02'),
      carModel.getObjectByName('tire_rims_03'),
      carModel.getObjectByName('tire_rims_04'),
      carModel.getObjectByName('tire_rims_c_01'),
      carModel.getObjectByName('tire_rims_c_02'),
      carModel.getObjectByName('tire_rims_c_03'),
      carModel.getObjectByName('tire_rims_c_04'),
      carModel.getObjectByName('silver_01'),
      carModel.getObjectByName('silver_02'),
      carModel.getObjectByName('silver_03'),
      carModel.getObjectByName('silver_04'),
    );

    carParts.cartire.push(
      carModel.getObjectByName('wheel_fl'),
      carModel.getObjectByName('wheel_fr'),
      carModel.getObjectByName('wheel_rl'),
      carModel.getObjectByName('wheel_rr'),

    );

    carParts.etc.push(
      carModel.getObjectByName('black_m_18'),
      carModel.getObjectByName('black_m_19'),
      carModel.getObjectByName('black_m_30'),
      carModel.getObjectByName('black_m_20'),
      carModel.getObjectByName('black_m_21'),
      carModel.getObjectByName('black_m_29'),
      carModel.getObjectByName('black_m_05'),
      carModel.getObjectByName('black_m_06'),
      carModel.getObjectByName('black_m_09'),
      carModel.getObjectByName('black_m_04'),
      carModel.getObjectByName('black_m_07'),
      carModel.getObjectByName('black_m_10'),
      carModel.getObjectByName('tire_brakedisk_01'),
      carModel.getObjectByName('tire_brakedisk_02'),
      carModel.getObjectByName('tire_brakedisk_03'),
      carModel.getObjectByName('tire_brakedisk_04'),
      carModel.getObjectByName('tire_brakedisk_05'),
      carModel.getObjectByName('tire_brakedisk_06'),
      carModel.getObjectByName('tire_brakedisk_07'),
      carModel.getObjectByName('tire_brakedisk_08'),

      carModel.getObjectByName('tire_caliper_01'),
      carModel.getObjectByName('tire_caliper_02'),
      carModel.getObjectByName('tire_caliper_03'),
      carModel.getObjectByName('tire_caliper_04'),
    );


    // carParts.floor.push(
    //   carModel.getObjectByName('StuioBG'),

    // );

    updateMaterials();

  });

  window.addEventListener('resize', onWindowResize);


}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

  requestAnimationFrame(animate);

  cameraControls.update(); // required if damping enabled

  render();

}

function render() {

  renderer.render(scene, camera);
  stats.update();

  if (settings.cameraRotate) {
    const delta = clock.getDelta();

    if (carModel !== undefined) {

      carModel.rotation.y += delta * 0.5;

    }

  }


}

function initscence() {
  // SCENE
  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0x9b9a9d );
  // scene.fog = new THREE.Fog( 0x9b9a9d, 500, 10000 );

  // scene.background = new THREE.Color( 0xffffff );
  // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
  // scene.background = new THREE.Fog( 0xffffff, 1, 80 );

  // envMap_01 = new THREE.CubeTextureLoader()
  //   .setPath('textures/cube/skyboxsun25deg02/')
  //   .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

  // scene.background = envMap_01;

  // var ground = new THREE.Mesh(
  //   new THREE.PlaneBufferGeometry(2400, 2400),
  //   new THREE.ShadowMaterial({
  //     color: 0x000000,
  //     opacity: 0.15,
  //     depthWrite: false
  //   }));

  // ground.rotation.x = -Math.PI / 2;
  // ground.receiveShadow = true;
  // ground.renderOrder = 1;
  // scene.add( ground );

  // grid
  var grid = new THREE.GridHelper(400, 40, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  // scene.add( grid );


  var floorMat = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: 0xffffff,
    metalness: 0.2,
    bumpScale: 0.0005
  });



  var qui1floor = new THREE.TextureLoader();

  qui1floor.load("textures/concrete_floor.jpg", function(map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(10, 24);
    floorMat.map = map;
    floorMat.needsUpdate = true;
  });



  // var floorGeometry = new THREE.PlaneBufferGeometry(20, 20);
  // var floorMesh = new THREE.Mesh(floorGeometry, floorMat);
  // floorMesh.receiveShadow = true;
  // floorMesh.rotation.x = -Math.PI / 2.0;
  // floorMesh.position.set(0, 0.01, 0);
  // // scene.add( floorMesh );


}

function initlight() {
  // Lights
  scene.add(new THREE.AmbientLight(0x404040, 3));

  dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.name = 'Dir. Light';
  dirLight.position.set(0, 10, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

  dirLight2 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight2.name = 'Dir. Light';
  dirLight2.position.set(10, 10, 0);
  dirLight2.castShadow = true;
  dirLight2.shadow.camera.near = 1;
  dirLight2.shadow.camera.far = 10;
  dirLight2.shadow.camera.right = 15;
  dirLight2.shadow.camera.left = -15;
  dirLight2.shadow.camera.top = 15;
  dirLight2.shadow.camera.bottom = -15;
  dirLight2.shadow.mapSize.width = 1024;
  dirLight2.shadow.mapSize.height = 1024;
  scene.add(dirLight2);

  scene.add(new THREE.CameraHelper(dirLight2.shadow.camera));

  dirLight3 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight3.name = 'Dir. Light';
  dirLight3.position.set(10, 10, 10);
  dirLight3.castShadow = true;
  dirLight3.shadow.camera.near = 1;
  dirLight3.shadow.camera.far = 10;
  dirLight3.shadow.camera.right = 15;
  dirLight3.shadow.camera.left = -15;
  dirLight3.shadow.camera.top = 15;
  dirLight3.shadow.camera.bottom = -15;
  dirLight3.shadow.mapSize.width = 1024;
  dirLight3.shadow.mapSize.height = 1024;
  scene.add(dirLight3);

  scene.add(new THREE.CameraHelper(dirLight3.shadow.camera));

  dirLight4 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight4.name = 'Dir. Light';
  dirLight4.position.set(-10, -10, -10);
  dirLight4.castShadow = true;
  dirLight4.shadow.camera.near = 1;
  dirLight4.shadow.camera.far = 10;
  dirLight4.shadow.camera.right = 15;
  dirLight4.shadow.camera.left = -15;
  dirLight4.shadow.camera.top = 15;
  dirLight4.shadow.camera.bottom = -15;
  dirLight4.shadow.mapSize.width = 1024;
  dirLight4.shadow.mapSize.height = 1024;
  scene.add(dirLight4);

  scene.add(new THREE.CameraHelper(dirLight4.shadow.camera));



}


function initMaterials() {

  materialsLib = {

    main: [

      new THREE.MeshPhongMaterial({
        name: 'Phong_orange',
        color: 0xff4400,
        // envMap: envMap_01
      }),
      new THREE.MeshPhongMaterial({
        name: 'metallic',
        color: 0x555555,
        // envMap: envMap_01,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'result_one',
        color: 0x141414,
        // envMap: envMap_01,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'standby',
        color: 0x8c5c5c,
        // envMap: envMap_01,
        specular: 0xffffff
      }),


      new THREE.MeshPhongMaterial({
        name: '4_client_red_1',
        color: 0x990000,
        // envMap: envMap_01,
        reflectivity: 0.8,
        specular: 0xd7d7d7
      }),
      new THREE.MeshPhongMaterial({
        name: '_client_red_2',
        color: 0x990000,
        specular: 0xffffff
      }),
      new THREE.MeshPhysicalMaterial({
        name: '6_client_red_01',
        color: 0x990000,
        reflectivity: 100.43,
        metalness: 0.66,
        roughness: 0.38
      }),
      new THREE.MeshPhysicalMaterial({
        name: '_client_red_02',
        color: 0x990000,
        reflectivity: 0.2,
        metalness: 0.66,
        roughness: 0.38
      }),
      new THREE.MeshPhysicalMaterial({
        name: '_phy_red',
        color: 0x990000,
        reflectivity: 0.428,
        metalness: 0.66,
        roughness: 0.485
      }),
      new THREE.MeshStandardMaterial({
        name: '9_stan_red',
        color: 0xe61922,
        // envMap: envMap_01,
        metalness: 0.6,
        roughness: 0.2
      }),
      //personal like// new THREE.MeshStandardMaterial( { name: '9_stan_red' 		, color: 0x990000 	, envMap: envMap_01 , metalness: 1, roughness: 0.2 } ),

      new THREE.MeshPhongMaterial({
        name: '10_client_blue_1',
        color: 0x0,
        emissive: 0x40934,
        // envMap: envMap_01,
        reflectivity: 1.0,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_blue_2',
        color: 0x60641,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_blue_3',
        color: 0x001166,
        // envMap: envMap_01
      }),
      new THREE.MeshPhongMaterial({
        name: 'bb',
        color: 0x3a4f85,
        // envMap: envMap_01
      }),
      // new THREE.MeshPhysicalMaterial( { name: 'bbb' 					, color: 0x0d2767 	, envMap: envMap_01 } ),
      new THREE.MeshPhysicalMaterial({
        name: 'bbb',
        color: 0x000d55,
        // envMap: envMap_01
      }),

      new THREE.MeshPhongMaterial({
        name: '15_client_black_1',
        color: 0x0,
        // envMap: envMap_01,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_black_2',
        color: 0x0,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_black_3',
        color: 0x0,
        specular: 0xffffff
      }),

      new THREE.MeshPhongMaterial({
        name: '18_client_white_1',
        color: 0xffffff,
        // envMap: envMap_01,
        reflectivity: 0.6,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_white_3',
        color: 0xffffff,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshStandardMaterial({
        name: 'client_white_4',
        color: 0xffffff,
        // envMap: envMap_01
      }),

      new THREE.MeshPhongMaterial({
        name: 'client_sliver_0',
        color: 0xffffff,
        // envMap: envMap_01,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_sliver_1',
        color: 0xc0c0c0,
        // envMap: envMap_01,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_sliver_2',
        color: 0xc0c0c0,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_sliver_3',
        color: 0xACAEA9,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_sliver_4',
        color: 0xbfc0be,
        // envMap: envMap_01,
        reflectivity: 0.5,
        specular: 0xffffff
      }),
      new THREE.MeshPhongMaterial({
        name: 'client_sliver_5',
        color: 0xc0c0c0,
        specular: 0xffffff
      }),

    ],

    black_part: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.8,
        name: 'black'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        name: 'black'
      }),

    ],

    interior: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.47,
        name: 'black'
      }),

    ],
    interior_handle: [
      new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'silver'
      }),

    ],

    side: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        envMapIntensity: 2.0,
        roughness: 0.1,
        metalness: 0.8,
        name: 'black'
      }),

    ],
    side_logo: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 0.6,
        roughness: 0.2
      }),

    ],
    side_nameplate_insise: [
      new THREE.MeshStandardMaterial({
        color: 0x101010,
        // envMap: envMap_01,
        metalness: 0.6,
        roughness: 0.2
      }),

    ],
    side_nameplate_plus: [
      new THREE.MeshStandardMaterial({
        color: 0xa40000,
        // envMap: envMap_01,
        metalness: 0.6,
        roughness: 0.2
      }),

    ],
    side_nameplate_word: [
      new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        // envMap: envMap_01,
        metalness: 0.6,
        roughness: 0.2
      }),

    ],

    sliver: [
      new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        // envMap: envMap_01,
        metalness: 0.7,
        roughness: 0.1,
        name: 'silver'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        metalness: 0.7,
        roughness: 0.1,
        name: 'silver'
      }),

    ],

    mirror: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        envMapIntensity: 2.0,
        metalness: 1,
        roughness: 0,
        name: 'black'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.3,
        opacity: 0.3,
        reflectivity: 0.8,
        name: 'clear'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xff4400,
        // envMap: envMap_01,
        metalness: 0.8,
        roughness: 0.2,
        name: 'orange'
      }),

    ],

    glass: [

      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 0.50,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 0.75,
        transparent: true,
        premultipliedAlpha: true,
        name: 'smoked'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x001133,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 0.75,
        transparent: true,
        premultipliedAlpha: true,
        name: 'blue'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x001133,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0,
        opacity: 0.80,
        transparent: true,
        envMapIntensity: 3,
        name: 'IX-T40'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x001133,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0,
        opacity: 0.60,
        transparent: true,
        envMapIntensity: 3,
        name: 'IX-T70'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        opacity: 0.41,
        transparent: true,
        name: 'TR60'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x141414,
        // envMap: envMap_01,
        opacity: 0.95,
        transparent: true,
        name: 'CS-R05'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x141414,
        // envMap: envMap_01,
        opacity: 0.50,
        transparent: true,
        name: 'CS-R50'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x141414,
        // envMap: envMap_01,
        opacity: 0.72,
        transparent: true,
        name: 'CS-R30'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x141414,
        // envMap: envMap_01,
        opacity: 0.81,
        transparent: true,
        name: 'CS-R20'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x888888,
        // envMap: envMap_01,
        opacity: 0.87,
        transparent: true,
        name: 'MX50'
      }),
      new THREE.MeshPhongMaterial({
        color: 0xD3D3D3,
        // envMap: envMap_01,
        opacity: 0.67,
        transparent: true,
        name: 'XC50'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x3936,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0,
        opacity: 0.57,
        transparent: true,
        name: 'test1'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x3936,
        // envMap: envMap_01,
        opacity: 0.57,
        transparent: true,
        name: 'test2'
      }),
      new THREE.MeshBasicMaterial({
        color: 0x3936,
        // envMap: envMap_01,
        opacity: 0.57,
        transparent: true,
        name: 'test3'
      }),

    ],
    front_glass: [

      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.15,
        opacity: 0.25,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),

    ],

    back_glass: [

      new THREE.MeshPhysicalMaterial({
        color: 0x990000,
        // envMap: envMap_01,
        metalness: 1,
        emissive: 0x910000,
        roughness: 0.2,
        opacity: 0.35,
        reflectivity: 0.8,
        transparent: true,
        premultipliedAlpha: true,
        name: 'Dark Red'
      }),

    ],

    front_bulb: [
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.15,
        opacity: 0.50,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.1,
        emissive: 0x910000,
        roughness: 0.4,
        opacity: 0.6,
        reflectivity: 0.8,
        transparent: true,
        premultipliedAlpha: true,
        name: 'Dark Red'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 1.0,
        transparent: true,
        premultipliedAlpha: true,
        name: 'smoked'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 0.75,
        transparent: true,
        premultipliedAlpha: true,
        name: 'blue'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.3,
        opacity: 0.3,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),

    ],

    front_bulb_gray: [
      new THREE.MeshPhongMaterial({
        color: 0x555555,
        // envMap: envMap_01,
        reflectivity: 0,
        specular: 0xffffff,
        opacity: 1,
        transparent: true
      }),
      new THREE.MeshStandardMaterial({
        color: 0x555555,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.15,
        name: 'clear'
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x2f2f2f,
        // envMap: envMap_01,
        metalness: 0.9,
        reflectivity: 1,
        roughness: 0.15,
        name: 'front_bulb_gray'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        // envMap: envMap_01,
        metalness: 0.9,
        roughness: 0.1,
        opacity: 0.50,
        transparent: true,
        premultipliedAlpha: true,
        name: 'clear'
      }),

    ],
    front_bulb_inside_black: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1.0,
        roughness: 0.15,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.8,
        name: 'black'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        name: 'black'
      }),
    ],

    bulub_black: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1.0,
        roughness: 0.0,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.8,
        name: 'black'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        name: 'black'
      }),

    ],

    signal_red: [
      new THREE.MeshStandardMaterial({
        color: 0x990000,
        metalness: 1.0,
        roughness: 0.3,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.8,
        name: 'black'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        name: 'black'
      }),

    ],

    signal_white_base: [
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.3,
        name: 'black'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.8,
        name: 'black'
      }),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        name: 'black'
      }),

    ],


    tire: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        envMapIntensity: 2.0,
        metalness: 0.95,
        roughness: 0.6,
        name: 'black'
      }),

    ],

    rims: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'silver'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'silver'
      }),
      new THREE.MeshStandardMaterial({
        color: 0x555555,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'metallic'
      }),
      new THREE.MeshStandardMaterial({
        color: 0xD3D3D3,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'lightgray'
      }),

    ],


    floor: [
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        name: 'black'
      })
    ],

    etc: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'silver'
      }),
    ],
  }
}

function setupGui() {

  var panel = new GUI();


  var folder1 = panel.addFolder('Body');
  var folder2 = panel.addFolder('Exterior_black');
  var folder3 = panel.addFolder('Interior');
  var folder4 = panel.addFolder('Sliver_logo');
  var folder5 = panel.addFolder('side ');
  var folder6 = panel.addFolder('Miroor');
  var folder7 = panel.addFolder('tayer');
  var folder8 = panel.addFolder('frontbulb');
  var folder9 = panel.addFolder('backbulb');
  var folder10 = panel.addFolder('front_bulb_gray');
  var folder11 = panel.addFolder('front_bulb inside_black');
  var folder12 = panel.addFolder('glass');

  // wanna make a timer in console but fail
  // var r = Date.now() * 0.1;


  // ##bodyfolder##folder1
  {
    folder1.add(settings, 'cameraRotate');

    folder1.add(settings, 'body', {
        // 'Phong_orange': 0,
        // "metallic": 1,
        // "result_one": 2,
        // "standby": 3,
        // "client_red_1": 4,
        // "client_red_2": 5,
        "client_red_01": 6,
        "client_red_02": 7,
        "client_red_03": 8,
        "client_red_001": 9,
        // "client_blue_1": 10,
        // "client_blue_2": 11,
        // "client_blue_3": 12,
        // "bb": 13,
        // "bbb": 14,
        // "client_black_1": 15,
        // "client_black_2": 16,
        // "client_black_3": 17,
        // "client_white_1": 18,
        // "client_white_2": 19,
        "client_white_3_ok": 20,
        // "client_sliver_0": 21,
        // "client_sliver_1": 22,
        // "client_sliver_2": 23,
        // "client_sliver_3": 24,
        // "client_sliver_4": 25,
        // "client_sliver_5": 26,
      })
      .onChange(updateMaterials)

    folder1.addColor(settings, 'carbody').onChange(function(val) {
      console.log("onChange : ", val)
        // way1
      carParts.body.forEach(function(part) {
        part.material.color.setHex(val);
      });


      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;
      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;

      // carParts.body.forEach( function ( part ) { part.material = color; } );

    });

    folder1.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.body.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder1.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.body.forEach(function(part) {
        part.material.metalness = val
      });

    });

    folder1.add(settings, 'isMeshPhysicalMaterial');

    folder1.add(settings, 'envMap_01');

    folder1.close()

  }

  // ##blackfolder##folder2
  {
    folder2.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.black_part.forEach(function(part) { part.material.clearCoat = val });
    });

    folder2.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.black_part.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder2.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.black_part.forEach(function(part) { part.material.reflectivity = val });

    });

    folder2.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.black_part.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder2.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.black_part.forEach(function(part) {
        part.material.metalness = val
      });

    });

    folder2.close()

  }


  // ##Interiorfolder##folder3
  {
    folder3.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.interior.forEach(function(part) { part.material.clearCoat = val });
    });

    folder3.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.interior.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder3.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.interior.forEach(function(part) { part.material.reflectivity = val });

    });

    folder3.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.interior.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder3.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.interior.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder3.close()

  }



  // ##Sliverfolder##folder4
  {
    folder4.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.sliver.forEach(function(part) { part.material.clearCoat = val });
    });

    folder4.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.sliver.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder4.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.sliver.forEach(function(part) { part.material.reflectivity = val });

    });

    folder4.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.sliver.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder4.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.sliver.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder4.close()

  }



  // ##sidefolder##folder5
  {
    folder5.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.side.forEach(function(part) { part.material.clearCoat = val });
    });

    folder5.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.side.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder5.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.side.forEach(function(part) { part.material.reflectivity = val });

    });

    folder5.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.side.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder5.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.side.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder5.close()

  }


  // ##mirrorfolder ##folder6
  {
    folder6.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.mirror.forEach(function(part) { part.material.clearCoat = val });
    });

    folder6.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.mirror.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder6.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.mirror.forEach(function(part) { part.material.reflectivity = val });

    });

    folder6.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.mirror.forEach(function(part) { part.material.roughness = val });

    });

    folder6.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.mirror.forEach(function(part) { part.material.metalness = val });

    });
    folder6.close()

  }


  // ## tayerfolder##folder7
  {
    folder7.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.tire.forEach(function(part) { part.material.clearCoat = val });
    });

    folder7.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.tire.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder7.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.tire.forEach(function(part) { part.material.reflectivity = val });

    });

    folder7.add(settings, 'tire_roughness', 0, 1).onChange(function(val) {
      carParts.tire.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder7.add(settings, 'tire_metalness', 0, 1).onChange(function(val) {
      carParts.tire.forEach(function(part) {
        part.material.metalness = val
      });

    });



    folder7.add(settings, 'rims_roughness', 0, 1).onChange(function(val) {
      carParts.rims.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder7.add(settings, 'rims_metalness', 0, 1).onChange(function(val) {
      carParts.rims.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder7.close()




  }
  // ## frontbulbfolder##folder8
  {
    folder8.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) { part.material.clearCoat = val });
    });

    folder8.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder8.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) { part.material.reflectivity = val });

    });

    folder8.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder8.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) {
        part.material.metalness = val
      });

    });

    folder8.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.front_glass.forEach(function(part) {
        part.material.reflectivity = val
      });

    });




    folder8.add(settings, 'front_bulb_opacity', 0, 1).onChange(function(val) {
      carParts.front_bulb.forEach(function(part) {
        part.material.opacity = val
      });

    });

    folder8.add(settings, 'front_bulb_roughness', 0, 1).onChange(function(val) {
      carParts.front_bulb.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder8.add(settings, 'front_bulb_metalness', 0, 1).onChange(function(val) {
      carParts.front_bulb.forEach(function(part) {
        part.material.metalness = val
      });

    });

    folder8.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.front_bulb.forEach(function(part) {
        part.material.reflectivity = val
      });

    });

    folder8.add(settings, 'bulub_black_roughness', 0, 1).onChange(function(val) {
      carParts.bulub_black.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder8.add(settings, 'bulub_black_metalness', 0, 1).onChange(function(val) {
      carParts.bulub_black.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder8.close()







  }
  // ## baackbulbfolder##folder9
  {
    folder9.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.back_glass.forEach(function(part) { part.material.clearCoat = val });
    });

    folder9.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.back_glass.forEach(function(part) { part.material.clearCoatRoughness = val });

    });

    folder9.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.back_glass.forEach(function(part) { part.material.reflectivity = val });

    });

    folder9.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.back_glass.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder9.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.back_glass.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder9.close()


  }
  // ## front_bulb_gray##folder10
  {

    folder10.add(settings, 'front_bulb_gray_type', {
      'MeshPhongMaterial ': 0,
      "MeshStandardMaterial": 1,
      "MeshPhysicalMaterial": 2,
      "standby": 3,
      "client_red_1": 4,
    })

    .onChange(updateMaterials)

    folder10.addColor(settings, 'front_bulb_gray').onChange(function(val) {
      // way1
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.color.setHex(val);
      });


      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;
      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;

      // carParts.body.forEach( function ( part ) { part.material = color; } );

    });


    folder10.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.clearCoat = val
      });
    });

    folder10.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.clearCoatRoughness = val
      });

    });

    folder10.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.reflectivity = val
      });

    });

    folder10.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder10.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder10.add(settings, 'shininess', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder10.add(settings, 'opacity', 0, 1).onChange(function(val) {
      carParts.front_bulb_gray.forEach(function(part) {
        part.material.opacity = val
      });

    });
    folder10.close()

  }
  // ## front_bulb_inside_black##folder11
  {

    folder11.add(settings, 'front_bulb_gray_type', {
      'MeshPhongMaterial ': 0,
      "MeshStandardMaterial": 1,
      "MeshPhysicalMaterial": 2,
      "standby": 3,
      "client_red_1": 4,
    })

    .onChange(updateMaterials)

    folder11.addColor(settings, 'front_bulb_gray').onChange(function(val) {
      // way1
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.color.setHex(val);
      });


      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;
      // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;

      // carParts.body.forEach( function ( part ) { part.material = color; } );

    });


    folder11.add(settings, 'clearCoat', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.clearCoat = val
      });
    });

    folder11.add(settings, 'clearCoatRoughness', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.clearCoatRoughness = val
      });

    });

    folder11.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.reflectivity = val
      });

    });

    folder11.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder11.add(settings, 'metalness', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder11.add(settings, 'shininess', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.metalness = val
      });

    });
    folder11.add(settings, 'opacity', 0, 1).onChange(function(val) {
      carParts.front_bulb_inside_black.forEach(function(part) {
        part.material.opacity = val
      });

    });
    folder11.close()

  }



  // ##bodyfolder##folder12
  {

    folder12.add(settings, 'glass', {
        'clear': 0,
        'smoked': 1,
        'blue': 2,
        'IX-T40': 3,
        'IX-T70': 4,
        'TR60': 5,
        'CS-R05': 6,
        'CS-R50': 7,
        'CS-R30': 8,
        'CS-R20': 9,
        'MX50': 10,
        'XC50': 11,
      })
      .onChange(updateMaterials)

    folder12.add(settings, 'roughness', 0, 1).onChange(function(val) {
      carParts.glass.forEach(function(part) {
        part.material.roughness = val
      });

    });

    folder12.add(settings, 'envMapIntensity', 0, 50).onChange(function(val) {
      carParts.glass.forEach(function(part) {
        part.material.envMapIntensity = val
      });

    });

    folder12.add(settings, 'opacity', 0, 1).onChange(function(val) {
      carParts.glass.forEach(function(part) {
        part.material.opacity = val
      });

    });

  }



}

function updateMaterials() {
  console.log("settings.body : ", settings.body)
  console.log("settings : ", settings)

  var body_Mat = materialsLib.main[settings.body];
  var black_part_Mat = materialsLib.black_part[0];
  var side_logo_Mat = materialsLib.side_logo[0];

  var side_nameplate_insise_Mat = materialsLib.side_nameplate_insise[0];
  var side_nameplate_plus_Mat = materialsLib.side_nameplate_plus[0];
  var side_nameplate_word_Mat = materialsLib.side_nameplate_word[0];


  var interior_Mat = materialsLib.interior[0];
  var interior_handle_Mat = materialsLib.interior_handle[0];

  var sliver_Mat = materialsLib.sliver[0];
  var side_Mat = materialsLib.side[0];

  var mirror_Mat = materialsLib.mirror[0];

  var glass_Mat = materialsLib.glass[settings.glass];
  var front_glass_Mat = materialsLib.front_glass[0];
  var back_glass_Mat = materialsLib.back_glass[0];

  var front_bulb_Mat = materialsLib.front_bulb[0];
  var front_bulb_gray_Mat = materialsLib.front_bulb_gray[0];
  var front_bulb_inside_black_Mat = materialsLib.front_bulb_inside_black[0];
  var bulub_black_Mat = materialsLib.bulub_black[0];
  var signal_red_Mat = materialsLib.signal_red[0];

  var signal_white_base_Mat = materialsLib.signal_white_base[0];


  var tire_Mat = materialsLib.tire[0];
  var rim_Mat = materialsLib.rims[0];
  var etc_Mat = materialsLib.etc[0];

  var floor_Mat = materialsLib.floor[0];


  carParts.body.forEach(function(part) {
    part.material = body_Mat;
  });
  carParts.black_part.forEach(function(part) {
    part.material = black_part_Mat;
  });
  carParts.side_logo.forEach(function(part) {
    part.material = side_logo_Mat;
  });

  carParts.side_nameplate_insise.forEach(function(part) {
    part.material = side_nameplate_insise_Mat;
  });
  carParts.side_nameplate_plus.forEach(function(part) {
    part.material = side_nameplate_plus_Mat;
  });
  carParts.side_nameplate_word.forEach(function(part) {
    part.material = side_nameplate_word_Mat;
  });



  carParts.interior.forEach(function(part) {
    part.material = interior_Mat;
  });
  carParts.interior_handle.forEach(function(part) {
    part.material = interior_handle_Mat;
  });

  carParts.sliver.forEach(function(part) {
    part.material = sliver_Mat;
  });
  carParts.side.forEach(function(part) {
    part.material = side_Mat;
  });

  carParts.mirror.forEach(function(part) {
    part.material = mirror_Mat;
  });

  carParts.glass.forEach(function(part) {
    part.material = glass_Mat;
  });
  carParts.back_glass.forEach(function(part) {
    part.material = back_glass_Mat;
  });
  carParts.front_glass.forEach(function(part) {
    part.material = front_glass_Mat;
  });

  carParts.front_bulb.forEach(function(part) {
    part.material = front_bulb_Mat;
  });
  carParts.front_bulb_gray.forEach(function(part) {
    part.material = front_bulb_gray_Mat;
  });
  carParts.front_bulb_inside_black.forEach(function(part) {
    part.material = front_bulb_inside_black_Mat;
  });
  carParts.bulub_black.forEach(function(part) {
    part.material = bulub_black_Mat;
  });
  carParts.signal_red.forEach(function(part) {
    part.material = signal_red_Mat;
  });

  carParts.signal_white_base.forEach(function(part) {
    part.material = signal_white_base_Mat;
  });

  carParts.tire.forEach(function(part) {
    part.material = tire_Mat;
  });
  carParts.rims.forEach(function(part) {
    part.material = rim_Mat;
  });
  carParts.etc.forEach(function(part) {
    part.material = etc_Mat;
  });

  carParts.floor.forEach(function(part) {
    part.material = floor_Mat;
  });

}