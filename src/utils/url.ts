/**
 * 将后端返回的相对图片路径拼接为完整可访问 URL。
 *
 * - 已是 http/https 绝对地址 → 原样返回
 * - 相对路径（如 /uploads/x.jpg）→ 拼接 VITE_API_BASE_URL
 * - 空值 → 返回空字符串
 *
 * VITE_API_BASE_URL 由 .env.development / .env.production 注入，
 * 严禁硬编码域名或端口。
 */
export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const base = import.meta.env.VITE_API_BASE_URL

  if (!base) {
    console.warn('[getFullImageUrl] VITE_API_BASE_URL 未配置，图片可能无法加载')
    return url
  }

  // 去掉 base 末尾的 /，去掉 url 开头的 /，然后用单 / 拼接，避免 // 双斜杠
  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedUrl = url.replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedUrl}`
}
