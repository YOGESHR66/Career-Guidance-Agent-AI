# Use the official lightweight Node.js image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build the frontend assets and backend bundle
RUN npm run build

# Remove development dependencies to keep production image tiny
RUN npm prune --production

# --- Production Image Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary production artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose server ingress port
EXPOSE 3000

# Start the bundled production server
CMD ["node", "dist/server.cjs"]
