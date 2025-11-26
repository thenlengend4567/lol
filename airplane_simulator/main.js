import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x87ceeb ); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Physics setup
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});

// Physics Debugger
const cannonDebugger = new CannonDebugger(scene, world, {});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Airplane Model (Placeholder)
const airplane = new THREE.Group();
scene.add(airplane);

const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.2, 3, 8), bodyMaterial);
body.rotation.z = Math.PI / 2;
airplane.add(body);

const wing1 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 1), wingMaterial);
wing1.position.y = 0.2;
airplane.add(wing1);

const wing2 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 0.5), wingMaterial);
wing2.position.set(-1.5, 0.2, 0);
airplane.add(wing2);

// Airplane Physics Body
const airplaneShape = new CANNON.Box(new CANNON.Vec3(2.5, 0.5, 1.5));
const airplaneBody = new CANNON.Body({ mass: 50, linearDamping: 0.4, angularDamping: 0.6 });
airplaneBody.addShape(airplaneShape);
airplaneBody.position.set(0, 100, 0);
world.addBody(airplaneBody);

// Ground
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Ground Physics Body
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);


// City Generation
const citySize = 10;
const roadWidth = 10;
const buildingWidth = 20;
const buildingSpacing = 5;

for (let i = -citySize; i < citySize; i++) {
    for (let j = -citySize; j < citySize; j++) {
        const x = i * (buildingWidth + buildingSpacing);
        const z = j * (buildingWidth + buildingSpacing);

        // Create Building
        const buildingHeight = Math.random() * 50 + 10;
        const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingWidth);
        const buildingMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, buildingHeight / 2, z);
        scene.add(building);

        // Building Physics Body
        const buildingShape = new CANNON.Box(new CANNON.Vec3(buildingWidth / 2, buildingHeight / 2, buildingWidth / 2));
        const buildingBody = new CANNON.Body({ mass: 0 });
        buildingBody.addShape(buildingShape);
        buildingBody.position.set(x, buildingHeight / 2, z);
        world.addBody(buildingBody);
    }
}

// Rings
function createRing(position, rotation) {
    const ringGeometry = new THREE.TorusGeometry(10, 1, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.copy(rotation);
    scene.add(ring);

    // Ring Physics Body
    const ringShape = CANNON.Trimesh.createTorus(10, 1, 16, 100);
    const ringBody = new CANNON.Body({ mass: 0 });
    ringBody.addShape(ringShape);
    ringBody.position.copy(position);
    ringBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(ringBody);
}

createRing(new THREE.Vector3(0, 100, -100), new THREE.Euler(0, 0, 0));
createRing(new THREE.Vector3(50, 120, -200), new THREE.Euler(Math.PI / 4, 0, 0));
createRing(new THREE.Vector3(-50, 140, -300), new THREE.Euler(-Math.PI / 4, 0, 0));

// Weather System
let rain;
function createWeatherSystem() {
    const particleCount = 10000;
    const vertices = [];
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 500 - 250;
        const y = Math.random() * 500;
        const z = Math.random() * 500 - 250;
        vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.5,
        transparent: true
    });

    rain = new THREE.Points(geometry, material);
    scene.add(rain);
}

function updateWeather() {
    if (rain) {
        const positions = rain.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 2; // Rain speed
            if (positions[i + 1] < 0) {
                positions[i + 1] = 500;
            }
        }
        rain.geometry.attributes.position.needsUpdate = true;
    }
}
createWeatherSystem();

// Traffic System
const cars = [];
function createTraffic() {
    const carGeometry = new THREE.BoxGeometry(4, 2, 2);
    const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    // Car Path 1
    const car1 = new THREE.Mesh(carGeometry, carMaterial);
    car1.position.set(-citySize * (buildingWidth + buildingSpacing), 1, 0);
    scene.add(car1);
    cars.push({ mesh: car1, path: [new THREE.Vector3(-citySize * (buildingWidth + buildingSpacing), 1, 0), new THREE.Vector3(citySize * (buildingWidth + buildingSpacing), 1, 0)], target: 0 });

    // Car Path 2
    const car2 = new THREE.Mesh(carGeometry, carMaterial);
    car2.position.set(0, 1, -citySize * (buildingWidth + buildingSpacing));
    scene.add(car2);
    cars.push({ mesh: car2, path: [new THREE.Vector3(0, 1, -citySize * (buildingWidth + buildingSpacing)), new THREE.Vector3(0, 1, citySize * (buildingWidth + buildingSpacing))], target: 0 });
}

function updateTraffic() {
    cars.forEach(car => {
        const targetPosition = car.path[car.target];
        const distance = car.mesh.position.distanceTo(targetPosition);

        // Check for traffic lights
        let canMove = true;
        trafficLights.forEach(light => {
            if (light.state === 'red' && car.mesh.position.distanceTo(light.mesh.position) < 10) {
                canMove = false;
            }
        });

        if (canMove) {
            if (distance < 1) {
                car.target = (car.target + 1) % car.path.length;
            } else {
                const direction = targetPosition.clone().sub(car.mesh.position).normalize();
                car.mesh.position.add(direction.multiplyScalar(0.5));
                car.mesh.lookAt(targetPosition);
            }
        }
    });
}
createTraffic();

// Traffic Lights
const trafficLights = [];
function createTrafficLights() {
    const lightGeometry = new THREE.BoxGeometry(1, 3, 1);
    const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

    const light1 = new THREE.Mesh(lightGeometry, redMaterial);
    light1.position.set(5, 1.5, 5);
    scene.add(light1);
    trafficLights.push({ mesh: light1, state: 'red', redMaterial, greenMaterial });

    const light2 = new THREE.Mesh(lightGeometry, greenMaterial);
    light2.position.set(-5, 1.5, -5);
    scene.add(light2);
    trafficLights.push({ mesh: light2, state: 'green', redMaterial, greenMaterial });
}

let lastLightChange = 0;
function updateTrafficLights(time) {
    if (time - lastLightChange > 5) { // Change every 5 seconds
        lastLightChange = time;
        trafficLights.forEach(light => {
            if (light.state === 'red') {
                light.state = 'green';
                light.mesh.material = light.greenMaterial;
            } else {
                light.state = 'red';
                light.mesh.material = light.redMaterial;
            }
        });
    }
}
createTrafficLights();

// Airplane Controls & Camera
const keyboard = {};
let cameraMode = 'firstPerson'; // 'firstPerson' or 'thirdPerson'

document.addEventListener('keydown', (event) => {
    keyboard[event.code] = true;
    if (event.code === 'KeyC') {
        cameraMode = cameraMode === 'firstPerson' ? 'thirdPerson' : 'firstPerson';
    }
});
document.addEventListener('keyup', (event) => { keyboard[event.code] = false; });

function updateAirplanePhysics() {
    const thrust = 1000;
    const liftCoefficient = 1;
    const pitchTorque = 50;
    const rollTorque = 30;
    const yawTorque = 20;

    // Thrust
    if (keyboard['KeyW']) {
        const forwardVector = new CANNON.Vec3(0, 0, -1);
        const worldForward = airplaneBody.quaternion.vmult(forwardVector);
        airplaneBody.applyForce(worldForward.scale(thrust));
    }

    // Lift
    const velocity = airplaneBody.velocity.length();
    const lift = velocity * velocity * liftCoefficient;
    const upVector = new CANNON.Vec3(0, 1, 0);
    const worldUp = airplaneBody.quaternion.vmult(upVector);
    airplaneBody.applyForce(worldUp.scale(lift));

    // Pitch
    if (keyboard['ArrowUp']) {
        airplaneBody.applyLocalTorque(new CANNON.Vec3(-pitchTorque, 0, 0));
    }
    if (keyboard['ArrowDown']) {
        airplaneBody.applyLocalTorque(new CANNON.Vec3(pitchTorque, 0, 0));
    }

    // Roll
    if (keyboard['ArrowLeft']) {
        airplaneBody.applyLocalTorque(new CANNON.Vec3(0, 0, rollTorque));
    }
    if (keyboard['ArrowRight']) {
        airplaneBody.applyLocalTorque(new CANNON.Vec3(0, 0, -rollTorque));
    }

    // Yaw
    if (keyboard['KeyA']) {
         airplaneBody.applyLocalTorque(new CANNON.Vec3(0, yawTorque, 0));
    }
    if (keyboard['KeyD']) {
         airplaneBody.applyLocalTorque(new CANNON.Vec3(0, -yawTorque, 0));
    }
}

function updateCamera() {
    const firstPersonOffset = new THREE.Vector3(0, 0.5, -1);
    const thirdPersonOffset = new THREE.Vector3(0, 5, 15);

    if (cameraMode === 'firstPerson') {
        const cameraPosition = airplane.localToWorld(firstPersonOffset.clone());
        camera.position.copy(cameraPosition);
        camera.quaternion.copy(airplane.quaternion);
    } else { // thirdPerson
        const cameraPosition = airplane.localToWorld(thirdPersonOffset.clone());
        camera.position.lerp(cameraPosition, 0.1);
        camera.lookAt(airplane.position);
    }
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updateAirplanePhysics();

    world.step(1/60, delta, 3);

    airplane.position.copy(airplaneBody.position);
    airplane.quaternion.copy(airplaneBody.quaternion);

    updateCamera();
    updateWeather();
    updateTraffic();
    updateTrafficLights(clock.getElapsedTime());
    cannonDebugger.update();

    renderer.render(scene, camera);
}
animate();
