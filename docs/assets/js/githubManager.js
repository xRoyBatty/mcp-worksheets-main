export class GitHubManager {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO';
        this.token = process.env.GITHUB_TOKEN; // You'll need to set this up securely
    }

    async saveWorksheet(worksheet, metadata) {
        const path = this.generatePath(metadata);
        const content = btoa(JSON.stringify(worksheet, null, 2));

        // Create/update worksheet file
        await this.createOrUpdateFile(`docs/worksheets/${path}/index.html`, content);
        
        // Update hub index
        await this.updateHubIndex(metadata);
    }

    generatePath(metadata) {
        const slug = metadata.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        return `${metadata.level}-${slug}`;
    }

    async updateHubIndex(metadata) {
        // Update the hub's index.json with the new worksheet
        const indexPath = 'docs/data/worksheets.json';
        const currentIndex = await this.fetchFile(indexPath);
        
        currentIndex.worksheets.push({
            title: metadata.title,
            level: metadata.level,
            skills: metadata.skills,
            path: this.generatePath(metadata),
            metadata: metadata.metadata
        });

        await this.createOrUpdateFile(indexPath, btoa(JSON.stringify(currentIndex, null, 2)));
    }
} 