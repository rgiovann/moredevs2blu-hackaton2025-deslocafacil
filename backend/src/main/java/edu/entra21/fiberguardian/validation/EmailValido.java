package edu.entra21.fiberguardian.validation;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Documented
@Constraint(validatedBy = {}) // Composição de anotações; sem lógica customizada
@Target({ FIELD })
@Retention(RUNTIME)
@NotBlank(message = "Email é obrigatório")
@Email(message = "Email deve ser válido")
@Size(max = 50, message = "Email deve ter até 50 caracteres")
public @interface EmailValido {

	String message() default "Email inválido";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
