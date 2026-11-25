export const MAX_DIFF_LENGTH = 20_000;

export const SAMPLE_DIFF = `diff --git a/average.py b/average.py
--- a/average.py
+++ b/average.py
@@ -1,2 +1,3 @@
 def average(numbers):
-    return 0
+    return sum(numbers) / len(numbers)`;

export type ReviewState =
  | { kind: 'initial' }
  | { kind: 'loading' }
  | { kind: 'success'; comment: string }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

// Считаем Unicode code points, как Python len() в существующем API.
export function characterCount(text: string): number {
  return Array.from(text).length;
}

export function validateDiff(diff: string): string | null {
  if (!diff.trim()) return 'Введите diff: пустая строка и пробелы не подходят.';
  if (characterCount(diff) > MAX_DIFF_LENGTH) {
    return 'Сократите diff до 20 000 символов.';
  }
  return null;
}

export async function requestReview(diff: string): Promise<string> {
  const response = await fetch(new URL('/api/reviews', window.location.origin), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diff }),
  });

  if (response.status === 413) throw new Error('Сервис отклонил слишком большой diff. Сократите его и повторите попытку.');
  if (response.status === 422) throw new Error('Сервис не принял diff. Проверьте введённый текст и повторите попытку.');
  if (!response.ok) throw new Error('Сервис временно недоступен. Повторите попытку чуть позже.');

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || !('comment' in data) || typeof data.comment !== 'string') {
    throw new Error('Сервис вернул ответ неизвестного формата. Повторите попытку.');
  }
  return data.comment;
}
