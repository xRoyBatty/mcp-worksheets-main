/**
 * Template processing utilities
 */

// Common replacement patterns
const PATTERNS = {
    handlebars: /\{\{([^}]+)\}\}/g,  // {{variable}}
    eachBlock: /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,  // {{#each items}}...{{/each}}
    ifBlock: /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,  // {{#if condition}}...{{/if}}
    comment: /<!--.*?-->/g  // <!-- comment -->
};

/**
 * Process array with template
 * @param {Array} items - Array to iterate over
 * @param {string} template - Template string
 * @param {Object} context - Additional context
 */
export function processEach(items, template, context = {}) {
    return items.map((item, index) => {
        const itemContext = {
            ...context,
            '@index': index,
            '@first': index === 0,
            '@last': index === items.length - 1,
            ...item
        };
        return replacePlaceholders(template, itemContext);
    }).join('\n');
}

/**
 * Replace placeholders in template
 * @param {string} template - Template string
 * @param {Object} data - Data object
 */
export function replacePlaceholders(template, data) {
    let result = template;

    // Process {{#each}} blocks first
    result = result.replace(PATTERNS.eachBlock, (match, arrayName, innerTemplate) => {
        const items = data[arrayName];
        if (!Array.isArray(items)) return '';
        return processEach(items, innerTemplate, data);
    });

    // Process {{#if}} blocks
    result = result.replace(PATTERNS.ifBlock, (match, condition, content) => {
        const value = evaluateCondition(condition, data);
        return value ? replacePlaceholders(content, data) : '';
    });

    // Replace simple variables
    result = result.replace(PATTERNS.handlebars, (match, path) => {
        return getValueByPath(data, path.trim()) ?? match;
    });

    return result;
}

/**
 * Get value from object by dot path
 */
function getValueByPath(obj, path) {
    return path.split('.').reduce((current, part) => {
        return current?.[part];
    }, obj);
}

/**
 * Simple condition evaluator
 */
function evaluateCondition(condition, data) {
    // Add more complex condition evaluation if needed
    const value = getValueByPath(data, condition);
    return Boolean(value);
}
