import { generateComprehensionTask } from './generator/taskGenerators/comprehension.js';
import { generateMatchingTask } from './generator/taskGenerators/matching.js';

export async function generateWorksheet(worksheetData) {
    try {
        // Load the base template through API
        const template = await fetch('http://127.0.0.1:3000/api/templates/worksheet').then(r => r.text());
        
        // Replace basic placeholders
        let worksheet = template
            .replace('[Worksheet Title]', worksheetData.title)
            .replace('[Level]', worksheetData.level.toUpperCase())
            .replace('[Skills]', worksheetData.skills.join(', '));

        // Get task HTML from data
        const tasksHtml = await Promise.all(
            worksheetData.tasks.map((task, index) => 
                generateTaskHtml(task, index + 1)
            )
        );

        // Insert tasks into worksheet
        return worksheet.replace('<!-- Tasks will be inserted here -->', tasksHtml.join('\n'));
    } catch (error) {
        console.error('Error generating worksheet:', error);
        throw new Error('Failed to generate worksheet');
    }
}

async function generateTaskHtml(task, taskNumber) {
    // Build task data object
    const taskData = {
        ...task,
        taskId: `${task.type}-${taskNumber}`,
        taskNumber: taskNumber
    };

    // Task-specific data transformations
    switch (task.type) {
        case 'comprehension':
            return await replaceTemplatePlaceholders(task.type, generateComprehensionTask(taskData));
            
        case 'matching':
            return await replaceTemplatePlaceholders(task.type, generateMatchingTask(taskData));
            
        case 'dictation':
            taskData.attempts = task.maxAttempts || 3;
            taskData.speedControls = `
::: speed-controls
0.75x
1x
:::`;
            break;
            
        case 'multiChoice':
            taskData.options = generateOptionsHtml(task.options, taskNumber);
            break;
            
        case 'fillBlanks':
            taskData.text = task.text.replace(/\[(.*?)\]/g, (match, word) => 
                `<input type="text" data-answer="${word}" class="fill-blank">`
            );
            break;
    }

    return await replaceTemplatePlaceholders(task.type, taskData);
}

function generateOptionsHtml(options, taskNumber) {
    return options.map(option => `
        <label>
            <input type="radio" name="q${taskNumber}" value="${option.value}" 
                ${option.correct ? 'data-correct="true"' : ''}>
            <span>${option.text}</span>
        </label>
    `).join('\n');
}

async function replaceTemplatePlaceholders(taskType, data) {
    try {
        const template = await fetch(`http://127.0.0.1:3000/api/templates/tasks/${taskType}`).then(r => r.text());
        
        // Replace placeholders
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            return data[key] ?? match;
        });
    } catch (error) {
        console.error(`Error loading template for task type ${taskType}:`, error);
        throw new Error(`Failed to load task template: ${taskType}`);
    }
}