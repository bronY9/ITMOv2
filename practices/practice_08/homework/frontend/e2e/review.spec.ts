import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';
import { SAMPLE_DIFF } from '../src/review';

const evidence = (name: string) => resolve('..', 'evidence', name);

test('основной сценарий в настоящем браузере', async ({ page }) => {
  let received: unknown;
  await page.route('**/api/reviews', async route => {
    received = route.request().postDataJSON();
    await route.fulfill({ json: { comment: '### Возможна ошибка на пустом списке\nВ average.py проверьте деление на ноль.' } });
  });
  await page.goto('/');
  await page.screenshot({ path: evidence('initial.png'), fullPage: true });
  await page.getByRole('button', { name: 'Вставить пример' }).click();
  await page.getByRole('button', { name: 'Проверить изменения' }).click();
  await expect(page.getByRole('heading', { name: 'Возможна ошибка на пустом списке' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Diff изменений' })).toHaveValue(SAMPLE_DIFF);
  expect(received).toEqual({ diff: SAMPLE_DIFF });
  await expect(page.getByText('Готово', { exact: true })).toBeVisible();
  await page.screenshot({ path: evidence('mock-success.png'), fullPage: true });
});

test('двойной клик и клавиатура не дублируют запрос при задержке', async ({ page }) => {
  let calls = 0;
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/reviews', async route => {
    calls++;
    await pending;
    await route.fulfill({ json: { comment: 'Один запрос, один результат' } });
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Diff изменений' });
  await input.fill(SAMPLE_DIFF);
  try {
    await page.getByRole('button', { name: 'Проверить изменения' }).dblclick();
    await expect(page.getByRole('status')).toContainText('Проверяем изменения');
    await expect(page.getByRole('button', { name: 'Проверяем…' })).toBeDisabled();
    await input.focus();
    await page.keyboard.press('Control+Enter');
    await page.keyboard.press('Control+Enter');
    expect(calls).toBe(1);
    await page.screenshot({ path: evidence('mock-loading.png'), fullPage: true });
  } finally {
    release();
  }
  await expect(page.getByText('Один запрос, один результат')).toBeVisible();
  expect(calls).toBe(1);
});

test('серверная ошибка сохраняет ввод и допускает повтор', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/reviews', async route => {
    calls++;
    await route.fulfill(calls === 1
      ? { status: 500, json: { detail: 'Internal error' } }
      : { json: { comment: 'Повтор выполнен' } });
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Diff изменений' });
  const diff = `  ${SAMPLE_DIFF}\n `;
  await input.fill(diff);
  await page.getByRole('button', { name: 'Проверить изменения' }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось получить ревью');
  await expect(input).toHaveValue(diff);
  await page.screenshot({ path: evidence('mock-error.png'), fullPage: true });
  await page.getByRole('button', { name: 'Повторить попытку' }).click();
  await expect(page.getByText('Повтор выполнен')).toBeVisible();
  expect(calls).toBe(2);
});

test('обязательное поле, некорректный ввод и пустой ответ', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/reviews', async route => {
    calls++;
    await route.fulfill({ json: { comment: '' } });
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Diff изменений' });
  const submit = page.getByRole('button', { name: 'Проверить изменения' });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Введите diff');
  await input.fill(' '.repeat(3));
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Введите diff');
  await input.fill('x'.repeat(20_001));
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Сократите diff');
  expect(calls).toBe(0);
  await input.fill(SAMPLE_DIFF);
  await submit.click();
  await expect(page.getByRole('heading', { name: 'Модель вернула пустой ответ' })).toBeVisible();
  await page.screenshot({ path: evidence('mock-empty-response.png'), fullPage: true });
  expect(calls).toBe(1);
});

test('сценарий с клавиатуры, видимый фокус и диалог', async ({ page }) => {
  await page.route('**/api/reviews', route => route.fulfill({ json: { comment: 'Проверка с клавиатуры выполнена' } }));
  await page.goto('/');
  const help = page.getByRole('button', { name: 'Как получить diff' });
  await page.keyboard.press('Tab');
  await expect(help).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Как получить diff' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(help).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Вставить пример' })).toBeFocused();
  await page.keyboard.press('Tab');
  const input = page.getByRole('textbox', { name: 'Diff изменений' });
  await expect(input).toBeFocused();
  expect(await input.evaluate(el => parseFloat(getComputedStyle(el.closest('.MuiOutlinedInput-root')!).outlineWidth))).toBeGreaterThanOrEqual(3);
  await input.fill(SAMPLE_DIFF);
  await page.keyboard.press('Control+Enter');
  await expect(page.getByText('Проверка с клавиатуры выполнена')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Результат ревью' })).toBeFocused();
});

test('узкий экран и длинный код не создают горизонтального скролла', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/reviews', route => route.fulfill({ json: { comment: '### Проверка\n```text\n' + 'x'.repeat(2400) + '\n```' } }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Как получить diff' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Вставить пример' }).click();
  await page.getByRole('button', { name: 'Проверить изменения' }).click();
  await expect(page.getByText('Готово', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: evidence('mobile-success.png'), fullPage: true });
});

test('автоматическая проверка доступности исходного экрана и ошибки', async ({ page }) => {
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Проверить изменения' }).click();
  await expect(page.getByRole('alert')).toContainText('Введите diff');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

// Прототип — отдельный экспорт, не использует настоящую модель.
test('прототип доступен и отражает состояния сценария', async ({ page }) => {
  await page.goto('/prototype.html');
  await expect(page.getByRole('heading', { name: 'Проверьте изменения перед коммитом' })).toBeVisible();
  await page.screenshot({ path: evidence('prototype-initial.png'), fullPage: true });
  await page.locator('#state').selectOption('loading');
  await expect(page.getByRole('status')).toContainText('Проверяем изменения');
  await page.locator('#state').selectOption('error');
  await expect(page.getByRole('alert')).toContainText('Введённый diff сохранён');
  await page.locator('#state').selectOption('success');
  await expect(page.getByRole('heading', { name: 'Возможна ошибка на пустом списке' })).toBeVisible();
});
