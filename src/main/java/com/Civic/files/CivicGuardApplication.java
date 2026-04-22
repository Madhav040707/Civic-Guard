package com.Civic.files;

import com.mongodb.client.model.Aggregates;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CivicGuardApplication {

	public static void main(String[] args) {
		SpringApplication.run(CivicGuardApplication.class, args);
	}

}
