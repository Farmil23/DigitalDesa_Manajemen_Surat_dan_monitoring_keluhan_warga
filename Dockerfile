# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY pom.xml ./
COPY src ./src
# Copy React build to Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist /app/backend/src/main/resources/static
# Build the Spring Boot application
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Hugging Face Spaces expose port 7860
ENV SERVER_PORT=7860
EXPOSE 7860

# Add uploads directory
RUN mkdir -p /app/uploads/pengaduan

COPY --from=backend-builder /app/backend/target/demo-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
