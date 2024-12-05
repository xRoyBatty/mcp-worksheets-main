import { loadSchemas, taskDescriptions } from './schemas/index.js';
import { generateWorksheet, setCreatorType } from '../worksheetGenerator.js';

class QuickCreator {
    constructor() {
        // Set creator type for template paths
        setCreatorType('quick');
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSchemas();
    }

    // Rest of the file remains the same...
