# Use a Debian-based slim image for building (glibc is included)
FROM node:20-slim AS build

WORKDIR /app

# Copy dependency files first to leverage caching
COPY package.json ./

# Install all dependencies (this might include dev dependencies for build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Final/production stage
FROM node:20-slim

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY package.json ./

# Install all dependencies
RUN npm install

EXPOSE 8081
CMD ["node", "./dist/pipeline.js", "start"]