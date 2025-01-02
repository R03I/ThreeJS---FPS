import * as THREE from 'three';
import { MainView } from '@/lib/UI/MainView';

interface EnemyConfig {
    position: THREE.Vector3;
    health: number;
    speed: number;
    damage: number;
    attackRange: number;
    startAttackRange: number; // Add this
    texturePath?: string;
    attackTexturePath?: string; // Add this
    attackCooldown: number;
    lastAttackTime: number;
}

interface WallBoundary {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

export class Enemy {
    protected mesh: THREE.Mesh;
    protected camera: THREE.Camera;
    protected model: THREE.Group | null = null;
    protected health: number;
    protected speed: number;
    protected attackRange: number;
    protected startAttackRange: number; // Add this
    private damage: number;
    public isAlive: boolean = true;
    private textureLoader: THREE.TextureLoader;
    protected forward!: THREE.Vector3;
    private attackCooldown: number;
    private lastAttackTime: number;
    protected mainView: MainView;
    private readonly COLLISION_MARGIN = 0.1;
    public wallBoundaries: WallBoundary[] = [];
    private lastValidDirection: THREE.Vector3 = new THREE.Vector3();
    private readonly WALL_AVOID_ANGLES = [45, -45, 90, -90]; // Degrees
    private attackTexturePath?: string; // Add this
    private texturePath?: string;

    constructor(scene: THREE.Scene, camera: THREE.Camera, config: EnemyConfig, mainView: MainView) {
        this.camera = camera;
        this.health = config.health;
        this.speed = config.speed;
        this.damage = config.damage;
        this.attackRange = config.attackRange;
        this.startAttackRange = config.startAttackRange;
        this.textureLoader = new THREE.TextureLoader();
        this.attackCooldown = config.attackCooldown;
        this.lastAttackTime = config.lastAttackTime;
        this.mainView = mainView;
        this.attackTexturePath = config.attackTexturePath;
        this.texturePath = config.texturePath;

        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial();
        material.transparent = true;
        material.opacity = 0;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(config.position);
        scene.add(this.mesh);

        const initialPosition = this.mesh.position.clone();
        this.mesh.position.z += 0.1;

        setTimeout(() => {
            this.mesh.position.copy(initialPosition);
        }, 100);

        this.loadModelAndTexture(scene, config.texturePath);
    }

    private loadModelAndTexture(scene: THREE.Scene, texturePath?: string) {
        const textureLoader = new THREE.TextureLoader();
    }

    protected loadTexture(mesh: THREE.Mesh, texturePath: string): void {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            texturePath,
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.map = texture;
                material.transparent = true; // Ensure transparency is enabled
                material.alphaTest = 0.5; // Set alpha test to handle transparency
                material.needsUpdate = false;
            },
            undefined,
            (error) => {
                console.error('Texture loading error:', error);
            }
        );
    }

    private checkCollision(newPosition: THREE.Vector3): boolean {
        for (const wall of this.wallBoundaries) {
            if (newPosition.x >= wall.minX - this.COLLISION_MARGIN &&
                newPosition.x <= wall.maxX + this.COLLISION_MARGIN &&
                newPosition.z >= wall.minZ - this.COLLISION_MARGIN &&
                newPosition.z <= wall.maxZ + this.COLLISION_MARGIN) {
                return true;
            }
        }
        return false;
    }

    update(playerPosition: THREE.Vector3, delta: number) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

        const angleY = Math.atan2(
            playerPosition.x - this.mesh.position.x,
            playerPosition.z - this.mesh.position.z
        );
        this.mesh.rotation.y = angleY;

        if (!this.isAlive) return;

        // Attack if in range
        if (distanceToPlayer <= this.attackRange) {
            this.attack(playerPosition);
        }

        // Only move if within start attack range and alive
        if (this.isAlive && distanceToPlayer <= this.startAttackRange) {
            // Calculate direction and distance
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, this.mesh.position)
                .normalize();
            const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

            // Try original direction first
            let nextPosition = this.mesh.position.clone().add(
                direction.multiplyScalar(this.speed * delta)
            );

            // Movement and collision logic only if alive
            if (this.checkCollision(nextPosition) && distanceToPlayer > this.attackRange) {
                let foundPath = false;
                
                for (const angle of this.WALL_AVOID_ANGLES) {
                    const radians = (angle * Math.PI) / 180;
                    const altDirection = direction.clone()
                        .applyAxisAngle(new THREE.Vector3(0, 1, 0), radians)
                        .normalize();
                    
                    nextPosition = this.mesh.position.clone().add(
                        altDirection.multiplyScalar(this.speed * delta)
                    );

                    if (!this.checkCollision(nextPosition)) {
                        this.lastValidDirection = altDirection;
                        foundPath = true;
                        break;
                    }
                }

                if (!foundPath && this.lastValidDirection.lengthSq() > 0) {
                    nextPosition = this.mesh.position.clone().add(
                        this.lastValidDirection.multiplyScalar(this.speed * delta)
                    );
                    if (!this.checkCollision(nextPosition)) {
                        this.mesh.position.copy(nextPosition);
                    }
                }
            } else if (distanceToPlayer > this.attackRange) {
                this.mesh.position.copy(nextPosition);
            }
        }
    }

    public registerWall(wall: THREE.Mesh) {
        const box = new THREE.Box3().setFromObject(wall);
        const margin = this.COLLISION_MARGIN;
        
        this.wallBoundaries.push({
            minX: box.min.x - margin,
            maxX: box.max.x + margin,
            minZ: box.min.z - margin,
            maxZ: box.max.z + margin,
        });
    }

    public attack(playerPosition: THREE.Vector3): void {
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
            if (distanceToPlayer <= this.attackRange) {
                this.mainView.updateHealth(this.mainView.getCurrentHealth() - this.damage);
                this.lastAttackTime = now;

                // Change to attack texture
                if (this.attackTexturePath) {
                    this.loadTexture(this.mesh, this.attackTexturePath);
                    setTimeout(() => {
                        if (this.isAlive && this.mesh) {
                            this.loadTexture(this.mesh, this.texturePath || '');
                        }
                    }, 400);
                }
            }
        }
    }

    takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    private die() {
        this.isAlive = false;
        this.mesh.visible = false;
    }

    getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }

    isDead(): boolean {
        return !this.isAlive;
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }

    setMesh(mesh: THREE.Mesh) {
        this.mesh = mesh;
    }
}