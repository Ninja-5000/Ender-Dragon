# Build Stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app ./
RUN npm install --omit=dev && npm install @vitejs/plugin-react
EXPOSE 6767
CMD ["npm", "run", "preview", "--", "--port", "6767", "--host", "0.0.0.0"]