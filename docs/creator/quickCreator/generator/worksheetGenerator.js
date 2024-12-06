import { getTaskGenerator } from './taskGenerators/index.js';
import { replaceTemplatePlaceholders } from './templateProcessor.js';

/**
 * Validates worksheet data against expected structure
 */
function validateWorksheetData(data) {
    const required = ['title', 'level', 'tasks'];
    for (const field of required) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error('Worksheet must contain at least one task');
    }

    // Validate each task has required fields
    data.tasks.forEach((task, index) => {
        if (!task.type) {
            throw new Error(`Task ${index + 1} missing required field: type`);
        }
        if (!task.title) {
            throw new Error(`Task ${index + 1} missing required field: title`);
        }
    });
}

/**
 * Processes metadata into HTML
 */
function generateMetadataHtml(metadata) {
    if (!metadata) return '';

    const sections = [];
    
    if (metadata.description) {
        sections.push(`<div class="worksheet-description">${metadata.description}</div>`);
    }

    if (metadata.objectives?.length) {
        sections.push(`
            <div class="worksheet-objectives">
                <h3>Learning Objectives</h3>
                <ul>
                    ${metadata.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
        `);
    }

    if (metadata.prerequisites?.length) {
        sections.push(`
            <div class="worksheet-prerequisites">
                <h3>Prerequisites</h3>
                <ul>
                    ${metadata.prerequisites.map(pre => `<li>${pre}</li>`).join('')}
                </ul>
            </div>
        `);
    }

    return sections.join('\n');
}

/**
 * Generates complete worksheet HTML from data
 */
export async function generateWorksheet(worksheetData) {
    try {
        // Validate input data
        validateWorksheetData(worksheetData);

        // Load the base template
        const template = await fetch('/api/templates/worksheet').then(r => r.text());
        
        // Replace basic placeholders
        let worksheet = template
            .replace('[Worksheet Title]', worksheetData.title)
            .replace('[Level]', worksheetData.level.toUpperCase())
            .replace('[Skills]', worksheetData.skills?.join(', ') || '')
            .replace('[Time]', worksheetData.metadata?.estimatedTime || '30 minutes');

        // Generate metadata HTML if present
        const metadataHtml = generateMetadataHtml(worksheetData.metadata);
        worksheet = worksheet.replace('<!-- Metadata will be inserted here -->', metadataHtml);

        // Generate tasks HTML
        const tasksHtml = await Promise.all(
            worksheetData.tasks.map(async (task, index) => {
                try {
                    const generator = getTaskGenerator(task.type);
                    const taskData = {
                        ...task,
                        taskId: `${task.type}-${index + 1}`,
                        taskNumber: index + 1
                    };
                    
                    const processedData = generator(taskData);
                    return await replaceTemplatePlaceholders(task.type, processedData);
                } catch (error) {
                    console.error(`Error generating task ${index + 1}:`, error);
                    return `<!-- Error generating task ${index + 1}: ${error.message} -->`;
                }
            })
        );

        // Insert tasks
        worksheet = worksheet.replace(
            '<!-- Tasks will be inserted here -->', 
            tasksHtml.join('\n')
        );

        return worksheet;

    } catch (error) {
        console.error('Error generating worksheet:', error);
        throw new Error(`Failed to generate worksheet: ${error.message}`);
    }
}
