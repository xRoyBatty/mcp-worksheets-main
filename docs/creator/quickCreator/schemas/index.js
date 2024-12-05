async function loadJSON(path) {
    const response = await fetch(path);
    return response.json();
}

export async function loadSchemas() {
    const schemas = {
        base: await loadJSON('./schemas/base.json'),
        tasks: {
            multiChoice: await loadJSON('./schemas/tasks/multiChoice.json'),
            fillBlanks: await loadJSON('./schemas/tasks/fillBlanks.json'),
            matching: await loadJSON('./schemas/tasks/matching.json'),
            dictation: await loadJSON('./schemas/tasks/dictation.json'),
            comprehension: await loadJSON('./schemas/tasks/comprehension.json')
        }
    };

    return {
        ...schemas,
        generateFullExample: () => {
            const example = { ...schemas.base };
            example.tasks = [
                schemas.tasks.comprehension,
                schemas.tasks.multiChoice,
                schemas.tasks.fillBlanks
            ];
            return example;
        }
    };
}

export const taskDescriptions = {
    multiChoice: "Multiple choice questions with one correct answer",
    fillBlanks: "Text with missing words to fill in",
    matching: "Two columns of items to match",
    dictation: "Text to be written from audio",
    comprehension: "Text/video/audio with true/false questions"
};