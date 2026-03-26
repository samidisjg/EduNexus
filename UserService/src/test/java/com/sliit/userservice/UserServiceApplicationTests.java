package com.sliit.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "jwt.secret=test-secret-key-test-secret-key-test-secret-key-123456",
        "jwt.expiration=3600000",
        "jwt.refresh-expiration=86400000",
        "spring.datasource.url=jdbc:h2:mem:userservice-test;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class UserServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
