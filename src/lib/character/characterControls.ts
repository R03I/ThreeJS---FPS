import * as THREE from 'three';
import { WeaponSystem } from '@/lib/weapons/WeaponSystem';
import { MainView } from '@/lib/UI/MainView';

interface WallBoundary {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

export class CharacterControls {
    camera: THREE.Camera;
    private mouseSensitivity = 0.002;
    private euler = new THREE.Euler(0, 0, 0, 'YXZ');
    private weaponSystem: WeaponSystem;
    private mainView: MainView;
    
    // Constants
    private readonly PLAYER_HEIGHT = 1.7;
    private readonly PLAYER_RADIUS = 0.7;
    private readonly COLLISION_MARGIN = 0.1;
    private readonly MOVE_SPEED = 5.0;
    private readonly SPRINT_SPEED = 10.0;  // Add sprint speed

    // Movement
    private velocity = new THREE.Vector3();
    public wallBoundaries: WallBoundary[] = [];
    private isSprinting = false;  // Track sprint state

    constructor(camera: THREE.Camera, scene: THREE.Scene, mainView: MainView) {
        this.camera = camera;
        this.mainView = mainView;
        this.camera.position.set(0, this.PLAYER_HEIGHT, 0);
        
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        this.weaponSystem = new WeaponSystem(scene, camera, mainView);
    }

    private onMouseMove(event: MouseEvent): void {
        if (document.pointerLockElement) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= event.movementX * this.mouseSensitivity;
            this.euler.x -= event.movementY * this.mouseSensitivity;
            this.euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        }
    }

    private onPointerLockChange(): void {
        // Handle pointer lock change if needed
    }

    update(delta: number, keysPressed: { [key: string]: boolean }) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        // Check if sprinting
        this.isSprinting = keysPressed['ShiftLeft'];
        const currentSpeed = this.isSprinting ? this.SPRINT_SPEED : this.MOVE_SPEED;

        // Update velocity with sprint speed
        this.velocity.set(0, 0, 0);
        if (keysPressed['KeyW']) this.velocity.add(forward);
        if (keysPressed['KeyS']) this.velocity.sub(forward);
        if (keysPressed['KeyA']) this.velocity.sub(right);
        if (keysPressed['KeyD']) this.velocity.add(right);

        if (this.velocity.lengthSq() > 0) {
            this.velocity.normalize().multiplyScalar(currentSpeed * delta);
            const nextPosition = this.camera.position.clone().add(this.velocity);
            
            if (!this.checkWallCollision(nextPosition)) {
                this.camera.position.copy(nextPosition);
            }
        }

        this.weaponSystem.update();
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

    private checkWallCollision(position: THREE.Vector3): boolean {
        const playerRadius = this.PLAYER_RADIUS;
        
        for (const boundary of this.wallBoundaries) {
            const playerLeft = position.x - playerRadius;
            const playerRight = position.x + playerRadius;
            const playerFront = position.z - playerRadius;
            const playerBack = position.z + playerRadius;

            if ((playerRight >= boundary.minX && playerLeft <= boundary.maxX) && 
                (playerBack >= boundary.minZ && playerFront <= boundary.maxZ)) {
                return true;
            }
        }
        return false;
    }

    public getWeaponSystem(): WeaponSystem {
        return this.weaponSystem;
    }

    public reset() {
        this.camera.position.set(0, this.PLAYER_HEIGHT, 0);
        this.camera.rotation.set(0, 0, 0);
    }
}