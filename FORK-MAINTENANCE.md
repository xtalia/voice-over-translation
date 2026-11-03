# Сопровождение форка

## База и история

- Upstream: https://github.com/ilyhalight/voice-over-translation — **1.12.6**, точный SHA **`23335c9a4e489ae2befcdc6dd2052a7d6b405ecb`**.
- Форк: https://github.com/xtalia/voice-over-translation, рабочая ветка `feat/volume-settings-v2`, версия **1.12.6.1**.
- Предыдущая реализация: `feat/volume-quick-controls`, `160dd21`, версия **1.11.17.2**, старая upstream-база `af99cad99e0365d4e5590608d98c56a91cc373b4`.
- Старые `patches/translation-volume-offset.patch` и `patches/volume-quick-controls.patch` — исторические снимки старого UI, не патчи для текущего upstream.
- Актуальный source-only снимок переноса: **`patches/volume-settings-v2.patch`**, относительно SHA выше. Сгенерирован и проверен основным агентом: `git apply --check`, реальное применение к чистой базе и сравнение всех 40 файлов без расхождений. Документация и `tests/fork-docs.test.ts` исключены.
- Версия **1.12.6.1** опубликована в `master` с разрешения владельца. Обе raw-сборки прочитаны после push и совпали с локальными проверенными артефактами. История прежнего форка сохранена без force-push.

## Карта переноса

| Область                                                         | Что сохранять при обновлении                                                                                               |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/videoHandler/volumeLink.ts`                                | Classic delta при 0, fixed-offset при ненулевом значении, clamp и возврат после насыщения                                  |
| `src/videoHandler/autoVolumeLimit.ts`, `src/VideoHandler.ts`    | once/hold, baseline на время перевода, restore stop/off/replaceVideo, фактический уровень аудио                            |
| `src/videoHandler/modules/{events,smartDuckingRuntime}.ts`      | Native volume/mute, совместимость с adaptive, refresh связи после ограничения                                              |
| `src/types/storage.ts`, инициализация настроек                  | Миграцию старых параметров, `muteTranslationWithOriginal: true` по умолчанию, сохранение настроек                          |
| `src/components/*`, settings/overlay и UI stores                | Общие сохранённые параметры; переключатели, зависимые поля, смещение −10…100 шаг 5, синхронный числовой ввод, метки ✨     |
| Локализация UI форка                                            | Отдельный fork overlay; upstream JSON и hashes не менять вручную                                                           |
| `src/config/config.ts`, `src/headers.json`, `package.json`      | Репозиторий xtalia, raw-адреса `master`, версия 1.12.6.1, авторы upstream и AI-credit; package dependencies/lock не менять |
| `vite/lib/userscript/headers.ts`, конфигурация сборки           | Проверить конечные update/download URL: upstream генератор перезаписывает поля metadata адресами Releases                  |
| `src/localization/localizationProvider.ts`, build `REPO_BRANCH` | Runtime locales/hashes должны загружаться из xtalia/master, а не feature/dev/upstream                                      |
| `tests/fork-{metadata,docs}.test.ts` и volume/UI тесты          | URL/версия/credits, границы смещения, mute opt-out, restoration, storage, состояния элементов                              |
| `README.md`, `README-EN.md`, `FORK.md`, `TASKS.md`              | Краткое описание, точная база, честный статус проверок и публикации                                                        |
| `dist/vot{,-min}.user.js`                                       | Пересобирать после слияния исходников; не править вручную                                                                  |

Это карта зон ответственности переноса; окончательный список изменённых файлов берётся из diff, а не из старой структуры UI. Hooks форка ищутся по `[VOT-FORK:...]`.

## Проверки перед готовностью

```sh
npx --yes bun test --isolate --preload ./tests/setup.ts tests/fork-metadata.test.ts tests/fork-docs.test.ts
npx --yes bun test --isolate --preload ./tests/setup.ts
node node_modules/typescript/bin/tsc -p src/tsconfig.json --noEmit
npx --yes bun run lint
npm run build:gm
```

Не использовать локально `autobuild:signed` или `sign:firefox`. Общие upstream-сбои сравнивать с **новой** чистой базой; отчёт старого `af99cad` не доказывает состояние 1.12.6.

В браузере проверить once/hold/adaptive, восстановление stop/off и смену видеоэлемента; offset −10/0/100, шаг 5 и двусторонний ввод; mute/unmute и отключение флажка; persistence после reload; реальную громкость audio, а не только sliders; полные и быстрые настройки, если быстрые кнопки перенесены. Сборочные headers проверить у обоих userscript: версия, авторы, raw update/download `xtalia/master`, runtime locale branch.

## Обновления и резервный патч

1. Сохранить текущую работу и работать в отдельной update-ветке; объединять upstream-исходники, не заменять bundle оригинальным. Не применять `reset --hard` или автосинхронизацию, стирающую форк.
2. После разрешения конфликтов обновить точный upstream SHA и эту карту; сохранить storage migration, API hooks и credits. Повторить unit/UI/type/lint/build проверки.
3. Сгенерировать `patches/volume-settings-v2.patch` из diff относительно указанной базы: включить функциональные исходники и тесты, включая новые файлы; исключить `dist`, документацию, `tests/fork-docs.test.ts` и сами патчи. Сборочные metadata-правки учитывать отдельно при переносе в оригинальный проект.
4. В отдельном чистом checkout **точного SHA** проверить патч абсолютным путём:

```sh
git apply --check /absolute/path/to/patches/volume-settings-v2.patch
```

Не запускать эту проверку поверх уже пропатченного форка. На более новом upstream возможны конфликты; это не повод считать старый снимок актуальным. Отмечать готовность только после реального результата проверки.

Публикация — отдельная операция только с разрешения владельца. После неё прочитать удалённый SHA и raw-файлы, сверить версии/headers и содержимое обеих сборок; только тогда убрать предупреждение «не опубликовано» из README. [MIT-лицензия](LICENSE), upstream credits и AI-атрибуция остаются.
