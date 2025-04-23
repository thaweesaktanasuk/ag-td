FROM node:20-bullseye-slim

# Install required system libraries
RUN apt-get update && apt-get install -y \
    libc6 \
    libgcc1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
