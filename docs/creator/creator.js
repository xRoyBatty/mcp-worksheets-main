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
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createWorksheet();
        });

        // Add live preview updates
        this.form.addEventListener('input', () => this.updatePreview());
    }

    addTaskForm(taskType) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-form';
        const timestamp = Date.now(); // Create a unique timestamp for this task
        
        switch (taskType) {
            case 'multiChoice':
                taskDiv.innerHTML = `
                    <h3>Multiple Choice Task</h3>
                    <div class="form-group">
                        <label>Question</label>
                        <input type="text" class="task-question" required>
                    </div>
                    <div class="options-container">
                        <div class="option">
                            <input type="text" placeholder="Option 1" required>
                            <input type="radio" name="correct-${timestamp}" value="0" required>
                        </div>
                        <div class="option">
                            <input type="text" placeholder="Option 2" required>
                            <input type="radio" name="correct-${timestamp}" value="1">
                        </div>
                    </div>
                    <button type="button" class="add-option">Add Option</button>
                `;
                break;

            case 'fillBlanks':
                taskDiv.innerHTML = `
                    <h3>Fill in the Blanks Task</h3>
                    <div class="form-group">
                        <label>Text (use [word] for blanks)</label>
                        <textarea class="task-text" required></textarea>
                    </div>
                `;
                break;

            case 'matching':
                taskDiv.innerHTML = `
                    <h3>Matching Task</h3>
                    <div class="pairs-container">
                        <div class="pair">
                            <input type="text" placeholder="Left item" required>
                            <input type="text" placeholder="Right item" required>
                        </div>
                    </div>
                    <button type="button" class="add-pair">Add Pair</button>
                `;
                break;

            case 'dictation':
                taskDiv.innerHTML = `
                    <h3>Dictation Task</h3>
                    <div class="form-group">
                        <label>Text to dictate</label>
                        <textarea class="task-text" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Max attempts</label>
                        <input type="number" class="max-attempts" value="3" min="1" max="5">
                    </div>
                `;
                break;
        }

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Task';
        removeBtn.className = 'remove-task';
        removeBtn.onclick = () => taskDiv.remove();
        taskDiv.appendChild(removeBtn);

        // Add event listeners for "Add Option" and "Add Pair" buttons
        if (taskType === 'multiChoice') {
            const addOptionBtn = taskDiv.querySelector('.add-option');
            addOptionBtn.addEventListener('click', () => {
                const optionsContainer = taskDiv.querySelector('.options-container');
                const newOption = document.createElement('div');
                newOption.className = 'option';
                newOption.innerHTML = `
                    <input type="text" placeholder="Option ${optionsContainer.children.length + 1}" required>
                    <input type="radio" name="correct-${timestamp}" value="${optionsContainer.children.length}">
                `;
                optionsContainer.appendChild(newOption);
            });
        }

        if (taskType === 'matching') {
            const addPairBtn = taskDiv.querySelector('.add-pair');
            addPairBtn.addEventListener('click', () => {
                const pairsContainer = taskDiv.querySelector('.pairs-container');
                const newPair = document.createElement('div');
                newPair.className = 'pair';
                newPair.innerHTML = `
                    <input type="text" placeholder="Left item" required>
                    <input type="text" placeholder="Right item" required>
                `;
                pairsContainer.appendChild(newPair);
            });
        }

        this.tasksList.appendChild(taskDiv);
    }

    collectFormData() {
        const formData = {
            title: document.getElementById('title').value,
            level: document.getElementById('level').value,
            category: document.getElementById('category').value,
            skills: Array.from(document.getElementById('skills').selectedOptions)
                        .map(opt => opt.value),
            tasks: this.collectTasks(),
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0'
            }
        };

        return formData;
    }

    collectTasks() {
        const tasks = [];
        const taskForms = this.tasksList.querySelectorAll('.task-form');

        taskForms.forEach(form => {
            if (form.querySelector('.task-question')) {
                // Multiple Choice Task
                const options = [];
                form.querySelectorAll('.option').forEach((opt, index) => {
                    options.push({
                        text: opt.querySelector('input[type="text"]').value,
                        value: index,
                        correct: opt.querySelector('input[type="radio"]').checked
                    });
                });

                tasks.push({
                    type: 'multiChoice',
                    title: 'Multiple Choice Question',
                    instructions: 'Choose the correct answer',
                    question: form.querySelector('.task-question').value,
                    options: options
                });
            } else if (form.querySelector('.task-text')) {
                const textArea = form.querySelector('.task-text');
                if (form.querySelector('.max-attempts')) {
                    // Dictation Task
                    tasks.push({
                        type: 'dictation',
                        title: 'Dictation Exercise',
                        instructions: 'Listen and type what you hear',
                        text: textArea.value,
                        maxAttempts: form.querySelector('.max-attempts').value
                    });
                } else {
                    // Fill in the Blanks Task
                    tasks.push({
                        type: 'fillBlanks',
                        title: 'Fill in the Blanks',
                        instructions: 'Fill in the blanks with the correct words',
                        text: textArea.value
                    });
                }
            } else if (form.querySelector('.pairs-container')) {
                // Matching Task
                const pairs = [];
                form.querySelectorAll('.pair').forEach((pair, index) => {
                    const [left, right] = pair.querySelectorAll('input[type="text"]');
                    pairs.push({
                        id: index + 1,
                        left: left.value,
                        right: right.value
                    });
                });

                tasks.push({
                    type: 'matching',
                    title: 'Matching Exercise',
                    instructions: 'Match the items from the left column with the corresponding items from the right column',
                    pairs: pairs
                });
            }
        });

        return tasks;
    }

    async createWorksheet() {
        try {
            const formData = this.collectFormData();
            const worksheet = await generateWorksheet(formData);
            
            // Generate the path for the worksheet
            const path = this.generatePath(formData);
            
            // Save worksheet HTML file
            await this.saveWorksheetFile(path, worksheet);
            
            // Update index.json
            await this.updateIndex(formData, path);
            
            this.showNotification('Worksheet created successfully! Don\'t forget to commit and push your changes.', 'success');
            
            // Reset form
            this.form.reset();
            this.tasksList.innerHTML = '';
            this.preview.innerHTML = '';
        } catch (error) {
            console.error('Error creating worksheet:', error);
            this.showNotification('Error creating worksheet. Check console for details.', 'error');
        }
    }

    generatePath(formData) {
        return `${formData.level}-${formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}`;
    }

    async saveWorksheetFile(path, content) {
        // Create directory if it doesn't exist
        const dirPath = `../worksheets/${path}`;
        const filePath = `${dirPath}/index.html`;

        try {
            // Save the file
            const blob = new Blob([content], { type: 'text/html' });
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: filePath,
                types: [{
                    description: 'HTML Files',
                    accept: { 'text/html': ['.html'] },
                }],
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error('Error saving worksheet file:', error);
            throw error;
        }
    }

    async updateIndex(formData, path) {
        try {
            // Load current index
            const response = await fetch('../data/worksheets.json');
            const index = await response.json();

            // Add new worksheet
            index.worksheets.push({
                title: formData.title,
                level: formData.level,
                skills: formData.skills,
                path: path,
                category: formData.category
            });

            // Save updated index
            const blob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json' });
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: '../data/worksheets.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error('Error updating index:', error);
            throw error;
        }
    }

    showNotification(message, type) {
        // Implementation of notification system
    }

    async updatePreview() {
        try {
            const formData = this.collectFormData();
            const worksheet = await generateWorksheet(formData);
            
            // Extract just the tasks section for preview
            const tasksMatch = worksheet.match(/<div class="tasks">([\s\S]*?)<\/div>/);
            if (tasksMatch) {
                this.preview.innerHTML = tasksMatch[1];
            }
        } catch (error) {
            console.error('Error updating preview:', error);
            this.preview.innerHTML = '<p class="error">Error generating preview</p>';
        }
    }
}

new WorksheetCreator();