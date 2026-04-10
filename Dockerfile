FROM node:20-slim
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Serve using Vite's preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
