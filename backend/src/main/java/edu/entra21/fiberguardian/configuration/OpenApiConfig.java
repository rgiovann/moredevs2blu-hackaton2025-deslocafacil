package edu.entra21.fiberguardian.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

	@Bean
	OpenAPI customOpenAPI() {
		return new OpenAPI().components(new Components()
				.addSecuritySchemes("cookieAuth",
						new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.COOKIE)
								.name("JSESSIONID").description("Cookie de sessão para autenticação"))
				.addSecuritySchemes("csrfToken",
						new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.HEADER)
								.name("X-XSRF-TOKEN")
								.description("Token CSRF para requisições que alteram estado (POST, PUT, DELETE)")));
	}
}
