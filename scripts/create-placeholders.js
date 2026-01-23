/**
 * 创建占位图 - 快速版本
 * 不依赖外部 API，直接生成简单的占位 SVG
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/images/preview');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 需要生成的占位图
const placeholders = [
  'github-com.png',
  'fst-fujica-com-cn.png',
  'www-fujica-com-cn.png',
  'fsbigdata-fujica-com-cn.png',
  'www-yuque-com.png',
  'undefcc-github-io.png',
  'www-cnblogs-com.png',
  'www-npmjs-com.png',
  'fujicafe-github-io.png',
];

// SVG 占位图模板
function createPlaceholderSVG(name) {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3f4f6"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
    ${name.replace('.png', '').replace(/-/g, '.')}
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
    Placeholder - Replace with actual screenshot
  </text>
</svg>`;
}

console.log('🖼️  生成占位图...\n');

placeholders.forEach(filename => {
  const filepath = path.join(OUTPUT_DIR, filename.replace('.png', '.svg'));
  
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  已存在: ${filename}`);
    return;
  }
  
  const svg = createPlaceholderSVG(filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ 生成: ${filename.replace('.png', '.svg')}`);
});

console.log('\n✅ 占位图生成完成！');
console.log(`📁 位置: ${OUTPUT_DIR}`);
console.log('\n💡 提示: 使用 .svg 文件，无需下载实际截图');
