FROM node:20-alpine

WORKDIR /app

# Needed for `pg_isready` in the entrypoint.
RUN apk add --no-cache postgresql16-client

# Provide a dummy DATABASE_URL at build time so Prisma can parse the schema.
# At runtime, docker-compose will override it via `.env`.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY frontend/package.json ./frontend/package.json

WORKDIR /app/frontend
RUN npm install

WORKDIR /app
COPY frontend ./frontend

RUN cd /app/frontend && npx prisma generate
RUN cd /app/frontend && npm run build
RUN chmod +x /app/frontend/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/frontend/docker-entrypoint.sh"]

