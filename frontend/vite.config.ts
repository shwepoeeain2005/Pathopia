import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // OneDrive syncs this repo and briefly creates `~*.tmp` sibling files
      // while syncing; without this, Vite's fs watcher can hit an EBUSY on
      // those transient files and crash the whole dev server process.
      ignored: ['**/~*.tmp'],
    },
  },
})
