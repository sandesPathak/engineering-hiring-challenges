FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/sabhaghar.sqlite

RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
