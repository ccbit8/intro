const Critters = require('critters');
const fs = require('fs');
const path = require('path');

async function optimize() {
    const htmlPath = path.join(__dirname, '../.next/server/app/index.html');
    if (!fs.existsSync(htmlPath)) {
        console.error('HTML not found:', htmlPath);
        return;
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Critters configuration
    const critters = new Critters({
        path: path.join(__dirname, '../.next/'), // Base path for assets
        publicPath: '/_next/',                   // Public path prefix to strip
        compress: true,
        pruneSource: false,                      // Keep external sheets for hydration
        inlineFonts: true,
        preload: 'media',                        // Preload external sheets
        // reduceInlineStyles: false,
        properties: {
            // Keep specific properties if lost
        }
    });

    try {
        const result = await critters.process(html);
        console.log('Optimization success!');
        // Check if style tags are present
        if (result.includes('<style')) {
            console.log('✅ Inline styles detected');
            // Write back
             fs.writeFileSync(htmlPath, result);
        } else {
            console.log('❌ No inline styles generated');
        }
    } catch (e) {
        console.error('Optimization failed:', e);
    }
}

optimize();