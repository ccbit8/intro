/**
 * Standalone 模式构建后处理脚本
 * 复制必需的静态文件到 standalone 输出目录
 */

const fs = require('fs');
const path = require('path');

// 定义路径
const ROOT_DIR = path.join(__dirname, '..');
const STANDALONE_DIR = path.join(ROOT_DIR, '.next/standalone');
const STATIC_SOURCE = path.join(ROOT_DIR, '.next/static');
const STATIC_TARGET = path.join(STANDALONE_DIR, '.next/static');
const PUBLIC_SOURCE = path.join(ROOT_DIR, 'public');
const PUBLIC_TARGET = path.join(STANDALONE_DIR, 'public');

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
    console.log('\n🚀 现在可以运行: node .next/standalone/server.js');
  } catch (error) {
    console.error('\n❌ 复制失败:', error.message);
    process.exit(1);
  }
}

main();
