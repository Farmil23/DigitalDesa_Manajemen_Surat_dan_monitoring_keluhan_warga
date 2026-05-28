package com.DigitalVillageHub.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DemoApplication - Main Spring Boot Application
 * Backend API server untuk Digital Village Hub
 * 
 * JavaFX Desktop GUI dijalankan separately via:
 * mvn javafx:run -Djavafx.mainClass=com.DigitalVillageHub.demo.javafx.JavaFXApplication
 */
@SpringBootApplication
public class DemoApplication {
	
	private static final Logger logger = LoggerFactory.getLogger(DemoApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
		logger.info("✅ Digital Village Hub API Server started");
		logger.info("📍 API Server ready at http://localhost:5000");
	}

}
