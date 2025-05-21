FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port specified in the app
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 