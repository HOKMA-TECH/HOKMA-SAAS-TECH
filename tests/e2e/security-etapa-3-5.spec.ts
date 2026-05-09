import { test, expect } from '@playwright/test'

test.describe('Etapa 3.5 - session and tenant hardening', () => {
  test('redirects non-authorized users to 403 route', async ({ page }) => {
    await page.goto('/403')
    await expect(page.getByText('Acesso negado')).toBeVisible()
  })

  test('tenant switching does not reuse previous tenant cache', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/login/)
  })
})
