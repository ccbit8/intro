
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../reports');

function extractMetrics(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        const match = content.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*({.*});/);
        
        if (!match) return null;
        
        const data = JSON.parse(match[1]);
        const audits = data.audits || {};
        const categories = data.categories || {};
        
        const getScore = (catName) => categories[catName] ? (categories[catName].score || 0) * 100 : 0;
        const getVal = (key) => audits[key] ? (audits[key].numericValue || 0) : 0;

        return {
            file: path.basename(filepath),
            timestamp: data.fetchTime,
            score: getScore('performance'),
            LCP: getVal('largest-contentful-paint'),
            FCP: getVal('first-contentful-paint'),
            TBT: getVal('total-blocking-time'),
            SI: getVal('speed-index'),
            CLS: getVal('cumulative-layout-shift'),
            TTFB: getVal('server-response-time'),
            UnusedJS: (audits['unused-javascript']?.details?.overallSavingsBytes || 0) / 1024
        };
    } catch (e) {
        return null;
    }
}

function main() {
    if (!fs.existsSync(REPORT_DIR)) {
        return;
    }

    const files = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.html') && f.startsWith('localhost'));
    const reports = [];

    files.forEach(file => {
        const metrics = extractMetrics(path.join(REPORT_DIR, file));
        if (metrics) reports.push(metrics);
    });

    reports.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Last 5
    const latest = reports.slice(-5);

    console.log(
        `${"Time".padEnd(20)} | ` +
        `${"Score".padEnd(5)} | ` +
        `${"LCP".padEnd(6)} | ` +
        `${"FCP".padEnd(6)} | ` +
        `${"TTFB".padEnd(6)} | ` +
        `${"SI".padEnd(6)}`
    );
    console.log("-".repeat(70));

    latest.forEach(r => {
        const date = new Date(r.timestamp);
        const timeStr = date.toISOString().replace('T', ' ').substring(5, 19); 
        
        console.log(
            `${timeStr.padEnd(20)} | ` +
            `${r.score.toFixed(0).padEnd(5)} | ` +
            `${r.LCP.toFixed(0).padEnd(6)} | ` +
            `${r.FCP.toFixed(0).padEnd(6)} | ` +
            `${r.TTFB.toFixed(0).padEnd(6)} | ` +
            `${r.SI.toFixed(0).padEnd(6)}`
        );
    });
}

main();
