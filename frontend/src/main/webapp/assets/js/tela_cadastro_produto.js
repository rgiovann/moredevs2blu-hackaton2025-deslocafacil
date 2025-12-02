(function () {
    'use strict';

    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaCadastroProduto = (function () {
        const URL_PRODUTOS = '/api/produtos';
        const URL_LISTAR_FORNECEDORES = '/api/fornecedores/list/recebimento';
        let produtosEmMemoria = [];

        function configurarEventos() {
            configurarFormulario();
            configurarDropdownFornecedor();
            configurarModalAcessibilidade();
        }

        // --- Funções de Busca ---

        async function buscarFornecedores(nomeParcial) {
            if (!nomeParcial) {
                FiberGuardian.Utils.exibirMensagemModal(
                    'Digite parte do nome do fornecedor para buscar.',
                    'warning'
                );
                return [];
            }
            return await fetchData(
                `${URL_LISTAR_FORNECEDORES}?nome=${encodeURIComponent(nomeParcial)}`
            );
        }

        // --- Função centralizada de fetch usando Utils ---

        async function fetchData(url, method = 'GET', body = null) {
            try {
                const csrf = await FiberGuardian.Utils.obterTokenCsrf();
                if (!csrf) {
                    FiberGuardian.Utils.exibirMensagemModal(
                        'Erro: Token CSRF não encontrado.',
                        'danger'
                    );
                    return [];
                }

                const opcoes = {
                    method,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrf,
                    },
                };

                if (body) {
                    opcoes.body = JSON.stringify(body);
                }

                const resposta = await fetch(url, opcoes);

                if (!resposta.ok) {
                    if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(resposta);
                    }
                    return null;
                }

                if (method === 'DELETE' || resposta.status === 204) {
                    return true;
                }

                const dados = await resposta.json();
                let lista = Array.isArray(dados) ? dados : dados.content || [];
                if (!Array.isArray(lista)) {
                    FiberGuardian.Utils.exibirMensagemModal(
                        'Erro: Formato inválido dos dados recebidos.',
                        'danger'
                    );
                    return [];
                }
                return lista;
            } catch (erro) {
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede na requisição.',
                    null,
                    erro
                );
                return null;
            }
        }

        // --- Lógica de Configuração de Dropdown Reutilizável (com estilo padronizado) ---

        function configurarDropdownGenerico(
            btnBuscarId,
            inputId,
            dropdownId,
            buscarFuncao,
            onSelectCallback
        ) {
            const btnBuscar = document.getElementById(btnBuscarId);
            const input = document.getElementById(inputId);
            const dropdown = document.getElementById(dropdownId);

            if (!btnBuscar || !input || !dropdown) {
                console.error(`Elementos do dropdown ${inputId} não encontrados.`);
                return;
            }

            btnBuscar.addEventListener('click', async () => {
                dropdown.innerHTML = '';
                dropdown.classList.remove('show');

                const nomeParcial = input.value.trim();
                const lista = await buscarFuncao(nomeParcial);

                if (!lista || lista.length === 0) {
                    dropdown.innerHTML = `<div class="dropdown-item-text">Nenhum resultado encontrado para "${nomeParcial}".</div>`;
                    dropdown.classList.add('show');
                    return;
                }

                // Monta a tabela dentro do dropdown
                const tabela = document.createElement('table');
                tabela.className = 'table table-sm table-hover mb-0';
                tabela.style.border = '1px solid #b5d4f5';
                tabela.style.borderRadius = '4px';
                tabela.style.tableLayout = 'fixed';
                tabela.style.width = '100%';

                // Cabeçalho da tabela
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr class="table-light">
                        <th style="width:70%">Fornecedor</th>
                        <th style="width:30%">CNPJ</th>
                    </tr>
                `;
                tabela.appendChild(thead);

                // Corpo da tabela
                const tbody = document.createElement('tbody');
                lista.forEach((item) => {
                    const tr = document.createElement('tr');
                    tr.style.cursor = 'pointer';
                    tr.innerHTML = `
                        <td>${item.nome || 'Sem nome'}</td>
                        <td>${item.cnpj || ''}</td>
                    `;

                    tr.addEventListener('click', (e) => {
                        e.preventDefault();
                        onSelectCallback(item, input, dropdown);
                    });

                    tbody.appendChild(tr);
                });
                tabela.appendChild(tbody);

                dropdown.appendChild(tabela);
                dropdown.classList.add('show');
            });

            document.addEventListener('click', (event) => {
                if (
                    !dropdown.contains(event.target) &&
                    event.target !== input &&
                    event.target !== btnBuscar
                ) {
                    setTimeout(() => {
                        if (!dropdown.contains(document.activeElement)) {
                            dropdown.classList.remove('show');
                        }
                    }, 100);
                }
            });
            /*
            input.addEventListener('input', () => {
                if (input.readOnly) return;
                const valorAtual = input.value.trim();
                const valorSelecionado = input.dataset.selectedValue || '';

                if (valorAtual !== valorSelecionado) {
                    delete input.dataset.id;
                    delete input.dataset.cnpj;
                    delete input.dataset.selectedValue;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            */
        }

        // --- Funções de Configuração Específicas para Cada Dropdown ---

        function configurarDropdownFornecedor() {
            configurarDropdownGenerico(
                'btnBuscarFornecedor',
                'fornecedor',
                'dropdownFornecedor',
                buscarFornecedores,
                (item, input, dropdown) => {
                    input.value = item.nome;

                    const fornecedorCnpj = item.cnpj ?? '';
                    input.dataset.cnpj = fornecedorCnpj;
                    input.dataset.selectedValue = item.nome;

                    document.getElementById(
                        'fornecedorNomeLabel'
                    ).textContent = `Fornecedor: ${item.nome}`;
                    input.classList.remove('is-invalid');
                    dropdown.classList.remove('show');

                    input.readOnly = true;
                    const btnBuscarFornecedor =
                        document.getElementById('btnBuscarFornecedor');
                    const btnTrocarFornecedor =
                        document.getElementById('btnTrocarFornecedor');

                    if (btnBuscarFornecedor) {
                        btnBuscarFornecedor.disabled = true;
                        btnBuscarFornecedor.classList.add('campo-desabilitado');
                    }
                    if (btnTrocarFornecedor) {
                        btnTrocarFornecedor.disabled = false;
                        btnTrocarFornecedor.classList.remove('campo-desabilitado');
                        btnTrocarFornecedor.onclick = () => {
                            input.readOnly = false;
                            input.value = '';
                            input.classList.remove('campo-desabilitado', 'is-invalid');
                            delete input.dataset.cnpj;
                            delete input.dataset.selectedValue;
                            document.getElementById('fornecedorNomeLabel').textContent =
                                '';
                            if (btnBuscarFornecedor) {
                                btnBuscarFornecedor.disabled = false;
                                btnBuscarFornecedor.classList.remove(
                                    'campo-desabilitado'
                                );
                            }
                            btnTrocarFornecedor.disabled = true;
                            btnTrocarFornecedor.classList.add('campo-desabilitado');
                            input.focus();
                            input.dispatchEvent(new Event('change'));
                        };
                    }

                    // Limpa a lista de produtos temporários ao selecionar um novo fornecedor
                    produtosEmMemoria = [];
                    preencherTabelaProdutos();
                }
            );
        }

        function configurarModalAcessibilidade() {
            const modal = document.getElementById('modalMensagemSistema');
            if (modal) {
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.inert = true;
                    document.getElementById('fornecedor').focus();
                });
                modal.addEventListener('shown.bs.modal', () => {
                    modal.inert = false;
                    modal.querySelector('.btn-close').focus();
                });
            }
        }

        function configurarFormulario() {
            const form = document.getElementById('produtoForm');
            const btnAdicionarALista = document.getElementById('btnAdicionarALista');
            const btnSalvarProduto = document.getElementById('btnSalvarProduto');
            const btnSair = document.getElementById('btnSair');

            if (!form || !btnAdicionarALista || !btnSalvarProduto || !btnSair) {
                console.error('Elementos do formulário principal não encontrados.');
                return;
            }

            btnAdicionarALista.addEventListener('click', adicionarProdutoALista);
            btnSalvarProduto.addEventListener('click', gravarProdutos);
            btnSair.addEventListener('click', sair);

            preencherTabelaProdutos();
        }

        function adicionarProdutoALista() {
            const campoFornecedor = document.getElementById('fornecedor');
            const fornecedorCnpj = (campoFornecedor.dataset.cnpj || '').trim();
            const codigoProduto = document.getElementById('codigoProduto').value.trim();
            const descricaoProduto = document
                .getElementById('descricaoProduto')
                .value.trim();

            if (!fornecedorCnpj) {
                campoFornecedor.classList.add('is-invalid');
                FiberGuardian.Utils.exibirMensagemModal(
                    'Por favor, selecione um fornecedor.',
                    'danger'
                );
                return;
            }

            if (!codigoProduto) {
                document.getElementById('codigoProduto').classList.add('is-invalid');
                FiberGuardian.Utils.exibirMensagemModal(
                    'O campo Código do Produto é obrigatório.',
                    'danger'
                );
                return;
            }

            if (!descricaoProduto) {
                document.getElementById('descricaoProduto').classList.add('is-invalid');
                FiberGuardian.Utils.exibirMensagemModal(
                    'O campo Descrição do Produto é obrigatório.',
                    'danger'
                );
                return;
            }

            const produtoExistente = produtosEmMemoria.find(
                (p) => p.codigo.toLowerCase() === codigoProduto.toLowerCase()
            );
            if (produtoExistente) {
                FiberGuardian.Utils.exibirMensagemModal(
                    'Este produto já foi adicionado à lista. Remova-o e adicione-o novamente se necessário.',
                    'warning'
                );
                return;
            }

            const novoProduto = {
                codigo: codigoProduto,
                descricao: descricaoProduto,
            };

            produtosEmMemoria.push(novoProduto);
            preencherTabelaProdutos();

            document.getElementById('codigoProduto').value = '';
            document.getElementById('descricaoProduto').value = '';
            document.getElementById('codigoProduto').focus();
            FiberGuardian.Utils.exibirMensagemModal(
                'Produto adicionado à lista com sucesso!',
                'success'
            );
        }

        async function gravarProdutos(event) {
            event.preventDefault();

            const fornecedorCnpj = document.getElementById('fornecedor').dataset.cnpj;

            if (produtosEmMemoria.length === 0) {
                FiberGuardian.Utils.exibirMensagemModal(
                    'Nenhum produto na lista para ser gravado.',
                    'warning'
                );
                return;
            }

            try {
                const url = `${URL_PRODUTOS}/lote`;

                const dadosParaGravar = {
                    fornecedorCnpj: fornecedorCnpj,
                    produtos: produtosEmMemoria,
                };

                const resposta = await fetchData(url, 'POST', dadosParaGravar);

                if (resposta === null) {
                    return;
                }

                FiberGuardian.Utils.exibirMensagemModal(
                    'Todos os produtos foram gravados com sucesso!',
                    'success'
                );

                produtosEmMemoria = [];
                preencherTabelaProdutos();

                document.getElementById('codigoProduto').value = '';
                document.getElementById('descricaoProduto').value = '';
            } catch (erro) {
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro ao tentar gravar os produtos.',
                    null,
                    erro
                );
            }
        }

        function preencherTabelaProdutos() {
            const produtosTableBody = document.getElementById('produtosTableBody');
            produtosTableBody.innerHTML = '';

            if (produtosEmMemoria.length === 0) {
                const tr = document.createElement('tr');
                tr.id = 'noDataRow';
                tr.innerHTML =
                    '<td colspan="3" class="text-center">Nenhum produto adicionado.</td>';
                produtosTableBody.appendChild(tr);
                return;
            }

            produtosEmMemoria.forEach((produto, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${produto.codigo}</td>
                    <td>${produto.descricao}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-custom deletar-produto" data-index="${index}">Deletar</button>
                    </td>
                `;
                produtosTableBody.appendChild(tr);
            });

            document.querySelectorAll('.deletar-produto').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    const index = e.target.getAttribute('data-index');
                    const confirmar = await FiberGuardian.Utils.confirmarAcaoAsync(
                        'Deseja realmente remover este produto da lista?',
                        'Confirmação'
                    );

                    if (confirmar) {
                        produtosEmMemoria.splice(index, 1);
                        preencherTabelaProdutos();
                        FiberGuardian.Utils.exibirMensagemModal(
                            'Produto removido da lista.',
                            'success'
                        );
                    }
                });
            });
        }

        async function sair() {
            const confirmar = await FiberGuardian.Utils.confirmarAcaoAsync(
                'Deseja sair? A lista de produtos não gravados será perdida.',
                'Confirmação'
            );

            if (confirmar) {
                window.location.href = 'index.html';
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            FiberGuardian.TelaCadastroProduto.init();
        });

        return { init: configurarEventos };
    })();
})();
