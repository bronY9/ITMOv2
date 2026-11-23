# ДЗ 8 — интерфейс сервиса код-ревью

Разработчик вставляет `git diff`, отправляет его и получает ревью локальной
модели. Это фронтенд существующего проекта из практик 4–6. Условия:
[ТЗ практики](../README.md), лекция 8. Material UI предложен в лекции как
одна из альтернатив shadcn/ui.

**Стек:** React + TypeScript + Vite, **Material UI**; Vitest,
React Testing Library, MSW и Playwright.

## Установка и запуск

Нужны Node.js 24+, npm, Python 3.11+ и Ollama. Из корня репозитория:

```bash
cd practices/practice_08/homework
make install
ollama pull qwen3.5:4b
```

Откройте приложение Ollama или выполните `ollama serve`, если сервис ещё
не работает. Затем в двух терминалах, оба из этой папки:

```bash
make backend
```

```bash
make frontend
```

Приложение: <http://127.0.0.1:5188/>.
Прототип: <http://127.0.0.1:5188/prototype.html>.
Самостоятельный экспорт [design/prototype.html](design/prototype.html)
можно скачать и открыть без сервера.

API слушает `127.0.0.1:8088`, Ollama — `127.0.0.1:11434`.
Vite проксирует `/api` к API; ключи и CORS-настройки не нужны.
Перед запуском backend можно задать `OLLAMA_MODEL` и `OLLAMA_URL`.
Не добавляйте токены или секреты в файлы проекта. n8n и Gmail для ДЗ 8
не требуются: собственный фронтенд использует прежний Python-сервис.

На демонстрации нажмите «Вставить пример»: функция среднего не проверяет
пустой список. Ответ модели настоящий, формулировки могут различаться;
содержание нужно проверять как обычное ревью.

## Проверки

Из `practices/practice_08/homework`:

```bash
make build         # TypeScript и production-сборка
make test          # 18 проверок Vitest + RTL + MSW
make browser-test  # браузерные сценарии Playwright
make check         # сборка и все клиентские тесты
```

Браузерные проверки запускают собственный Vite на 5189 и подменяют HTTP.
Ollama и backend для автоматических тестов не нужны. Для WebKit:
`cd frontend && npx playwright install webkit && PW_BROWSER=webkit npm run test:e2e`.

В ограниченном процессе Codex на macOS запуск дочернего браузера может
быть запрещён. Для такой среды есть [GitHub Actions](../../../.github/workflows/practice-08.yml)
с Chromium на Linux. Фактические результаты: [TESTING.md](TESTING.md).

## Что где находится

- [SPEC.md](SPEC.md) — сценарий, контракт API, ожидаемое поведение.
- [design/prototype.html](design/prototype.html) — переключаемый AI-прототип.
- [frontend/src/App.tsx](frontend/src/App.tsx) — форма, диалог и состояния.
- [frontend/src/theme.ts](frontend/src/theme.ts) — цвета, шрифты, отступы MUI.
- [frontend/src/review.ts](frontend/src/review.ts) — валидация и HTTP-запрос.
- [server.py](server.py) — адаптер к локальной Ollama.
- [AI_USAGE.md](AI_USAGE.md) — вклад AI и исправления после проверки.
- [TESTING.md](TESTING.md) — доказательства и таблица критериев.

UI отправляет неизменённый diff в `POST /api/reviews` и показывает
`comment` из JSON. `create_app` и `ReviewService` импортируются из
практики 5; предыдущие реализации не переписаны. Новый адаптер реализует
существующий `LLM.generate` через Ollama.

## Коротко для защиты

1. В прототипе переключить исходное состояние, загрузку, ошибку, пустой ответ.
2. В приложении показать ошибку пустого поля и диалог помощи.
3. Вставить пример, отправить Ctrl/⌘ + Enter, показать настоящий ответ.
4. Объяснить `inFlight`: синхронный ref блокирует повтор до перерендера;
   disabled-кнопка дополнительно показывает запрет пользователю.
5. В тесте задержки показать один HTTP-запрос при повторных действиях.
6. В тесте API 500 показать сохранение точной строки и успешный повтор.
7. Показать MUI-тему, адаптивную сетку и реальные результаты тестов.
