FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/StudentService-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9095

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
