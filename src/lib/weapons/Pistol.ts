import * as THREE from 'three';
import { Weapon } from './Weapon';

export class Pistol extends Weapon {

    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private readonly shootingImage: string = './textures/weapons/pistolShot.png';
    private readonly texturePath: string = './textures/weapons/pistol.png';

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        super(scene, camera, './textures/weapons/pistol.png', 20, 0.5, false, -0.2);
        this.camera = camera;
        this.scene = scene;
    }

    public shootingEffect(): void {
        this.updateWeaponModel(this.shootingImage);

        setTimeout(() => {
            this.updateWeaponModel(this.texturePath);
        }, 100);
    }
}
