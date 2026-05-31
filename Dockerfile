# Single-stage image. Keeps the Prisma CLI and ts-node available so the
# container can run `migrate deploy` and seed on startup. Multi-stage slimming
# is noted as production follow-up work in the README.
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# Drop root: run as the unprivileged "node" user shipped in the base image.
RUN chown -R node:node /app
USER node

EXPOSE 3000
# Apply migrations, seed defaults/policies, then start the compiled app.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main"]
