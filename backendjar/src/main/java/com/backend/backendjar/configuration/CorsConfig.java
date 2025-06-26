package com.backend.backendjar.configuration;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // apply to all routes
                .allowedOrigins("http://localhost:8081", "http://localhost:8082") // allow frontend ports
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
