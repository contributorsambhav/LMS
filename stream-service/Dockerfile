FROM node:20-alpine

# Install FFmpeg required for video transcoding
RUN apk update && apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Ensure temp directory exists for video processing
RUN mkdir -p temp

# Expose port (default 4000)
EXPOSE 4000

# Start the server using ts-node
CMD ["npm", "run", "start"]
