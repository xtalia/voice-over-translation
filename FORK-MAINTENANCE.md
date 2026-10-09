# Сопровождение правок форка

## От чего отделены наши изменения

- Upstream: `https://github.com/ilyhalight/voice-over-translation.git`.
- Форк: `https://github.com/xtalia/voice-over-translation.git`.
- Исходный коммит для этой реализации: **`af99cad99e0365d4e5590608d98c56a91cc373b4`**.
- Разработка функции: ветка `feat/translation-volume-offset`; устанавливаемая сборка: `master/dist/vot.user.js`.
- Правки в исходниках помечены **`[VOT-FORK:volume-offset]`**, **`[VOT-FORK:compact-select]`**, **`[VOT-FORK:select-disabled]`** и **`[VOT-FORK:metadata]`**. Это поисковые якоря, не отдельная система сборки.
- `patches/translation-volume-offset.patch` — исходный source-only патч относительно указанного коммита: исходники, настройки пакета и тесты. Сгенерированные `dist` исключены. Это снимок первой реализации, а не автоматически актуализируемый патч.

## Карта изменений

| Файлы | Что сохранять при обновлении |
|---|---|
| `src/videoHandler/volumeLink.ts` | Необязательный `offsetPercent`, ветку original-master + надбавка, clamp, ноль; прежняя delta-ветка сохраняется |
| `src/VideoHandler.ts` | `refreshVolumeLink()`, параметры fixed-offset/mute, реальную громкость аудио и вызовы refresh при setup/активации перевода |
| `src/videoHandler/modules/events.ts` | Обработку native volume/mute и YouTube в fixed-offset, без изменений фильтров classic mode |
| `src/types/storage.ts`, `src/videoHandler/modules/init.ts` | `volumeLinkMode`, `translationVolumeOffset`, включение в `storageKeys`, совместимые default `delta`/`10` |
| `src/ui/views/settings.ts` | Пресеты, поля режима/надбавки, persistence, disabled/hidden, немедленное применение, `searchable: false` только для новых списков |
| `src/ui/manager.ts`, `src/types/views/settings.ts` | Событие `change:volumeLinkSettings` и немедленный refresh при включении связи |
| `src/ui/components/select.ts`, `src/types/components/select.ts` | Опциональный `searchable` (default true), корректные boolean disabled и aria-disabled |
| `src/types/localization.ts`, `src/localization/locales/{en,ru}.json` | Новые подписи настроек; после правок пересчитать hashes соответствующих JSON |
| `src/config/config.ts`, `src/headers.json`, `package.json` | URL форка, версия и AI-credit; не вернуть адрес обновлений на оригинал |
| `README.md`, `README-EN.md`, `FORK.md` | Ссылку установки форка, описание функции, Contributors/AI-credit; сохранить авторов upstream |
| `tests/volume-link-offset.test.ts`, `tests/fork-metadata.test.ts` | Регрессионные проверки логики, mute/unmute, inactive-source preview, settings и URL |
| `tests/browser-volume-offset.{html,ts}` | Локальную фикстуру настоящих настроек/video/audio без API перевода |
| `dist/vot.user.js`, `dist/vot-min.user.js` | Не редактировать вручную: пересобрать из уже объединённых исходников |

## Как обновлять от оригинала, не теряя функцию

Не заменять исходники файлом `dist/vot.user.js` из оригинала. Не использовать `git reset --hard upstream/master` и не запускать авто-синхронизацию форка, которая перезапишет наши коммиты.

Работать из чистого checkout, сохранив изменения отдельным коммитом. Сначала создать ветку обновления и объединять исходники, а не сгенерированный bundle:

```sh
git switch master
git pull --ff-only origin master
git fetch upstream master
git switch -c update/upstream-merge
git merge --no-commit --no-ff upstream/master
```

При конфликте использовать карту выше и маркеры `[VOT-FORK:...]`; перенести hooks на новые upstream-методы, если их структура изменилась. В JSON комментарии недопустимы, поэтому ориентироваться на карту и diff. Не выбирать целиком `ours`/`theirs` для всех исходников: это может потерять исправления одной стороны. Для конфликтующих bundle в `dist` можно взять upstream-вариант временно, затем **обязательно пересобрать**.

После разрешения конфликтов:

1. Проверить сохранение storage keys, URL обновлений, режима default и атрибуции.
2. Пересчитать locale hashes, если изменились локали, и выполнить `bun install --frozen-lockfile`.
3. Запустить проверки из `FORK.md` и полный `bun test`. Прежние upstream-сбои сравнить с новой чистой upstream-базой; старый baseline не доказывает отсутствие новых ошибок.
4. В браузере проверить пресет/своё значение, persistence после reload, mute/unmute, насыщение 100% и отсутствие поиска в двух новых меню.
5. Выполнить `bun run build:gm`, проверить headers сборки, закончить merge-коммит и публиковать только после review.
6. Влить проверенную ветку обновления в `master` и обновить базовый upstream SHA/карту по мере изменений.

## Резервный перенос через патч

Для **чистой базы указанного SHA** проверка применимости исходного патча:

```sh
git apply --check patches/translation-volume-offset.patch
```

На новом upstream патч может конфликтовать — это ожидаемо. Работать в отдельной ветке; `git apply --3way` использовать только с доступными исходными Git-объектами, затем вручную проверить конфликты. Не применять патч поверх форка, где функция уже есть.

Для актуального экспорта после будущих обновлений использовать Git diff относительно последнего реально объединённого upstream-коммита, включать все изменения функции и тесты, исключать `dist` и сам файл патча. Версия в снимке первоначальная: после переноса выбрать новую версию и пересобрать.
