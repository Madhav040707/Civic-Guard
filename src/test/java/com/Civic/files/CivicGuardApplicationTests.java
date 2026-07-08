package com.Civic.files;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.InputStream;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class CivicGuardApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void mongodbUriIsExternalizedAndNotHardcoded() throws Exception {
		Properties properties = new Properties();
		try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
			assertNotNull(input, "application.properties should be present on the classpath");
			properties.load(input);
		}
		String mongoUri = properties.getProperty("spring.mongodb.uri");
		assertTrue(mongoUri.contains("${SPRING_MONGODB_URI"), "Mongo URI should be externalized via environment variable");
		assertFalse(mongoUri.contains("@"), "Mongo URI in repo should not embed credentials");
	}

}
