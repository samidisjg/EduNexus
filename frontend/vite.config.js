import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/config/api.config.js',
        'src/services/auth.service.js',
        'src/components/SideNav.jsx',
        'src/Pages/Component.jsx',
        'src/Pages/SignUp.jsx',
        'src/Pages/StaffCoursePage.jsx',
        'src/Pages/StudentServicePage.jsx',
        'src/Pages/IT22577160/LibraryDashboard.jsx',
        'src/Pages/IT22607232/FineDashboard.jsx',
      ],
    },
  },
})
