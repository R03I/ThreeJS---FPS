import { MainView } from './MainView';
import { LevelBuilder } from '../maps/LevelBuilder';

export class GameOver {
    private container!: HTMLDivElement;
    private keydownHandler: (event: KeyboardEvent) => void;

    constructor() {
        this.createGameOverScreen();
        this.keydownHandler = (event: KeyboardEvent) => {
            if (event.code === 'Space' && this.container.style.display === 'block') {
                this.hide();
                window.location.reload();
            }
        };
    }

    private createGameOverScreen() {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            display: none;
            z-index: 1001;
        `;

        const title = document.createElement('h1');
        title.textContent = 'GAME OVER';
        title.style.color = 'red';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        
        const message = document.createElement('p');
        message.textContent = 'Try again?';
        message.style.color = 'white';

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.style.cssText = `
            background-color: #ff0000;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 20px;
            cursor: pointer;
            border-radius: 5px;
            margin-top: 20px;
        `;
        restartButton.onclick = () => window.location.reload();

        const spaceMessage = document.createElement('p');
        spaceMessage.textContent = 'Press SPACE to restart';
        spaceMessage.style.color = 'white';
        spaceMessage.style.fontSize = '16px';
        spaceMessage.style.marginTop = '10px';

        this.container.append(title, message, restartButton, spaceMessage);
        document.body.appendChild(this.container);
    }

    public show() {
        this.container.style.display = 'block';
        document.addEventListener('keydown', this.keydownHandler);
    }

    public hide() {
        this.container.style.display = 'none';
        document.removeEventListener('keydown', this.keydownHandler);
    }
}