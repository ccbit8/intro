
const fs = require('fs');
const path = require('path');

// A report from the "Feature Bloat" phase (Score ~63)
const REPORT_FILE = path.join(__dirname, '../reports/localhost_2026-01-24_22-05-09.report.html');

function analyzeReport(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        const match = content.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*({.*});/);
        
        if (!match) {
            console.error("JSON not found");
            return;
        }
        
        const data = JSON.parse(match[1]);
        const audits = data.audits || {};
        
        console.log(`Report: ${path.basename(filepath)}`);
        console.log(`Timestamp: ${data.fetchTime}`);
        console.log(`Performance Score: ${data.categories.performance.score * 100}`);
        console.log("---------------------------------------------------");
        console.log("FAILING AUDITS (Score < 0.9 or specific warnings):");

        Object.keys(audits).forEach(key => {
            const audit = audits[key];
            // Filter only interesting failing items
            if (audit.score !== null && audit.score < 0.9) {
                console.log(`[FAIL] ${audit.title} (Score: ${audit.score})`);
                console.log(`       Value: ${audit.displayValue || audit.numericValue}`);
                if (audit.details && audit.details.overallSavingsMs) {
                    console.log(`       Potential Savings: ${audit.details.overallSavingsMs} ms`);
                }
            }
            
            // Also check for big numeric values even if score is null (sometimes informative)
            if (key === 'unused-javascript' || key === 'render-blocking-resources' || key === 'server-response-time') {
                 console.log(`[${key.toUpperCase()}] Val: ${audit.numericValue} | Display: ${audit.displayValue}`);
            }
        });
        
    } catch (e) {
        console.error(e);
    }
}

analyzeReport(REPORT_FILE);
