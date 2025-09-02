#Use Node.js 10.19.0 (latest LTS version for Node 10.x)
FROM node:10.19.0-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (adjust if your app uses a different port)
EXPOSE 1994

# Start the application
CMD ["npm", "start"]