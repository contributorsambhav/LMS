FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (default 5001)
EXPOSE 5001

# Start the server using tsx (since there is no build script configured)
CMD ["npx", "tsx", "src/index.ts"]
