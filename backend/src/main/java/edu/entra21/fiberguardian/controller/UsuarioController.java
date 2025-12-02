package edu.entra21.fiberguardian.controller;

import java.util.List;

import edu.entra21.fiberguardian.dto.UsuarioListagemPagedDto;
import edu.entra21.fiberguardian.input.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.annotation.JsonView;

import edu.entra21.fiberguardian.assembler.UsuarioDtoAssembler;
import edu.entra21.fiberguardian.assembler.UsuarioListagemPagedDtoAssembler;
import edu.entra21.fiberguardian.assembler.UsuarioNovoInputDisassembler;
import edu.entra21.fiberguardian.dto.PageDto;
import edu.entra21.fiberguardian.dto.UsuarioDto;
import edu.entra21.fiberguardian.jacksonview.UsuarioView;
import edu.entra21.fiberguardian.model.Usuario;
//import edu.entra21.fiberguardian.openapi.UsuarioControllerOpenApi;
import edu.entra21.fiberguardian.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/usuarios")
public class UsuarioController /*implements UsuarioControllerOpenApi */{

	private final UsuarioService usuarioService;
	private final UsuarioDtoAssembler usuarioDtoAssembler;
	private final UsuarioListagemPagedDtoAssembler usuarioListagemPagedDtoAssembler;
	private final UsuarioNovoInputDisassembler UsuarioCriarUsuarioInputDisassembler;
 	private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

  	private static final Sort ORDENACAO_PADRAO =
			Sort.by(Sort.Order.desc("ativo"), Sort.Order.asc("nome"));

	public UsuarioController(UsuarioService usuarioService, UsuarioDtoAssembler usuarioDtoAssembler,
			UsuarioListagemPagedDtoAssembler usuarioListagemPagedDtoAssembler,
			UsuarioNovoInputDisassembler UsuarioCriarUsuarioInputDisassembler ) {

		this.usuarioService = usuarioService;
		this.usuarioDtoAssembler = usuarioDtoAssembler;
		this.usuarioListagemPagedDtoAssembler = usuarioListagemPagedDtoAssembler;
		this.UsuarioCriarUsuarioInputDisassembler = UsuarioCriarUsuarioInputDisassembler;

	}

	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public PageDto<UsuarioListagemPagedDto> listarPaginado(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
	) {
		Pageable pageable = PageRequest.of(page, size, ORDENACAO_PADRAO);

		Page<Usuario> pagina = usuarioService.listarPaginado(pageable);
		List<UsuarioListagemPagedDto> dtos = usuarioListagemPagedDtoAssembler.toCollectionDto(pagina.getContent());

		PageDto<UsuarioListagemPagedDto> dtoPaged = new PageDto<>();
		dtoPaged.setContent(dtos);
		dtoPaged.setPageNumber(pagina.getNumber());
		dtoPaged.setPageSize(pagina.getSize());
		dtoPaged.setTotalElements(pagina.getTotalElements());
		dtoPaged.setTotalPages(pagina.getTotalPages());
		dtoPaged.setLast(pagina.isLast());

		return dtoPaged;
	}

	/*
      Endpoint usado para as dropdownlists
      elemcam os 20 registros onde o parcial de nome do fornecedor está contida no nome
      Ex. "Mar" vai listar todas os nome que contem MAR por exemplo Mario, Marcio, Marciana etc
      o json retorna com nome, email, setor e turno entretanto.
     */
	@GetMapping(path = "/lista-usuario-por-role")
	@JsonView(UsuarioView.CompletoMenosRole.class)
	public List<UsuarioDto> listarFiltroPorNome(@RequestParam String nome, @RequestParam String role) {
		List<Usuario> usuarios = usuarioService.buscaTop20ByNomeUsuarioRecebimentoContendoStringIgnoraCase(nome,role.toUpperCase());
		return usuarioDtoAssembler.toCollectionDto(usuarios);
	}

	///@Override
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public UsuarioDto adicionar(@RequestBody @Valid UsuarioaAdicionaNovoUsuarioInput usuarioNomeInput) {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return usuarioDtoAssembler.toDto(
				usuarioService.cadastrarNovoUsuario(UsuarioCriarUsuarioInputDisassembler.toEntity(usuarioNomeInput),usuarioNomeInput.getRepeteSenha()));

	}

	@GetMapping(path = "/me/nome")
	@JsonView(UsuarioView.Completo.class)
	public UsuarioDto buscarNome(Authentication authentication) {
		String emailAutenticado = authentication.getName();
		return usuarioDtoAssembler.toDto(usuarioService.buscarPorEmailObrigatorio(emailAutenticado));
	}

	/*
	 * TODO: depois atualizar interface OpenAPI
	 */

	@PutMapping(path = "/me/nome", produces = MediaType.APPLICATION_JSON_VALUE)
	@JsonView(UsuarioView.SomenteNome.class)
	public ResponseEntity<UsuarioDto> alterarNome(@RequestBody @Valid UsuarioAlteraSeusDadosInput input,
			Authentication authentication) {

		String emailAutenticado = authentication.getName();
		Usuario atualizado = usuarioService.alterarDadosUsuario(emailAutenticado,
				input.getNome(),
				input.getTelefone());


		UsuarioDto dto = usuarioDtoAssembler.toDto(atualizado);
		return ResponseEntity.ok(dto);
	}

	//@Override
	@PutMapping(path = "/me/senha", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> alterarSenha(@RequestBody @Valid UsuarioAlteraSenhaInput input,
			Authentication authentication) {

		String emailAutenticado = authentication.getName();
		usuarioService.atualizarSenha(emailAutenticado, input.getNovaSenha(), input.getSenhaAtual(),input.getRepeteNovaSenha());
		return ResponseEntity.noContent().build();
	}

	//@Override
	@DeleteMapping("/ativo")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ResponseEntity<Void> inativarUsuario(@RequestBody @Valid UsuarioAlteraStatusInput input,
			Authentication authentication) {
		usuarioService.inativarUsuario(authentication.getName(), input.getEmail());
		return ResponseEntity.noContent().build();
	}

	//@Override
	@PutMapping("/ativo")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ResponseEntity<Void> ativarUsuario(@RequestBody @Valid UsuarioAlteraStatusInput input,
			Authentication authentication) {
		usuarioService.ativarUsuario(authentication.getName(), input.getEmail());
		return ResponseEntity.noContent().build();
	}

	// não faz validacao @Valid alguma, é autenticacao
	@PostMapping("/validar-admin")
	public ResponseEntity<Void> validarAdmin(
			@RequestBody UsuarioEmailSenhaInput input,
			HttpServletRequest request,
			HttpServletResponse response
	) {
		Authentication auth = usuarioService.autenticarSupervisor(input.getEmail(), input.getSenha());

		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(auth);

		// Salva diretamente na sessão HTTP
		HttpSession session = request.getSession(true); // true para criar se não existir
		session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

		return ResponseEntity.ok().build();
	}

	@PostMapping("/reset-senha")
	public ResponseEntity<Void> resetSenha(@RequestBody @Valid  UsuarioResetSenhaInput input) {

		// lógica para resetar a senha de outro usuário
		usuarioService.resetarSenha(input.getEmail(),input.getSenha(),input.getRepeteSenha());
		return ResponseEntity.ok().build();

	}

}
