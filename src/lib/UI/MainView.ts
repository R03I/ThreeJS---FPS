import * as THREE from 'three';
import { HealthBar } from './HealthBar';
import { WeaponSwitch } from './WeaponSwitch';
import { TaskList } from './TaskList';

export class MainView {
    private uiContainer!: HTMLDivElement;
    private healthBar: HealthBar;
    private weaponSwitch: WeaponSwitch;
    public taskList: TaskList;

    constructor() {
        this.createUIContainer();
        this.healthBar = new HealthBar(100);
        this.weaponSwitch = new WeaponSwitch();
        this.taskList = new TaskList();
        
        this.uiContainer.appendChild(this.healthBar.getContainer());
        this.uiContainer.appendChild(this.weaponSwitch.getContainer());
    }

    private createUIContainer() {
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 75px;
            background-color: rgba(70, 70, 70, 0.9);
            z-index: 1000;
            display: flex;
            align-items: center;
            padding: 0 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(this.uiContainer);
    }

    public update() {
        // Add update logic for UI elements
    }

    public updateHealth(newHealth: number) {
        this.healthBar.updateHealth(newHealth);
    }

    public takeDamage(amount: number) {
        this.healthBar.takeDamage(amount);
    }

    public getCurrentHealth(): number {
        return this.healthBar.getCurrentHealth();
    }

    public setActiveWeapon(weaponNumber: number) {
        this.weaponSwitch.setActiveWeapon(weaponNumber);
    }

    public dispose() {
        document.body.removeChild(this.uiContainer);
    }
}