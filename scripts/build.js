const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

// Read the markdown file
const markdownPath = 'src/content/pages/index.md';
const outputPath = 'public/index.html';

// Simple HTML template
const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
    {{content}}
</body>
</html>
`;

async function buildPage() {
    // Read markdown file
    const markdown = await fs.readFile(markdownPath, 'utf-8');
    
    // Parse front matter
    const { attributes, body } = frontMatter(markdown);
    
    // Convert markdown to HTML
    const content = marked.parse(body);
    
    // Replace template variables
    const html = template
        .replace('{{title}}', attributes.title)
        .replace('{{content}}', content);
    
    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath));
    
    // Write the HTML file
    await fs.writeFile(outputPath, html);
    
    console.log(`Built ${outputPath}`);
}

buildPage().catch(console.error); 