import { generateComprehensionTask } from './generator/taskGenerators/comprehension.js';
import { generateMatchingTask } from './generator/taskGenerators/matching.js';
import { generateDictationTask } from './generator/taskGenerators/dictation.js';
import { generateMultiChoiceTask } from './generator/taskGenerators/multiChoice.js';
import { generateFillBlanksTask } from './generator/taskGenerators/fillBlanks.js';

const taskGenerators = {
    comprehension: generateComprehensionTask,
    matching: generateMatchingTask,
    dictation: generateDictationTask,
    multiChoice: generateMultiChoiceTask,
    fillBlanks: generateFillBlanksTask
};

export async function generateWorksheet(worksheetData) {
    try {
        // Load the base template through API
        const template = await fetch('http://127.0.0.1:3000/api/templates/worksheet').then(r => r.text());
        
        // Replace basic placeholders
        let worksheet = template
            .replace('[Worksheet Title]', worksheetData.title)
            .replace('[Level]', worksheetData.level.toUpperCase())
            .replace('[Skills]', worksheetData.skills.join(', '));

        // Generate task HTML using our modular generators
        const tasksHtml = await Promise.all(
            worksheetData.tasks.map(async (task, index) => {
                const taskNumber = index + 1;
                const processedData = taskGenerators[task.type]?.({
                    ...task,
                    taskNumber,
                    taskId: `${task.type}-${taskNumber}`
                });

                if (!processedData) {
                    throw new Error(`Unknown task type: ${task.type}`);
                }

                return await replaceTemplatePlaceholders(task.type, processedData);
            })
        );

        // Insert tasks into worksheet
        return worksheet.replace('<!-- Tasks will be inserted here -->', tasksHtml.join('\n'));
    } catch (error) {
        console.error('Error generating worksheet:', error);
        throw new Error(`Failed to generate worksheet: ${error.message}`);
    }
}

async function replaceTemplatePlaceholders(taskType, data) {
    try {
        const template = await fetch(`http://127.0.0.1:3000/api/templates/tasks/${taskType}`).then(r => r.text());
        
        // Replace placeholders
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const value = data[key];
            if (value === undefined || value === null) return match;
            return value;
        });
    } catch (error) {
        console.error(`Error loading template for task type ${taskType}:`, error);
        throw new Error(`Failed to load task template: ${taskType}`);
    }
}