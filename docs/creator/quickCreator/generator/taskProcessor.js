import { generateComprehensionTask } from './taskGenerators/comprehension.js';
import { generateMatchingTask } from './taskGenerators/matching.js';
import { generateDictationTask } from './taskGenerators/dictation.js';
import { generateMultiChoiceTask } from './taskGenerators/multiChoice.js';
import { generateFillBlanksTask } from './taskGenerators/fillBlanks.js';
import { replaceTemplatePlaceholders } from './templateProcessor.js';

const taskGenerators = {
    comprehension: generateComprehensionTask,
    matching: generateMatchingTask,
    dictation: generateDictationTask,
    multiChoice: generateMultiChoiceTask,
    fillBlanks: generateFillBlanksTask
};

export async function generateTaskHtml(task, taskNumber) {
    // Build task data object with common properties
    const taskData = {
        ...task,
        taskId: `${task.type}-${taskNumber}`,
        taskNumber: taskNumber
    };

    // Get the appropriate task generator
    const generator = taskGenerators[task.type];
    if (!generator) {
        throw new Error(`Unknown task type: ${task.type}`);
    }

    // Generate task-specific data
    const processedData = generator(taskData, taskNumber);

    // Generate final HTML using template
    return await replaceTemplatePlaceholders(task.type, processedData);
}