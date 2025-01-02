export class WeaponSwitch {
    private container!: HTMLDivElement;
    private weaponNumbers: HTMLDivElement[] = [];
    private activeWeapon: number = 1;

    constructor() {
        this.createWeaponSwitch();
    }

    private createWeaponSwitch() {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: absolute;
            left: 260px;
            bottom: 13px;
            display: flex;
            gap: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 5px;
            border: 2px solid #ffffff;
            border-radius: 5px;
        `;

        // Create weapon numbers
        for (let i = 1; i <= 4; i++) {
            const numberDiv = document.createElement('div');
            numberDiv.innerHTML = i.toString();
            numberDiv.style.cssText = `
                width: 30px;
                height: 30px;
                color: #ffffff;
                background-color: rgba(0, 0, 0, 0.5);
                border: 1px solid #ffffff;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.2s ease;
            `;
            this.weaponNumbers.push(numberDiv);
            this.container.appendChild(numberDiv);
        }

        this.setActiveWeapon(1);
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

    public setActiveWeapon(weaponNumber: number) {
        if (weaponNumber < 1 || weaponNumber > 4) return;
        
        // Reset all weapons to inactive state
        this.weaponNumbers.forEach(num => {
            num.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            num.style.color = '#ffffff';
        });

        // Highlight active weapon
        const activeDiv = this.weaponNumbers[weaponNumber - 1];
        activeDiv.style.color = '#ffff00';
        this.activeWeapon = weaponNumber;
    }
}