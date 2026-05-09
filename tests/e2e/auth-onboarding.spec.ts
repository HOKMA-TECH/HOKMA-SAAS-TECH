import { test, expect } from '@playwright/test'

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
})

test('pending approval page renders', async ({ page }) => {
  await page.goto('/auth/aguardando-aprovacao')
  await expect(page.getByRole('heading', { name: 'Aguardando aprovacao' })).toBeVisible()
})

test('tenant selection page renders', async ({ page }) => {
  await page.goto('/auth/selecionar-tenant')
  await expect(page.getByRole('heading', { name: 'Selecione um tenant' })).toBeVisible()
})

test('recover password page renders', async ({ page }) => {
  await page.goto('/auth/recuperar-senha')
  await expect(page.getByRole('heading', { name: 'Recuperar senha' })).toBeVisible()
})
