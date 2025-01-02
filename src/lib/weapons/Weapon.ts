import * as THREE from 'three';
import { Enemy } from '@/lib/enemys/Enemy';

export class Weapon {
    protected model: THREE.Group;
    protected damage: number;
    protected fireRate: number;
    protected isAutomatic: boolean;
    protected scale: THREE.Vector3;
    protected position: THREE.Vector3;
    protected shootEffect?: HTMLDivElement;
    protected muzzleFlash: THREE.Sprite | null = null;
    protected bottomPosition: number;

    constructor(scene: THREE.Scene, camera: THREE.Camera, texturePath: string, damage: number, fireRate: number, isAutomatic: boolean, bottomPosition: number) {
        this.model = this.createWeaponModel(texturePath);
        this.damage = damage;
        this.bottomPosition = bottomPosition;
        this.fireRate = fireRate;
        this.isAutomatic = isAutomatic;
        this.scale = new THREE.Vector3(0.3, 0.3, 0.3);
        this.position = new THREE.Vector3(0.2, -0.1, -0.5);

        scene.add(this.model);
        this.createShootEffect();
        this.createMuzzleFlash(camera);
    }

    private createWeaponModel(texturePath: string): THREE.Group {
        const group = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        const weaponTexture = textureLoader.load(texturePath);

        const geometry = new THREE.PlaneGeometry(0.5, 0.6);
        const material = new THREE.MeshBasicMaterial({
            map: weaponTexture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        const weapon = new THREE.Mesh(geometry, material);
        weapon.scale.set(0.8, 0.8, 0.8);
        group.add(weapon);

        return group;
    }

    protected updateWeaponModel(url: string) {
        const textureLoader = new THREE.TextureLoader();
        const weaponTexture = textureLoader.load(url);
        const material = new THREE.MeshBasicMaterial({
            map: weaponTexture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        const weapon = this.model.children[0] as THREE.Mesh;
        weapon.material = material;
    }

    private createShootEffect() {
        this.shootEffect = document.createElement('div');
        this.shootEffect.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: yellow;
            font-size: 40px;
            font-weight: bold;
            opacity: 0;
            text-shadow: 
                0 0 10px #ff7700,
                0 0 20px #ff7700,
                0 0 30px #ff7700;
            pointer-events: none;
            user-select: none;
            z-index: 1000;
            transition: opacity 0.05s;
        `;
        this.shootEffect.innerHTML = '✧';
        document.body.appendChild(this.shootEffect);
    }

    protected createMuzzleFlash(camera: THREE.Camera) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 220, 100, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 128, 128);
        }

        const flashTexture = new THREE.CanvasTexture(canvas);
        const flashMaterial = new THREE.SpriteMaterial({
            map: flashTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 1,
            depthTest: false,
            depthWrite: false,
            sizeAttenuation: false
        });

        this.muzzleFlash = new THREE.Sprite(flashMaterial);
        this.muzzleFlash.scale.set(0.15, 0.15, 0.15);
        this.muzzleFlash.position.set(0.2, -0.1, -0.5);
        this.muzzleFlash.visible = true;
        this.muzzleFlash.renderOrder = 999;

        camera.add(this.muzzleFlash);
    }

    public getModel(): THREE.Group {
        return this.model;
    }

    public getDamage(): number {
        return this.damage;
    }

    public getFireRate(): number {
        return this.fireRate;
    }

    public isAuto(): boolean {
        return this.isAutomatic;
    }

    public update(camera: THREE.Camera) {
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        this.model.position.copy(camera.position)
            .add(cameraDirection.multiplyScalar(1))
            .add(new THREE.Vector3(-0, this.bottomPosition, 0));

        this.model.lookAt(camera.position);
        this.model.matrixAutoUpdate = true;
    }

    protected shootingEffect() {
        
    }

    public shoot(enemies: Enemy[], raycaster: THREE.Raycaster, camera: THREE.Camera) {
        if (!this.shootEffect) return;

        // Show shoot effect
        this.shootEffect.style.opacity = '1';
        setTimeout(() => {
            if (this.shootEffect) {
                this.shootEffect.style.opacity = '0';
            }
        }, 50);

        // Fix muzzle flash effect
        if (this.muzzleFlash) {
            this.muzzleFlash.visible = true;
            // Create temporary light for flash effect
            const flashLight = new THREE.PointLight(0xff7700, 1, 3);
            flashLight.position.copy(this.muzzleFlash.position);
            camera.add(flashLight);

            this.shootingEffect();

            setTimeout(() => {
                if (this.muzzleFlash) {
                    this.muzzleFlash.visible = false;
                }
                camera.remove(flashLight);
            }, 50);
        }

        // Rest of shoot method...
        const direction = new THREE.Vector3(0, 0, -1);
        camera.getWorldDirection(direction);
        direction.normalize();

        const bulletOffset = new THREE.Vector3(0.3, -0.2, -0.5);
        const raycasterOrigin = camera.position.clone().add(bulletOffset);
        raycaster.set(raycasterOrigin, direction);

        // Get all enemy meshes
        const enemyMeshes = enemies.map(enemy => enemy.getMesh());

        // Get ALL intersections, not just the first one
        const intersects = raycaster.intersectObjects(enemyMeshes, false);

        // Find first living enemy that was hit
        for (const intersection of intersects) {
            const hitMesh = intersection.object;
            const hitEnemy = enemies.find(enemy => enemy.getMesh() === hitMesh);

            // Check isAlive property instead of calling it as a function
            if (hitEnemy && hitEnemy.isAlive) {
                hitEnemy.takeDamage(this.damage);
                break; // Stop after hitting first living enemy
            }
        }
    }
}
