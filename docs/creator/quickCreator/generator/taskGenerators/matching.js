export function generateMatchingTask(taskData) {
    return {
        ...taskData,
        leftItems: taskData.pairs
            .map(pair => `   ${pair.left}`)
            .join('\n'),
        rightItems: taskData.pairs
            .map(pair => `   ${pair.right}`)
            .join('\n')
    };
}