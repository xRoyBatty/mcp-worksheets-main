import { loadSchemas, taskDescriptions } from './schemas/index.js';
import { generateWorksheet } from './quickWorksheetGenerator.js';

class QuickCreator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSchemas();
    }

    initializeElements() {
        this.jsonInput = document.getElementById('jsonInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.showExampleBtn = document.getElementById('showExampleBtn');
        this.showTasksBtn = document.getElementById('showTasksBtn');
        this.tasksList = document.getElementById('tasksList');
        this.schemaHint = document.getElementById('schemaHint');
        this.notification = document.getElementById('notification');
    }

    async loadSchemas() {
        try {
            const { base, tasks, generateFullExample } = await loadSchemas();
            this.schemas = { base, tasks };
            this.generateFullExample = generateFullExample;
            this.updateTasksList();
        } catch (error) {
            this.showNotification('Error loading schemas', 'error');
            console.error('Schema loading error:', error);
        }
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.createWorksheet());
        this.validateBtn.addEventListener('click', () => this.validateJson());
        this.showExampleBtn.addEventListener('click', () => this.toggleExample());
        this.showTasksBtn.addEventListener('click', () => this.toggleTasksList());
        
        // Add JSON formatting on input blur
        this.jsonInput.addEventListener('blur', () => this.formatJson());
    }

    updateTasksList() {
        const taskTypes = Object.keys(this.schemas.tasks);
        const tasksHtml = taskTypes.map(type => `
            <div class="task-type">
                <h4>${type}</h4>
                <p>${taskDescriptions[type]}</p>
                <button onclick="copyTaskExample('${type}')">Copy Example</button>
            </div>
        `).join('');

        this.tasksList.innerHTML = tasksHtml;

        // Add global function for copy buttons
        window.copyTaskExample = (type) => {
            const example = JSON.stringify(this.schemas.tasks[type], null, 2);
            navigator.clipboard.writeText(example);
            this.showNotification('Task example copied to clipboard', 'success');
        };
    }

    toggleExample() {
        const isHidden = this.schemaHint.classList.contains('hidden');
        if (isHidden) {
            const example = JSON.stringify(this.generateFullExample(), null, 2);
            this.schemaHint.querySelector('pre').textContent = example;
            this.schemaHint.classList.remove('hidden');
            this.tasksList.classList.add('hidden');
        } else {
            this.schemaHint.classList.add('hidden');
        }
    }

    toggleTasksList() {
        const isHidden = this.tasksList.classList.contains('hidden');
        if (isHidden) {
            this.tasksList.classList.remove('hidden');
            this.schemaHint.classList.add('hidden');
        } else {
            this.tasksList.classList.add('hidden');
        }
    }

    formatJson() {
        try {
            const value = this.jsonInput.value.trim();
            if (value) {
                const parsed = JSON.parse(value);
                this.jsonInput.value = JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            // If it's not valid JSON, leave as is
        }
    }

    validateJson() {
        try {
            const data = JSON.parse(this.jsonInput.value);
            const validationResult = this.validateWorksheetStructure(data);
            
            if (validationResult.valid) {
                this.showNotification('JSON structure is valid', 'success');
            } else {
                this.showNotification(`Invalid JSON: ${validationResult.errors.join(', ')}`, 'error');
            }
        } catch (error) {
            this.showNotification('Invalid JSON format', 'error');
        }
    }

    validateWorksheetStructure(data) {
        const errors = [];
        const required = ['title', 'level', 'category', 'skills', 'tasks'];

        // Check required fields
        required.forEach(field => {
            if (!data[field]) errors.push(`Missing ${field}`);
        });

        // Validate tasks
        if (Array.isArray(data.tasks)) {
            data.tasks.forEach((task, index) => {
                if (!task.type) {
                    errors.push(`Task ${index + 1} missing type`);
                } else if (!this.schemas.tasks[task.type]) {
                    errors.push(`Task ${index + 1} has invalid type: ${task.type}`);
                }
            });
        } else if (data.tasks) {
            errors.push('Tasks must be an array');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async createWorksheet() {
        try {
            const data = JSON.parse(this.jsonInput.value);
            const validationResult = this.validateWorksheetStructure(data);

            if (!validationResult.valid) {
                this.showNotification(`Validation failed: ${validationResult.errors.join(', ')}`, 'error');
                return;
            }

            const worksheet = await generateWorksheet(data);
            const folderName = this.generateFolderName(data);

            const response = await fetch('http://127.0.0.1:3000/api/create-worksheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderName: folderName,
                    worksheet: worksheet,
                    metadata: {
                        title: data.title,
                        level: data.level,
                        skills: data.skills,
                        category: data.category
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create worksheet');
            }

            this.showNotification('Worksheet created successfully!', 'success');
            this.jsonInput.value = '';
        } catch (error) {
            console.error('Error creating worksheet:', error);
            this.showNotification(error.message || 'Error creating worksheet', 'error');
        }
    }

    generateFolderName(data) {
        return `${data.level}-${data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}`;
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        
        setTimeout(() => {
            this.notification.className = 'notification';
        }, 3000);
    }
}

// Initialize the creator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuickCreator();
});