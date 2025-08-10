FROM node:20-alpine

WORKDIR /app

# Ensure compatibility libs for some native/optional deps
RUN apk add --no-cache libc6-compat

# Copy package files first for better docker layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Use official registry and clean cache to avoid stale issues
RUN npm config set registry https://registry.npmjs.org/ && npm cache clean --force

# Install deps: prefer npm ci if lockfile exists; fallback to clean install; ensure rollup musl optional dep present
RUN if [ -f package-lock.json ]; then \
      echo "Found package-lock.json → running npm ci" && \
      npm ci --prefer-offline --no-optional --verbose || (rm -rf node_modules package-lock.json && npm install --prefer-offline --no-optional --verbose); \
    else \
      echo "No package-lock.json found → running npm install" && \
      npm install --force --prefer-offline --no-optional --verbose; \
    fi \
  && (npm ls @rollup/rollup-linux-x64-musl >/dev/null 2>&1 || npm install @rollup/rollup-linux-x64-musl --no-save)

# Copy source code
COPY . .

# Enable polling for file changes (fixes hot reload on Windows)
ENV CHOKIDAR_USEPOLLING=true

# Expose dev server port
EXPOSE 5050

# Run dev server and bind to 0.0.0.0 so host can access it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5050"]


