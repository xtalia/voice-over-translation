# TASKS — перенос настроек громкости v2

База: upstream **1.12.6**, `23335c9a4e489ae2befcdc6dd2052a7d6b405ecb`. Рабочая ветка: `feat/volume-settings-v2`; версия: **1.12.6.1**. Владелец разрешил commit и публикацию в production.

## 1. Исследование — завершено

- [x] Прочитать `AGENTS.md`, проверить ветку, upstream SHA и старый форк `160dd21`.
- [x] Зафиксировать новый контракт: once/hold/adaptive, offset −10…100 шаг 5, 0 = delta, mute opt-out default true, restore stop/off.
- [x] Проверить кредиты и текущую генерацию metadata/URL.

## 2. Перенос — завершён

- [x] Перенести runtime связи, ограничения и восстановления baseline на текущий upstream.
- [x] Перенести storage/defaults/migration, включая `muteTranslationWithOriginal: true`.
- [x] Обновить Solid UI: переключатели, режимы, sliders, numeric input, зависимые состояния, ✨ и fork localization overlay.
- [x] Подтвердить перенос трёх быстрых кнопок через production-цепочку OverlayController → OverlayView → Menu → SettingsController.
- [x] Обновить краткие RU/EN README, инструкцию и maintenance-документ с credits и статусом локальной версии.
- [x] Обновить metadata версии/авторов, repository URL и исходные raw-ссылки установки/обновления.
- [x] Проверить, что генератор сборки не заменяет raw update/download URL на Releases, и runtime locale branch = master.

## 3. Проверки — итоговый прогон основным агентом

- [x] Unit/regression тесты runtime и настроек.
- [x] Metadata/docs тесты (основной агент повторяет после интеграции).
- [x] Полный suite: 339 pass / 0 fail; чистый upstream: 310 pass / 0 fail.
- [x] Typecheck и lint без новых ошибок.
- [x] Browser smoke: реальные audio/video, offset/mute/restoration и persistence.
- [x] Собрать обе userscript-версии; проверить конечные headers и URL локалей.
- [x] Независимый review runtime/build routing и UI: PASS после исправления четырёх найденных краевых случаев. LICENSE, CONTRIBUTING.md, bun.lock и upstream locale JSON/hashes не менялись.

## 4. Резервный перенос и передача

- [x] Сгенерировать актуальный source-only `patches/volume-settings-v2.patch`.
- [x] Выполнить `git apply --check`, реально применить патч на чистой базе `23335c9a4e489ae2befcdc6dd2052a7d6b405ecb` и сравнить все 40 файлов: расхождений нет.
- [x] Обновить итоговый отчёт фактическими результатами.

## Итог проверки

- Полный повторный прогон после последнего исправления: **339 pass / 0 fail** (44 файла), typecheck PASS, lint PASS (422 файла).
- Headless Chrome: once/hold, отрицательный offset, zero/delta, native mute/unmute, muted source refresh, новый сеанс, stop/off/replaceVideo, Rutube/OK hold; реальная громкость HTML media.
- UI browser: production quick-control chain, persistence/reload, границы −10/100, шаг 5, дробный/невалидный ввод, последовательный ввод 75/−10, повторный ввод неизменившегося 0 → blur → slider25.
- Обе сборки `1.12.6.1`: сборка PASS, `node --check` PASS, конечные update/download URL `xtalia/master/dist` проверены.
- `dist/vot.user.js` SHA-256: `8ff9f5bfdb3e2ac6a09303e0b06e6c04e911680e037a58ee9525e869ecb5cf8f`.
- `dist/vot-min.user.js` SHA-256: `409b528fcf40fa2b0a96f0d8ac15f60711deeab08a1908863e78c2f48667f5ae`.
- Source-only patch SHA-256: `1eb8450f024cb4d071ec99c4cbe6dba9d04a965e78a91dd9e85fabdf23a8f3aa`; apply/check и паритет 40 файлов PASS.
- Проверялось управление громкостью без обращения к API перевода; новый перевод на живом YouTube с Яндекс API не запускался.
- Реализация закоммичена: `8689a927`. Merge `29dbe767` сохраняет прежнюю историю форка (`160dd21`) и проверенное дерево исходников; force-push не использовался.
- Production `master` обновлён; обе raw-сборки `1.12.6.1` прочитаны после push и совпали с указанными SHA-256. Прежняя ветка `feat/volume-quick-controls` сохранена.
- Отдельный tag/release не создавался: production-канал userscript — `master/dist`. Это не подписанная сборка магазинного расширения.

**Следующие публикации** требуют разрешения владельца и повторной проверки удалённого SHA и raw-артефактов. Сама по себе локальная сборка не означает обновление production.
