export function generateMatchingTask(taskData) {
    const pairsList = taskData.pairs.map(pair => `
        <div class="left-item" data-pair="${pair.id}">${pair.left}</div>
    `).join('');

    const matchesList = taskData.pairs.map(pair => `
        <div class="right-item" data-pair="${pair.id}">${pair.right}</div>
    `).join('');

    return {
        ...taskData,
        pairs: `
            <div class="left">
                ${pairsList}
            </div>
            <div class="right">
                ${matchesList}
            </div>
        `
    };
}