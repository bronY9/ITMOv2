# Практика 4: фичи A и B

## 1. Выбранный skill

- Skill: `webapp-testing` из `anthropics/skills`.
- Фича A: валидация обязательного непустого строкового поля `diff` в `POST /api/reviews`.
- Почему применяем: FastAPI предоставляет Swagger UI, поэтому через Playwright можно проверить доступность web-интерфейса и наблюдаемое HTTP-поведение API.
- Ограничение: skill не может доказать, что при ошибочном запросе LLM не вызывался. Это должна проверять отдельная backend unit-проверка.

## 2. Подключение

Skill установлен как `~/.codex/skills/webapp-testing`. Его инструкция требует Python Playwright и рекомендует использовать `scripts/with_server.py` для запуска локального сервера.

Зависимость проверки указана в [`requirements.txt`](requirements.txt). Установка в отдельное окружение:

```bash
python3 -m venv .venv
.venv/bin/pip install -r practices/practice_04/requirements.txt
.venv/bin/playwright install chromium
```

## 3. Проверка фичи A

Скрипт [`check_feature_a.py`](check_feature_a.py):

1. открывает `/docs` и ждёт `networkidle`;
2. проверяет, что Swagger UI содержит `POST /api/reviews`;
3. сохраняет скриншот;
4. отправляет валидный запрос и ожидает HTTP 200 с полем `comment`;
5. отправляет запросы без `diff`, с нестроковым и пустым `diff` и ожидает HTTP 422.

Если приложение уже запущено на порту 8000:

```bash
.venv/bin/python practices/practice_04/check_feature_a.py
```

Если появится команда запуска приложения, использовать helper из skill:

```bash
.venv/bin/python ~/.codex/skills/webapp-testing/scripts/with_server.py \
  --server "<команда запуска FastAPI>" --port 8000 -- \
  .venv/bin/python practices/practice_04/check_feature_a.py
```

## Текущий результат

Backend-реализация A/B и проверки через `TestClient` добавлены в `review_app.py` и `test_review_app.py`. Браузерная проверка `check_feature_a.py` подготовлена, но для её выполнения по-прежнему нужна команда запуска ASGI-приложения с настроенным `ReviewService`.

## 4. Полезный ответ через Context7 MCP

Для фичи A выбран запрос: как в Pydantic v2 объявить обязательное поле, которое принимает только непустую строку, и как FastAPI обрабатывает ошибочное тело запроса до выполнения обработчика.

Выполнены реальные вызовы инструментов Context7:

```text
resolve-library-id(libraryName="Pydantic", query="strict non-empty string")
→ /pydantic/pydantic

query-docs(libraryId="/pydantic/pydantic", query="strict string and min_length=1")
→ Field(strict=True) включает строгую проверку типа;
  min_length=1 создаёт ошибку string_too_short для пустой строки.

resolve-library-id(libraryName="FastAPI", query="request body validation")
→ /websites/fastapi_tiangolo

query-docs(libraryId="/websites/fastapi_tiangolo", query="RequestValidationError status 422")
→ невалидное тело вызывает RequestValidationError;
  обработчик ошибки возвращает HTTP 422.
```

Применимое к A объявление:

```python
from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    diff: str = Field(strict=True, min_length=1)
```

Связь с условием приёмки A:

- поле без значения по умолчанию обязательно, поэтому отсутствие `diff` отклоняется;
- `strict=True` отклоняет `{"diff": 123}` без преобразования числа в строку;
- `min_length=1` отклоняет `{"diff": ""}`;
- FastAPI валидирует модель тела запроса и возвращает HTTP 422 при `RequestValidationError`, поэтому обработчик с вызовом `ReviewService` и LLM для этих запросов не выполняется.

Источники, возвращённые Context7: [Pydantic fields](https://docs.pydantic.dev/latest/concepts/fields/), [Pydantic strings](https://docs.pydantic.dev/latest/api/standard_library_types/), [FastAPI request body](https://fastapi.tiangolo.com/tutorial/body/), [FastAPI validation errors](https://fastapi.tiangolo.com/tutorial/handling-errors/).

## 5. Контрольная точка: среда для A

| Пункт | Статус | Подтверждение |
| --- | --- | --- |
| Файлы требований прочитаны | Готово | Маршрут к `TRAINING_PR.diff`, ADR, CASE, описаниям и тестовым сценариям сохранён в корневом `AGENTS.md`; все указанные файлы существуют и непустые. |
| Ограничения A понятны | Готово | Меняется только валидация обязательного непустого строкового `diff`; лимит длины, секреты, ошибки LLM, аутентификация и фича B исключены. |
| Проверка согласована | Готово | Определены `make step1`, `make step2`, `make test` и `check_feature_a.py`; критерии включают HTTP 200 для валидного тела и HTTP 422 без вызова LLM для трёх невалидных тел. |
| Skill применён к задаче | Готово частично | `webapp-testing` установлен, его helper проверен, Playwright-сценарий A подготовлен. Backend-сценарии A/B проходят через `TestClient`; полный браузерный прогон требует запуска ASGI-приложения. |
| MCP вернул полезный ответ | Готово | Context7 вызван через `resolve-library-id` и `query-docs`; получено основание для `Field(strict=True, min_length=1)` и HTTP 422 при `RequestValidationError`. |
| Известно, что недоступно | Blocker обозначен | На `127.0.0.1:8000` нет сервера и нет команды запуска с настроенным LLM, поэтому браузерный прогон ещё не выполнен. Отсутствие вызова LLM для ошибочных тел подтверждено backend-тестами. |

Для полного применения skill нужно добавить конфигурацию запуска приложения с LLM, запустить его через `webapp-testing/scripts/with_server.py` и выполнить `check_feature_a.py`. Это не меняет уже подтверждённые backend-контракты A/B.

## 6. Автоматическая проверка

- Lint: Ruff `0.16.10`, команда `make lint`.
- Tests: существующая команда `make test`.
- Общая ручная проверка: `make check`.
- Триггер: событие GitHub Actions `push` для любой ветки.
- Исполнитель: GitHub-hosted runner `ubuntu-latest`, а не агент разработки.
- Workflow: `.github/workflows/python-checks.yml`.

Workflow устанавливает закреплённую версию Ruff и выполняет `make check`. В журнале GitHub Actions будут видны событие `push`, команда `make check`, вывод Ruff и тестов и итоговый exit code шага. Lint охватывает Python-файлы фич A и B; ранее созданные файлы `practice_03/lab/demo` не входят в область этой задачи.

Локальная проверка конфигурации перед первым `push`:

| Команда | Exit code | Результат |
| --- | ---: | --- |
| `make lint` | 0 | `All checks passed!` |
| `make check` | 0 | Ruff и проверки практик 1–2 прошли |
| разбор YAML workflow | 0 | синтаксис корректен |

После добавления workflow в коммит первый `push` создаст удалённый журнал. Шаг `Show trigger` напечатает `event`, SHA коммита и исполнителя, а шаг `Run lint and tests` всегда напечатает `check_exit_code` и завершится с тем же кодом.

## 7. Этап 5.2: фича B в отдельном worktree

- База A: commit `d1aef34`.
- Worktree: `/Users/vasilijpanfilov/Soft_eng_2026/AI/project-p4-b`.
- Ветка: `practice-04-b`.
- Требование B: `diff` длиннее 20 000 символов отклоняется с HTTP 413 до вызова LLM согласно `API-1` из `CASE.md`.
- Контракт A сохранён: обязательная строгая непустая строка, HTTP 422 для ошибочного тела и прежний успешный ответ.

Реализация находится в `review_app.py`. Сценарии A и B находятся в `test_review_app.py` и запускаются вместе с hook командой `make check`.

Предварительная формулировка с HTTP 422 для превышения лимита заменена на HTTP 413 после чтения точного правила `API-1` в `CASE.md`.

Результат в worktree B:

| Проверка | Exit code | Результат |
| --- | ---: | --- |
| `make check` | 0 | Ruff, проверки практик 1–2 и сценарии A/B прошли |
| `test_review_app.py -v` | 0 | 6 из 6 сценариев прошли |

Проверены сценарии A: валидный, отсутствующий, нестроковый и пустой `diff`. Проверены границы B: 20 000 символов принимаются, 20 001 символ отклоняется с HTTP 413 без вызова LLM.

## 8. Этап 5.3: проверка субагентом

Субагенту передана роль только для чтения: проверить требование B, diff
worktree и тесты, запустить `make check`, но не изменять файлы и не создавать
коммиты.

Субагент подтвердил сценарии валидации и лимита, но нашёл дефект P1:
глобальный `UnconfiguredLLM` приводил к HTTP 500 при обычном успешном запросе,
а тесты скрывали это подменой глобального сервиса.

Замечание воспроизведено отдельным запросом через `TestClient`: до исправления
получен `500 Internal Server Error`. После исправления приложение создаётся
функцией `create_app`, которая явно получает настроенный `ReviewService`.
Тесты создают настоящий экземпляр FastAPI с этой зависимостью и больше не
подменяют глобальное состояние.

Повторная проверка тем же субагентом завершилась ответом «Дефектов не
найдено»: P1 закрыт, контракты A/B подтверждены, файлы субагент не изменял.

Итог после исправления:

| Проверка | Exit code | Результат |
| --- | ---: | --- |
| настроенный запрос `{"diff": "test"}` | 0 | HTTP 200, `{"comment": "configured"}` |
| `make check` | 0 | Ruff, проверки практик 1–2 и 6 сценариев A/B прошли |
| `git diff --check` | 0 | ошибок форматирования diff нет |

Остаточное ограничение: проверка выполнена через `TestClient`; запуск живого
ASGI-сервера и журнал GitHub Actions появятся после сохранения и отправки ветки.

## 9. Домашнее продолжение: собственный skill

Создан проектный OpenCode skill `review-api-contract` в
`.opencode/skills/review-api-contract/SKILL.md`. OpenCode ищет проектные skills
в `.opencode/skills/<name>/SKILL.md`, поэтому отдельная глобальная установка не
нужна. Источник формата: [OpenCode Agent Skills](https://docs.opencode.ai/docs/skills/).

Skill предназначен только для проверки `POST /api/reviews`. Он читает
актуальные `AGENTS.md`, `HANDOFF.md` и style guide, сопоставляет реализацию с
шестью сценариями A/B, запускает команду из handoff и `git diff --check`, а в
ответе разделяет факты и ещё не проверенное поведение.

Подтверждение подключения и применения:

| Проверка | Результат |
| --- | --- |
| `quick_validate.py` | `Skill is valid!` |
| `opencode debug skill` | OpenCode 1.18.30 нашёл `review-api-contract` по проектному пути |
| workflow skill: `make check` | Ruff, практики 1–2 и 6 сценариев A/B прошли |
| workflow skill: `git diff --check` | ошибок форматирования diff нет |

Skill вызван через OpenCode с локальной моделью `ollama/itmo-agent-local`, без
VseLLM. В сессии `ses_ee7efd5ebffed9IPoEZiOBaTeX` виден отдельный вызов
`skill(review-api-contract)`; в повторном запуске skill сам выполнил
`make check`, и все 9 тестов прошли. После этого модель ошибочно назвала
ожидаемое сообщение ошибочного MCP-входа с 20 001 символом сбоем
`git diff --check`, хотя эту команду не вызывала. Повторяющийся ответ был
остановлен, а `git diff --check` выполнен отдельно с exit code 0.

Короткий разбор:

- помог единый контракт в `AGENTS.md` и одна команда `make check`;
- мешали устаревшие ранние разделы README и отсутствие запуска живого сервера;
- ручное вмешательство потребовалось после замечания субагента: глобальный
  неработающий LLM заменён явной передачей `ReviewService` в `create_app`;
- во время запуска skill пришлось остановить локальную модель и проверить
  `git diff --check` вручную, потому что она смешала ожидаемую ошибку MCP-теста
  с результатом другой команды;
- skill намеренно не исправляет код сам и не расширяет A/B таймаутами,
  фильтрацией секретов или аутентификацией.

## 10. Материалы сдачи

- [`HOMEWORK.html`](HOMEWORK.html) — единый отчёт по критериям A–Г.
- [`reflection.md`](reflection.md) — свободная рефлексия с конкретными
  наблюдениями.
- [`opencode-skill-run.txt`](opencode-skill-run.txt) — подтверждение вызова
  skill локальной моделью и фактический результат `make check`.
- [`mcp_review_server.py`](mcp_review_server.py) и
  [`test_mcp_review_server.py`](test_mcp_review_server.py) — собственный MCP и
  подтверждения реальных вызовов.
