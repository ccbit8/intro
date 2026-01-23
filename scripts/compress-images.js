/**
 * 图片压缩工具
 * 使用 sharp 库压缩 PNG/JPG 图片，减少文件体积
 * 使用方式：node scripts/compress-images.js
 */

const fs = require('fs');
const path = require('path');

// 动态导入 sharp（如果未安装会提示）
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('❌ 未安装 sharp 库');
  console.error('\n安装方法:');
  console.error('  npm install --save-dev sharp');
  process.exit(1);
}

const IMAGE_DIR = path.join(__dirname, '../public/images/preview');

/**
 * 获取图片文件列表
 */
function getImageFiles() {
  const files = fs.readdirSync(IMAGE_DIR);
  return files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
}

/**
 * 压缩单个图片
 */
async function compressImage(filename) {
  const inputPath = path.join(IMAGE_DIR, filename);
  const outputPath = inputPath; // 覆盖原文件
  const tempPath = `${inputPath}.tmp`;
  
  const inputSize = fs.statSync(inputPath).size;
  
  try {
    // 获取图片信息
    const metadata = await sharp(inputPath).metadata();
    
    // 根据图片大小决定压缩质量
    let quality = 80; // 默认质量
    if (inputSize > 2000000) {
      quality = 70; // 大于 2MB，降低到 70
    } else if (inputSize > 1000000) {
      quality = 75; // 大于 1MB，降低到 75
    }
    
    // 压缩图片
    let pipeline = sharp(inputPath);
    
    // 调整分辨率（不超过 2000px）
    if (metadata.width > 2000 || metadata.height > 2000) {
      pipeline = pipeline.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 根据格式选择压缩参数
    if (filename.toLowerCase().endsWith('.png')) {
      await pipeline
        .png({ 
          quality: 80,
          effort: 9, // 最高压缩等级
          adaptiveFiltering: true
        })
        .toFile(tempPath);
    } else if (/\.(jpg|jpeg)$/i.test(filename)) {
      await pipeline
        .jpeg({ 
          quality: quality,
          progressive: true,
          mozjpeg: true // 使用 MozJPEG 获得更好压缩
        })
        .toFile(tempPath);
    } else if (filename.toLowerCase().endsWith('.webp')) {
      await pipeline
        .webp({ quality: quality })
        .toFile(tempPath);
    }
    
    // 检查压缩是否有效
    const outputSize = fs.statSync(tempPath).size;
    const savedSize = inputSize - outputSize;
    const savedPercent = ((savedSize / inputSize) * 100).toFixed(1);
    
    // 如果压缩后更小，才覆盖原文件
    if (savedSize > 0) {
      fs.renameSync(tempPath, outputPath);
      console.log(`✅ ${filename.padEnd(30)} ${(inputSize/1024).toFixed(1).padStart(8)}KB → ${(outputSize/1024).toFixed(1).padStart(8)}KB (节省 ${savedPercent}%)`);
      return { success: true, saved: savedSize };
    } else {
      // 删除临时文件
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      console.log(`⏭️  ${filename.padEnd(30)} 已是最优大小，跳过`);
      return { success: true, saved: 0 };
    }
  } catch (error) {
    // 删除临时文件
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    console.error(`❌ ${filename.padEnd(30)} ${error.message}`);
    return { success: false, saved: 0 };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🖼️  开始压缩图片...\n');

  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`❌ 目录不存在: ${IMAGE_DIR}`);
    process.exit(1);
  }

  const files = getImageFiles();
  if (files.length === 0) {
    console.warn('⚠️  未找到任何图片文件');
    process.exit(0);
  }

  console.log(`📁 找到 ${files.length} 个图片文件\n`);
  console.log('文件名'.padEnd(30) + '原始大小'.padStart(15) + '压缩后'.padStart(15) + '节省比例'.padStart(12));
  console.log('-'.repeat(72));

  let totalSaved = 0;
  let successCount = 0;

  for (const filename of files) {
    const result = await compressImage(filename);
    if (result.success) {
      successCount++;
      totalSaved += result.saved;
    }
  }

  console.log('-'.repeat(72));
  console.log(`\n✅ 完成: ${successCount}/${files.length} 个文件处理成功`);
  console.log(`💾 总共节省: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 位置: ${IMAGE_DIR}\n`);
}

main().catch(console.error);
