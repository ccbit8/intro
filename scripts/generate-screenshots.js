/**
 * 预生成截图工具（改进版本）
 * 在构建时运行，将外部网站截图下载到本地
 * 下载完成后自动压缩图片
 * 使用方式：node scripts/generate-screenshots.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 可选：尝试加载 sharp 库用于压缩
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('⚠️  未安装 sharp 库，将跳过图片压缩');
  console.warn('   使用: npm install --save-dev sharp\n');
}

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
 * 压缩单个图片（可选）
 */
async function compressImage(filePath) {
  if (!sharp) return null; // 未安装 sharp，跳过压缩

  try {
    const inputSize = fs.statSync(filePath).size;
    const tempPath = `${filePath}.tmp`;

    // 获取图片信息
    const metadata = await sharp(filePath).metadata();

    // 根据原始大小决定压缩质量
    let quality = 80;
    if (inputSize > 2000000) quality = 70;
    else if (inputSize > 1000000) quality = 75;

    // 压缩 PNG
    let pipeline = sharp(filePath);
    if (metadata.width > 400 || metadata.height > 400) {
      pipeline = pipeline.resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    await pipeline
      .png({
        quality: 80,
        effort: 9,
        adaptiveFiltering: true
      })
      .toFile(tempPath);

    const outputSize = fs.statSync(tempPath).size;
    const savedPercent = ((1 - outputSize / inputSize) * 100).toFixed(1);

    if (outputSize < inputSize) {
      fs.renameSync(tempPath, filePath);
      return {
        original: inputSize,
        compressed: outputSize,
        percent: savedPercent
      };
    } else {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return null;
    }
  } catch (error) {
    console.warn(`⚠️  压缩失败: ${error.message}`);
    return null;
  }
}

/**
 * 下载文件（支持重定向）
 */
function downloadFile(fileUrl, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const protocol = fileUrl.startsWith('https') ? https : http;

    protocol.get(fileUrl, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000 
    }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`  → 重定向: ${res.headers.location}`);
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, fileUrl).href;
        downloadFile(redirectUrl, destPath, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          const size = fs.statSync(destPath).size;
          resolve(size);
        });

        fileStream.on('error', reject);
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject).on('timeout', function() {
      this.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * 下载截图
 */
async function downloadScreenshot(url) {
  const filename = getFilename(url);
  const filepath = path.join(OUTPUT_DIR, filename);
  
  // 如果文件已存在且大小合理，跳过
  if (fs.existsSync(filepath)) {
    const size = fs.statSync(filepath).size;
    if (size > 1000) { // 超过 1KB 认为是有效文件 (因压缩后可能很小)
      console.log(`⏭️  已存在 (${(size/1024).toFixed(1)}KB): ${filename}`);
      return true;
    } else {
      console.log(`🔄 重新下载 (文件太小): ${filename}`);
      fs.unlinkSync(filepath);
    }
  }

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  
  console.log(`📸 下载中: ${url}`);

  try {
    const size = await downloadFile(screenshotUrl, filepath);
    
    // 尝试压缩图片
    let compressed = null;
    if (sharp) {
      compressed = await compressImage(filepath);
    }
    
    if (compressed) {
      console.log(`✅ 完成 (${(compressed.original/1024).toFixed(1)}KB → ${(compressed.compressed/1024).toFixed(1)}KB, 节省${compressed.percent}%): ${filename}\n`);
    } else {
      console.log(`✅ 完成 (${(size/1024).toFixed(1)}KB): ${filename}\n`);
    }
    return true;
  } catch (error) {
    console.error(`❌ 失败: ${error.message}`);
    // 删除失败的文件
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成截图...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const url of urls) {
    const result = await downloadScreenshot(url);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // 避免请求过快被限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log('='.repeat(50));
  console.log(`📁 文件保存在: ${OUTPUT_DIR}\n`);
  
  if (failed > 0) {
    console.log('💡 提示: 失败的截图使用 SVG 占位图，可稍后重试\n');
  }

  // 如果安装了 sharp，提示可以进一步压缩
  if (!sharp) {
    console.log('💡 提示: 安装 sharp 库可以自动压缩图片');
    console.log('   运行: npm install --save-dev sharp');
    console.log('   然后: npm run compress\n');
  }
  
  if (failed > 0) {
    process.exit(failed > 5 ? 1 : 0);
  }
}

main().catch(console.error);
