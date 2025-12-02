package edu.entra21.fiberguardian.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;

import edu.entra21.fiberguardian.assembler.UsuarioDtoAssembler;
import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.dto.UsuarioDto;
import edu.entra21.fiberguardian.input.UsuarioEmailSenhaInput;
import edu.entra21.fiberguardian.jacksonview.UsuarioView;
import edu.entra21.fiberguardian.model.Usuario;
import edu.entra21.fiberguardian.model.UsuarioAutenticado;
import edu.entra21.fiberguardian.service.UsuarioService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final Mapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(CsrfController.class);

    //private final UsuarioAutenticadoInputAssembler usuarioAutenticadoInputAssembler;
    private final UsuarioService usuarioService;
    private final UsuarioDtoAssembler usuarioDtoAssembler;

    public AuthController(AuthenticationManager authenticationManager, Mapper mapper,
                          UsuarioService usuarioService,
                          UsuarioDtoAssembler usuarioDtoAssembler) {

        this.authenticationManager = authenticationManager;
        this.mapper = mapper;
        //this.usuarioAutenticadoInputAssembler = usuarioAutenticadoInputAssembler;
        this.usuarioService = usuarioService;
        this.usuarioDtoAssembler = usuarioDtoAssembler;

    }

    // não faz validacao alguma, é autenticacao
    @PostMapping("/api/fg-login")
    @JsonView(UsuarioView.Completo.class)
    public ResponseEntity<?> login(@RequestBody UsuarioEmailSenhaInput loginRequest,
                                   HttpServletRequest request, HttpServletResponse response) {

        //logger.debug("JSESSIONID recebido: " + request.getSession(false).getId()); // Log para depuração
        //logger.debug("Token CSRF esperado: " + request.getAttribute("_csrf")); // Log para depuração

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                loginRequest.getSenha());

        usuarioService.verificaSeUsuarioEstaBloqueado(loginRequest.getEmail());

        Authentication authentication = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = request.getSession(false);
        if (session == null) {
            // Segurança extra: recusar login se não houver sessão válida (token CSRF foi
            // inválido)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sessão inválida ou expirada");
        }

        // Salvar explicitamente o contexto na sessão HTTP
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());


        logger.debug("Reutilizando sessão existente: " + session.getId());

        UsuarioAutenticado usuarioAutenticado = (UsuarioAutenticado) authentication.getPrincipal();
        Usuario usuario = usuarioAutenticado.getUsuario();

        logger.info("Usuário [" + usuarioAutenticado.getUsuario().getNome() + "] autenticado com sucesso.");

        UsuarioDto responseDto = usuarioDtoAssembler.toDto(usuario);

        return ResponseEntity.ok(responseDto);

    }

    @PostMapping("/api/fg-logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            String sessionId = session.getId();
            session.invalidate(); // Invalida a sessão
            logger.info("Sessão encerrada com sucesso. JSESSIONID: " + sessionId);
        } else {
            logger.info("Logout chamado sem sessão ativa.");
        }

        SecurityContextHolder.clearContext(); // Limpa o contexto de autenticação

        // Opcional: deletar cookie JSESSIONID (seguro, mas depende do client respeitar)
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setPath("/");
        cookie.setMaxAge(0); // Expira imediatamente
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // True se seu app está servindo via HTTPS
        response.addCookie(cookie);

        return ResponseEntity.ok().body("Logout realizado com sucesso");
    }

}
