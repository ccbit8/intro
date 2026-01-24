/**
 * Standalone 模式构建后处理脚本
 * 复制必需的静态文件到 standalone 输出目录
 */

const fs = require('fs');
const path = require('path');
const Critters = require('critters');

// 定义路径
const ROOT_DIR = path.join(__dirname, '..');
const STANDALONE_DIR = path.join(ROOT_DIR, '.next/standalone');
const STANDALONE_NEXT_DIR = path.join(STANDALONE_DIR, '.next');
const BASIC_NEXT_DIR = path.join(ROOT_DIR, '.next');
const STATIC_SOURCE = path.join(ROOT_DIR, '.next/static');
const STATIC_TARGET = path.join(STANDALONE_DIR, '.next/static');
const PUBLIC_SOURCE = path.join(ROOT_DIR, 'public');
const PUBLIC_TARGET = path.join(STANDALONE_DIR, 'public');

/**
 * 递归查找 HTML 文件
 */
function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else {
      if (path.extname(file) === '.html') {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * 优化 HTML 文件 (Inline Critical CSS)
 */
async function optimizeHtml() {
  console.log('🎨 开始优化 HTML 文件 (Critical CSS)...');
  
  // 我们需要针对两个位置进行优化：
  // 1. .next/server/app (用于 next start)
  // 2. .next/standalone/.next/server/app (用于 standalone 部署)
  
  const searchDirs = [
    path.join(BASIC_NEXT_DIR, 'server/app'),
    path.join(STANDALONE_NEXT_DIR, 'server/app')
  ];

  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) continue;

    // 确定 Critters 的查找路径 (assets path)
    // 对于 standalone，资源在 .next/standalone/.next
    // 对于普通 build，资源在 .next
    const isStandalone = searchDir.includes('standalone');
    const basePath = isStandalone ? STANDALONE_NEXT_DIR : BASIC_NEXT_DIR;

    const critters = new Critters({
      path: basePath,
      publicPath: '/_next/',
      compress: true,
      pruneSource: false, 
      inlineFonts: true,
      preload: 'media',
      logLevel: 'warn'
    });

    const htmlFiles = findHtmlFiles(searchDir);
    
    for (const file of htmlFiles) {
      try {
        const html = fs.readFileSync(file, 'utf-8');
        const result = await critters.process(html);
        fs.writeFileSync(file, result);
        console.log(`✅ 已优化: ${path.relative(ROOT_DIR, file)}`);
      } catch (e) {
        console.error(`❌ 优化失败: ${file}`, e);
      }
    }
  }
}


/**
 * 递归复制目录
 */
function copyDir(src, dest) {
  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 开始复制静态文件到 standalone 目录...\n');

  try {
    // 检查 standalone 目录是否存在
    if (!fs.existsSync(STANDALONE_DIR)) {
      console.error('❌ 错误: standalone 目录不存在');
      console.error('   请先运行 npm run build');
      process.exit(1);
    }

    // 复制 .next/static
    if (fs.existsSync(STATIC_SOURCE)) {
      console.log('📁 复制 .next/static ...');
      copyDir(STATIC_SOURCE, STATIC_TARGET);
      console.log('✅ .next/static 复制完成');
    } else {
      console.warn('⚠️  .next/static 不存在，跳过');
    }

    // 复制 public
    if (fs.existsSync(PUBLIC_SOURCE)) {
      console.log('📁 复制 public ...');
      copyDir(PUBLIC_SOURCE, PUBLIC_TARGET);
      console.log('✅ public 复制完成');
    } else {
      console.warn('⚠️  public 不存在，跳过');
    }

    console.log('\n✅ 所有静态文件复制完成！');
    console.log(`📂 Standalone 目录: ${STANDALONE_DIR}`);
    
    // 执行 Critical CSS 优化
    optimizeHtml().then(() => {
        console.log('\n🚀 现在可以运行: node .next/standalone/server.js 或 npm run start:standalone');
    });
    
  } catch (error) {
    console.error('\n❌ 复制失败:', error.message);
    process.exit(1);
  }
}

main();
