package com.martzy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MartzyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MartzyBackendApplication.class, args);
	}

}

