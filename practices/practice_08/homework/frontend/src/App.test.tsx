import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { SAMPLE_DIFF } from './review';
import { theme } from './theme';
import { server } from './test/setup';

const endpoint = /\/api\/reviews$/;

function openApp() {
  render(<StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></StrictMode>);
  return {
    user: userEvent.setup(),
    input: screen.getByRole('textbox', { name: 'Diff изменений' }),
    submit: screen.getByRole('button', { name: 'Проверить изменения' }),
  };
}

describe('Ревью изменений — действия пользователя и состояния', () => {
  it('показывает подписанное поле, исходное состояние и счётчик', () => {
    const { input, submit } = openApp();
    expect(input).toHaveValue('');
    expect(input).toBeRequired();
    expect(submit).toBeEnabled();
    expect(screen.getByText('0 / 20 000')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Ревью появится здесь' })).toBeVisible();
  });

  it('вставляет пример и возвращает фокус в поле', async () => {
    const { user, input } = openApp();
    await user.click(screen.getByRole('button', { name: 'Вставить пример' }));
    expect(input).toHaveValue(SAMPLE_DIFF);
    expect(input).toHaveFocus();
    expect(screen.getByText(`${Array.from(SAMPLE_DIFF).length} / 20 000`)).toBeVisible();
  });

  it('открывает инструкцию и закрывает её кнопкой', async () => {
    const { user } = openApp();
    const help = screen.getByRole('button', { name: 'Как получить diff' });
    await user.click(help);
    const dialog = screen.getByRole('dialog', { name: 'Как получить diff' });
    expect(within(dialog).getByText('git diff --cached')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Понятно' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(help).toHaveFocus();
  });

  it('закрывает инструкцию клавишей Escape и восстанавливает фокус', async () => {
    const { user } = openApp();
    const help = screen.getByRole('button', { name: 'Как получить diff' });
    await user.click(help);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(help).toHaveFocus();
  });

  it.each(['', ' \t\n '])('отклоняет пустой/пробельный diff %j без HTTP-запроса', async value => {
    const handler = vi.fn(() => HttpResponse.json({ comment: 'Не должен вызываться' }));
    server.use(http.post(endpoint, handler));
    const { user, input, submit } = openApp();
    fireEvent.change(input, { target: { value } });
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent('Введите diff');
    expect(input).toHaveFocus();
    expect(handler).not.toHaveBeenCalled();
  });

  it('показывает ошибку для 20 001 символа и даёт исправить ввод', async () => {
    const handler = vi.fn(() => HttpResponse.json({ comment: 'Исправленный diff принят' }));
    server.use(http.post(endpoint, handler));
    const { user, input, submit } = openApp();
    fireEvent.change(input, { target: { value: 'a'.repeat(20_001) } });
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent('Сократите diff до 20 000 символов');
    expect(handler).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'исправлено' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(submit);
    expect(await screen.findByText('Исправленный diff принят')).toBeVisible();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each(['a', '😀'])('принимает ровно 20 000 Unicode-символов %s', async symbol => {
    let received: unknown;
    server.use(http.post(endpoint, async ({ request }) => {
      received = await request.json();
      return HttpResponse.json({ comment: 'Граничный запрос принят' });
    }));
    const { user, input, submit } = openApp();
    const diff = symbol.repeat(20_000);
    fireEvent.change(input, { target: { value: diff } });
    await user.click(submit);
    expect(await screen.findByText('Граничный запрос принят')).toBeVisible();
    expect(received).toEqual({ diff });
  });

  it('проходит полный сценарий: ввод → POST с точным diff → видимый комментарий', async () => {
    let received: unknown;
    let contentType: string | null = null;
    server.use(http.post(endpoint, async ({ request }) => {
      received = await request.json();
      contentType = request.headers.get('Content-Type');
      return HttpResponse.json({ comment: '### Деление на ноль\nПроверьте пустой список.' });
    }));
    const { user, input, submit } = openApp();
    const diff = '  + return sum(numbers) / len(numbers)\n';
    await user.type(input, diff);
    await user.click(submit);
    expect(await screen.findByRole('heading', { name: 'Деление на ноль' })).toBeVisible();
    expect(screen.getByText('Проверьте пустой список.')).toBeVisible();
    expect(received).toEqual({ diff });
    expect(contentType).toBe('application/json');
    expect(input).toHaveValue(diff);
    expect(screen.getByRole('region', { name: 'Результат ревью' })).toHaveFocus();
    expect(screen.getByText('Готово')).toBeVisible();
  });

  it('при задержке блокирует двойной клик, submit и повторный Ctrl+Enter', async () => {
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    const handler = vi.fn(async () => {
      await pending;
      return HttpResponse.json({ comment: 'Ровно один результат' });
    });
    server.use(http.post(endpoint, handler));
    const { user, input, submit } = openApp();
    await user.type(input, '+ return 1');
    try {
      await user.dblClick(submit);
      expect(await screen.findByRole('status')).toHaveTextContent('Проверяем изменения');
      expect(screen.getByRole('button', { name: 'Проверяем…' })).toBeDisabled();
      expect(input).toHaveAttribute('readonly');
      expect(screen.getByRole('button', { name: 'Вставить пример' })).toBeDisabled();
      fireEvent.submit(input.closest('form')!);
      fireEvent.submit(input.closest('form')!);
      await user.click(input);
      await user.keyboard('{Control>}{Enter}{Enter}{/Control}');
      await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    } finally {
      release();
    }
    expect(await screen.findByText('Ровно один результат')).toBeVisible();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Проверить изменения' })).toBeEnabled();
  });

  it('сохраняет точную строку после API 500 и успешно повторяет запрос', async () => {
    const received: unknown[] = [];
    server.use(http.post(endpoint, async ({ request }) => {
      received.push(await request.json());
      return received.length === 1
        ? HttpResponse.json({ detail: 'Internal error' }, { status: 500 })
        : HttpResponse.json({ comment: 'Повторная попытка успешна' });
    }));
    const { user, input, submit } = openApp();
    const diff = ' \t+ return 1\n  ';
    fireEvent.change(input, { target: { value: diff } });
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось получить ревью');
    expect(screen.getByRole('alert')).toHaveTextContent('Введённый diff сохранён');
    expect(input).toHaveValue(diff);
    await user.click(screen.getByRole('button', { name: 'Повторить попытку' }));
    expect(await screen.findByText('Повторная попытка успешна')).toBeVisible();
    expect(received).toEqual([{ diff }, { diff }]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('объясняет сетевую ошибку и оставляет возможность повтора', async () => {
    server.use(http.post(endpoint, () => HttpResponse.error()));
    const { user, input, submit } = openApp();
    await user.type(input, '+ test');
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent('Проверьте подключение к сервису');
    expect(input).toHaveValue('+ test');
    expect(screen.getByRole('button', { name: 'Повторить попытку' })).toBeEnabled();
  });

  it.each(['', ' \n '])('отличает пустой ответ %j от успешного ревью', async comment => {
    server.use(http.post(endpoint, () => HttpResponse.json({ comment })));
    const { user, input, submit } = openApp();
    await user.type(input, '+ test');
    await user.click(submit);
    expect(await screen.findByRole('heading', { name: 'Модель вернула пустой ответ' })).toBeVisible();
    expect(screen.queryByText('Готово')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Повторить проверку' })).toBeEnabled();
    expect(input).toHaveValue('+ test');
  });

  it('отклоняет неожиданный формат ответа вместо ложного успеха', async () => {
    server.use(http.post(endpoint, () => HttpResponse.json({ summary: 'Другой контракт' })));
    const { user, input, submit } = openApp();
    await user.type(input, '+ test');
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent('ответ неизвестного формата');
    expect(screen.queryByText('Готово')).not.toBeInTheDocument();
  });

  it.each([
    [413, 'слишком большой diff'],
    [422, 'Сервис не принял diff'],
  ])('показывает понятное сообщение для HTTP %i', async (status, message) => {
    server.use(http.post(endpoint, () => HttpResponse.json({ detail: 'Rejected' }, { status: Number(status) })));
    const { user, input, submit } = openApp();
    await user.type(input, '+ test');
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent(String(message));
    expect(input).toHaveValue('+ test');
  });
});
