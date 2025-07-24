# Use Node.js LTS version for React + TypeScript development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port for React development server
EXPOSE 3000

# Start React development server
CMD ["npm", "start"] 