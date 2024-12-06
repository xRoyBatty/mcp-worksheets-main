export function generateDictationTask(taskData) {
    return {
        ...taskData,
        attempts: taskData.maxAttempts || 3,
        speedControls: `
::: speed-controls
0.75x
1x
:::`
    };
}