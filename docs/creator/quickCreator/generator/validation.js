/**
 * Task Validation System
 * Provides validation rules and helpers for task data
 */

const baseTaskRules = {
    required: ['type', 'title', 'instructions'],
    optional: ['metadata', 'hints']
};

const taskRules = {
    comprehension: {
        required: ['contentType', 'content', 'statements'],
        contentTypes: ['text', 'video', 'audio'],
        validate(data) {
            if (!this.contentTypes.includes(data.contentType)) {
                throw new Error(`Invalid content type: ${data.contentType}`);
            }
            if (!Array.isArray(data.statements) || data.statements.length === 0) {
                throw new Error('Statements array is required and must not be empty');
            }
            data.statements.forEach((statement, index) => {
                if (!statement.text || typeof statement.correct !== 'boolean') {
                    throw new Error(`Invalid statement at index ${index}`);
                }
            });
        }
    },

    multiChoice: {
        required: ['question', 'options'],
        validate(data) {
            if (!Array.isArray(data.options) || data.options.length < 2) {
                throw new Error('At least 2 options are required');
            }
            const correctOptions = data.options.filter(opt => opt.correct);
            if (correctOptions.length !== 1) {
                throw new Error('Exactly one correct option must be specified');
            }
        }
    },

    fillBlanks: {
        required: ['text'],
        validate(data) {
            const blanks = (data.text.match(/\[.*?\]/g) || []).length;
            if (blanks === 0) {
                throw new Error('Text must contain at least one blank [...]');
            }
        }
    },

    matching: {
        required: ['pairs'],
        validate(data) {
            if (!Array.isArray(data.pairs) || data.pairs.length < 2) {
                throw new Error('At least 2 pairs are required');
            }
            data.pairs.forEach((pair, index) => {
                if (!pair.id || !pair.left || !pair.right) {
                    throw new Error(`Invalid pair at index ${index}`);
                }
            });
        }
    },

    dictation: {
        required: ['text'],
        optional: ['maxAttempts'],
        validate(data) {
            if (data.maxAttempts && (!Number.isInteger(data.maxAttempts) || data.maxAttempts < 1)) {
                throw new Error('maxAttempts must be a positive integer');
            }
        }
    }
};

/**
 * Validates task data against defined rules
 */
export function validateTask(taskData) {
    // Check if task type is supported
    if (!taskRules[taskData.type]) {
        throw new Error(`Unsupported task type: ${taskData.type}`);
    }

    // Check base requirements
    for (const field of baseTaskRules.required) {
        if (!(field in taskData)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Check task-specific requirements
    const rules = taskRules[taskData.type];
    for (const field of rules.required) {
        if (!(field in taskData)) {
            throw new Error(`Missing required field for ${taskData.type}: ${field}`);
        }
    }

    // Run task-specific validation
    if (rules.validate) {
        rules.validate(taskData);
    }

    return true;
}

/**
 * Returns validation rules for a task type
 */
export function getValidationRules(taskType) {
    return {
        ...baseTaskRules,
        ...(taskRules[taskType] || {})
    };
}

/**
 * Checks if a task type is supported
 */
export function isTaskTypeSupported(taskType) {
    return taskType in taskRules;
}
