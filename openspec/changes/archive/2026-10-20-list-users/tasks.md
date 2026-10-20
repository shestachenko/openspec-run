# Tasks

## 1. Fixtures

- [x] 1.1 Положить `data/users.json` и `data/user-profiles.json` в форме из design.md: пользователи id 1 (`ann`), 2 (`ben`) и 10 (`cara`); вторая запись есть у 1 и 10, у 2 её нет; у 1 salary — число 100. Проверка: оба файла читаются как JSON, id 1 и 10 есть в обоих, id 2 есть только в первом.

## 2. Domain and port

- [x] 2.1 Добавить `src/domain/user.ts` с элементом списка (`id`, `username`, `addresses`, `teams`, `manager`, `salary`) без импорта Fastify и файлов. Проверка: `npm run typecheck` проходит.
- [x] 2.2 Добавить `src/usecase/list-users.port.ts` с `listUsers` и `findProfile(id)`. Проверка: `npm run typecheck` проходит.

## 3. Adapters

- [x] 3.1 Добавить `src/adapter/json/users-json.ts`: читает `data/users.json` от `process.cwd()` и возвращает строки первого файла. Проверка: `npm run typecheck` проходит.
- [x] 3.2 Добавить `src/adapter/json/user-profiles-json.ts`: за один вызов чтения файла строит карту и `findProfile(id)` берёт запись из неё, а не открывает диск снова. Проверка: `npm run typecheck` проходит.

## 4. Usecase

- [x] 4.1 Добавить `src/usecase/list-users.ts`: сортировка по числовому `id` по возрастанию, срез `(page - 1) * limit`, `total` — длина полного списка, для id среза вызывается `findProfile`, нет записи — четыре поля `null`. Проверка: `npm run typecheck` проходит.

## 5. HTTP

- [x] 5.1 Добавить `src/http/list-users.ts`: отдельно нормализует `page` и `limit` (вся строка — десятичные цифры и значение ≥ 1, иначе 1 и 10), вызывает один usecase и отдаёт 200 с `{ items, total }`. Проверка: `npm run typecheck` проходит.
- [x] 5.2 В `src/app.ts` создать adapter-ы, передать их в usecase и зарегистрировать handler. `GET /health` и `src/server.ts` не менять. Проверка: `npm run typecheck` проходит.

## 6. Check

- [x] 6.1 `npm run typecheck` проходит. Затем запустить сервер из корня репозитория (`npm run dev`) и запросить его. `GET /users?page=1&limit=2` даёт 200, `items` — id 1 затем 2, `total` 3, у id 1 поля второй записи заполнены и `salary` число, у id 2 четыре поля `null`. `GET /users?page=5&limit=2` даёт пустой `items` и `total` 3. `GET /users?page=abc&limit=2` совпадает с первой страницей из двух элементов. `GET /health` по-прежнему `{ "status": "ok" }`.
