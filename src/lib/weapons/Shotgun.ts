import * as THREE from 'three';
import { Weapon } from './Weapon';

export class Shotgun extends Weapon {
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private readonly shootingImage: string = './textures/weapons/shotgunShot.png';
    private readonly texturePath: string = './textures/weapons/shotgun.png';

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        super(scene, camera, './textures/weapons/shotgun.png', 50, 0.8, false, -0.25);
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
