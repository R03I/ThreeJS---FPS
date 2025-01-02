import * as THREE from 'three';
import { Weapon } from './Weapon';

export class Chaingun extends Weapon {
    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        super(scene, camera, './textures/weapons/chaingun.png', 10, 0.8, true, -0.3);
    }
}
