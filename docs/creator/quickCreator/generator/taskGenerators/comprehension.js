export function generateComprehensionTask(taskData) {
    return {
        ...taskData,
        // Generate proper true/false list items
        statements: taskData.statements
            .map((statement, index) => `
                <li class="true-false-item" data-statement-index="${index}">
                    <span class="true-false-statement">${statement.text}</span>
                    <div class="true-false-options">
                        <label>
                            <input type="radio" name="statement_${index}" value="true">
                            True
                        </label>
                        <label>
                            <input type="radio" name="statement_${index}" value="false">
                            False
                        </label>
                    </div>
                </li>
            `)
            .join('\n')
    };
}