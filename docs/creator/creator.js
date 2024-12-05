import { generateWorksheet, setCreatorType } from './worksheetGenerator.js';

class WorksheetCreator {
    constructor() {
        // Set creator type for template paths
        setCreatorType('regular');
        
        this.form = document.getElementById('worksheetForm');
        this.tasksList = document.getElementById('tasksList');
        this.preview = document.querySelector('.preview-content');
        this.setupEventListeners();
        this.addJsonImportButton();
        
        // Create notification element
        this.notification = document.createElement('div');
        this.notification.className = 'notification';
        document.body.appendChild(this.notification);
    }

    // Rest of the file remains the same...
