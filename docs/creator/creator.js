import { generateWorksheet } from './worksheetGenerator.js';

class WorksheetCreator {
    constructor() {
        this.form = document.getElementById('worksheetForm');
        this.tasksList = document.getElementById('tasksList');
        this.preview = document.querySelector('.preview-content');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Task button handlers
        document.querySelectorAll('.task-buttons button').forEach(button => {
            button.addEventListener('click', () => 
                this.addTaskForm(button.dataset.taskType));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createWorksheet();
        });
    }

    addTaskForm(taskType) {
        const taskForm = this.createTaskForm(taskType);
        this.tasksList.appendChild(taskForm);
        this.updatePreview();
    }

    createTaskForm(taskType) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-form';
        
        // Add task-specific form fields based on type
        switch(taskType) {
            case 'multiChoice':
                taskDiv.innerHTML = this.createMultiChoiceForm();
                break;
            case 'fillBlanks':
                taskDiv.innerHTML = this.createFillBlanksForm();
                break;
            // Add other task types...
        }

        return taskDiv;
    }

    async createWorksheet() {
        const formData = this.collectFormData();
        const worksheet = await generateWorksheet(formData);
        
        // Save worksheet to GitHub Pages
        // This would need to be implemented based on your deployment strategy
        console.log('Worksheet generated:', worksheet);
    }
}

new WorksheetCreator();