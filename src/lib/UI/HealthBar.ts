export class HealthBar {
    private container!: HTMLDivElement;
    private healthBar!: HTMLDivElement;
    private currentHealth: number;
    private maxHealth: number;

    constructor(maxHealth: number = 100) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.createHealthBar();
    }

    private createHealthBar() {
        // Create container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: absolute;
            left: 20px;
            bottom: 30px;
            width: 200px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid #ffffff;
            border-radius: 5px;
        `;

        // Create health bar
        this.healthBar = document.createElement('div');
        this.healthBar.style.cssText = `
            width: 100%;
            height: 100%;
            background-color: #ff0000;
            transition: width 0.3s ease-in-out;
        `;

        this.container.appendChild(this.healthBar);

        //add health text
        const healthText = document.createElement('div');
        healthText.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            color: white;
            text-align: center;
            line-height: 30px;
        `;
        healthText.innerHTML = 'Health';
        this.container.appendChild(healthText);
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

    public updateHealth(newHealth: number) {
        this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth));
        const healthPercentage = (this.currentHealth / this.maxHealth) * 100;
        this.healthBar.style.width = `${healthPercentage}%`;

        // Change color based on health level
        if (healthPercentage > 60) {
            this.healthBar.style.backgroundColor = '#00ff00';
        } else if (healthPercentage > 30) {
            this.healthBar.style.backgroundColor = '#ffff00';
        } else {
            this.healthBar.style.backgroundColor = '#ff0000';
        }
    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public takeDamage(amount: number) {
        this.updateHealth(this.currentHealth - amount);
    }

    public heal(amount: number) {
        this.updateHealth(this.currentHealth + amount);
    }
}