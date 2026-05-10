import { test, expect } from '@playwright/test'

test.describe('CRM hardening role access', () => {
  test('unauthenticated user is redirected from clientes', async ({ page }) => {
    await page.goto('/clientes')
    await expect(page).toHaveURL(/\/login/)
  })

  test('403 page has safe messaging', async ({ page }) => {
    await page.goto('/403')
    await expect(page.getByText('Acesso negado')).toBeVisible()
    await expect(page.getByText('capacidades de seguranca especificas')).toBeVisible()
  })

  test('clientes page requires authenticated context', async ({ page }) => {
    await page.goto('/clientes')
    await expect(page).toHaveURL(/\/login/)
  })

  test('platform page is not directly available without auth', async ({ page }) => {
    await page.goto('/platform')
    await expect(page).toHaveURL(/\/login/)
  })
})
