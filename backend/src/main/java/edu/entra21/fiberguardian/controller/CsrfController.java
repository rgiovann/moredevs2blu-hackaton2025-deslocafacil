package edu.entra21.fiberguardian.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
public class CsrfController {

	private static final Logger logger = LoggerFactory.getLogger(CsrfController.class);
	private final CsrfTokenRepository csrfTokenRepository;
	private final CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler;

	public CsrfController(CsrfTokenRepository csrfTokenRepository,
			CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler) {
		this.csrfTokenRepository = csrfTokenRepository;
		this.csrfTokenRequestAttributeHandler = csrfTokenRequestAttributeHandler;
	}

	@GetMapping("/api/csrf-token")
	public ResponseEntity<Map<String, Object>> getCsrfToken(HttpServletRequest request) {
		try {
			// ✅ Garante que a sessão seja criada (gera o cookie JSESSIONID)
			HttpSession session = request.getSession(true);

			System.out.println("Nova sessão criada: " + session.getId()); // Log para depuração

			CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

			if (token == null || token.getToken() == null) {
				logger.warn("CSRF token não disponível na requisição");
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.body(Map.of("error", "CSRF token não disponível"));
			}

			Map<String, Object> tokenInfo = new HashMap<>();
			tokenInfo.put("token", token.getToken()); // token XORed
			tokenInfo.put("headerName", token.getHeaderName());
			tokenInfo.put("parameterName", token.getParameterName());
			tokenInfo.put("cookieName", "XSRF-TOKEN");

			// Opcional: Log de depuração
			logger.debug("Sessão criada: {}", session.getId());
			logger.debug("Token CSRF retornado: {}", token.getToken());

			return ResponseEntity.ok(tokenInfo);

		} catch (Exception e) {
			logger.error("Erro ao obter token CSRF", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "Erro ao obter token CSRF"));
		}
	}

	@GetMapping("/api/sessao/valida")
	public ResponseEntity<Void> validarSessao(HttpServletRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		boolean autenticado = auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken);

		return autenticado ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	}

}
