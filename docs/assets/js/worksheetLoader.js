async function loadWorksheetMetadata() {
    const response = await fetch('../data/catalog.json');
    const catalog = await response.json();
    
    const metaFiles = await loadDirectoryContents('/docs/data/worksheets/');
    const worksheets = [];
    
    for (const file of metaFiles) {
        if (file.name.endsWith('-meta.json')) {
            const metaResponse = await fetch(`../data/worksheets/${file.name}`);
            const metadata = await metaResponse.json();
            worksheets.push(metadata);
        }
    }
    
    return { catalog, worksheets };
}

async function generateFromJson(jsonPath) {
    const response = await fetch(jsonPath);
    const worksheetData = await response.json();
    return generateWorksheet(worksheetData);
}

export { loadWorksheetMetadata, generateFromJson };