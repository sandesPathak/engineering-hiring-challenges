# Docker and deployment

**The requirement, in one line:** we clone your repository, copy `.env.example` to `.env`,
run `docker compose up --build`, open a browser, and your project works.

That is 20 of the 100 points. It is the single largest category and the one most commonly
lost, because people build the Docker setup at 11pm on the last night and test it on a
machine that already has everything cached.

---

## What "works" means

```bash
git clone <your-repo> fresh && cd fresh
cp .env.example .env
docker compose up --build
```

and then, without any further steps:

- The database container starts, and the app **waits for it** rather than crashing because
  Postgres was not ready in the first 300 ms
- Migrations run
- Seed data loads
- The API is reachable on a documented port
- The front end is reachable on a documented port and can talk to the API
- The front page shows something real, not an error and not an empty list

If a step needs a second terminal — `docker compose exec api npm run db:seed` — that is
acceptable, **as long as your README says so, in order, in a copy-pasteable block**. What we
will not do is guess.

---

## The shape we expect

```
docker-compose.yml
.env.example
apps/
  api/Dockerfile
  web/Dockerfile
```

A minimal, honest example — yours will differ, this is to show the pieces:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports: ["5432:5432"]
    volumes: [dbdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 3s
      timeout: 3s
      retries: 20

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      SESSION_SECRET: ${SESSION_SECRET}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    ports: ["4000:4000"]

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      # Note: the browser resolves this, not the container, so it is localhost
      # and not http://api:4000. This trips up almost everybody once.
      NEXT_PUBLIC_API_URL: http://localhost:4000
    depends_on: [api]
    ports: ["3000:3000"]

volumes:
  dbdata:
```

### Things that earn credit

- **`depends_on` with `condition: service_healthy`**, not a bare `depends_on`, which only
  waits for the container to start and not for the database to accept connections
- **A multi-stage build** — deps, build, then a slim runtime stage that does not carry the
  toolchain
- **A non-root user** in the runtime stage (`USER node`)
- **A `.dockerignore`** with `node_modules`, `.git`, `.next`, `dist`, `coverage`, `.env`
- **Pinned base images** — `node:24-alpine`, `postgres:16-alpine`, not `node:latest`
- **A `HEALTHCHECK`** on your API
- **Layer order that caches** — copy manifests and install *before* copying source, so a
  code change does not reinstall the world
- **Named volumes for data**, so `docker compose down -v` genuinely resets the environment

### Things that lose credit

- `node_modules` copied into the image from the host
- A `.env` with real values committed so that "it works out of the box"
- An image that runs `npm run dev` with a file watcher as the production command, with no
  explanation
- Hard-coded `localhost` in server-to-server calls — inside the compose network the API is
  `http://api:4000`, and only the **browser** uses `localhost`
- A build that takes eleven minutes because every layer busts

---

## A worked multi-stage Dockerfile

```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=apps/api

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

---

## Testing it properly before you submit

The whole point is that it works somewhere that is not your machine. Simulate that:

```bash
docker compose down -v          # remove containers AND volumes
docker builder prune -f         # drop the build cache — this is the step people skip
rm -rf node_modules             # prove nothing on the host is being used
git status                      # is anything needed still uncommitted? .env.example? a migration?
docker compose up --build       # now watch it, from scratch, with a timer running
```

Then open both URLs in a private browser window and click through the main flow.

Note how long the cold build took and put it in your README. "First build takes about four
minutes" is a kindness. Silence followed by four minutes of scrolling logs makes a reviewer
wonder if it hung.

---

## Windows, Apple Silicon, and other people's machines

We review on both macOS (arm64) and Linux (amd64). If you build a native module or pin a
platform, test that it is not arm-only or amd-only, or note the limitation. Adding
`platform: linux/amd64` to a service is an acceptable fix if you say why.

Line endings matter: a shell entrypoint committed with CRLF fails in a Linux container with
a confusing `no such file or directory`. The `.editorconfig` in this repo sets `lf`; keep it.

---

## Deploying somewhere real

**Optional. Genuinely optional.** It is a bonus, not a requirement, and nobody has ever been
rejected for skipping it.

If you do want to, the free tiers that work with a Docker setup like this are Render,
Railway, Fly.io, and a small VPS with `docker compose`. Put the URL in your README, keep the
seeded test accounts working, and **rotate any credential you used** before you hand us the
repo.

If it is live, say clearly in the README **which** environment we are looking at, and make
sure the local Docker path still works. A hosted demo does not replace the compose file.

---

## If you cannot get Docker working

Tell us. In the README, plainly: what you tried, what failed, the exact error.

A submission that runs locally with clear instructions and an honest note about the Docker
problem scores far better than one where `docker compose up` fails silently and the README
claims it works. The first is a person having a bad night with a toolchain. The second is
somebody who did not check.
