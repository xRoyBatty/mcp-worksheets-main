export async function generateWorksheet(worksheetData) {
    try {
        // Load the base template
        const template = await fetch('../../templates/worksheet.html').then(r => r.text());
        
        // Replace basic placeholders
        let worksheet = template
            .replace('[Worksheet Title]', worksheetData.title)
            .replace('[Level]', worksheetData.level.toUpperCase())
            .replace('[Skills]', worksheetData.skills.join(', '));

        // Get task HTML from data
        const tasksHtml = worksheetData.tasks.map((task, index) => {
            return generateTaskHtml(task, index + 1);
        }).join('\n');

        // Insert tasks into worksheet
        return worksheet.replace('<!-- Tasks will be inserted here -->', tasksHtml);
    } catch (error) {
        console.error('Error generating worksheet:', error);
        throw new Error('Failed to generate worksheet');
    }
}

function generateTaskHtml(task, taskNumber) {
    // Load task template based on type and fill it with data
    const templatePath = `../../templates/tasks/${task.type}.html`;
    
    // Build task data object
    const taskData = {
        ...task,
        taskId: `${task.type}-${taskNumber}`,
        taskNumber: taskNumber
    };

    return replaceTemplatePlaceholders(templatePath, taskData);
}

async function replaceTemplatePlaceholders(templatePath, data) {
    try {
        const template = await fetch(templatePath).then(r => r.text());
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            return data[key] ?? match;
        });
    } catch (error) {
        console.error(`Error loading template ${templatePath}:`, error);
        throw new Error(`Failed to load task template: ${data.type}`);
    }
}