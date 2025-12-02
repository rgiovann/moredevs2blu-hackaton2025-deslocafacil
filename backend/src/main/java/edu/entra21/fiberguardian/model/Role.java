package edu.entra21.fiberguardian.model;

import edu.entra21.fiberguardian.exception.exception.NegocioException;

import java.util.Arrays;
import java.util.stream.Collectors;
import edu.entra21.fiberguardian.exception.exception.NegocioException;

public enum Role {
	ADMIN, USUARIO;

	public String getAuthority() {
		return "ROLE_" + this.name();
	}

	public static void validarRole(String roleStr) {
		boolean valido = Arrays.stream(Role.values())
				.anyMatch(r -> r.name().equalsIgnoreCase(roleStr));
		if (!valido) {
			throw new NegocioException("Role inválida: " + roleStr);
		}
	}
}
