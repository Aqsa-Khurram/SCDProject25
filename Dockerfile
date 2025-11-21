# Use official Node 18 LTS slim image
FROM node:18-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install build deps needed for some native modules during npm install
# then remove them after install to reduce final image size.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production

# Remove build tools (optional cleanup)
RUN apt-get purge -y --auto-remove build-essential python3 make g++ || true \
  && rm -rf /var/lib/apt/lists/*

# Copy app source
COPY . .

# Expose the port your app uses (default 3000)
EXPOSE 3000

# Run the app (use the file you use locally: app.js or server.js)
CMD ["node", "app.js"]

