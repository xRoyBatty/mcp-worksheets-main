const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from the docs directory
app.use(express.static(path.join(__dirname, '../docs')));

// API endpoint for creating worksheets
app.post('/api/create-worksheet', async (req, res) => {
    try {
        const { folderName, worksheet, metadata } = req.body;
        const baseDir = path.join(__dirname, '../docs');
        
        // Create worksheet directory and save index.html
        const worksheetDir = path.join(baseDir, 'worksheets', folderName);
        await fs.mkdir(worksheetDir, { recursive: true });
        await fs.writeFile(
            path.join(worksheetDir, 'index.html'),
            worksheet
        );

        // Create data directory and save/update worksheets.json
        const dataDir = path.join(baseDir, 'data');
        await fs.mkdir(dataDir, { recursive: true });
        
        const indexPath = path.join(dataDir, 'worksheets.json');
        let index = { worksheets: [] };
        
        try {
            const existingData = await fs.readFile(indexPath, 'utf8');
            index = JSON.parse(existingData);
        } catch (error) {
            console.log('No existing worksheets.json, creating new one');
        }

        // Add new worksheet to index
        index.worksheets.push({
            ...metadata,
            path: folderName
        });

        // Write updated index
        await fs.writeFile(
            indexPath,
            JSON.stringify(index, null, 2),
            'utf8'
        );

        console.log(`Created worksheet at: ${worksheetDir}`);
        console.log(`Updated index at: ${indexPath}`);

        res.json({ 
            success: true,
            paths: {
                worksheet: worksheetDir,
                index: indexPath
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Failed to create worksheet',
            details: error.message 
        });
    }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../docs/index.html'));
});

const PORT = 5500;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    console.log(`Serving files from: ${path.join(__dirname, '../docs')}`);
}); 