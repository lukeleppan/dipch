# Build stage
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY svelte.config.js ./

RUN pnpm install --frozen-lockfile

COPY . .
COPY .env.build .env
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/svelte.config.js ./svelte.config.js
COPY --from=build /app/start.js ./start.js
COPY --from=build /app/drizzle ./drizzle/

RUN pnpm install --frozen-lockfile --prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the app
CMD ["node", "start.js"]
