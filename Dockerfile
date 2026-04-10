FROM oven/bun:latest
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN bun install
RUN bun run build

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Serve using Vite's preview server
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "8080"]
