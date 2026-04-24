const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const indexFile = path.join(dataDir, 'content-index.json');

function getJsonFiles(dir) {
    const fullPath = path.join(dataDir, dir);
    if (!fs.existsSync(fullPath)) return [];
    
    return fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => `${dir}/${file}`);
}

try {
    const contentIndex = {
        banners: getJsonFiles('banners'),
        products: getJsonFiles('products'),
        blog: getJsonFiles('blog')
    };

    fs.writeFileSync(indexFile, JSON.stringify(contentIndex, null, 2));
    console.log(`Successfully updated ${indexFile} with ${contentIndex.products.length} products, ${contentIndex.blog.length} blog posts, and ${contentIndex.banners.length} banners.`);
} catch (error) {
    console.error('Error generating content-index.json:', error);
    process.exit(1);
}
