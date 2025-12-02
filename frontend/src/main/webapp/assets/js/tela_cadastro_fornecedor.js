(function () {
    'use strict';

    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaCadastroFornecedor = (function () {
        const API_URL = '/api/fornecedores';

        // Função para exibir mensagens usando Bootstrap Modal
        const exibirMensagem = (mensagem, tipo, callback) => {
            const modal = document.getElementById('modalMensagemSistema');
            if (!modal) {
                console.error('Modal com ID "modalMensagemSistema" não encontrado.');
                alert(mensagem); // Fallback para alert se o modal não for encontrado
                if (callback) callback();
                return;
            }

            const modalBody = modal.querySelector('.modal-body');
            const modalHeader = modal.querySelector('.modal-header');
            const modalTitle = modal.querySelector('.modal-title');

            if (!modalBody || !modalHeader || !modalTitle) {
                console.error(
                    'Elementos do modal (body, header ou title) não encontrados.'
                );
                alert(mensagem); // Fallback para alert se os elementos não forem encontrados
                if (callback) callback();
                return;
            }

            modalTitle.textContent = tipo === 'success' ? 'Sucesso' : 'Erro';
            modalHeader.className = `modal-header bg-${
                tipo === 'success' ? 'success' : 'danger'
            } text-white`;
            modalBody.textContent = mensagem;

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            modal.addEventListener(
                'hidden.bs.modal',
                () => {
                    if (callback) callback();
                },
                { once: true }
            );
        };

         // Função para validar email
        function validarEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email.trim());
        }

        // Função principal de inicialização
        function init() {
            configurarEventos();
        }

        function configurarEventos() {
            const form = document.getElementById('formFornecedor');
            const btnCadastrar = document.getElementById('btnCadastrar');
            const btnSair = document.getElementById('btnSair');

            if (!form || !btnCadastrar || !btnSair) {
                console.error('Elementos essenciais do formulário não encontrados.');
                exibirMensagem('Erro: Elementos do formulário ausentes.', 'danger');
                return;
            }

            requestAnimationFrame(() => {
                const campoNome = document.getElementById('nome');
                if (campoNome) campoNome.focus();
            });

            form.addEventListener('submit', handleFormSubmit);

            btnSair.addEventListener('click', async () => {
                const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                    'Deseja realmente voltar ao Menu Principal?',
                    'Sair do Sistema'
                );

                if (confirmado) {
                    FiberGuardian.Utils.voltarMenuPrincipal();
                }
                document.getElementById('nome').focus();
                return;
            });
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const campoNome = form.querySelector('#nome');
            const campoCnpj = form.querySelector('#cnpj');
            const campoEmail = form.querySelector('#email');
            const campoTelefone = form.querySelector('#telefone');

            // Validação do campo Nome
            if (!campoNome.value.trim()) {
                campoNome.classList.add('is-invalid');
                exibirMensagem('O campo Nome é obrigatório.', 'danger');
                return;
            } else {
                campoNome.classList.remove('is-invalid');
            }

            if (campoNome.value.trim().length > 255) {
                campoNome.classList.add('is-invalid');
                exibirMensagem(
                    'O nome do fornecedor não pode exceder 255 caracteres.',
                    'danger'
                );
                return;
            } else {
                campoNome.classList.remove('is-invalid');
            }

            // Validação do campo CNPJ
            if (!campoCnpj.value.trim()) {
                campoCnpj.classList.add('is-invalid');
                exibirMensagem('O campo CNPJ é obrigatório.', 'danger');
                return;
            } else {
                campoCnpj.classList.remove('is-invalid');
            }

            // Validação do campo Email
            if (!campoEmail.value.trim()) {
                campoEmail.classList.add('is-invalid');
                exibirMensagem('O campo Email é obrigatório.', 'danger');
                return;
            } else {
                campoEmail.classList.remove('is-invalid');
            }

            if (!validarEmail(campoEmail.value)) {
                campoEmail.classList.add('is-invalid');
                exibirMensagem('Email inválido.', 'danger');
                return;
            } else {
                campoEmail.classList.remove('is-invalid');
            }

            // Validação do campo Telefone
            if (!campoTelefone.value.trim()) {
                campoTelefone.classList.add('is-invalid');
                exibirMensagem('O campo Telefone é obrigatório.', 'danger');
                return;
            } else {
                campoTelefone.classList.remove('is-invalid');
            }

            const cnpj = campoCnpj.value.trim().replace(/[^\d]+/g, '');
            const telefone = campoTelefone.value.trim().replace(/[^\d]+/g, '');
            const payload = {
                nomeFornecedor: campoNome.value.trim(),
                cnpj: cnpj,
                email: campoEmail.value.trim(),
                telefone: telefone,
            };
            console.log('Payload enviado:', payload); // Log para depuração

            try {
                const csrf = getCookie('XSRF-TOKEN');
                console.log('CSRF Token:', csrf); // Log para depuração

                const resposta = await fetch(API_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify(payload),
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

                limparFormulario();
            } catch (erro) {
                console.error('Erro ao buscar fornecedores:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao cadastrar fornecedores.',
                    inputFornecedor,
                    erro
                );
            }
        }

        function limparFormulario() {
            const form = document.getElementById('formFornecedor');
            if (form) {
                form.reset();
                const campoNome = document.getElementById('nome');
                const campoCnpj = document.getElementById('cnpj');
                const campoEmail = document.getElementById('email');
                const campoTelefone = document.getElementById('telefone');
                [campoNome, campoCnpj, campoEmail, campoTelefone].forEach((campo) => {
                    if (campo) campo.classList.remove('is-invalid');
                });
                if (campoNome) campoNome.focus();
            }
        }

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return '';
        }

        document.addEventListener('DOMContentLoaded', init);

        return { init };
    })();
})();
