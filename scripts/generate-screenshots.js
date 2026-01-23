/**
 * 预生成截图工具
 * 在构建时运行，将外部网站截图下载到本地
 * 使用方式：node scripts/generate-screenshots.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 需要生成截图的 URL 列表
const urls = [
  'https://github.com/undefcc',
  'https://fst.fujica.com.cn',
  'https://www.fujica.com.cn/lists/104.html',
  'https://fsbigdata.fujica.com.cn',
  'https://www.yuque.com/hexc',
  'https://undefcc.github.io',
  'https://www.cnblogs.com/cc1997',
  'https://www.npmjs.com/org/fujica',
  'https://fujicafe.github.io/utils/modules.html',
];

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/images/preview');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 生成文件名（基于 URL）
 */
function getFilename(url) {
  const hash = url.split('//')[1]?.split('/')[0]?.replace(/\./g, '-') || 'default';
  return `${hash}.png`;
}

/**
 * 下载截图
 */
async function downloadScreenshot(url) {
  const filename = getFilename(url);
  const filepath = path.join(OUTPUT_DIR, filename);
  
  // 如果文件已存在，跳过
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  已存在: ${filename}`);
    return;
  }

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  
  console.log(`📸 下载中: ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(screenshotUrl, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ 完成: ${filename}`);
          resolve();
        });
      } else {
        console.error(`❌ 失败 (${res.statusCode}): ${url}`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`❌ 错误: ${url}`, err.message);
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成截图...\n');
  
  for (const url of urls) {
    try {
      await downloadScreenshot(url);
      // 避免请求过快被限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`跳过: ${url}`);
    }
  }
  
  console.log('\n✅ 所有截图生成完成！');
  console.log(`📁 文件保存在: ${OUTPUT_DIR}`);
}

main().catch(console.error);
