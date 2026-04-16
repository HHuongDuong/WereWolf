package com.werewolf.gameplay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class GameplayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GameplayApplication.class, args);
	}

}
