import * as THREE from 'three';
import { Enemy } from '@/lib/enemys/Enemy';
import { MainView } from '../UI/MainView';
import { Pistol } from './Pistol';
import { Shotgun } from './Shotgun';
import { Chaingun } from './Chaingun';
import { RocketLauncher } from './RocketLauncher';
import { Weapon } from './Weapon';

enum WeaponType {
    PISTOL = 1,
    SHOTGUN = 2,
    CHAINGUN = 3,
    ROCKET_LAUNCHER = 4
}

export class WeaponSystem {
    private enemies: Enemy[] = [];
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private currentWeapon: WeaponType;
    private weapons: Map<WeaponType, Weapon>;
    private lastFireTime: number;
    private crosshair!: HTMLDivElement;
    private raycaster: THREE.Raycaster;
    private shootEffect!: HTMLDivElement;
    private muzzleFlash: THREE.Sprite | null = null;
    private mainView: MainView;

    constructor(scene: THREE.Scene, camera: THREE.Camera, mainView: MainView) {
        this.scene = scene;
        this.camera = camera;
        this.mainView = mainView;
        this.weapons = new Map();
        this.currentWeapon = WeaponType.PISTOL;
        this.lastFireTime = 0;
        this.raycaster = new THREE.Raycaster();

        this.createCrosshair();
        this.initWeapons();
        this.setupKeyBindings();
        this.setupShootingMechanism();
    }

    private createCrosshair() {
        this.crosshair = document.createElement('div');
        this.crosshair.innerHTML = '+';
        this.crosshair.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
            pointer-events: none;
            user-select: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.crosshair);

        document.addEventListener('pointerlockchange', () => {
            this.crosshair.style.display = 
                document.pointerLockElement ? 'block' : 'none';
        });
    }

    private initWeapons() {
        this.weapons.set(WeaponType.PISTOL, new Pistol(this.scene, this.camera));
        this.weapons.set(WeaponType.SHOTGUN, new Shotgun(this.scene, this.camera));
        this.weapons.set(WeaponType.CHAINGUN, new Chaingun(this.scene, this.camera));
        this.weapons.set(WeaponType.ROCKET_LAUNCHER, new RocketLauncher(this.scene, this.camera));

        this.weapons.forEach(weapon => {
            const model = weapon.getModel();
            if (model) {
                model.visible = false;
            }
        });
        const pistolModel = this.weapons.get(WeaponType.PISTOL)?.getModel();
        if (pistolModel) {
            pistolModel.visible = true;
        }
    }

    private setupKeyBindings() {
        document.addEventListener('keydown', (event) => {
            const weaponNumber = parseInt(event.key);
            if (weaponNumber >= 1 && weaponNumber <= 4) {
                this.switchWeapon(weaponNumber as WeaponType);
            }
        });
    }

    private setupShootingMechanism() {
        document.addEventListener('mousedown', (event) => {
            if (document.pointerLockElement && event.button === 0) { // Left click
                const weaponData = this.weapons.get(this.currentWeapon);
                if (weaponData) {
                    weaponData.shoot(this.enemies, this.raycaster, this.camera);
                }
            }
        });
    }

    public setEnemies(enemies: Enemy[]): void {
        this.enemies = enemies;
    }

    public getEnemies(): Enemy[] {
        return this.enemies;
    }

    switchWeapon(newWeapon: WeaponType) {
        if (this.currentWeapon === newWeapon) return;

        // Hide current weapon
        const currentWeaponData = this.weapons.get(this.currentWeapon);
        if (currentWeaponData) {
            currentWeaponData.getModel().visible = false;
        }

        // Show new weapon
        const newWeaponData = this.weapons.get(newWeapon);
        if (newWeaponData) {
            newWeaponData.getModel().visible = true;
            this.currentWeapon = newWeapon;
            // Update UI
            this.mainView.setActiveWeapon(newWeapon);
        }
    }

    public update() {
        const weaponData = this.weapons.get(this.currentWeapon);
        if (weaponData) {
            weaponData.update(this.camera);
        }
    }

    public dispose() {
        this.weapons.forEach(weapon => {
            this.scene.remove(weapon.getModel());
        });
    }
}