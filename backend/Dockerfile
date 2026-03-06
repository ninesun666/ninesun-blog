# Runtime stage - uses pre-built JAR
FROM eclipse-temurin:17-jdk
WORKDIR /app
RUN useradd -r spring && mkdir /app/uploads && chown spring:spring /app/uploads
USER spring
COPY target/blog-1.0.0.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]
