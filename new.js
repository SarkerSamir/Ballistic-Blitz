
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger';
import { ContactMaterial } from 'cannon-es';

var control = 1;
var collition_thres = 0;
var collided = 0

const gravity = -9.81;
const scene = new THREE.Scene();
const CubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = CubeTextureLoader.load([
  '/images/cocoa_lf.jpg',
  '/images/cocoa_rt.jpg',
  '/images/cocoa_up.jpg',
  '/images/cocoa_dn.jpg',
  '/images/cocoa_ft.jpg',
  '/images/cocoa_bk.jpg',]);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0x404040;
const intensity = 80;
const distance = 100;

const light = new THREE.DirectionalLight(color, intensity, distance);
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
//controls.target.set(0, 0, 0);
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 3;
controls.update();
camera.position.set(0, 0, 5)

const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});


const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});


groundBody.position.set(0, 0, 0)
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

physicsWorld.addBody(groundBody);

const cannonDebugger = new CannonDebugger(scene, physicsWorld, {
  color: 0xff0000,
});

var right_tank, body_right_tank, right_missile, body_right_tankBB;

var body_left_tankBB
var isMissileLaunched = false;
var isMissileLaunched_right = false;

var Vx, Vy;
var timeStep;
var totalTime;
var x, y, x_r_m, y_r_m;
var input_angle = 25;
var divider, dividerBB

var angle = (Math.PI / 180) * (input_angle + 3);
console.log(angle)
var initialVelocity = 15;

/* 

const shape2 = new CANNON.Box(new CANNON.Vec3(0.05,3,2));
const body2= new CANNON.Body({
  mass: 0, // Adjust the mass as needed
  shape: shape2,
  type:CANNON.Body.STATIC,
});


body2.position.set(-3,0,0);
const eulerRotation = new CANNON.Vec3(0,0, -65 * (Math.PI / 180)); // Euler angles in radians (Y rotation)
const quaternionRotation = new CANNON.Quaternion();
quaternionRotation.setFromEuler(eulerRotation.x, eulerRotation.y, eulerRotation.z, 'XYZ'); // Adjust order if needed

body2.quaternion.mult(quaternionRotation, body2.quaternion);


// Add the Cannon.js rigid body to the physics world
physicsWorld.addBody(body2); */



const gltfLoader = new GLTFLoader();

gltfLoader.load('rocky_outcrop_scan/scene.gltf', function (gltf) {
  divider = gltf.scene;
  divider.scale.set(0.5, 0.5, 0.5)
  divider.rotation.y = -80
  divider.position.y = -0.4
  scene.add(gltf.scene);

  const boundingBox = new THREE.Box3().setFromObject(divider);
  const height = boundingBox.max.y - boundingBox.min.y;
  console.log('Model Height:', height);

});

var ground_surface
gltfLoader.load('ground_decimated_3d_scan/scene.gltf', function (gltf) {
  ground_surface = gltf.scene;

  ground_surface.scale.set(0.009, 0.004, 0.008)

  ground_surface.position.y = -0.1
  scene.add(gltf.scene);

});




gltfLoader.load('right_missile_gltf/right_missile.glb', (gltf) => {
  right_missile = gltf.scene;
  right_missile.scale.set(0.01, 0.01, 0.01);

  const shape_right_missiel = new CANNON.Box(new CANNON.Vec3(0.38, 0.08, 0.08)); // Adjust the size of the box shape as needed
  const body_right_missile = new CANNON.Body({

    mass: 0,
    shape: shape_right_missiel,
  });
  body_right_missile.position.set(right_missile.position.x, right_missile.position.y, right_missile.position.z)

  var body_right_missile_BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
  body_right_missile_BB.setFromObject(right_missile)

  //right tank

  gltfLoader.load('right_tank_gltf/right_tank.glb', function (gltf) {
    right_tank = gltf.scene;
    right_tank.scale.set(0.3, 0.3, 0.3);
    right_tank.position.x = 8;
    right_tank.position.y = 0.2;
    scene.add(gltf.scene);

    const shape_right_tank = new CANNON.Box(new CANNON.Vec3(0.54, 0.2, 0.5));
    body_right_tank = new CANNON.Body({

      mass: 50000,
      shape: shape_right_tank,
    });

    body_right_tank.position.set(right_tank.position.x, right_tank.position.y, right_tank.position.z);

    body_right_tank.quaternion.setFromEuler(0, -Math.PI / 2, 0);
    physicsWorld.addBody(body_right_tank);

    body_right_tankBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    body_right_tankBB.setFromObject(right_tank)




    //left_tank
    var tank_right_initial_angle = Math.PI / 2;
    var left_tank
    var body_left_tank
    gltfLoader.load('left_tank.glb', function (gltf) {
      left_tank = gltf.scene;
      left_tank.rotation.set(0, Math.PI / 2, 0);
      left_tank.scale.set(0.003, 0.003, 0.003);
      left_tank.position.x = -7;
      left_tank.position.y = 0;
      scene.add(gltf.scene);

      const shape_left_tank = new CANNON.Box(new CANNON.Vec3(0.3, 0.2, 0.4));
      body_left_tank = new CANNON.Body({

        mass: 50000,
        shape: shape_left_tank,
      });

      body_left_tank.position.set(left_tank.position.x, left_tank.position.y, left_tank.position.z);
      body_left_tank.quaternion.setFromEuler(0, tank_right_initial_angle, 0);

      body_left_tankBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      body_left_tankBB.setFromObject(left_tank);

      physicsWorld.addBody(body_left_tank);

      var gltfModel;

      gltfLoader.load('left_missile/right_missile.glb', (gltf) => {
        gltfModel = gltf.scene;
        gltfModel.scale.set(0.1, 0.1, 0.1);
        gltfModel.scale.set(0.006, 0.006, 0.006);

        const shape = new CANNON.Box(new CANNON.Vec3(0.38, 0.1, 0.1)); // Adjust the size of the box shape as needed
        const body = new CANNON.Body({

          mass: 0,
          shape: shape,
        });
        body.position.set(gltfModel.position.x, gltfModel.position.y, gltfModel.position.z)

        var gltfModel_BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        gltfModel_BB.setFromObject(gltfModel)



        function initial_angle_velocity_right_missile() {



          Vx = initialVelocity * Math.cos(angle);
          Vy = initialVelocity * Math.sin(angle);

          timeStep = 0.1;
          totalTime = (2 * Vy) / (-gravity);

          body_right_missile.position.x = body_right_tank.position.x;
          body_right_missile.position.y = body_right_tank.position.y;
          body_right_missile.position.z = body_right_tank.position.z;
          body_right_missile.position.x -= 0.5
          body_right_missile.position.y += 0.2


        }


        function initial_angle_velocity() {
          Vx = initialVelocity * Math.cos(angle);
          Vy = initialVelocity * Math.sin(angle);

          timeStep = 0.1;
          totalTime = (2 * Vy) / (-gravity);

          body.position.x = body_left_tank.position.x;
          body.position.y = body_left_tank.position.y;
          body.position.z = body_left_tank.position.z;
          body.position.x += 0.5
          body.position.y += 0.2

        }





        function launchMissile() {
          if (isMissileLaunched == false) {
            isMissileLaunched = true;
            scene.add(gltfModel);
            physicsWorld.addBody(body);
          }
        }


        function launchMissile_right() {
          if (isMissileLaunched_right == false) {
            isMissileLaunched_right = true;
            scene.add(right_missile);
            physicsWorld.addBody(body_right_missile);
          }
        }



        function updateGLTFModel() {

          right_missile.position.copy(body_right_missile.position);
          right_missile.quaternion.copy(body_right_missile.quaternion);

          gltfModel.position.copy(body.position);
          gltfModel.quaternion.copy(body.quaternion);


          right_tank.position.copy(body_right_tank.position);
          right_tank.quaternion.copy(body_right_tank.quaternion);



          left_tank.position.copy(body_left_tank.position);
          left_tank.quaternion.copy(body_left_tank.quaternion);

        }



        let lock_missile_possition

        function updateProjectileMotion_right() {

          if (!isMissileLaunched_right) {
            lock_missile_possition = body_right_tank.position.x;
          }

          if (isMissileLaunched_right) {

            scene.add(right_missile);
            physicsWorld.addBody(body_right_missile);


            if (timeStep <= totalTime) {
              x_r_m = Vx * timeStep;
              x_r_m = lock_missile_possition - x_r_m;
              y_r_m = Vy * timeStep + 0.5 * gravity * timeStep * timeStep;



              body_right_missile.position.x = x_r_m;
              body_right_missile.position.y = y_r_m;

              right_missile.position.copy(body_right_missile.position);
              right_missile.quaternion.copy(body_right_missile.quaternion);

              timeStep += 0.005

              if (body_left_tankBB.intersectsBox(body_right_missile_BB)) {


                collided += 1;
                console.log("collided_with_yello_tank", collided)
                scene.remove(right_missile);
                physicsWorld.removeBody(body_right_missile);
                right_missile.alive = false;
                body_right_missile.alive = false;


              }

              if (x_r_m < 2 && x_r_m > 0) {

                if (body_right_missile.position.y < 2.47) {
                  console.log('y', y_r_m)
                  scene.remove(right_missile);
                  physicsWorld.removeBody(body_right_missile);
                  right_missile.alive = false;
                  body_right_missile.alive = false;
                  isMissileLaunched_right = false;
                  timeStep = 0.1;
                  control = 0;
                }
              }

            } else {
              scene.remove(right_missile);
              physicsWorld.removeBody(body_right_missile);
              right_missile.alive = false;
              body_right_missile.alive = false;
              isMissileLaunched_right = false;
              console.log('removed');
              timeStep = 0.1;
              control = 0;
            }
            renderer.render(scene, camera);
          }
        }

  let lock_left_missile_possiotion

    function updateProjectileMotion() {
          if (!isMissileLaunched) {
            lock_left_missile_possiotion = body_left_tank.position.x;
          }


          if (isMissileLaunched) {

            scene.add(gltfModel);

            physicsWorld.addBody(body);

            if (timeStep <= totalTime) {
              x = Vx * timeStep;
              x = x - (-lock_left_missile_possiotion)
              y = Vy * timeStep + 0.5 * gravity * timeStep * timeStep;

              body.position.x = x;
              body.position.y = y;

              gltfModel.position.copy(body.position);
              gltfModel.quaternion.copy(body.quaternion);

              timeStep += 0.005;


              if (body_right_tankBB.intersectsBox(gltfModel_BB)) {
                {
                  console.log("ccollided_with_black_tank", collition_thres)
                  scene.remove(gltfModel);
                  physicsWorld.removeBody(body);
                  gltfModel.alive = false;
                  body.alive = false;
                  collition_thres += 1;
                }
              }

              if (x > -2 && x < 0) {

                if (gltfModel.position.y < 2.47) {
                  console.log('y', y)
                  scene.remove(gltfModel);
                  physicsWorld.removeBody(body);
                  gltfModel.alive = false;
                  body.alive = false;
                  isMissileLaunched = false;
                  timeStep = 0.1;
                  control = 1;
                }
              }


            } else {
              scene.remove(gltfModel);
              physicsWorld.removeBody(body);
              gltfModel.alive = false;
              body.alive = false;
              isMissileLaunched = false;
              console.log('removed');
              timeStep = 0.1;
              control = 1;
            }
            renderer.render(scene, camera);
          }
        }




        function animate() {

          requestAnimationFrame(animate);
          physicsWorld.step(1 / 60);
          cannonDebugger.update();

          updateGLTFModel();
          updateProjectileMotion();
          updateProjectileMotion_right();

          body_right_tankBB.setFromObject(right_tank)
          gltfModel_BB.setFromObject(gltfModel)

          body_left_tankBB.setFromObject(left_tank)
          body_right_missile_BB.setFromObject(right_missile)

          function move_front() {
            if (body_left_tank.position.x <= -5.5) {
              body_left_tank.position.x += 0.0001
              left_tank.position.copy(body_left_tank.position);
              left_tank.quaternion.copy(body_left_tank.quaternion);
            }

          }

          function move_back() {
            if (body_left_tank.position.x >= -10.5) {
              body_left_tank.position.x -= 0.0001
              left_tank.position.copy(body_left_tank.position);
              left_tank.quaternion.copy(body_left_tank.quaternion);
            }

          }



          function move_right() {

            if (body_left_tank.position.z <= 5) {
              body_left_tank.position.z += 0.0001
              body_left_tank.quaternion.setFromEuler(0, tank_right_initial_angle, 0);
              left_tank.position.copy(body_left_tank.position);
              left_tank.quaternion.copy(body_left_tank.quaternion);
            }



          }


          function move_left() {
            if (body_left_tank.position.z >= -5) {
              body_left_tank.position.z -= 0.0001

              left_tank.position.copy(body_left_tank.position);
              left_tank.quaternion.copy(body_left_tank.quaternion);

            }

          }


          //right tank

          function move_front_right_tank() {

            if (body_right_tank.position.x >= 6) {
              body_right_tank.position.x -= 0.0001
              right_tank.position.copy(body_left_tank.position);
              right_tank.quaternion.copy(body_left_tank.quaternion);
            }

          }

          function move_back_right_tank() {
            if (body_right_tank.position.x <= 10.5) {
              body_right_tank.position.x += 0.0001
              right_tank.position.copy(body_left_tank.position);
              right_tank.quaternion.copy(body_left_tank.quaternion);
            }

          }



          function move_right_right_tank() {

            if (body_right_tank.position.z <= 5) {
              body_right_tank.position.z += 0.0001
              right_tank.position.copy(body_right_tank.position);
              right_tank.quaternion.copy(body_right_tank.quaternion);




            }


          }


          function move_left_right_tank() {


            if (body_right_tank.position.z >= -5) {
              body_right_tank.position.z -= 0.0001
              right_tank.position.copy(body_right_tank.position);
              right_tank.quaternion.copy(body_right_tank.quaternion);

            }


          }


          document.addEventListener('keydown', (event) => {

            if (control == 0) {
              // Check the key code of the pressed key
              switch (event.code) {
                case 'Space':
                  if (timeStep <= totalTime && isMissileLaunched == false) {

                    initial_angle_velocity();
                    launchMissile();


                  }
                  break;

                case 'ArrowUp':


                  move_front();

                  break;
                case 'ArrowDown':

                  console.log('Down arrow key pressed');
                  move_back();

                  break;
                case 'ArrowLeft':
                  move_left();
                  console.log('Left arrow key pressed');

                  break;
                case 'ArrowRight':
                  move_right();


                  break;

              }

            }

            else if (control == 1) {
              switch (event.code) {
                case 'Space':
                  if (timeStep <= totalTime && isMissileLaunched_right == false) {

                    initial_angle_velocity_right_missile();


                    launchMissile_right();
                  }
                  break;

                case 'ArrowUp':


                  move_front_right_tank();

                  break;
                case 'ArrowDown':

                  move_back_right_tank();

                  break;
                case 'ArrowLeft':

                  move_left_right_tank();

                  break;
                case 'ArrowRight':
                  move_right_right_tank();



                  break;

              }


            }


          });



          renderer.render(scene, camera);
        }


        initial_angle_velocity();
        initial_angle_velocity_right_missile();

        renderer.render(scene, camera);

        animate();
      });
    });
  });
});


