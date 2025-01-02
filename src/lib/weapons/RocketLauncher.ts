import * as THREE from 'three';
import { Weapon } from './Weapon';

export class RocketLauncher extends Weapon {
    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        super(scene, camera, './textures/weapons/rocket_launcher.png', 200, 0.8, false, 0.3);
    }
}
