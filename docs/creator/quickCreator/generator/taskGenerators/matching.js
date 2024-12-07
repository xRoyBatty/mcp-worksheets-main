export function generateMatchingTask(taskData) {
    // Generate proper HTML structure for matching pairs
    const leftItems = taskData.pairs
        .map(pair => `<div class="item left-item" data-pair="${pair.id}">${pair.left}</div>`)
        .join('\n');

    const rightItems = taskData.pairs
        .map(pair => `<div class="item right-item" data-pair="${pair.id}">${pair.right}</div>`)
        .join('\n');

    return {
        ...taskData,
        pairs: `
            <div class="left">${leftItems}</div>
            <div class="right">${rightItems}</div>
        `
    };
}