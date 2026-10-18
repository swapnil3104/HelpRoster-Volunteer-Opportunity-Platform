# ==============================================================================
# HelpRoster Client - Production Multi-Stage Dockerfile
# Stage 1: Build Vite React application
# Stage 2: Serve optimized static assets with Nginx Alpine
# ==============================================================================

# --- Stage 1: Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . ./

# Build production bundle
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME="HelpRoster"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# --- Stage 2: Nginx runtime stage ---
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
