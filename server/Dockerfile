# ==============================================================================
# HelpRoster Server - Production Dockerfile
# Multi-stage lightweight Node.js 20 Alpine container
# ==============================================================================

FROM node:20-alpine AS base

# Install curl/wget for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY src/ ./src/

# Create non-root user execution
USER node

# Expose API port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start production server
CMD ["npm", "start"]
