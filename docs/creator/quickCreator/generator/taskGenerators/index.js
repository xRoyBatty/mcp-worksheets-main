import { generateComprehensionTask } from './comprehension.js';
import { generateMatchingTask } from './matching.js';
import { generateDictationTask } from './dictation.js';
import { generateMultiChoiceTask } from './multiChoice.js';
import { generateFillBlanksTask } from './fillBlanks.js';

export const taskGenerators = {
    comprehension: generateComprehensionTask,
    matching: generateMatchingTask,
    dictation: generateDictationTask,
    multiChoice: generateMultiChoiceTask,
    fillBlanks: generateFillBlanksTask
};

// Helper to validate if task type is supported
export function isTaskTypeSupported(type) {
    return type in taskGenerators;
}

// Helper to get task generator
export function getTaskGenerator(type) {
    if (!isTaskTypeSupported(type)) {
        throw new Error(`Unsupported task type: ${type}`);
    }
    return taskGenerators[type];
}

// Export individual generators for direct access if needed
export {
    generateComprehensionTask,
    generateMatchingTask,
    generateDictationTask,
    generateMultiChoiceTask,
    generateFillBlanksTask
};