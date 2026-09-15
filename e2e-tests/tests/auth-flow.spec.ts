import { test, expect } from '@playwright/test';

test.describe('Governança Nominal e Fluxos de Acesso (E2E)', () => {
  test('Cenário A: Dia Zero deve direcionar adequadamente para a tela de Setup ou Login conforme o estado do banco', async ({ page }) => {
    await page.goto('/');

    // Aguarda resolução da rota após checagem de sessão
    await page.waitForURL(/\/(setup|login)/);

    if (page.url().includes('/setup')) {
      // Estado de Dia Zero: formulário de setup do primeiro supervisor
      await expect(page.getByRole('heading', { name: /configuração inicial/i })).toBeVisible();
      await expect(page.getByLabel(/nome completo do supervisor/i)).toBeVisible();
      await expect(page.getByLabel(/e-mail corporativo/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /inicializar sistema e entrar/i })).toBeVisible();
    } else {
      // Estado normal: formulário de login de rotina
      await expect(page.getByRole('heading', { name: /acesso ao sistema/i })).toBeVisible();
      await expect(page.getByLabel(/usuário/i)).toBeVisible();
      await expect(page.getByLabel(/senha/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    }
  });

  test('Cenário B: Validação defensiva de formulário e alertas acolhedores sem vazamento técnico', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/(setup|login)/);

    if (page.url().includes('/setup')) {
      // No Dia Zero: testa submissão com dados inválidos (ex: senha curta)
      await page.getByLabel(/nome completo do supervisor/i).fill('Bryan E. Fernandes');
      await page.getByLabel(/e-mail corporativo/i).fill('bryan_fernandes@br.ajinomoto.com');
      await page.getByLabel(/senha mestra/i).fill('123');
      await page.getByLabel(/confirmar senha/i).fill('123');
      await page.getByRole('button', { name: /inicializar sistema e entrar/i }).click();

      // Valida que o alerta na UI é seguro e acolhedor
      const alert = page.locator('[role="alert"]');
      await expect(alert).toBeVisible({ timeout: 5000 });
      const alertText = await alert.innerText();
      expect(alertText).toContain('A senha deve conter no mínimo 8 caracteres.');

      // Asserção estrita de segurança OWASP A05: zero vazamento técnico
      expect(alertText).not.toMatch(/Route POST/i);
      expect(alertText).not.toMatch(/not found/i);
      expect(alertText).not.toMatch(/[D-Z]:\\/i);
    } else {
      // Em ambiente com supervisor: testa credenciais incorretas
      await page.getByLabel(/usuário/i).fill('usuario_inexistente');
      await page.getByLabel(/senha/i).fill('SenhaErrada123!');
      await page.getByRole('button', { name: /entrar/i }).click();

      const alert = page.locator('[role="alert"]');
      await expect(alert).toBeVisible({ timeout: 5000 });
      const alertText = await alert.innerText();
      expect(alertText).toContain('Usuário ou senha incorretos.');

      expect(alertText).not.toMatch(/Route POST/i);
      expect(alertText).not.toMatch(/not found/i);
      expect(alertText).not.toMatch(/[D-Z]:\\/i);
    }
  });

  test('Cenário C: Navegação e sanitização contra rotas inexistentes ou legadas /v1', async ({ page }) => {
    // Tenta acessar uma rota inexistente ou com prefixo legado /v1
    await page.goto('/v1/auth/fake-route');

    // O sistema não deve quebrar nem exibir erro 500 bruto
    // Deve redirecionar defensivamente para /login ou /setup
    await page.waitForURL(/\/(login|setup)/);
    await expect(page).toHaveURL(/\/(login|setup)/);
  });
});
