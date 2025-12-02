(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaEsqueciSenha = (function () {
        'use strict';

        function configurarEventos() {
            const formAdmin = document.getElementById('formAdmin');
            const formNovaSenha = document.getElementById('formNovaSenha');

            if (!formAdmin || !formNovaSenha) {
                console.error('Formulários não encontrados.');
                return;
            }

            formAdmin.addEventListener('submit', async function (e) {
                e.preventDefault();

                const email = formAdmin.adminEmail?.value.trim();
                const senha = formAdmin.adminSenha?.value;
                const campoEmail = FiberGuardian.Utils.obterCampo(
                    formAdmin,
                    'adminEmail'
                );
                const campoSenha = FiberGuardian.Utils.obterCampo(
                    formAdmin,
                    'adminSenha'
                );

                try {
                    const csrfToken = await FiberGuardian.Utils.obterNovoToken();

                    const resposta = await fetch('/api/usuarios/validar-admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                        body: JSON.stringify({ email, senha }),
                    });

                    if (resposta.ok) {
                        formNovaSenha.classList.remove('d-none');

                        // 1. Força o foco para sair do campo atual
                        document.activeElement.blur();

                        // 2. Aplica readonly após remover o foco
                        formAdmin.adminEmail.readOnly = true;
                        formAdmin.adminSenha.readOnly = true;

                        // 3. (opcional, ideal) Foca no próximo campo do passo seguinte
                        formNovaSenha.usuarioEmail?.focus();

                        formAdmin
                            .querySelectorAll('button')
                            .forEach((btn) => (btn.disabled = true));
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            //'Erro ao validar supervisor',
                            campoEmail
                        );
                        campoEmail.value = '';
                        campoSenha.value = '';
                    }
                    return;
                } catch (erro) {
                    console.error('Falha na requisição:', erro);
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao validar supervisor',
                        campoEmail,
                        erro
                    );
                    campoEmail.value = '';
                    campoSenha.value = '';
                }
            });

            formNovaSenha.addEventListener('submit', async function (e) {
                e.preventDefault();

                const nova = formNovaSenha.novaSenha?.value;
                const repetir = formNovaSenha.confirmarSenha?.value;
                const emailUsuario = formNovaSenha.usuarioEmail?.value?.trim();
                const campoNova = FiberGuardian.Utils.obterCampo(
                    formNovaSenha,
                    'novaSenha'
                );
                const campoEmailUsuario = FiberGuardian.Utils.obterCampo(
                    formNovaSenha,
                    'usuarioEmail'
                );
                const campoConfirmar = FiberGuardian.Utils.obterCampo(
                    formNovaSenha,
                    'confirmarSenha'
                );

                if (nova !== repetir) {
                    // Limpa os campos antes de exibir o modal
                    campoNova.value = '';
                    campoConfirmar.value = '';

                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'As senhas não coincidem.',
                        'danger',
                        campoNova
                    );

                    return;
                }

                try {
                    const csrfToken = await FiberGuardian.Utils.obterNovoToken();

                    const resposta = await fetch('/api/usuarios/reset-senha', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            email: emailUsuario,
                            senha: nova,
                            repeteSenha: repetir,
                        }),
                    });

                    if (resposta.ok) {
                        FiberGuardian.Utils.exibirMensagemModal(
                            'Senha redefinida com sucesso.',
                            'success'
                        );
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 100);
                        return;
                    }
                    campoNova.value = '';
                    campoConfirmar.value = '';
                    // resposta para expiracao de sessao deve ser a parte
                    if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        return;
                    } else {
                        if (resposta.status === 404 || resposta.status === 401) {
                            campoEmailUsuario.value = '';
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                //'Erro ao redefinir senha. Tente novamente.',
                                campoEmailUsuario
                            );
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                //'Erro ao redefinir senha. Tente novamente.',
                                campoNova
                            );
                        }
                        return;
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao tentar redefinir a senha',
                        campoEmailUsuario,
                        erro
                    );
                    campoNova.value = '';
                    campoConfirmar.value = '';
                    campoEmailUsuario.value = '';
                }
            });
        }

        return {
            init: configurarEventos,
        };
    })();
})();
