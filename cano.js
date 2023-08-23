
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
//import CannonDebugger from 'cannon-es-debugger';

const sceneContainer = document.getElementById('scene-container');
var control = 1;

var collition_thres = 0;
var collided = 0




var turns;

const gravity = -15;
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
//document.body.appendChild(renderer.domElement);
sceneContainer.appendChild(renderer.domElement);

const color = 0x404040;
const intensity = 80;
const distance = 100;

const light = new THREE.DirectionalLight(color, intensity, distance);
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
//controls.target.set(0, 0, 0);
controls.minPolarAngle = Math.PI / 4; //45
controls.maxPolarAngle = Math.PI / 3; //60
controls.update();
camera.position.set(0, 0, -5)


var leftTankScoreLabel = document.getElementById('leftTankScore');
var  rightTankScoreLabel = document.getElementById('rightTankScore');


var maxTurnsLabel = document.getElementById('maxTurns');






updateTankInfo();
//updateTurnInfo();

function updateTankInfo() {

    leftTankScoreLabel.textContent = collition_thres;
    //player1Score=collition_thres;
  
    rightTankScoreLabel.textContent = collided;
    //player2Score=collided;

   
      maxTurnsLabel.textContent=turns;
    
 
}



var player1Name ,player2Name,turnlb;

document.addEventListener("DOMContentLoaded", () => {
  const player1NameElement = document.getElementById("player1Name");
  const player2NameElement = document.getElementById("player2Name");
  const maxTurnsLabel = document.getElementById('maxTurns');

  player1Name = localStorage.getItem("player1Name");
  player2Name = localStorage.getItem("player2Name");
  turnlb = localStorage.getItem("Turns");


  player1NameElement.textContent = player1Name;
  player2NameElement.textContent = player2Name;
  maxTurnsLabel.textContent=turnlb;
  turns = 2*turnlb;
    
});
 


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

/* const cannonDebugger = new CannonDebugger(scene, physicsWorld, {
  color: 0xff0000,
}); */

var right_tank, body_right_tank, right_missile, body_right_tankBB;

var body_left_tankBB
var isMissileLaunched = false;
var isMissileLaunched_right = false;

var Vx, Vy;
var timeStep;
var totalTime;
var x, y, x_r_m, y_r_m;
           
var divider


var input_angle =11; ////////input angle

var initialVelocity =12////input velocity


var angle = (Math.PI / 180) * (input_angle + 3); 

const gltfLoader = new GLTFLoader();

gltfLoader.load('new/untitled.glb', function (gltf) {
  divider = gltf.scene;
  divider.scale.set(0.5, 0.5, 0.5)
  divider.rotation.y = -80
  divider.position.y = -0.4
  scene.add(gltf.scene);

  const boundingBox = new THREE.Box3().setFromObject(divider);
  //const height = boundingBox.max.y - boundingBox.min.y;


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
            turns=turns-1;
            
            if (turns < 1) {
              if (collided < collition_thres) {
                var winner = player1Name;
                var winnerScore = collition_thres;
              } else {
                var winner = player2Name;
                var winnerScore = collided ;
              }
            
              localStorage.setItem('winner_name',winner);
              localStorage.setItem('winner_score',winnerScore);
            
              window.location.href = 'gameover.html?name=' + winner + '&score=' + winnerScore;
            }
            

          }
        }


        function launchMissile_right() {
          if (isMissileLaunched_right == false) {
            isMissileLaunched_right = true;
            scene.add(right_missile);
            physicsWorld.addBody(body_right_missile);
            turns=turns-1;


            if (turns < 1) {

              if (collided < collition_thres) {
                var winner = player1Name;
                var winnerScore = collition_thres;
              } else {
                var winner = player2Name;
                var winnerScore = collided;
              }
            

              localStorage.setItem('winner_name',winner);
              localStorage.setItem('winner_score',winnerScore);
              window.location.href = 'gameover.html?name=' + winner + '&score=' + winnerScore;
            }
            
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
        
          updateTankInfo();
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
      
           
            updateTankInfo();
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
                 
                  scene.remove(gltfModel);
                  physicsWorld.removeBody(body);
                  gltfModel.alive = false;
                  body.alive = false;
                  collition_thres += 1;
                }
              }

              if (x > -2 && x < 0) {

                if (gltfModel.position.y < 2.47) {
                 
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

        var speedLabel = document.querySelector('.buttons-container_speed b');
        var angleLabel = document.querySelector('.buttons-container_angle b');
       

        
        
        var projectileSpeed = 10;
        var projectileAngle = 10;

        speedLabel.textContent = projectileSpeed;
        input_angle = projectileAngle;
        angle= (Math.PI / 180) * projectileAngle; 
        angleLabel.textContent = projectileAngle;


        function animate() {

          requestAnimationFrame(animate);
          physicsWorld.step(1 / 60);
          //cannonDebugger.update();

          updateGLTFModel();
          updateProjectileMotion();
          updateProjectileMotion_right();
              


          if (turns < 1) {
            if (collided < collition_thres) {
              var winner = player1Name;
              var winnerScore = collition_thres;
            } else {
              var winner = player2Name;
              var winnerScore = collided;
            }
            localStorage.setItem('winner_name',winner);
            localStorage.setItem('winner_score',winnerScore);
            window.location.href = 'gameover.html?name=' + winner + '&score=' + winnerScore;
          } 
          

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
           
              switch (event.code) {
                case 'Space':
                  
                  if (timeStep <= totalTime && isMissileLaunched == false) {
                      
     
                    initial_angle_velocity();
                    launchMissile();


                  }
                  break;

                case 'ArrowUp':
                  console.log('l')

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


        const increaseSpeedButton = document.getElementById('increaseSpeed');
        increaseSpeedButton.addEventListener('click', () => {
          if (projectileSpeed < 50 ) {
            projectileSpeed += 0.5;
            speedLabel.textContent = projectileSpeed;
            initialVelocity = projectileSpeed;
            console.log('initialvelo',initialVelocity)
            
          }
        });


        const decreaseSpeedButton = document.getElementById('decreaseSpeed');
        decreaseSpeedButton.addEventListener('click', () => {
          if (projectileSpeed > 10 ) {
              projectileSpeed -= 0.5;
            speedLabel.textContent = projectileSpeed;
            initialVelocity = projectileSpeed;
            console.log('initialvelo',initialVelocity)
          }
        });


        const increaseAngleButton = document.getElementById('increaseAngle');
        increaseAngleButton.addEventListener('click', () => {
          if (projectileAngle < 60) {
            projectileAngle += 0.5;
            
            input_angle = projectileAngle;
            angle= (Math.PI / 180) * projectileAngle; // Convert angle to radians
            angleLabel.textContent = projectileAngle
            console.log('angle',angle);
          }
        });
        
        const decreaseAngleButton = document.getElementById('decreaseAngle');
        decreaseAngleButton.addEventListener('click', () => {
          if (projectileAngle > 10) {
            projectileAngle -= 0.5;
            input_angle = projectileAngle;
            angle= (Math.PI / 180) * projectileAngle;
            angleLabel.textContent = projectileAngle
            console.log('angle',angle);
          }
        });

    
        animate();
      });
    });
  });
});


