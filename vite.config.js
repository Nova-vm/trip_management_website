import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so the built files work no matter what subfolder GitHub
  // Pages serves them from (https://<user>.github.io/<repo-name>/...),
  // without needing to hardcode the repo name here. See
  // Read_Me/GITHUB_DEPLOY_GUIDE.md.
  base: './',
  server: {
    host: true,
  },
})
