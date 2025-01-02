import { Enemy } from '@/lib/enemys/Enemy';

export class KillAllEnemies {
    public isComplete: boolean = false;
    private enemies: any;

    constructor(enemies: any) {
        this.enemies = enemies;
    }

    private checkEnemies(): void {
        const all_enemy_dead = this.enemies.every((enemy: Enemy) => {
            return enemy.isAlive === false;
        });

        if(all_enemy_dead){
            this.isComplete = true;
        }
    }

    public update(): void {
        if(!this.isComplete){
            this.checkEnemies();
        }
    }
}