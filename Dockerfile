FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_PUBLIC_APP_URL
ARG VITE_DEMO_BUSINESS_DAYS_PARAM=1
ENV VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL
ENV VITE_DEMO_BUSINESS_DAYS_PARAM=$VITE_DEMO_BUSINESS_DAYS_PARAM
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
