import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

var camera, cameraControls;
var scene, renderer;

var matStdObjects = new THREE.MeshStandardMaterial({
  color: 0xA00000,
  roughness: 0,
  metalness: 0
});

var settings = {
  'cameraRotate': false,
  'envMap_01': false,

  'body': 9,
  'carbody': matStdObjects.color.getHex(),

  'glass': 0,
  'carglass': matStdObjects.color.getHex(),
  'opacity': 0.3,
  'isMeshPhysicalMaterial': false,
  'clearCoat': 1.000,
  'clearCoatRoughness': 0.520,
  'reflectivity': 0.428,
  'roughness': 0.485,
  'metalness': 0.660,
  'shininess': 0.660,

  'tire_roughness': 0.3,
  'tire_metalness': 0.0,
  'rims': 0,
  'rims_roughness': 0.2,
  'rims_metalness': 0.4,

  'front_bulb': 0,
  'front_bulb_roughness': 0.485,
  'front_bulb_envMapIntensity': 0.660,
  'front_bulb_opacity': 0.660,

  'front_bulb_gray_color': matStdObjects.color.getHex(),
  'front_bulb_gray_type': 0,
  'envMapIntensity': 1,
  'refractionRatio': 1,
};;

var carModel, materialsLib;
var envMap_01;

// var car = new THREE.Car();
// car.turningRadius = 75;


var bodyMatSelect = document.getElementById('body-mat');
var rimMatSelect = document.getElementById('rim-mat');
var glassMatSelect = document.getElementById('glass-mat');

var carParts = {
  body: [],
  black_part: [],
  interior: [],
  sliver: [],
  side: [],
  mirror: [],
  tire: [],
  rims: [],
  front_bulb: [],
  back_glass: [],
  glass: [],
  etc: [],

  // TODO need check below car part then can combine with carPartsMap
  side_logo: [],
  side_nameplate_insise: [],
  side_nameplate_plus: [],
  side_nameplate_word: [],
  interior_handle: [],
  side_signal_glass: [],
  front_bulb_gray: [],
  signal_red: [],
  signal_white_base: [],
  floor: [],
  cartire: [],
};

var clock = new THREE.Clock();
var stats;

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
  scene.environment = pmremGenerator.fromScene(environment).texture;


  // CAMERA
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 80000);
  camera.position.set(-400, 300.0, 800);

  // CONTROLS
  cameraControls = new OrbitControls(camera, renderer.domElement);


  initMaterials();
  setupGui();

  // model
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


      // shoule de gray be lazy liao
      // TODO need check
      carModel.getObjectByName('Exterior_side_signal'),
      // shoulde be check agian
      carModel.getObjectByName('Exterior_back_red_011'),
      carModel.getObjectByName('Exterior_back_red_021'),
      carModel.getObjectByName('Exterior_back_red_031'),
      carModel.getObjectByName('Exterior_back_red_041'),

    );

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

    carParts.side.push(
      carModel.getObjectByName('Exterior_side_07'),
      carModel.getObjectByName('Exterior_side_02'),
      carModel.getObjectByName('Exterior_side_04'),
      carModel.getObjectByName('Exterior_side_05'),
      carModel.getObjectByName('Exterior_side_06'),

    );

    carParts.mirror.push(
      carModel.getObjectByName('Exterior_side_mirror'),

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

    // carParts.cartire.push(
    //   carModel.getObjectByName('wheel_fl'),
    //   carModel.getObjectByName('wheel_fr'),
    //   carModel.getObjectByName('wheel_rl'),
    //   carModel.getObjectByName('wheel_rr'),

    // );

    carParts.front_bulb.push(

      carModel.getObjectByName('Exterior_front_glass_01'),
      carModel.getObjectByName('Exterior_front_glass_02'),

      // need sepearte it
      carModel.getObjectByName('Exterior_side_glass_01'),
    );


    carParts.back_glass.push(
      carModel.getObjectByName('Exterior_back_glass_01'),

      carModel.getObjectByName('Exterior_back_glass_04'),

    );

    carParts.front_bulb_gray.push(
      carModel.getObjectByName('Exterior_front_bulb_00'),
      carModel.getObjectByName('Exterior_front_bulb_001'),

      carModel.getObjectByName('Exterior_front_bulb_002'),
      carModel.getObjectByName('Exterior_front_bulb_004'),

      carModel.getObjectByName('Exterior_front_bulb_005'),
      carModel.getObjectByName('Exterior_front_bulb_006'),
      carModel.getObjectByName('Exterior_front_bulb_007'),


    );

    carParts.glass.push(
      carModel.getObjectByName('Exterior_glass_01'),
      carModel.getObjectByName('Exterior_glass_02'),
      carModel.getObjectByName('Exterior_glass_03'),
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

    // TODO   below carpart need check
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

function initMaterials() {

  materialsLib = {

    body: [

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

    tire: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        envMapIntensity: 2.0,
        roughness: settings.tire_roughness,
        metalness: settings.tire_metalness,
        name: 'black'
      }),

    ],

    rims: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        roughness: settings.rims_roughness,
        metalness: settings.rims_metalness,
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

    front_bulb: [
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

    front_bulb_gray: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1.0,
        roughness: 0.15,
        name: 'black'
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

    etc: [
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        // envMap: envMap_01,
        metalness: 1.0,
        roughness: 0.2,
        name: 'silver'
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

    floor: [
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        name: 'black'
      })
    ],

  }
}

function setupGui() {

  var panel = new GUI();

  const folders = {
    'Body': carParts.body,
    'Exterior_black': carParts.black_part,
    'Interior': carParts.interior,
    'Sliver_logo': carParts.sliver,
    'Side': carParts.side,
    'Mirror': carParts.mirror,
    'Tires & rims': carParts.tire,
    'Front Bulb Glass': carParts.front_bulb,
    'Back Bulb': carParts.back_glass,
    'Front Bulb gray': carParts.front_bulb_gray,
    'Glass': carParts.glass,
  };

  // TODO wanna make a timer in console but fail
  // var r = Date.now() * 0.1;


  for (const folderName in folders) {
    const folder = panel.addFolder(folderName);
    if (folderName === 'Body') {
      folder.add(settings, 'cameraRotate');

      folder.add(settings, 'body', {
          // 'Phong_orange': 0,
          // "metallic": 1,
          // "result_one": 2,
          // "standby": 3,
          // "client_red_1": 4,
          // "client_red_2": 5,
          "Rosely": 6,
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

      folder.addColor(settings, 'carbody').onChange(function(val) {
        console.log("onChange : ", val)
          // way1
        carParts.body.forEach(function(part) {
          part.material.color.setHex(val);
        });


        // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;
        // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;

        // carParts.body.forEach( function ( part ) { part.material = color; } );

      });

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.body.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.body.forEach(function(part) {
          part.material.metalness = val
        });

      });

      folder.add(settings, 'envMap_01');

      folder.close()

    } else if (folderName === 'Exterior_black') {
      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.black_part.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.black_part.forEach(function(part) {
          part.material.metalness = val
        });

      });

      folder.close()

    } else if (folderName === 'Interior') {

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.interior.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.interior.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()

    } else if (folderName === 'Sliver_logo') {

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.sliver.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.sliver.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()
    } else if (folderName === 'Side') {
      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.side.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.side.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()

    } else if (folderName === 'Mirror') {
      // TODO also need fix the mirror
      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.mirror.forEach(function(part) { part.material.metalness = val });

      });
      folder.close()
    } else if (folderName === 'Tires & rims') {
      folder.add(settings, 'tire_roughness', 0, 1).onChange(function(val) {
        carParts.tire.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'tire_metalness', 0, 1).onChange(function(val) {
        carParts.tire.forEach(function(part) {
          part.material.metalness = val
        });

      });



      folder.add(settings, 'rims', {
          'original': 0,
          'silver': 1,
          'metallic': 2,
          'lightgray': 3,
        })
        .onChange(updateMaterials)
      folder.add(settings, 'rims_roughness', 0, 1).onChange(function(val) {
        carParts.rims.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'rims_metalness', 0, 1).onChange(function(val) {
        carParts.rims.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()




    } else if (folderName === 'Front Bulb Glass') {

      folder.add(settings, 'front_bulb_roughness', 0, 1).onChange(function(val) {
        carParts.front_bulb.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'front_bulb_envMapIntensity', 0, 5).onChange(function(val) {
        carParts.front_bulb.forEach(function(part) {
          part.material.envMapIntensity = val
        });

      });

      folder.add(settings, 'front_bulb_opacity', 0, 1).onChange(function(val) {
        carParts.front_bulb.forEach(function(part) {
          part.material.opacity = val
        });

      });

      folder.close()

    } else if (folderName === 'Back Bulb') {

      folder.add(settings, 'reflectivity', 0, 1).onChange(function(val) {
        carParts.back_glass.forEach(function(part) { part.material.reflectivity = val });

      });

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.back_glass.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.back_glass.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()


    } else if (folderName === 'Front Bulb gray') {
      folder.addColor(settings, 'front_bulb_gray_color').onChange(function(val) {
        // way1
        carParts.front_bulb_gray.forEach(function(part) {
          part.material.color.setHex(val);
        });


        // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;
        // var  color = new THREE.MeshPhongMaterial( { name: 'random' , color: val, // envMap: envMap_01, envMapIntensity: 2.0, metalness: 1.0, roughness: 0.2, specular: 0xffffff } ) ;

        // carParts.body.forEach( function ( part ) { part.material = color; } );

      });

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.front_bulb_gray.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'metalness', 0, 1).onChange(function(val) {
        carParts.front_bulb_gray.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.add(settings, 'shininess', 0, 1).onChange(function(val) {
        carParts.front_bulb_gray.forEach(function(part) {
          part.material.metalness = val
        });

      });
      folder.close()
    } else if (folderName === 'Glass') {

      folder.add(settings, 'glass', {
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

      folder.add(settings, 'roughness', 0, 1).onChange(function(val) {
        carParts.glass.forEach(function(part) {
          part.material.roughness = val
        });

      });

      folder.add(settings, 'envMapIntensity', 0, 5).onChange(function(val) {
        carParts.glass.forEach(function(part) {
          part.material.envMapIntensity = val
        });

      });

      folder.add(settings, 'opacity', 0, 1).onChange(function(val) {
        carParts.glass.forEach(function(part) {
          part.material.opacity = val
        });

      });

    }

  }
}

function updateMaterials() {
  console.log("settings.body : ", settings.body);
  console.log("settings : ", settings);

  const carPartsMap = {
    body: carParts.body,
    black_part: carParts.black_part,
    interior: carParts.interior,
    sliver: carParts.sliver,
    side: carParts.side,
    mirror: carParts.mirror,
    tire: carParts.tire,
    rims: carParts.rims,
    front_bulb: carParts.front_bulb,
    back_glass: carParts.back_glass,
    front_bulb_gray: carParts.front_bulb_gray,
    glass: carParts.glass,
    etc: carParts.etc,

    // side_logo: carParts.side_logo,
    // side_nameplate_insise: carParts.side_nameplate_insise,
    // side_nameplate_plus: carParts.side_nameplate_plus,
    // side_nameplate_word: carParts.side_nameplate_word,
    // interior_handle: carParts.interior_handle,
    // signal_red: carParts.signal_red,
    // signal_white_base: carParts.signal_white_base,
    // floor: carParts.floor,
  };

  for (const partName in carPartsMap) {
    if (settings[partName] !== undefined) {
      const materialName = partName + "_Mat";
      const selectedMaterial = materialsLib[partName][settings[partName]];
      carPartsMap[partName].forEach((part) => {
        part.material = selectedMaterial;
      });
    } else {
      const selectedMaterial = materialsLib[partName][0]
      carPartsMap[partName].forEach((part) => {
        part.material = selectedMaterial;
      });
    }
  }
}