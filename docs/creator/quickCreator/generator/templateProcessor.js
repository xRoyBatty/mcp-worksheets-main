export async function replaceTemplatePlaceholders(taskType, data) {
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