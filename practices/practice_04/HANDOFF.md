# Handoff: фичи A и B для `POST /api/reviews`

## Цель

Подготовить продолжение API ревью: сохранить валидацию фичи A и добавить
лимит размера `diff` из фичи B. Актуальный контракт и границы изменения
находятся в корневом `AGENTS.md`; не восстанавливать прежний запрет на B.

## Рабочая копия и состояние

- Worktree: `/Users/vasilijpanfilov/Soft_eng_2026/AI/project-p4-b`.
- Ветка: `practice-04-b`.
- База A: commit `d1aef34` ветки `fourth_practice`.
- Изменения B и материалы этапов 5.2–6.2 пока не закоммичены.
- Основная рабочая копия `ITMOv2` остаётся на `fourth_practice` без изменений.

## Актуальные файлы

- `AGENTS.md` — контракт A/B, границы и команды проверки.
- `practices/practice_04/review_app.py` — реализация API.
- `practices/practice_04/test_review_app.py` — шесть сценариев A/B.
- `practices/practice_04/mcp_review_server.py` — собственный MCP tool.
- `practices/practice_04/test_mcp_review_server.py` — реальные вызовы MCP.
- `practices/practice_04/STYLE_GUIDE.md` — правила Python-кода.
- `practices/practice_04/README.md` — подтверждения этапов и проверок.
- `practices/practice_04/HOMEWORK.html` — итоговый отчёт по критериям.
- `practices/practice_04/reflection.md` — свободная рефлексия.
- `practices/practice_04/opencode-skill-run.txt` — подтверждение локального
  запуска skill.
- `practices/practice_04/requirements.txt` — закреплённые зависимости проверок.
- `.opencode/skills/review-api-contract/SKILL.md` — проектный skill проверки
  контрактов A/B.
- `Makefile` — единая команда `make check`.
- `.github/workflows/python-checks.yml` — проверка каждого push в GitHub.

## Контракты A и B

- A: обязательный строгий непустой строковый `diff`.
- Валидный `diff` вызывает LLM один раз и возвращает HTTP 200 с
  `{"comment": <строка>}`.
- Отсутствующий, нестроковый и пустой `diff` возвращают HTTP 422 до LLM.
- B: ровно 20 000 символов принимаются; 20 001 символ возвращает HTTP 413
  до LLM.
- `ReviewService` явно передаётся в `create_app`; глобальной подмены сервиса
  в тестах нет.

## Выполненные проверки

Команда:

```bash
RUFF_CACHE_DIR=/tmp/itmo-p4-b-ruff-cache \
make check \
  PYTHON=/tmp/itmo-p4-b-venv/bin/python \
  RUFF=/tmp/itmo-p4-b-venv/bin/ruff
```

Последний результат: Ruff прошёл, проверки практик 1–2 прошли, все 6
сценариев A/B и 3 сценария собственного MCP прошли. `git diff --check`
завершился с кодом 0. После
исправления P1 субагент повторно проверил изменение и сообщил:
«Дефектов не найдено».

Skill `review-api-contract` прошёл `quick_validate.py` и обнаруживается
OpenCode 1.18.30 через `opencode debug skill`. Skill вызван OpenCode с локальной
моделью `ollama/itmo-agent-local` без VseLLM и выполнил `make check`: все 9
тестов прошли. После этого модель неверно истолковала ожидаемую ошибку MCP-теста
как сбой `git diff --check`; её повторяющийся ответ остановлен, а команда
проверена отдельно с exit code 0.

## Что ещё не подтверждено

- Живой ASGI-сервер не запускался; HTTP-сценарии проверены через `TestClient`.
- GitHub Actions ещё не запускался для изменений B, потому что ветка не
  отправлена после этих изменений.
- Изменения не закоммичены и PR для `practice-04-b` не создан.

## Следующий шаг

Проверить `git diff` в worktree B, повторить `make check`, затем сохранить
изменения одним коммитом и отправить `practice-04-b` в GitHub. После push
проверить журнал workflow и подготовить PR из `practice-04-b` в
`fourth_practice`.
