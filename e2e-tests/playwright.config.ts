import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração da Suíte de Testes Ponta a Ponta (E2E) com Playwright.
 * Simula a interação real de analistas do LD2 no navegador contra o ecossistema integrado.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Execução sequencial para evitar concorrência no banco SQLite local
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
