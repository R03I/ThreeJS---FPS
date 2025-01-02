export class TaskList {
    private container!: HTMLDivElement;
    private mission: any;

    constructor() {
        this.container = document.createElement('div');
        this.createTaskList();
    }

    private createTaskList() {
        this.container.innerHTML = '';

        this.container.style.cssText = `
            position: fixed;
            top: 40px;
            left: 20px;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px;
            padding-left: 40px;
            padding-right: 40px;
            border-radius: 10px;
            text-align: left;
            display: block;
            z-index: 1001;
        `;
        
        document.body.appendChild(this.container);
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

    public updateTasks(newTasks: string[], mission: any) {
        this.container.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'Objectives';
        title.style.color = 'white';
        title.style.fontSize = '24px';
        title.style.marginBottom = '20px';
        this.container.appendChild(title);

        newTasks.forEach((task: string, index: number) => {
            const taskItem = document.createElement('p');
            taskItem.textContent = task;
            taskItem.style.fontSize = '18px';
            taskItem.style.margin = '5px 0';

            if (mission[index].isComplete) {
                taskItem.style.color = 'green';
                taskItem.style.textDecoration = 'line-through';
            } else {
                taskItem.style.color = 'yellow';
            }

            this.container.appendChild(taskItem);
        });
    }
}