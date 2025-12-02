(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaLogin = (function () {
        'use strict';

        function configurarEventos() {
            const formLogin = document.querySelector('form');
            if (!formLogin) {
                console.error('Formulário de login não encontrado.');
                return;
            }
            formLogin.addEventListener('submit', async function (event) {
                event.preventDefault();

                const email = document.getElementById('email').value.trim();
                const senha = document.getElementById('senha').value;

                const campoEmail = FiberGuardian.Utils.obterCampo(formLogin, 'email');
                const campoSenha = FiberGuardian.Utils.obterCampo(formLogin, 'senha');

                try {
                    const csrfToken = await FiberGuardian.Utils.obterNovoToken();
                    console.log('Token CSRF a ser enviado:', csrfToken);

                    const resposta = await fetch('/api/fg-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                        body: JSON.stringify({ email, senha }),
                    });

                    if (resposta.ok) {
                        formLogin
                            .querySelectorAll('input, button')
                            .forEach((el) => (el.disabled = true));

                        const usuario = await resposta.json();

                        FiberGuardian.UsuarioLogado = {
                            nome: usuario.nome,
                            email: usuario.email,
                            role: usuario.role,
                        };
                        sessionStorage.setItem(
                            'usuario',
                            JSON.stringify(FiberGuardian.UsuarioLogado)
                        );

                        FiberGuardian.Utils.exibirMensagemModal(
                            'Login realizado com sucesso!',
                            'success'
                        );

                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 300);
                    } else if (resposta.status === 401) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'Credenciais inválidas.',
                            'danger',
                            campoEmail
                        );
                    } else {
                        console.error('Erro ao autenticar:', await resposta.text());
                        FiberGuardian.Utils.exibirMensagemModal(
                            'Erro inesperado ao autenticar. Tente novamente mais tarde.',
                            'danger'
                        );
                    }
                    campoEmail.value = '';
                    campoSenha.value = '';
                    return;
                } catch (erro) {
                    console.error('Falha na requisição:', erro);
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede',
                        campoEmail,
                        erro
                    );
                    campoEmail.value = '';
                    campoSenha.value = '';
                }
            });
        }

        return {
            init: configurarEventos,
        };
    })();
})();
