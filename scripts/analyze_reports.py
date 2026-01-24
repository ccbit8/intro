
import os
import json
import re
from datetime import datetime

REPORT_DIR = 'reports'

def extract_metrics(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Lighthouse HTML reports store data in window.__LIGHTHOUSE_JSON__
        match = re.search(r'window\.__LIGHTHOUSE_JSON__\s*=\s*({.*});', content)
        if not match:
            # Fallback for older formats or if regex fails (sometimes it's __LIGHTHOUSE_JSON__ = )
            match = re.search(r'__LIGHTHOUSE_JSON__\s*=\s*({.*});', content)
            
        if not match:
             # Try finding JSON blob that looks like "lighthouseVersion":
             return None

        data = json.loads(match.group(1))
        
        audits = data.get('audits', {})
        categories = data.get('categories', {})
        
        metrics = {
            'file': os.path.basename(filepath),
            'timestamp': data.get('fetchTime', ''),
            'score': categories.get('performance', {}).get('score', 0) * 100,
            'FCP': audits.get('first-contentful-paint', {}).get('numericValue', 0),
            'LCP': audits.get('largest-contentful-paint', {}).get('numericValue', 0),
            'TBT': audits.get('total-blocking-time', {}).get('numericValue', 0),
            'CLS': audits.get('cumulative-layout-shift', {}).get('numericValue', 0),
            'TTFB': audits.get('server-response-time', {}).get('numericValue', 0),
            'SpeedIndex': audits.get('speed-index', {}).get('numericValue', 0),
            'UnusedJS': audits.get('unused-javascript', {}).get('details', {}).get('overallSavingsBytes', 0) / 1024 # KB
        }
        return metrics
    except Exception as e:
        # print(f"Error parsing {filepath}: {e}")
        return None

def main():
    reports = []
    if os.path.exists(REPORT_DIR):
        for filename in os.listdir(REPORT_DIR):
            if filename.endswith('.html') and filename.startswith('localhost'):
                metrics = extract_metrics(os.path.join(REPORT_DIR, filename))
                if metrics:
                    reports.append(metrics)

    # Sort by timestamp
    reports.sort(key=lambda x: x['timestamp'])

    print(f"{'Time':<25} | {'Score':<5} | {'TTFB':<6} | {'LCP':<6} | {'CLS':<5} | {'Unused JS'}")
    print("-" * 80)
    
    for r in reports:
        dt = datetime.fromisoformat(r['timestamp'].replace("Z", "+00:00"))
        time_str = dt.strftime('%Y-%m-%d %H:%M:%S')
        print(f"{time_str:<25} | {r['score']:<5.0f} | {r['TTFB']:<6.0f} | {r['LCP']:<6.0f} | {r['CLS']:<5.3f} | {r['UnusedJS']:<10.1f} KB")

if __name__ == '__main__':
    main()
