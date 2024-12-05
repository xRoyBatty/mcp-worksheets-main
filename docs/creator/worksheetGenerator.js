export async function generateWorksheet(formData) {
    // Load the worksheet template
    const template = await loadTemplate();
    
    // Replace template placeholders with actual data
    let worksheet = template
        .replace('[Worksheet Title]', formData.title)
        .replace('[Level]', formData.level.toUpperCase())
        .replace('[Skills]', formData.skills.join(', '));

    // Generate tasks HTML
    const tasksHtml = formData.tasks.map((task, index) => {
        return generateTaskHtml(task, index + 1);
    }).join('\n');

    // Insert tasks into worksheet
    worksheet = worksheet.replace('<!-- Tasks will be inserted here -->', tasksHtml);

    return worksheet;
}

async function loadTemplate() {
    try {
        // Use absolute path from docs root
        const response = await fetch('/templates/worksheet.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading template:', error);
        throw new Error('Failed to load worksheet template');
    }
}

function generateTaskHtml(task, taskNumber) {
    switch (task.type) {
        case 'multiChoice':
            return generateMultipleChoiceHtml(task, taskNumber);
        case 'fillBlanks':
            return generateFillBlanksHtml(task, taskNumber);
        case 'matching':
            return generateMatchingHtml(task, taskNumber);
        case 'dictation':
            return generateDictationHtml(task, taskNumber);
        case 'comprehension':
            return generateComprehensionHtml(task, taskNumber);
        default:
            console.warn(`Unknown task type: ${task.type}`);
            return '';
    }
}

function generateComprehensionHtml(task, taskNumber) {
    let contentHtml = '';
    
    // Generate content based on type
    switch(task.contentType) {
        case 'text':
            contentHtml = `
                <div class="reading-content">
                    ${task.content}
                    <button class="text-to-speech-btn" aria-label="Read text aloud" title="Read text aloud">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            `;
            break;
        case 'video':
            contentHtml = `
                <div class="video-content">
                    <iframe 
                        src="https://www.youtube.com/embed/${task.videoId}" 
                        title="${task.title}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
            break;
        case 'audio':
            contentHtml = `
                <div class="audio-content">
                    <div class="audio-controls">
                        <button class="play-btn" aria-label="Play audio">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="pause-btn" aria-label="Pause audio" style="display: none;">
                            <i class="fas fa-pause"></i>
                        </button>
                        <button class="stop-btn" aria-label="Stop audio">
                            <i class="fas fa-stop"></i>
                        </button>
                    </div>
                    <div class="audio-progress">
                        <progress value="0" max="100"></progress>
                        <span class="time-display">00:00 / 00:00</span>
                    </div>
                </div>
            `;
    }

    return `
        <section class="task-container task comprehension" data-task-type="comprehension" data-task-id="comprehension-${taskNumber}">
            <h2>${taskNumber}. ${task.title}</h2>
            <p class="instructions">${task.instructions}</p>
            
            <div class="content">
                ${contentHtml}
                
                <div class="statements-container">
                    <ul class="true-false-list">
                        ${task.statements.map((statement, index) => `
                            <li class="true-false-item" data-statement-index="${index}">
                                <div class="true-false-statement">
                                    ${statement.text}
                                </div>
                                <div class="true-false-options">
                                    <label>
                                        <input type="radio" name="statement_${taskNumber}_${index}" value="true"> True
                                    </label>
                                    <label>
                                        <input type="radio" name="statement_${taskNumber}_${index}" value="false"> False
                                    </label>
                                </div>
                            </li>
                        `).join('\n')}
                    </ul>
                </div>
            </div>

            <div class="score-container"></div>
        </section>
    `;
}


function generateMultipleChoiceHtml(task, taskNumber) {
    return `
        <section class="task-container task multiple-choice">
            <h2>${taskNumber}. ${task.title}</h2>
            <p class="instructions">${task.instructions}</p>
            
            <div class="content">
                <div class="question">
                    <p>${task.question}</p>
                    <div class="options">
                        ${task.options.map(option => `
                            <label>
                                <input type="radio" name="q${taskNumber}" value="${option.value}" 
                                    ${option.correct ? 'data-correct="true"' : ''}>
                                <span>${option.text}</span>
                            </label>
                        `).join('\n')}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function generateFillBlanksHtml(task, taskNumber) {
    return `
        <section class="task-container task fill-blanks">
            <h2>${taskNumber}. ${task.title}</h2>
            <p class="instructions">${task.instructions}</p>
            
            <div class="content">
                ${task.text.replace(/\[([^\]]+)\]/g, (match, answer) => 
                    `<input type="text" data-correct="${answer}">`
                )}
            </div>
        </section>
    `;
}

function generateMatchingHtml(task, taskNumber) {
    return `
        <section class="task-container task matching">
            <h2>${taskNumber}. ${task.title}</h2>
            <p class="instructions">${task.instructions}</p>
            
            <div class="content">
                <div class="pairs">
                    <div class="left">
                        ${task.pairs.map(pair => `
                            <div class="item" data-pair="${pair.id}">${pair.left}</div>
                        `).join('\n')}
                    </div>
                    <div class="right">
                        ${task.pairs.map(pair => `
                            <div class="item" data-pair="${pair.id}">${pair.right}</div>
                        `).join('\n')}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function generateDictationHtml(task, taskNumber) {
    return `
        <section class="task-container task dictation">
            <h2>${taskNumber}. ${task.title}</h2>
            <p class="instructions">${task.instructions}</p>
            
            <div class="content">
                <div class="controls">
                    <button class="play-btn">Play</button>
                    <div class="speed-controls">
                        <button class="speed-btn" data-speed="0.75">0.75x</button>
                        <button class="speed-btn active" data-speed="1">1x</button>
                    </div>
                    <span class="attempts">Plays left: 3</span>
                </div>
                <textarea 
                    data-text="${task.text}" 
                    data-max-attempts="3"
                    placeholder="Type what you hear..."></textarea>
            </div>
        </section>
    `;
}