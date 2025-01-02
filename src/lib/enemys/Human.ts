import * as THREE from 'three';
import { Enemy } from '@/lib/enemys/Enemy';
import { MainView } from '@/lib/UI/MainView';

interface HumanConfig {
    position: THREE.Vector3;
    health?: number;
    speed?: number;
    damage?: number;
    attackRange?: number;
    startAttackRange?: number; // Add this
    attackCooldown?: number;
}

export class Human extends Enemy {
    private static readonly TEXTURE_PATH = './textures/mobs/human.png';
    private static readonly TEXTURE_DEAD = './textures/mobs/human_dead.png';
    private static readonly TEXTURE_ATTACK = './textures/mobs/human_shooting.png';
    protected mainView: MainView;

    constructor(scene: THREE.Scene, camera: THREE.Camera, config: HumanConfig, mainView: MainView) {
        const humanConfig = {
            position: config.position,
            health: config.health || 50,
            speed: config.speed || 4,
            damage: config.damage || 5,
            attackRange: config.attackRange || 10,
            startAttackRange: config.startAttackRange || 30,
            attackCooldown: config.attackCooldown || 2000,
            lastAttackTime: Date.now(),
            texturePath: Human.TEXTURE_PATH,
            attackTexturePath: Human.TEXTURE_ATTACK // Add this
        };

        super(scene, camera, humanConfig, mainView);
        this.mainView = mainView;

        // Create initial white mesh
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.0,
            transparent: true,
            alphaTest: 0.5
        });
        
        const humanMesh = new THREE.Mesh(geometry, material);
        humanMesh.position.copy(config.position);
        humanMesh.castShadow = true;
        humanMesh.receiveShadow = true;
        
        this.setMesh(humanMesh);
        scene.add(humanMesh);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            Human.TEXTURE_PATH,
            (texture) => {
                texture.premultiplyAlpha = false;
                material.map = texture;
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading texture:', error)
        );
    }

    public takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0 && this.isAlive) {
            this.isAlive = false;
            
            // Load and apply dead texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                Human.TEXTURE_DEAD,
                (texture) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(1, 1);
                    texture.premultiplyAlpha = false;
                    
                    const material = this.mesh.material as THREE.MeshStandardMaterial;
                    material.map = texture;
                    material.needsUpdate = true;
                },
                undefined,
                (error) => console.error('Error loading dead texture:', error)
            );

            this.mesh.position.y = 1;
            
            this.speed = 0;
        }
    }
}