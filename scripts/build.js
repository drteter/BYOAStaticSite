const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

// Base template function
function createTemplate(title, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
        ${content}
    </main>
    <footer>
        <p>&copy; 2024</p>
    </footer>
</body>
</html>`;
}

function createBlogTemplate(title, date, content) {
    // Format the date nicely
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact.html">Contact</a>
    </nav>
    <main class="blog-post">
        <article>
            <h1>${title}</h1>
            <time>${formattedDate}</time>
            ${content}
        </article>
    </main>
    <footer>
        <p>&copy; 2024</p>
    </footer>
</body>
</html>`;
}

function createBlogIndexTemplate(posts) {
    const postsList = posts.map(post => `
        <article class="blog-preview">
            <h2><a href="/blog/${post.slug}.html">${post.title}</a></h2>
            <time>${post.date}</time>
        </article>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Posts</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about.html">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact.html">Contact</a>
    </nav>
    <main class="blog-index">
        <h1>Blog Posts</h1>
        <div class="posts-list">
            ${postsList}
        </div>
    </main>
    <footer>
        <p>&copy; 2024</p>
    </footer>
</body>
</html>`;
}

// Function to build markdown pages
async function buildPage(markdownFile) {
    if (markdownFile === 'index.md') {
        await buildIndexPage();
        return;
    }

    const markdownPath = path.join('src/content/pages', markdownFile);
    const outputPath = path.join('public', markdownFile.replace('.md', '.html'));
    
    const markdown = await fs.readFile(markdownPath, 'utf-8');
    const { attributes, body } = frontMatter(markdown);
    const content = marked.parse(body);
    
    const html = createTemplate(attributes.title, content);
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html);
    
    console.log(`Built ${outputPath}`);
}

// Special function for index page
async function buildIndexPage() {
    const indexContent = `
        <div class="hero-section">
            <h1>Welcome to the</h1>
            <h2 class="gradient-text">My Personal Website</h2>
            
            <div class="hero-description">
                <p>I've condensed <span class="highlight">10+ years of experience</span> into 
                articles and posts to share my journey.</p>
                
                <p>Learn from my experiences, so you don't have to learn the hard way...</p>
            </div>

            <button class="cta-button">Find Out More 👇</button>
        </div>

        <div class="achievements-section">
            <h2>I've written over 100 articles about technology and development</h2>
            
            <div class="recent-posts">
                <h3>Recent Posts</h3>
                <ul>
                    <li><a href="/blog/first-post.html">First Blog Post</a></li>
                    <li><a href="/blog/another-post.html">Another Post</a></li>
                </ul>
            </div>
        </div>

        <div class="testimonials-section">
            <h2>What Readers Are Saying</h2>
            <div class="testimonials-grid">
                <div class="testimonial">
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p>"Great insights and well-written articles. Always looking forward to new posts!"</p>
                    <p class="author">- John D.</p>
                </div>
                <div class="testimonial">
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p>"The technical explanations are clear and easy to follow."</p>
                    <p class="author">- Sarah M.</p>
                </div>
            </div>
        </div>`;
    
    const html = createTemplate('Welcome to My Site', indexContent);
    await fs.ensureDir('public');
    await fs.writeFile('public/index.html', html);
    console.log('Built public/index.html');
}

async function copyAssets() {
    // Ensure the public/styles directory exists
    await fs.ensureDir('public/styles');
    // Copy the CSS file
    await fs.copy('src/styles/main.css', 'public/styles/main.css');
    console.log('Copied assets to public directory');
}

async function buildSite() {
    // Clean the public directory first
    await fs.remove('public');
    
    // Copy assets
    await copyAssets();
    
    // Build regular pages
    const pageFiles = await fs.readdir('src/content/pages');
    const markdownPages = pageFiles.filter(file => file.endsWith('.md'));
    
    for (const file of markdownPages) {
        await buildPage(file);
    }
    
    // Build blog posts and collect their data
    await fs.ensureDir('src/content/blog');
    const blogFiles = await fs.readdir('src/content/blog');
    const markdownPosts = blogFiles.filter(file => file.endsWith('.md'));
    
    const posts = [];
    for (const file of markdownPosts) {
        const markdown = await fs.readFile(path.join('src/content/blog', file), 'utf-8');
        const { attributes } = frontMatter(markdown);
        posts.push({
            title: attributes.title,
            date: new Date(attributes.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }),
            slug: file.replace('.md', '')
        });
        await buildBlogPost(file);
    }
    
    // Build the blog index page
    await buildBlogIndex(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
}

async function buildBlogPost(markdownFile) {
    const markdownPath = path.join('src/content/blog', markdownFile);
    const outputPath = path.join('public/blog', markdownFile.replace('.md', '.html'));
    
    const markdown = await fs.readFile(markdownPath, 'utf-8');
    const { attributes, body } = frontMatter(markdown);
    const content = marked.parse(body);
    
    const html = createBlogTemplate(attributes.title, attributes.date, content);
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html);
    
    console.log(`Built ${outputPath}`);
}

async function buildBlogIndex(posts) {
    const html = createBlogIndexTemplate(posts);
    const outputPath = path.join('public/blog/index.html');
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html);
    
    console.log('Built blog index page');
}

buildSite().catch(console.error); 