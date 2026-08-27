# Stage 1: Build application with Maven and JDK 21
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production JRE 21 Container
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/motel-management-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
