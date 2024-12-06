export function generateComprehensionTask(taskData) {
    return {
        ...taskData,
        statements: taskData.statements
            .map(statement => `
                -   ${statement.text}
            `)
            .join('\n')
    };
}