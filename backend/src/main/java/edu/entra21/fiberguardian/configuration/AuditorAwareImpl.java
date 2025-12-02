package edu.entra21.fiberguardian.configuration;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import edu.entra21.fiberguardian.model.UsuarioAutenticado;

public class AuditorAwareImpl implements AuditorAware<Long> {
	private static final Logger logger = LoggerFactory.getLogger(AuditorAwareImpl.class);

	@Override
	public Optional<Long> getCurrentAuditor() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			logger.warn("Auditoria: Authentication é null");
			return Optional.empty();
		}

		if (!authentication.isAuthenticated()) {
			logger.warn("Auditoria: Authentication não está autenticado");
			return Optional.empty();
		}

		Object principal = authentication.getPrincipal();

		// logger.debug("Auditoria: principal = {}", principal);

		if (principal instanceof UsuarioAutenticado usuario) {
			// logger.debug("Auditoria: usuário autenticado = {}", usuario.getUsername());
			return Optional.of(usuario.getId()); // ID real do usuário autenticado
		}

		logger.warn("Auditoria: principal não é do tipo UsuarioAutenticado");

		return Optional.empty();
	}
}
