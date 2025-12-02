(function () {
    'use strict';

    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaConsultaProduto = (function () {
        const URL_PRODUTOS = '/api/produtos';
        const URL_LISTAR_PRODUTOS = '/api/produtos/paged';
        const URL_LISTAR_FORNECEDORES = '/api/fornecedores/list/recebimento';

        let currentPage = 0;
        const pageSize = 10;
        let totalPages = 0;

        let fornecedorSelecionado = null;

        function configurarEventos() {
            configurarDropdownFornecedor();
            configurarBotoesAlteracao();
            configurarBotaoSair();
            configurarPaginacao();
        }

        // --- Fetch centralizado ---
        async function fetchData(url, method = 'GET', body = null) {
            try {
                const csrf = await FiberGuardian.Utils.obterTokenCsrf();
                // Adicionado: Log para verificar o token CSRF
                console.log('Token CSRF:', csrf);
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
                        // Adicionado: Forçar HTTP/1.1 para evitar erros de HTTP/2
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
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

                if (dados.content) {
                    totalPages = dados.totalPages;
                    return dados;
                }

                let lista = Array.isArray(dados) ? dados : (dados.content || []);
                if (!Array.isArray(lista)) {
                    FiberGuardian.Utils.exibirMensagemModal(
                        'Erro: Formato inválido dos dados recebidos.',
                        'danger'
                    );
                    return [];
                }
                return lista;
            } catch (erro) {
                // Adicionado: Log detalhado do erro para diagnóstico
                console.error('Erro detalhado na requisição:', {
                    url,
                    method,
                    error: erro.message,
                    stack: erro.stack
                });
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede na requisição.',
                    null,
                    erro
                );
                return null;
            }
        }

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

        // --- Dropdown genérico (padrão tabela com borda azul) ---
        function configurarDropdownGenerico(
            btnBuscarId,
            btnTrocarId,
            inputId,
            dropdownId,
            buscarFuncao,
            onSelectCallback
        ) {
            const btnBuscar = document.getElementById(btnBuscarId);
            const btnTrocar = document.getElementById(btnTrocarId);
            const input = document.getElementById(inputId);
            const dropdown = document.getElementById(dropdownId);

            if (!btnBuscar || !btnTrocar || !input || !dropdown) {
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

                // Monta a tabela padronizada
                const tabela = document.createElement('table');
                tabela.className = 'table table-sm table-hover mb-0';
                tabela.style.border = '1px solid #b5d4f5';
                tabela.style.borderRadius = '4px';
                tabela.style.tableLayout = 'fixed';
                tabela.style.width = '100%';

                // Cabeçalho
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr class="table-light">
                        <th style="width:70%">Fornecedor</th>
                        <th style="width:30%">CNPJ</th>
                    </tr>
                `;
                tabela.appendChild(thead);

                // Corpo
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
                        btnTrocar.disabled = false;
                        btnBuscar.disabled = true;
                        input.disabled = true;
                    });
                    tbody.appendChild(tr);
                });
                tabela.appendChild(tbody);

                dropdown.appendChild(tabela);
                dropdown.classList.add('show');
            });

            btnTrocar.addEventListener('click', () => {
                input.value = '';
                input.disabled = false;
                btnTrocar.disabled = true;
                btnBuscar.disabled = false;
                dropdown.classList.remove('show');
                preencherTabelaProdutos([]);
                ocultarSecaoAlteracao();
            });

            document.addEventListener('click', (event) => {
                if (
                    !dropdown.contains(event.target) &&
                    event.target !== input &&
                    event.target !== btnBuscar &&
                    event.target !== btnTrocar
                ) {
                    setTimeout(() => {
                        if (!dropdown.contains(document.activeElement)) {
                            dropdown.classList.remove('show');
                        }
                    }, 100);
                }
            });
        }

        function configurarDropdownFornecedor() {
            configurarDropdownGenerico(
                'btnBuscarFornecedorBusca',
                'btnTrocarFornecedorBusca',
                'fornecedorBusca',
                'dropdownFornecedorBusca',
                buscarFornecedores,
                (item, input, dropdown) => {
                    input.value = item.nome;
                    fornecedorSelecionado = item;
                    dropdown.classList.remove('show');

                    currentPage = 0;
                    buscarProdutos(true);
                }
            );
        }

        function configurarBotaoSair() {
            const btnSair = document.getElementById('btnSair');
            if (btnSair) {
                btnSair.addEventListener('click', sair);
            }
        }

        function configurarPaginacao() {
            document.getElementById('prevPage').addEventListener('click', async (e) => {
                e.preventDefault();
                if (currentPage > 0) {
                    currentPage--;
                    await buscarProdutos(false, currentPage);
                }
            });

            document.getElementById('nextPage').addEventListener('click', async (e) => {
                e.preventDefault();
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    await buscarProdutos(false, currentPage);
                }
            });
        }

        function configurarBotoesAlteracao() {
            document
                .getElementById('btnSalvarAlteracao')
                .addEventListener('click', alterarProduto);
            document
                .getElementById('btnCancelarAlteracao')
                .addEventListener('click', ocultarSecaoAlteracao);
        }

        async function buscarProdutos(mostrarMensagem = true, pageNumber = 0) {
            const fornecedorCnpj = fornecedorSelecionado ? fornecedorSelecionado.cnpj : '';

            if (!fornecedorCnpj) {
                preencherTabelaProdutos([]);
                return;
            }

            const params = new URLSearchParams({
                page: pageNumber,
                size: pageSize,
                sort: 'descricao,asc',
                cnpj: fornecedorCnpj,
            });

            const url = `${URL_LISTAR_PRODUTOS}?${params.toString()}`;
            const dados = await fetchData(url);

            if (dados === null) {
                return;
            }

            preencherTabelaProdutos(dados.content);
            atualizarPaginacao(dados.totalPages, dados.number);

            if (mostrarMensagem && dados.content.length > 0) {
                FiberGuardian.Utils.exibirMensagemModal(
                    `Busca concluída. ${dados.totalElements} produto(s) encontrado(s) para o fornecedor selecionado.`,
                    'success'
                );
            } else if (mostrarMensagem && dados.content.length === 0) {
                FiberGuardian.Utils.exibirMensagemModal(
                    `Nenhum produto encontrado para o fornecedor selecionado.`,
                    'warning'
                );
            }

            ocultarSecaoAlteracao();
        }

        function preencherTabelaProdutos(produtos) {
            const produtosTableBody = document.getElementById('produtosTableBody');
            produtosTableBody.innerHTML = '';

            if (!produtos || produtos.length === 0) {
                const tr = document.createElement('tr');
                tr.id = 'noDataRow';
                tr.innerHTML =
                    '<td colspan="4" class="text-center">Nenhum produto encontrado.</td>';
                produtosTableBody.appendChild(tr);
                return;
            }

            produtos.forEach((produto) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${produto.codigo}</td>
                    <td>${produto.descricao}</td>
                    <td>${produto.fornecedor?.nome || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-custom alterar-produto me-2" data-codigo="${produto.codigo}" data-descricao="${produto.descricao}" data-fornecedor-cnpj="${fornecedorSelecionado.cnpj}">
                            <i class="fas fa-edit"></i> Alterar
                        </button>
                        <button class="btn btn-sm btn-danger btn-custom deletar-produto" data-codigo="${produto.codigo}" data-fornecedor-cnpj="${fornecedorSelecionado.cnpj}">
                            <i class="fas fa-trash-alt"></i> Deletar
                        </button>
                    </td>
                `;
                produtosTableBody.appendChild(tr);
            });

            document.querySelectorAll('.deletar-produto').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const codigo = e.currentTarget.getAttribute('data-codigo');
                    const fornecedorCnpj = e.currentTarget.getAttribute('data-fornecedor-cnpj');
                    const nome = e.currentTarget.closest('tr').querySelector('td:nth-child(1)').textContent;
                    confirmarExclusao(codigo, nome, fornecedorCnpj);
                });
            });

            document.querySelectorAll('.alterar-produto').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const codigo = e.currentTarget.getAttribute('data-codigo');
                    const descricao = e.currentTarget.getAttribute('data-descricao');
                    const fornecedorCnpj = e.currentTarget.getAttribute('data-fornecedor-cnpj');

                    exibirSecaoAlteracao(codigo, descricao, fornecedorCnpj);
                });
            });
        }

        // --- Paginação corrigida ---
        function atualizarPaginacao(totalPaginas, paginaAtual) {
            totalPages = Number.isFinite(totalPaginas) ? totalPaginas : 1;
            currentPage = Number.isFinite(paginaAtual) ? paginaAtual : 0;

            const prevBtn = document.getElementById('prevPage');
            const nextBtn = document.getElementById('nextPage');
            const currentPageBtn = document.getElementById('currentPage');

            prevBtn.classList.toggle('disabled', currentPage <= 0);
            nextBtn.classList.toggle('disabled', currentPage >= totalPages - 1);

            // Exibe "página atual / total de páginas"
            currentPageBtn.querySelector('a').textContent = `${currentPage + 1} / ${totalPages}`;
        }

        async function confirmarExclusao(codigo, nome, fornecedorCnpj) {
            const confirmar = await FiberGuardian.Utils.confirmarAcaoAsync(
                `Deseja realmente excluir o produto de código "${nome}"?`,
                'Confirmação'
            );

            if (confirmar) {
                excluirProduto(codigo, fornecedorCnpj);
            }
        }

        async function excluirProduto(codigo, fornecedorCnpj) {
            const url = `${URL_PRODUTOS}/${encodeURIComponent(fornecedorCnpj)}/${encodeURIComponent(codigo)}`;
            const resposta = await fetchData(url, 'DELETE');

            if (resposta) {
                FiberGuardian.Utils.exibirMensagemModal('Produto excluído com sucesso!', 'success');
                buscarProdutos(false, currentPage);
            }
        }

        function exibirSecaoAlteracao(codigo, descricao, fornecedorCnpj) {
            document.getElementById('codigoProdutoAlterar').value = codigo;
            document.getElementById('descricaoProdutoAlterar').value = descricao;
            document.getElementById('btnSalvarAlteracao').dataset.codigo = codigo;
            document.getElementById('btnSalvarAlteracao').dataset.fornecedorCnpj = fornecedorCnpj;

            document.getElementById('secaoAlteracaoProduto').classList.remove('d-none');
            document.getElementById('descricaoProdutoAlterar').focus();
        }

        function ocultarSecaoAlteracao() {
            document.getElementById('secaoAlteracaoProduto').classList.add('d-none');
            document.getElementById('formAlteracaoProduto').reset();
            delete document.getElementById('btnSalvarAlteracao').dataset.codigo;
            delete document.getElementById('btnSalvarAlteracao').dataset.fornecedorCnpj;
        }

        async function alterarProduto() {
            const codigo = document.getElementById('btnSalvarAlteracao').dataset.codigo;
            const fornecedorCnpj = document.getElementById('btnSalvarAlteracao').dataset.fornecedorCnpj;
            const descricao = document.getElementById('descricaoProdutoAlterar').value.trim();

            if (!descricao) {
                FiberGuardian.Utils.exibirMensagemModal('A descrição não pode ser vazia.', 'warning');
                return;
            }

            const url = `${URL_PRODUTOS}/${encodeURIComponent(fornecedorCnpj)}/${encodeURIComponent(codigo)}`;
            const dadosAtualizados = {
                codigo: codigo,
                descricao: descricao,
            };

            const resposta = await fetchData(url, 'PUT', dadosAtualizados);

            if (resposta) {
                ocultarSecaoAlteracao();
                FiberGuardian.Utils.exibirMensagemModal('Produto alterado com sucesso!', 'success');
                buscarProdutos(false, currentPage);
            }
        }

        async function sair() {
            const confirmar = await FiberGuardian.Utils.confirmarAcaoAsync(
                'Deseja sair da consulta de produtos?',
                'Confirmação'
            );
            if (confirmar) {
                window.location.href = 'index.html';
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            FiberGuardian.TelaConsultaProduto.init();
        });

        return { init: configurarEventos };
    })();
})();



