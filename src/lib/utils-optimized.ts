/**
 * 优化的截图工具
 * 使用本地占位图或静态生成的图片，避免运行时调用外部 API
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ❌ 旧版本：每次调用都会生成外部 API URL（导致 9+ 秒延迟）
 * ✅ 新版本：使用本地占位图或 CDN 缓存的截图
 * 
 * @param url - 网页 URL
 * @param useLocalPlaceholder - 是否使用本地占位图（推荐）
 * @returns 截图 URL
 */
export function getScreenshot(url: string, useLocalPlaceholder = true) {
  if (useLocalPlaceholder) {
    // ✅ 优化方案 1：返回本地占位图
    // 建议预先下载截图放在 /public/images/preview/ 目录
    const hash = url.split('//')[1]?.split('/')[0]?.replace(/\./g, '-') || 'default'
    return `/images/preview/${hash}.png`
  }
  
  // ✅ 优化方案 2：使用 Microlink API（仅构建时使用）
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
}

/**
 * ✅ 新增：批量预热截图（构建时使用）
 * 用于在构建时预先生成所有截图，避免运行时调用
 */
export async function prefetchScreenshots(urls: string[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ 截图预热仅在生产构建时执行')
    return
  }

  console.log(`📸 开始预热 ${urls.length} 个截图...`)
  
  for (const url of urls) {
    try {
      const screenshotUrl = getScreenshot(url, false)
      const response = await fetch(screenshotUrl)
      
      if (response.ok) {
        console.log(`✅ ${url} - 截图已缓存`)
      } else {
        console.warn(`⚠️ ${url} - 截图获取失败`)
      }
    } catch (error) {
      console.error(`❌ ${url} - 错误:`, error)
    }
  }
  
  console.log('✅ 截图预热完成')
}
