# openspec-run

Небольшой JSON REST API на Fastify и TypeScript. Поведение описывается через OpenSpec (spec-driven).

## Требования

- Node.js 20.19 или новее
- npm
- OpenSpec CLI: `npm install -g @fission-ai/openspec@latest`

## Команды

```bash
npm install
npm run dev        # http://127.0.0.1:3000
npm run typecheck
npm run build
npm start          # собранный dist/server.js
```

`GET /health` отвечает `{ "status": "ok" }`. Порт задаётся `PORT` (по умолчанию 3000), адрес — `HOST` (по умолчанию `0.0.0.0`).

## OpenSpec

Спеки и изменения лежат в `openspec/`. В Cursor доступны команды:

- `/opsx-explore` — продумать идею
- `/opsx-propose` — черновик изменения
- `/opsx-apply` — реализовать задачи
- `/opsx-update` — поправить план
- `/opsx-sync` — перенести дельты в `openspec/specs/`
- `/opsx-archive` — закрыть изменение

Новое поведение сначала оформляется изменением, потом кодом.
