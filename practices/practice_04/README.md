# Практика 4: применение skill к фиче A

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

Проверка подготовлена, но сейчас не может быть выполнена: в репозитории есть только `TRAINING_PR.diff`, нет исходников приложения и команды запуска FastAPI. Это ограничение входных данных, а не успешный результат проверки фичи A.

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
| Skill применён к задаче | Готово частично | `webapp-testing` установлен, его helper проверен, Playwright-сценарий A подготовлен. Полный прогон требует работающего приложения. |
| MCP вернул полезный ответ | Готово | Context7 вызван через `resolve-library-id` и `query-docs`; получено основание для `Field(strict=True, min_length=1)` и HTTP 422 при `RequestValidationError`. |
| Известно, что недоступно | Blocker обозначен | На `127.0.0.1:8000` нет сервера; в репозитории нет исходников FastAPI и команды запуска, поэтому нельзя выполнить браузерный прогон и проверить фактическое отсутствие вызова LLM. |

Запасной путь до появления исходников: использовать сохранённые критерии A и ответ Context7 для подготовки схемы и проверок. После получения приложения добавить unit-проверку с mock LLM, включить команду запуска в `Makefile`, запустить приложение через `webapp-testing/scripts/with_server.py` и выполнить `check_feature_a.py`. Только после этих прогонов пункт применения skill можно считать полностью завершённым.

## 6. Автоматическая проверка

- Lint: Ruff `0.16.10`, команда `make lint`.
- Tests: существующая команда `make test`.
- Общая ручная проверка: `make check`.
- Триггер: событие GitHub Actions `push` для любой ветки.
- Исполнитель: GitHub-hosted runner `ubuntu-latest`, а не агент разработки.
- Workflow: `.github/workflows/python-checks.yml`.

Workflow устанавливает закреплённую версию Ruff и выполняет `make check`. В журнале GitHub Actions будут видны событие `push`, команда `make check`, вывод Ruff и тестов и итоговый exit code шага. Lint ограничен Python-файлом текущей фичи A, потому что изменение ранее созданных файлов `practice_03/lab/demo` не входит в область этой задачи.

Локальная проверка конфигурации перед первым `push`:

| Команда | Exit code | Результат |
| --- | ---: | --- |
| `make lint` | 0 | `All checks passed!` |
| `make check` | 0 | Ruff и проверки практик 1–2 прошли |
| разбор YAML workflow | 0 | синтаксис корректен |

После добавления workflow в коммит первый `push` создаст удалённый журнал. Шаг `Show trigger` напечатает `event`, SHA коммита и исполнителя, а шаг `Run lint and tests` всегда напечатает `check_exit_code` и завершится с тем же кодом.
