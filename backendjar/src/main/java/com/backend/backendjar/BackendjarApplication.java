package com.backend.backendjar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@EnableMethodSecurity
@SpringBootApplication
public class BackendjarApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendjarApplication.class, args);
	}

	
}
