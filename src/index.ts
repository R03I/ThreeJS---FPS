import { CharacterControls } from '@/lib/character/characterControls';
import { LevelBuilder } from '@/lib/maps/LevelBuilder';
import { MainView } from '@/lib/UI/MainView';
import * as THREE from 'three';
import level1 from '@/maps/level1';
import level2 from '@/maps/level2';
import { GameOver } from '@/lib/UI/GameOver';
import { VictoryScreen } from './lib/UI/VictoryScreen';

const levels = [level1, level2];
let currentLevel = 0;

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);
const clock = new THREE.Clock();

scene.fog = new THREE.Fog(0xa8def0, 0, 40);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// Initialize UI
const mainView = new MainView();

// Initialize controls
let characterControls = new CharacterControls(camera, scene, mainView);

// Key handling
const keysPressed: { [key: string]: boolean } = {};

// Add document to DOM
document.body.appendChild(renderer.domElement);

// Add pointer lock setup
document.addEventListener('click', function() {
    document.body.requestPointerLock();
});

// Key event listeners
document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
}, false);

document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
}, false);


// Initialize level builder and generate map
const levelBuilder = new LevelBuilder(scene, characterControls, camera, mainView);
levelBuilder.buildFromASCII(levels[currentLevel]);

// Create GameOver instance
const gameOver = new GameOver();

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-60, 100, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -100;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
scene.add(dirLight);

function animate() {
    const delta = clock.getDelta();

    // Check player health
    if (mainView.getCurrentHealth() <= 0) {
        gameOver.show();
        return; // Stop animation when dead
    }

    const enemies = levelBuilder.getEnemies();

    if (levelBuilder.mission.Complete()) {
        nextLevel();
        return;
    }

    // Update character controls
    if (characterControls) {
        characterControls.update(delta, keysPressed);
    }

    // Update enemies
    enemies.forEach(enemy => {
        enemy.update(camera.position, delta);
    });

    levelBuilder.mission.Update();


    // Update UI
    mainView.update();

    if ('mission_hud' in levels[currentLevel]) {
        if ('mission_hud' in levels[currentLevel]) {
            mainView.taskList.updateTasks((levels[currentLevel] as { mission_hud: string[] }).mission_hud, levelBuilder.mission.objectives);
        }
    }

    // Render scene
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();

// Clean up
window.addEventListener('beforeunload', () => {
    mainView.dispose();
});

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

let victoryScreen: VictoryScreen;

function nextLevel() {
    if(currentLevel === -1) {
        currentLevel = 0;
    }
    if (currentLevel >= levels.length-1) {
        victoryScreen.show();
        setTimeout(() => {
            victoryScreen.hide();
            currentLevel = 0;
            loadGame();
        }, 3000);
    } else {
        currentLevel++;
        loadGame();
    }
}

// Initialize victory screen
victoryScreen = new VictoryScreen();

async function loadGame() {  
    // Reset player state
    mainView.updateHealth(100);
    characterControls.getWeaponSystem().dispose();

    levelBuilder.resetLevel();
    
    // Initialize new controls and level
    characterControls = new CharacterControls(camera, scene, mainView);
    await levelBuilder.buildFromASCII(levels[currentLevel]);

    // Register walls and enemies
    levelBuilder.getWalls().forEach(wall => {
        characterControls.registerWall(wall);
    });

    // Set up weapon system
    characterControls.getWeaponSystem().setEnemies(levelBuilder.getEnemies());

    // Resume animation
    requestAnimationFrame(animate);
}