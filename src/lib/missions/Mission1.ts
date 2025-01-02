import MissionInterface from '@/lib/missions/MissionInterface';
import { FindObject } from './tasks/FindObject';
import * as THREE from 'three';
import { KillAllEnemies } from './tasks/KillAllEnemies';

export class Mission1 implements MissionInterface {
    public objectives: any;
    private scene: THREE.Scene;
    private camera: THREE.Camera;

    constructor(scene: THREE.Scene, camera: THREE.Camera, enemies: any) {
        this.scene = scene;
        this.camera = camera;
        this.objectives = [
            new FindObject({ position: new THREE.Vector3(2, 1, 2), texturePath: './textures/mission_items/gems/blue_gem.png' }, this.scene, this.camera),
            new KillAllEnemies(enemies)
        ];

        this.Init();
    }

    public Init(): void {
        this.objectives[0].generateObject(this.scene);
    }

    public Complete(): boolean {
        const all_objectives_complete = this.objectives.every((objective: any) => {
            return objective.isComplete === true;
        });

        return all_objectives_complete;
    }

    public Reset(): void {
        this.objectives.forEach((objective: any) => {
            this.scene.remove(objective.mesh);
        });

        this.Init();
    }

    public Update(): void {
        if(this.objectives !== null) {
            this.objectives.forEach((objective: any) => {
                objective.update();
            });
        }
    }
}