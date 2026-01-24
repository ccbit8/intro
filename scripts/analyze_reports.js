
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../reports');

function extractMetrics(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        const match = content.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*({.*});/);
        
        if (!match) {
            console.error(`Skipping ${path.basename(filepath)}: JSON not found`);
            return null;
        }
        
        const data = JSON.parse(match[1]);
        const audits = data.audits || {};
        const categories = data.categories || {};
        
        const getScore = (catName) => categories[catName] ? (categories[catName].score || 0) * 100 : 0;
        
        // Safety helper
        const getVal = (key) => {
            if (!audits[key]) return -1;
            return audits[key].numericValue !== undefined ? audits[key].numericValue : -1;
        };

        const getAuditScore = (key) => {
             if (!audits[key]) return -1;
             return audits[key].score !== undefined ? audits[key].score : -1;
        }

        // Unused JS specific handling
        let unusedJs = -1;
        if (audits['unused-javascript'] && audits['unused-javascript'].details && audits['unused-javascript'].details.overallSavingsBytes) {
            unusedJs = audits['unused-javascript'].details.overallSavingsBytes / 1024;
        } else if (audits['unused-javascript']) {
            unusedJs = 0; // Audit exists but no savings -> 0 KB unused
        }

        return {
            file: path.basename(filepath),
            timestamp: data.fetchTime,
            score: getScore('performance'),
            TTFB: getVal('server-response-time'),
            LCP: getVal('largest-contentful-paint'),
            FCP: getVal('first-contentful-paint'),
            CSSBlock: getVal('render-blocking-resources'),
            ImgOptScore: getAuditScore('uses-optimized-images'),
            ImgSizeVal: getVal('uses-optimized-images'), // check if this has a numeric value (wasted bytes)
            UnusedJS: unusedJs
        };
    } catch (e) {
        console.error(`Error in ${path.basename(filepath)}: ${e.message}`);
        return null;
    }
}

function main() {
    if (!fs.existsSync(REPORT_DIR)) {
        console.log("No reports directory found.");
        return;
    }

    const files = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.html') && f.startsWith('localhost'));
    const reports = [];

    files.forEach(file => {
        const metrics = extractMetrics(path.join(REPORT_DIR, file));
        if (metrics) reports.push(metrics);
    });

    reports.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Get last 5
    const latest = reports.slice(-5);

    console.log(
        `${"Time".padEnd(20)} | ` +
        `${"Score".padEnd(5)} | ` +
        `${"LCP (ms)".padEnd(9)} | ` +
        `${"FCP (ms)".padEnd(9)} | ` +
        `${"TBT (ms)".padEnd(9)} | ` +
        `${"SI (s)".padEnd(9)} | ` +
        `${"CLS".padEnd(6)}`
    );
    console.log("-".repeat(90));

    latest.forEach(r => {
        const date = new Date(r.timestamp);
        const timeStr = date.toISOString().replace('T', ' ').substring(5, 19); 
        // We'll read SI (Speed Index) and TBT (Total Blocking Time) if we can fetch them. 
        // Need to update extractMetrics to get SI and TBT first if not already there.
        // Actually extractMetrics already gets TBT. SI is not there.
        // Let's modify extractMetrics above first. 
        console.log("Running...");
    });
}

main();
