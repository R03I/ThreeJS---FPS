import * as THREE from 'three';

interface FindObjectConfig {
    position: THREE.Vector3;
    texturePath: string;
}

export class FindObject {
    private config: FindObjectConfig;
    private scene: THREE.Scene;
    private mesh: THREE.Mesh | null = null;
    private uuid: string | null = null;
    public isComplete: boolean = false;
    private camera: THREE.Camera;

    constructor(config: FindObjectConfig, scene: THREE.Scene, camera: THREE.Camera) {
        this.config = config;
        this.scene = scene;
        this.camera = camera;
    }

    public generateObject(): void {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const texture = new THREE.TextureLoader().load(this.config.texturePath);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true, 
            alphaTest: 0.5 
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.config.position);
        this.scene.add(this.mesh);
        this.uuid = this.mesh.uuid;
    }

    public checkCollision(): void {
        if (this.mesh) {
            const vector = new THREE.Vector3();
            vector.setFromMatrixPosition(this.mesh.matrixWorld);
            const distance = this.camera.position.distanceTo(vector);
            if (distance < 2) {
                this.removeObject();
            }
        }
    }

    private removeObject(): void {
        if (this.uuid) {
            const object = this.scene.getObjectByProperty('uuid', this.uuid);
            if (object) {
                this.scene.remove(object);
                this.mesh = null;
                this.uuid = null;
                this.isComplete = true;
            }
        }
    }

    public update(): void {
        if (this.mesh) {
            this.mesh.lookAt(this.camera.position);
            this.checkCollision();
        }
    }
}