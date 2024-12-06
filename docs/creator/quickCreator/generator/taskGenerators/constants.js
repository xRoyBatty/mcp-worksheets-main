/**
 * Shared constants for task generators
 */

// Task type class names - ensures consistency
export const TASK_CLASSES = {
    comprehension: 'comprehension',
    multiChoice: 'multiChoice',
    fillBlanks: 'fillBlanks',
    matching: 'matching',
    dictation: 'dictation'
};

// CSS classes structure
export const CLASS_STRUCTURE = {
    container: 'task-container task',
    content: 'content',
    controls: 'task-controls',
    score: 'score-container'
};

// Common elements structure
export const TEMPLATE_STRUCTURE = {
    taskWrapper: (type, content) => `
        <section class="${CLASS_STRUCTURE.container} ${TASK_CLASSES[type]}">
            ${content}
        </section>
    `,
    controls: `
        <div class="${CLASS_STRUCTURE.controls}">
            <button class="submit-btn" disabled>Check Answers</button>
            <button class="reset-btn">Reset</button>
        </div>
    `,
    score: `<div class="${CLASS_STRUCTURE.score}"></div>`
};
