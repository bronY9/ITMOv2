# Style guide для фич A и B

## Источник и область применения

- Источник: [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/).
- Версия: статус `Active`, редакция от 2025-04-04.
- Область: Python-код фич A и B для `POST /api/reviews` и их unit-, integration-, E2E- и web-проверки.
- Пример принятого стиля в репозитории: `practices/practice_01/TRAINING_PR.diff` — `ReviewService` использует CapWords, `create_review` использует snake_case, импорты и определения разделены пустыми строками.

## Правила

1. Использовать 4 пробела для отступа; определения верхнеуровневых функций и классов разделять двумя пустыми строками.
2. Размещать импорты после docstring и группировать в порядке: стандартная библиотека, сторонние пакеты, локальные модули. Отложенный импорт допустим только с коротким комментарием о причине.
3. Называть функции и переменные в `snake_case`, классы в `CapWords`, модульные константы в `UPPER_CASE_WITH_UNDERSCORES`.
4. Ограничивать строки 79 символами и переносить длинные выражения внутри круглых скобок без обратной косой черты.

## Пример для A и B

```python
from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    diff: str = Field(strict=True, min_length=1)
```

В `practices/practice_04/review_app.py` правила видны в именах `MAX_DIFF_LENGTH`, `ReviewRequest`, `create_review`, в группировке импортов и в переносе длинных выражений.
