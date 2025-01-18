const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

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
    <nav>
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact.html">Contact</a>
    </nav>
    <main>
        {{content}}
    </main>
    <footer>
        <p>&copy; 2024</p>
    </footer>
</body>
</html>
`;

async function buildPage(markdownFile) {
    const markdownPath = path.join('src/content/pages', markdownFile);
    const outputPath = path.join('public', markdownFile.replace('.md', '.html'));
    
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

async function buildSite() {
    // Get all markdown files
    const files = await fs.readdir('src/content/pages');
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Build each page
    for (const file of markdownFiles) {
        await buildPage(file);
    }
}

buildSite().catch(console.error); 