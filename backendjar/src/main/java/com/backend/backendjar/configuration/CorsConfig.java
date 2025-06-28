package com.backend.backendjar.configuration;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // apply to all routes
//                .allowedOrigins("http://localhost:8081", "http://localhost:5173") // allow frontend ports
//                .allowedMethods("*")
//                .allowedHeaders("*")
//                .allowCredentials(true);
//    }
//}

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",               // for local dev
                    "https://dinego-ecst.onrender.com"     // your deployed frontend
                )
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}


