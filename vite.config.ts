import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Vite injects the module script before the CSS link; load CSS first for earlier paint and fewer “unstyled” flashes. */
function viteCssBeforeMainJs(): Plugin {
  return {
    name: 'vite-css-before-main-js',
    enforce: 'post',
    transformIndexHtml(html) {
      const re =
        /<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>\s*\n\s*<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/
      const m = html.match(re)
      if (!m) return html
      return html.replace(
        re,
        `<link rel="stylesheet" crossorigin href="${m[2]}">\n    <script type="module" crossorigin src="${m[1]}"></script>`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteCssBeforeMainJs()],
  server: {
    port: 8009,
    strictPort: true,
  },
})
