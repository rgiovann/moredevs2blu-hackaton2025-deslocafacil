package edu.entra21.fiberguardian.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import edu.entra21.fiberguardian.exception.exception.*;
import edu.entra21.fiberguardian.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.entra21.fiberguardian.repository.UsuarioRepository;

@Service
@Transactional(readOnly = true)  //  todos os métodos sao SÓ de leitura, a menos declarado o contrario
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private static final BadCredentialsException CREDENCIAIS_INVALIDAS =
            new BadCredentialsException("Credenciais inválidas.");
    private final String SENHA_INVALIDA = "A senha é inválida.";
    private final String SENHA_NOVA_IGUAL_SENHA_VELHA = "Essa senha já foi usada recentemente. Por segurança, escolha uma diferente.";
    private final String SENHA_NOVA_REPETE_SENHA_NOVA_DIFERENTES = "As nova senha e a repetição da nova senha não são iguais. Verifique.";
    private final String USUARIO_JA_EXISTE ="Já existe um usuário com email informado.";
    private final String USUARIO_NAO_ALTERA_PROPRIO_STATUS ="Usuário não pode alterar seu proprio status.";
    private final String EMAIL_EH_OBRIGATORIO = "Informar email é obrigatório.";
 
    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;

    }

    // lista todos os usuarios paginado
    public Page<Usuario> listarPaginado(Pageable pageable) {
        return usuarioRepository.findAll(pageable);
    }

    public void verificaSeUsuarioEstaBloqueado(String email) {
        try {
            Usuario usuario = buscarPorEmailObrigatorio(email);
            if (!usuario.getAtivo()) {
                throw CREDENCIAIS_INVALIDAS;
            }
        } catch (EmailUsuarioNaoEncontradoException e) {
            logger.warn("Email não encontrado: " + email);
            throw CREDENCIAIS_INVALIDAS;
        }
    }

    @Transactional(readOnly = false)
    public Usuario cadastrarNovoUsuario(Usuario usuario, String repeteSenha) {

        // codigo defensivo, validation no controller já
        // barra email vazio.
        String email = usuario.getEmail();

        if (email == null || email.trim().isEmpty()) {
            throw new NegocioException(EMAIL_EH_OBRIGATORIO);
        }

        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(email);

        // se usuario novo Id=null e achou email no banco, não pode haver emails iguais
        // - INCLUSAO
        // se existe usuario e o id é diferente do usuario atual, não pode haver emails
        // iguais - ALTERACAO
        boolean emailCadastradoPorOutro = usuarioExistente.isPresent()
                && (usuario.getId() == null || !usuarioExistente.get().getId().equals(usuario.getId()));

        if (emailCadastradoPorOutro) {
            throw new NegocioException(USUARIO_JA_EXISTE);
        }

        if ( !(usuario.getSenha().equals(repeteSenha)) ) {
            throw new NegocioException(SENHA_NOVA_REPETE_SENHA_NOVA_DIFERENTES);
        }

        String senhaCriptografada = passwordEncoder.encode(usuario.getSenha());
        usuario.setSenha(senhaCriptografada);

        return usuarioRepository.save(usuario);
    }

    public boolean senhaCorreta(String senhaInformada, Usuario usuario) {
        return passwordEncoder.matches(senhaInformada, usuario.getSenha());
    }

    public boolean senhaRepetida(String novaSenha, Usuario usuario) {
        return (passwordEncoder.matches(novaSenha, usuario.getSenha()));
    }

    @Transactional
    public void atualizarSenha(String email, String novaSenha, String senhaAtual, String repeteNovaSenha) {

        Usuario usuario = buscarPorEmailObrigatorio(email);

        if (!senhaCorreta(senhaAtual, usuario)) {
            throw new UsuarioSenhaIncorretaException(SENHA_INVALIDA);
        }
        logger.debug("Usuário passou check senha : " + senhaAtual);

        if (senhaRepetida(novaSenha, usuario)) {
            throw new NegocioException(SENHA_NOVA_IGUAL_SENHA_VELHA);
        }

        if ( !(repeteNovaSenha.equals(novaSenha)) ) {
            throw new NegocioException(SENHA_NOVA_REPETE_SENHA_NOVA_DIFERENTES);
        }

        String senhaCriptografada = passwordEncoder.encode(novaSenha);
        usuario.setSenha(senhaCriptografada);
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = false)
    public Usuario alterarDadosUsuario(String emailUsuario, String novoNome, String novoTelefone ) {
        Usuario usuario = buscarPorEmailObrigatorio(emailUsuario);

        usuario.setNome(novoNome);
        usuario.setTelefone(novoTelefone);

        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorEmailObrigatorio(String email) {
        return usuarioRepository.findByEmail(email.trim()).orElseThrow(() -> new EmailUsuarioNaoEncontradoException(email));
    }

    public void validaUsuario(String email) {
        if (!usuarioRepository.existsUsuarioByEmail(email.trim())) {
            throw new EmailUsuarioNaoEncontradoException(email);
        }
     }

    @Transactional(readOnly = false)
    public void ativarUsuario(String emailAutenticado, String emailUsuario) {
        validarMudancaStatus(emailAutenticado, emailUsuario);
        Usuario usuario = buscarPorEmailObrigatorio(emailUsuario);
        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = false)
    public void inativarUsuario(String emailAutenticado, String emailUsuario) {
        validarMudancaStatus(emailAutenticado, emailUsuario);
        Usuario usuario = buscarPorEmailObrigatorio(emailUsuario);
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    private void validarMudancaStatus(String emailAutenticado, String emailUsuario) {
        if (emailAutenticado.equalsIgnoreCase(emailUsuario)) {
            throw new UsuarioAutoMudancaStatusException(USUARIO_NAO_ALTERA_PROPRIO_STATUS);
        }
    }

    public Authentication autenticarSupervisor(String email, String senha) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, senha)
        );

        boolean ehSupervisor = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(Role.ADMIN.getAuthority()));

        if (!ehSupervisor) {
            throw CREDENCIAIS_INVALIDAS;
        }

        return authentication;
    }

    /**
     * Autocomplete por código parcial do fornecedor.
     * Retorna no máximo 20 resultados.
     */
    public List<Usuario> buscaTop20ByNomeUsuarioRecebimentoContendoStringIgnoraCase(String nomeUsuario, String role) {
        if (nomeUsuario == null || nomeUsuario.isBlank()) {
            return Collections.emptyList();
        }
        Role.validarRole(role);

        // monta a lista de roles para o filtro, se ADMIN é todos
        List<String> rolesFiltro;
        if (Role.ADMIN.name().equals(role)) {
            rolesFiltro = Arrays.stream(Role.values())
                    .map(Enum::name)
                    .toList();
        }
        else{
            rolesFiltro = List.of(role);
        }

        return usuarioRepository
                .findTop20UsuarioRecebimentoByNomeContainingIgnoreCase(nomeUsuario, rolesFiltro);
    }

    @Transactional(readOnly = false)
    public void resetarSenha(String email, String novaSenha, String repeteSenha) {

        Usuario usuario = buscarPorEmailObrigatorio(email);

        verificaSeUsuarioEstaBloqueado(email);

        if (!novaSenha.equals(repeteSenha)) {
            throw new NegocioException(SENHA_NOVA_REPETE_SENHA_NOVA_DIFERENTES);
        }

        if ( passwordEncoder.matches(novaSenha, usuario.getSenha())) {
            throw new NegocioException(SENHA_NOVA_IGUAL_SENHA_VELHA);
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
}
