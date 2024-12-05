// Configuration for different creators
const creatorConfig = {
    quick: {
        templatePath: '/templates/worksheet.html',
        tasksPath: '/templates/tasks/'
    },
    regular: {
        templatePath: '../templates/worksheet.html',
        tasksPath: '../templates/tasks/'
    }
};

// Default to regular creator
let currentConfig = creatorConfig.regular;

// Function to set creator type
export function setCreatorType(type) {
    currentConfig = creatorConfig[type] || creatorConfig.regular;
}

export async function generateWorksheet(formData) {
    // Load the worksheet template
    const template = await loadTemplate();
    
    // Replace template placeholders with actual data
    let worksheet = template
        .replace('[Worksheet Title]', formData.title)
        .replace('[Level]', formData.level.toUpperCase())
        .replace('[Skills]', formData.skills.join(', '));

    // Generate tasks HTML
    const tasksHtml = formData.tasks.map((task, index) => {
        return generateTaskHtml(task, index + 1);
    }).join('\n');

    // Insert tasks into worksheet
    worksheet = worksheet.replace('<!-- Tasks will be inserted here -->', tasksHtml);

    return worksheet;
}

async function loadTemplate() {
    try {
        const response = await fetch(currentConfig.templatePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading template:', error);
        throw new Error('Failed to load worksheet template');
    }
}

// Rest of the file remains the same with all the generateTaskHtml functions...
