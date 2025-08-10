# syntax=docker/dockerfile:1.4

# Build stage (cache Maven deps)
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests package

# Runtime stage (no Maven, fast restarts)
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/*-SNAPSHOT.jar /app/app.jar
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Default HTTP port (not published directly in compose)
EXPOSE 9090

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]


