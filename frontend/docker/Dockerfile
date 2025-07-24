# Use Node.js LTS version for React + TypeScript development
FROM node:18-alpine

# Install inotify for file watching (before switching users)
RUN apk add --no-cache inotify-tools

# Create startup script that embeds CSV as TypeScript module (no duplication)
RUN echo '#!/bin/sh' > /startup.sh && \
    echo 'cd /workspace/frontend' >> /startup.sh && \
    echo 'echo "🔄 Embedding CSV as TypeScript module (no file duplication)..."' >> /startup.sh && \
    echo 'mkdir -p src/data' >> /startup.sh && \
    echo 'echo "// Auto-generated quiz data module from /workspace/data/quiz_data.csv" > src/data/quizData.ts' >> /startup.sh && \
    echo 'echo "// This eliminates the need for file duplication or static file serving" >> src/data/quizData.ts' >> /startup.sh && \
    echo 'echo "export const quizDataCSV = \`" >> src/data/quizData.ts' >> /startup.sh && \
    echo 'cat /workspace/data/quiz_data.csv >> src/data/quizData.ts' >> /startup.sh && \
    echo 'echo "\`;" >> src/data/quizData.ts' >> /startup.sh && \
    echo 'echo "✅ Quiz data embedded as TypeScript module (single source of truth)"' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Start React development server' >> /startup.sh && \
    echo 'echo "🚀 Starting React development server..."' >> /startup.sh && \
    echo 'npm start &' >> /startup.sh && \
    echo 'SERVER_PID=$!' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Watch for file changes and regenerate module' >> /startup.sh && \
    echo 'while inotifywait -e modify /workspace/data/quiz_data.csv 2>/dev/null; do' >> /startup.sh && \
    echo '  echo "📄 Quiz data changed, regenerating TypeScript module..."' >> /startup.sh && \
    echo '  echo "// Auto-generated quiz data module from /workspace/data/quiz_data.csv" > src/data/quizData.ts' >> /startup.sh && \
    echo '  echo "// This eliminates the need for file duplication or static file serving" >> src/data/quizData.ts' >> /startup.sh && \
    echo '  echo "export const quizDataCSV = \`" >> src/data/quizData.ts' >> /startup.sh && \
    echo '  cat /workspace/data/quiz_data.csv >> src/data/quizData.ts' >> /startup.sh && \
    echo '  echo "\`;" >> src/data/quizData.ts' >> /startup.sh && \
    echo '  echo "✅ Quiz data module regenerated from single source"' >> /startup.sh && \
    echo 'done &' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Wait for the server process' >> /startup.sh && \
    echo 'wait $SERVER_PID' >> /startup.sh && \
    chmod +x /startup.sh

# Set working directory
WORKDIR /workspace/frontend

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Change ownership of the workspace directory
RUN chown -R nextjs:nodejs /workspace
USER nextjs

# Expose port for React development server
EXPOSE 3000

# Start with sync script
CMD ["/startup.sh"] 