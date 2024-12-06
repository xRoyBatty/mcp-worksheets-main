export function generateMultiChoiceTask(taskData, taskNumber) {
    return {
        ...taskData,
        options: taskData.options.map(option => `
            <label>
                <input type="radio" name="q${taskNumber}" value="${option.value}" 
                    ${option.correct ? 'data-correct="true"' : ''}>
                <span>${option.text}</span>
            </label>
        `).join('\n')
    };
}