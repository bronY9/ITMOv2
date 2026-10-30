# Practice 6: harden Mini Shop against STRIDE and LLM attacks

## Что сделано

- построена модель угроз с границами доверия, STRIDE и AI-векторами;
- воспроизведены и описаны исходные атаки в `REPORT_01.md`;
- добавлены session-based authentication и object-level authorization;
- устранены SQL injection, price tampering, role spoofing, IDOR, file disclosure, log leakage и XSS;
- LLM считается недоверенным планировщиком, executor применяет allowlist и повторную авторизацию;
- добавлены security regression и HTTP error-handling tests;
- повторные атаки и остаточные риски описаны в `REPORT_02.md`;
- добавлен кастомный промпт независимого LLM-судьи.

## Проверка

```bash
make step6
make test
```

## Выводы

Prompt engineering помогает модели распознать недоверенный текст, но не является границей
безопасности. Даже если модель вернёт `delete_tree` или `export_profiles`, сервер обязан заново
проверить пользователя, роль, инструмент и аргументы.

Также стало видно, что одной проверки токена недостаточно: права должны проверяться относительно
каждого профиля, заказа и файла. В исправленном варианте клиент не выбирает владельца, роль или
цену, а сервер вычисляет их из собственной сессии и каталога.
