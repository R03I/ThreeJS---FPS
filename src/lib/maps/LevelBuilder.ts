import * as THREE from 'three';
import { CharacterControls } from '@/lib/character/characterControls';
import { Human } from '@/lib/enemys/Human';
import { MainView } from '../UI/MainView';

type MaterialType = 'R' | 'T' | 'C' | 'W';

interface Materials {
    R: THREE.MeshStandardMaterial;
    T: THREE.MeshStandardMaterial;
    C: THREE.MeshStandardMaterial;
    W: THREE.MeshStandardMaterial;
    ceiling: THREE.MeshStandardMaterial;
    floor: THREE.MeshStandardMaterial;
}

interface MapData {
    layout: string[];
    tileSize: number;
    wallHeight: number;
    mission?: any;
}

export class LevelBuilder {
    private scene: THREE.Scene;
    private textureLoader: THREE.TextureLoader;
    private materials: Materials;
    private characterControls: CharacterControls;
    private camera: THREE.Camera;
    public mission: any;
    private enemies: Human[] = [];
    private floorPositions: THREE.Vector3[] = [];
    private readonly ENEMY_SPAWN_CHANCE = 0.01; // 10% chance per floor tile
    private mainView: MainView;
    public currentMapData: MapData; // Make currentMapData public
    private walls: THREE.Mesh[] = []; // Add this line

    constructor(scene: THREE.Scene, characterControls: CharacterControls, camera: THREE.Camera, mainView: MainView) {
        this.scene = scene;
        this.camera = camera;
        this.mission = null;
        this.currentMapData = { layout: [], tileSize: 0, wallHeight: 0 }; // Initialize currentMapData
        this.characterControls = characterControls;
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {
            R: this.createMaterial("./textures/wall/521.png"),
            T: this.createMaterial("./textures/wall/187.png"),
            C: this.createMaterial("./textures/wall/311.png"),
            W: this.createMaterial("./textures/wall/153.png"),
            ceiling: this.createMaterial("./textures/ceiling/105.png"),
            floor: this.createMaterial("./textures/floor/116.png")
        };
        this.characterControls.getWeaponSystem().setEnemies(this.enemies);
        this.mainView = mainView;
    }

    private createMaterial(texturePath: string): THREE.MeshStandardMaterial {
        const texture = this.textureLoader.load(texturePath);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return new THREE.MeshStandardMaterial({ map: texture });
    }

    public buildFromASCII(mapData: MapData) {
        this.currentMapData = mapData;
        this.mission = new mapData.mission(this.scene, this.camera, this.enemies);

        const { layout, tileSize, wallHeight } = mapData;

        layout.forEach((row, z) => {
            Array.from(row).forEach((tile, x) => {
                const worldX = x * tileSize - (row.length * tileSize) / 2;
                const worldZ = z * tileSize - (layout.length * tileSize) / 2;

                if (tile === 'S') {
                    this.createFloorTile(worldX, worldZ, tileSize);
                    this.characterControls.camera.position.set(worldX + tileSize / 2, 1.7, worldZ + tileSize / 2);
                }

                if (tile === 'R' || tile === 'T' || tile === 'C' || tile === 'W') {
                    const wall = this.createWall(
                        worldX,
                        worldZ,
                        tileSize,
                        wallHeight,
                        this.materials[tile as MaterialType]
                    );
                    this.walls.push(wall); // Add this line

                    // Add stronger red point light at the bottom of 'C' element to illuminate the floor
                    if (tile === 'C') {
                        const light = new THREE.PointLight(0xffffff, 3, 5); // Red color, higher intensity
                        light.position.set(worldX + tileSize / 2, 2.1, worldZ + tileSize / 2); // Slightly above the floor
                        this.scene.add(light);
                    }
                } else if (tile === '0') {
                    this.createFloorTile(worldX, worldZ, tileSize);
                }
            });
        });

        this.createCeiling(layout, tileSize, wallHeight);
        
        this.characterControls.wallBoundaries.forEach(wall => {
            this.enemies.forEach(enemy => {
                enemy.wallBoundaries.push(wall);
            });
        });

    }

    private createWall(x: number, z: number, size: number, height: number, material: THREE.Material) {
        const geometry = new THREE.BoxGeometry(size, height, size);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x + size/2, height/2, z + size/2);
        wall.receiveShadow = true;
        wall.castShadow = true;
        this.scene.add(wall);
        
        // Register wall for collision detection
        this.characterControls.registerWall(wall);
        
        return wall;
    }

    private createFloorTile(x: number, z: number, size: number) {
        const geometry = new THREE.PlaneGeometry(size, size);
        const floor = new THREE.Mesh(geometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x + size / 2, 0, z + size / 2);
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Store floor position for potential enemy spawn
        this.floorPositions.push(new THREE.Vector3(x + size / 2, 0, z + size / 2));

        // Random enemy spawn
        if (Math.random() < this.ENEMY_SPAWN_CHANCE) {
            this.spawnEnemy(x + size / 2, z + size / 2);
        }
    }

    private spawnEnemy(x: number, z: number) {
        const enemy = new Human(this.scene, this.camera, {
            position: new THREE.Vector3(x, 1, z), // Ensure the Y position is set correctly
        }, this.mainView); // Pass the instance of MainView
        this.enemies.push(enemy);
    }

    public getEnemies(): Human[] {
        return this.enemies;
    }

    private createCeiling(layout: string[], tileSize: number, height: number) {
        const geometry = new THREE.PlaneGeometry(
            layout[0].length * tileSize,
            layout.length * tileSize
        );
        const ceiling = new THREE.Mesh(geometry, this.materials.ceiling);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(0, height, 0);
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
    }

    public clearScene() {
        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
            if (object instanceof THREE.Mesh) {
                if (object.material instanceof THREE.Material) {
                    object.material.dispose();
                }
                if (object.geometry) {
                    object.geometry.dispose();
                }
            }
            this.scene.remove(object);
        }

        // Dispose of textures
        for (const key in this.materials) {
            const material = this.materials[key as MaterialType];
            if (material.map) {
                material.map.dispose();
            }
            material.dispose();
        }
    }

    public resetLevel(): void {
        this.clearScene(); // Clear the scene before resetting the level
        // Remove all enemies
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy.getMesh());
        });
        this.enemies = [];

        // Clear floor positions
        this.floorPositions = [];

        // Clear walls array
        this.walls = [];

        // Remove existing walls and floors
        this.scene.children = this.scene.children.filter(child => 
            !(child instanceof THREE.Mesh && 
              (child.material === this.materials.floor || 
               child.material === this.materials.R || 
               child.material === this.materials.T))
        );

        // Reset player position
        this.camera.position.set(0, 1.7, 0);
        this.camera.rotation.set(0, 0, 0);

        // Re-add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

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
        this.scene.add(dirLight);

        // Reset character controls
        this.characterControls.reset();
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }

    public getWalls(): THREE.Mesh[] {
        return this.walls;
    }
    
}