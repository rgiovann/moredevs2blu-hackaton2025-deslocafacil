package edu.entra21.fiberguardian.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.time.OffsetDateTime;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({ FIELD })
@Retention(RUNTIME)
@Constraint(validatedBy = RecebimentoRecenteValidator.class)
public @interface RecebimentoRecente {
    String message() default "A data de recebimento excede o limite permitido.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int mesesMaximo();
}

