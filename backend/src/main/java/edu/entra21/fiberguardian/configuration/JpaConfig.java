package edu.entra21.fiberguardian.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaConfig {
	private static final Logger logger = LoggerFactory.getLogger(JpaConfig.class);

	public JpaConfig() {
		logger.info("JpaConfig inicializado com auditoria habilitada.");
	}

	@Bean(name = "auditorAware")
	AuditorAware<Long> auditorAware() {
		return new AuditorAwareImpl();
	}
}