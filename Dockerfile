# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables (with default values for development)
ARG VITE_AUTH0_DOMAIN=dev-65tlgyzfpbzeka8a.us.auth0.com
ARG VITE_AUTH0_CLIENT_ID=pDaLfxwVAerUnhjKfJNfxLfduUPJQi3x
ARG VITE_AUTH0_AUDIENCE=https://api.snippets.com
ARG VITE_AUTH0_REALM=User-Pass-Auth
ARG VITE_FRONTEND_URL=http://localhost:5173
ARG VITE_API_URL=http://localhost:19081
ARG VITE_BACKEND_URL=http://localhost:19081
ARG VITE_RUNNER_URL=http://localhost:19082

ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
ENV VITE_AUTH0_REALM=$VITE_AUTH0_REALM
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_RUNNER_URL=$VITE_RUNNER_URL

# Build production bundle
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (opcional, ver abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]