(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaCadastroUsuario = (function () {
        'use strict';

        function configurarEventos() {
            const formCadastraUsuario = document.getElementById('cadastroForm');

            if (!formCadastraUsuario) {
                console.error('Formulários de cadastro de usuário não encontrados.');
                return;
            }

            const campoNome = FiberGuardian.Utils.obterCampo(
                formCadastraUsuario,
                'nome'
            );

            requestAnimationFrame(() => {
                campoNome.focus();
            });

            formCadastraUsuario.addEventListener('submit', async function (e) {
                e.preventDefault();

                const nome = formCadastraUsuario.nome?.value.trim();
                const email = formCadastraUsuario.email?.value.trim();
                const perfil = formCadastraUsuario.perfil?.value;
                const telefone = formCadastraUsuario.telefone?.value;
                const senha = formCadastraUsuario.senha?.value;
                const confirmarSenha = formCadastraUsuario.confirmarSenha?.value;
                console.log('Repete senha valor é :' + confirmarSenha);

                try {
                    const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                    const resposta = await fetch('/api/usuarios', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            nome: nome.trim(),
                            email: email.trim().toLowerCase(),
                            senha: senha,
                            role: perfil,
                            telefone: telefone.trim(),
                            repeteSenha: confirmarSenha,
                        }),
                    });

                    if (resposta.ok) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'Cadastro usuário realizado com sucesso.',
                            'success',
                            campoNome
                        );
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(resposta, campoNome);
                    }
                    formCadastraUsuario.reset();
                    return;
                } catch (erro) {
                    console.error('Falha na requisição:', erro);
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao cadastrar usuário',
                        campoNome,
                        erro
                    );
                    formCadastraUsuario.reset();
                }
            });
        }

        return {
            init: configurarEventos,
        };
    })();
})();
