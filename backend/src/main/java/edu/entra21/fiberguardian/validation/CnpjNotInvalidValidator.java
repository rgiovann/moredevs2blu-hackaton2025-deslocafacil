package edu.entra21.fiberguardian.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpjNotInvalidValidator implements ConstraintValidator<CnpjNotInvalid, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // @NotBlank cuida disso
        }

        // rejeitar se tiver caracteres inválidos
        if (!value.matches("[0-9./-]+")) {
            return false;
        }

        String cnpj = value.replaceAll("\\D", ""); // remove pontuação
        return isCNPJ(cnpj);
    }

    private boolean isCNPJ(String cnpj) {
        if (!cnpj.matches("\\d{14}")) {      // 14 digitos (sem formatacao)
            return false;
        }
        if (cnpj.chars().distinct().count() == 1) {
            return false;
        }
        char dig13 = calcularDigitoVerificador(cnpj, 12);
        char dig14 = calcularDigitoVerificador(cnpj, 13);
        return dig13 == cnpj.charAt(12) && dig14 == cnpj.charAt(13);
    }

    private char calcularDigitoVerificador(String cnpj, int pos) {
        int soma = 0, peso = 2;
        for (int i = pos - 1; i >= 0; i--) {
            soma += (cnpj.charAt(i) - '0') * peso;
            peso = (peso == 9) ? 2 : peso + 1;
        }
        int resto = soma % 11;
        return (resto < 2) ? '0' : (char) ((11 - resto) + '0');
    }
}
