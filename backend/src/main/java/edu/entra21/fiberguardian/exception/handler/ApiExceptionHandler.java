package edu.entra21.fiberguardian.exception.handler;

import static org.apache.commons.lang3.exception.ExceptionUtils.getRootCause;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.JsonMappingException.Reference;
import com.fasterxml.jackson.databind.exc.IgnoredPropertyException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;

import edu.entra21.fiberguardian.exception.exception.EntidadeEmUsoException;
import edu.entra21.fiberguardian.exception.exception.EntidadeNaoEncontradaException;
import edu.entra21.fiberguardian.exception.exception.NegocioException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
	private static final String MSG_ERRO_GENERICA_USUARIO_FINAL = "Ocorreu um erro interno inesperado no sistema. Tente novamente e se o problema "
			+ "persistir, entre em contato com o administrador do sistema.";

	private final MessageSource messageSource;

	public ApiExceptionHandler(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	@ExceptionHandler(EntidadeNaoEncontradaException.class)
	public ResponseEntity<Object> handleEntidadeNaoEncontradoException(EntidadeNaoEncontradaException ex,
			WebRequest request) {

		HttpStatusCode status = HttpStatus.NOT_FOUND;
		ProblemType problemType = ProblemType.RECURSO_NAO_ENCONTRADO;
		String detail = ex.getMessage();
		Problem problem = createProblemBuilder(status, problemType, detail).userMessage(detail).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@ExceptionHandler(NegocioException.class)
	public ResponseEntity<Object> handleNegocioException(NegocioException ex, WebRequest request) {

		HttpStatus status = HttpStatus.BAD_REQUEST;
		ProblemType problemType = ProblemType.PROBLEMA_NA_REQUISICAO;
		String detail = ex.getMessage();
		Problem problem = createProblemBuilder(status, problemType, detail).userMessage(detail).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);

	}

	@ExceptionHandler(EntidadeEmUsoException.class)
	public ResponseEntity<Object> handleEntidadeEmUsoException(EntidadeEmUsoException ex, WebRequest request) {

		HttpStatus status;
		status = HttpStatus.CONFLICT;
		ProblemType problemType = ProblemType.ENTIDADE_EM_USO;
		String detail = ex.getMessage();
		Problem problem = createProblemBuilder(status, problemType, detail).userMessage(detail).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleOtherExceptions(Exception ex, WebRequest request) {

		HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

		ex.printStackTrace(); // #debug
		String details = MSG_ERRO_GENERICA_USUARIO_FINAL;
		Problem problem = createProblemBuilder(status, ProblemType.ERRO_DO_SISTEMA, details).userMessage(details)
				.build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@Override
	protected ResponseEntity<Object> handleHttpMessageNotReadable(@NonNull HttpMessageNotReadableException ex,
			@NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {

		Throwable rootCause = getRootCause(ex);

		// rootCause.printStackTrace(); //#debug

		if (rootCause instanceof InvalidFormatException) {

			return handleInvalidFormatException((InvalidFormatException) rootCause, headers, status, request);

		} else if (rootCause instanceof UnrecognizedPropertyException) {

			return handleUnrecognizedPropertyException((UnrecognizedPropertyException) rootCause, headers, status,
					request);

		} else if (rootCause instanceof IgnoredPropertyException) {

			return handleIgnoredPropertyException((IgnoredPropertyException) rootCause, headers, status, request);

		}

		String detail = "O corpo da requisição está corrompido, não é possivel fazer o parsing da mensagem Json. Verifique a sintaxe da mensagem.";
		Problem problem = createProblemBuilder(status, ProblemType.MENSAGEM_CORROMPIDA, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@Override
	protected ResponseEntity<Object> handleHttpMediaTypeNotSupported(@NonNull HttpMediaTypeNotSupportedException ex,
			@NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {
		// Log the exception details server-side for debugging

		return ResponseEntity.status(status).headers(headers).build();

	}
    // trata LockedException (usuario inativo)  e BadCredentialsException
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<Object> handleBadCredentialsException(AuthenticationException ex, WebRequest request) {

		HttpStatus status = HttpStatus.UNAUTHORIZED;
		ProblemType problemType = ProblemType.USUARIO_NAO_AUTORIZADO;

		String detail = "Credenciais inválidas. A autenticação falhou.";

		Problem problem = createProblemBuilder(status, problemType, detail)
				.userMessage("Credenciais do usuário inválidas.").build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {

		List<String> violacoes = ex.getConstraintViolations().stream()
				.map(violation -> String.format("Campo '%s': %s",
						violation.getPropertyPath(),
						violation.getMessage()))
				.collect(Collectors.toList());

		String detail = "Dados inválidos: " + String.join(", ", violacoes);
		String userMessage = violacoes.size() == 1 ?
				violacoes.get(0).replaceFirst("Campo '.*?': ", "") :
				"Um ou mais campos contêm valores inválidos.";

		Problem problem = createProblemBuilder(HttpStatus.BAD_REQUEST, ProblemType.DADOS_INVALIDO, detail)
				.userMessage(userMessage)
				.build();

		return handleExceptionInternal(ex, problem, HttpHeaders.EMPTY, HttpStatus.BAD_REQUEST, request);
	}


	/*
	 * Spring Boot 3.x (Spring Framework 6.x): Esse metodo foi removido da classe
	 * ResponseEntityExceptionHandler.
	 * 
	 * 
	 * @Override protected ResponseEntity<Object> handleBindException( BindException
	 * ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) { return
	 * handleValidationInternal(ex, ex.getBindingResult(), headers, status,
	 * request); }
	 * 
	 */

	@Override
	protected ResponseEntity<Object> handleMissingServletRequestParameter(
			@NonNull MissingServletRequestParameterException ex,
			@NonNull HttpHeaders headers,
			@NonNull HttpStatusCode status,
			@NonNull WebRequest request) {

		ProblemType problemType = ProblemType.PARAMETRO_INVALIDO;

		String detail = String.format(
				"O parâmetro obrigatório '%s' do tipo '%s' não foi informado na requisição.",
				ex.getParameterName(),
				ex.getParameterType()
		);

		Problem problem = createProblemBuilder(status, problemType, detail)
				.userMessage("Parâmetro obrigatório ausente. Verifique a requisição e tente novamente.")
				.build();

		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	@Override
	protected ResponseEntity<Object> handleNoResourceFoundException(
			@NonNull NoResourceFoundException ex,
			@NonNull HttpHeaders headers,
			@NonNull HttpStatusCode status,
			@NonNull WebRequest request) {

		String recurso = ex.getResourcePath();
		String detail = String.format("O recurso '%s' não foi encontrado no servidor.", recurso);

		Problem problem = createProblemBuilder(status, ProblemType.RECURSO_NAO_ENCONTRADO, detail)
				.userMessage("Recurso solicitado não encontrado. Verifique a URL e tente novamente.")
				.build();

		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	@ExceptionHandler(BindException.class)
	public ResponseEntity<Object> handleBindException(BindException ex, WebRequest request) {
		// evitando overengineetiring, não há valor real em complicar algo que é
		// naturalmente 400
		HttpStatusCode status = HttpStatus.BAD_REQUEST;
		return handleValidationInternal(ex, ex.getBindingResult(), new HttpHeaders(), status, request);
	}

	@Override
	protected ResponseEntity<Object> handleNoHandlerFoundException(@NonNull NoHandlerFoundException ex,
			@NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {

		String recurso = ex.getRequestURL();
		String detail = String.format("O recurso '%s', que você tentou acessar, é inexistente", recurso);
		Problem problem = createProblemBuilder(status, ProblemType.RECURSO_NAO_ENCONTRADO, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@Override
	protected ResponseEntity<Object> handleTypeMismatch(@NonNull TypeMismatchException ex, @NonNull HttpHeaders headers,
			@NonNull HttpStatusCode status, @NonNull WebRequest request) {

		// rootCause é NumberFormatException mas MethodArgumentTypeMismatchException é
		// lançada
		// sendo herdada de TypeMismatchException

		// ex.printStackTrace(); // #debug

		if (ex instanceof MethodArgumentTypeMismatchException) {

			return handleMethodArgumentTypeMismatchException((MethodArgumentTypeMismatchException) ex, headers, status,
					request);
		}

		String detail = "Parâmetro da URL inválido. Verifique o erro de sintaxe.";
		Problem problem = createProblemBuilder(status, ProblemType.PARAMETRO_INVALIDO, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();

		return handleExceptionInternal(ex, problem, new HttpHeaders(), status, request);
	}

	@Override
	protected ResponseEntity<Object> handleExceptionInternal(@NonNull Exception ex, @Nullable Object body,
			@NonNull HttpHeaders headers, HttpStatusCode status, @NonNull WebRequest request) {
		HttpStatus httpStatus = HttpStatus.resolve(status.value());
		String reasonPhrase = httpStatus != null ? httpStatus.getReasonPhrase() : "Unknown Status";
		if (body == null) {
			body = Problem.builder().title(reasonPhrase).status(status.value())
					.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).timestamp(OffsetDateTime.now()).build();
		} else if (body instanceof String) {
			body = Problem.builder().title((String) body).status(status.value())
					.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).timestamp(OffsetDateTime.now()).build();
		}

		return super.handleExceptionInternal(ex, body, headers, status, request);
	}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(@NonNull MethodArgumentNotValidException ex,
			@NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {

		return handleValidationInternal(ex, ex.getBindingResult(), headers, status, request);

	}

	private ResponseEntity<Object> handleIgnoredPropertyException(IgnoredPropertyException ex, HttpHeaders headers,
			HttpStatusCode status, WebRequest request) {

		String path = joinPath(ex.getPath());

		String detail = String.format("A propriedade '%s' da entidade '%s' deve ser ignorada no corpo da requisição.",
				path, ex.getReferringClass().getSimpleName());

		Problem problem = createProblemBuilder(status, ProblemType.MENSAGEM_CORROMPIDA, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();

		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	private ResponseEntity<Object> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {

		String name = ex.getName();

		String detail = String.format(
				"O parâmetro de URL '%s' recebeu o valor '%s' "
						+ "que é de um tipo inválido. Corrija e informe o valor compatível com o tipo %s",
				name, ex.getValue(), ex.getParameter().getParameterType().getSimpleName());
		Problem problem = createProblemBuilder(status, ProblemType.PARAMETRO_INVALIDO, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();
		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	private ResponseEntity<Object> handleUnrecognizedPropertyException(UnrecognizedPropertyException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {

		String path = joinPath(ex.getPath());

		String detail = String.format("A propriedade '%s' não é reconhecida para a entidade '%s'.", path,
				ex.getReferringClass().getSimpleName());

		Problem problem = createProblemBuilder(status, ProblemType.MENSAGEM_CORROMPIDA, detail)
				.userMessage(MSG_ERRO_GENERICA_USUARIO_FINAL).build();

		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	private ResponseEntity<Object> handleInvalidFormatException(InvalidFormatException ex, HttpHeaders headers,
			HttpStatusCode status, WebRequest request) {

		String path = joinPath(ex.getPath());

		String detail = String.format(
				"A propriedade '%s' recebeu o valor '%s' "
						+ "que é do tipo inválido. Corrija e informe o valor compatível com o tipo %s",
				path, ex.getValue(), ex.getTargetType().getSimpleName());
		Problem problem = createProblemBuilder(status, ProblemType.MENSAGEM_CORROMPIDA, detail)
				.userMessage(detail).build();
		return handleExceptionInternal(ex, problem, headers, status, request);
	}

	private Problem.ProblemBuilder createProblemBuilder(HttpStatusCode status, ProblemType problemType, String detail) {
		return Problem.builder().status(status.value()).type(problemType.getUri()).title(problemType.getTitle())
				.detail(detail).timestamp(OffsetDateTime.now());

	}

	// agora trata referencias em Collections
	private String joinPath(List<Reference> references) {
		return references.stream().map(ref -> {
			// == null pega o index do elemento do atributo na collection
			if (ref.getFieldName() == null) {
				return "[" + ref.getIndex() + "]";
			} else {
				return ref.getFieldName();
			}
		}).collect(Collectors.joining("."));
	}

	private ResponseEntity<Object> handleValidationInternal(Exception ex, BindingResult bindingResult,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		List<Problem.Field> problemObjects = bindingResult.getAllErrors().stream().map(objectError -> {
			String message = messageSource.getMessage(objectError, LocaleContextHolder.getLocale());

			String name = objectError.getObjectName();

			if (objectError instanceof FieldError) {
				name = ((FieldError) objectError).getField();
			}

			return Problem.Field.builder().name(name).userMessage(message).build();
		}).collect(Collectors.toList());

		String detail = "Um ou mais dados estão inválidos. Faça o preenchimento correto e tente novamente.";
//        Problem problem = createProblemBuilder(HttpStatusCode status, ProblemType.DADOS_INVALIDO, detail)
//                .userMessage(detail)
//                .errorObjects(problemObjects)
//                .build();

		Problem problem = Problem.builder().status(status.value()) // Converte HttpStatusCode para Integer
				.type(ProblemType.DADOS_INVALIDO.getUri()) // Assume que ProblemType tem um método getUri() que retorna
															// String
				.title(ProblemType.DADOS_INVALIDO.getTitle()) // Assume que ProblemType tem um método getTitle()
				.detail(detail).userMessage(detail).errorObjects(problemObjects).timestamp(OffsetDateTime.now()) // Define
																													// o
																													// timestamp
																													// atual
				.build();

		return handleExceptionInternal(ex, problem, headers, status, request);
	}

}
