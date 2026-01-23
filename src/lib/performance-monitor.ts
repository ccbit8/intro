/**
 * 性能监控工具
 * 用于追踪和分析应用性能
 */

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()

  /**
   * 记录一个性能指标
   */
  measure(name: string, value: number, unit: string = 'ms') {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    }

    this.metrics.get(name)!.push(metric)

    // 如果超过 100 个样本，移除最旧的
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift()
    }
  }

  /**
   * 获取指定指标的统计信息
   */
  getStats(name: string) {
    const data = this.metrics.get(name) || []
    if (data.length === 0) {
      return null
    }

    const values = data.map(m => m.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const p95 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)]

    return {
      count: values.length,
      avg: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      p95: p95.toFixed(2),
      unit: data[0].unit,
    }
  }

  /**
   * 获取所有指标的摘要
   */
  getSummary() {
    const summary: Record<string, any> = {}
    for (const [name] of this.metrics) {
      summary[name] = this.getStats(name)
    }
    return summary
  }

  /**
   * 导出为 JSON
   */
  toJSON() {
    return {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      metrics: Array.from(this.metrics.entries()).map(([name, data]) => ({
        name,
        samples: data.length,
        data: data.slice(-10), // 只导出最后 10 个样本
      })),
    }
  }

  /**
   * 清空所有指标
   */
  clear() {
    this.metrics.clear()
  }

  /**
   * 打印性能报告
   */
  printReport() {
    console.log('\n📊 Performance Report')
    console.log('═'.repeat(60))

    const summary = this.getSummary()
    for (const [name, stats] of Object.entries(summary)) {
      if (stats) {
        console.log(`\n${name}:`)
        console.log(`  Average: ${stats.avg} ${stats.unit}`)
        console.log(`  Min:     ${stats.min} ${stats.unit}`)
        console.log(`  Max:     ${stats.max} ${stats.unit}`)
        console.log(`  P95:     ${stats.p95} ${stats.unit}`)
        console.log(`  Count:   ${stats.count}`)
      }
    }

    console.log('\n' + '═'.repeat(60))
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 装饰器：自动测量函数执行时间
 */
export function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    try {
      const result = await originalMethod.apply(this, args)
      const duration = Date.now() - start
      performanceMonitor.measure(`${target.constructor.name}.${propertyKey}`, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      performanceMonitor.measure(`${target.constructor.name}.${propertyKey} (ERROR)`, duration)
      throw error
    }
  }

  return descriptor
}
