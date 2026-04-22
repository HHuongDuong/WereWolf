package com.werewolf.vote.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Configuration
public class SchedulerConfig {

    // Virtual thread executor cho auto-close tasks
    @Bean("voteScheduler")
    public ScheduledExecutorService voteScheduler() {
        return Executors.newScheduledThreadPool(
            4,
            Thread.ofVirtual().name("vote-scheduler-", 0).factory()
        );
    }
}
