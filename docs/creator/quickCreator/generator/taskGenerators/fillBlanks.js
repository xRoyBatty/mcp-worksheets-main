export function generateFillBlanksTask(taskData) {
    return {
        ...taskData,
        text: taskData.text.replace(/\[(.*?)\]/g, (match, word) => 
            `<input type="text" data-answer="${word}" class="fill-blank">`
        )
    };
}