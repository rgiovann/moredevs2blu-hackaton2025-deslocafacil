(function () {
    window.FiberGuardian = window.FiberGuardian || {};
    // Variáveis globais dentro do escopo do módulo FiberGuardian.TelaCadastroRecebimento
    //  (não vaza para window).
    let cnpjFornecedorSelecionado = null;
    let codigoProdutoSelecionado = null;
    let nrNotaFiscalSelecionado = null;

    const formPesquisa = document.getElementById('formPesquisa');

    let paginaAtual = 0;
    const tamanhoPagina = 20;

    FiberGuardian.TelaConsultaRecebimento = (function () {
        // helper no topo do módulo
        function getTabelaBody() {
            return document.querySelector('.table-container table tbody');
        }

        function configurarEventos() {
            try {
                cnpjFornecedorSelecionado = null;
                codigoProdutoSelecionado = null;
                nrNotaFiscalSelecionado = null;
                paginaAtual = 0;
                const tbody = getTabelaBody();
                if (tbody) {
                    tbody.innerHTML = '';
                } else {
                    console.warn(
                        '[FG] tbody não encontrado ao iniciar tela (provável reconstrução do DOM).'
                    );
                }

                const tabelaBody = document.querySelector('.table-container tbody');

                tabelaBody.addEventListener('click', async (e) => {
                    const btnExcluir = e.target.closest('.btn-excluir');
                    const btnVerItens = e.target.closest('.btn-ver-itens');

                    // evita logs/fluxos desnecessários para outros clicks
                    if (!btnExcluir && !btnVerItens) return;

                    if (btnExcluir) {
                        const linha = btnExcluir.closest('tr');
                        const codigoNf = linha.children[0].textContent.trim();
                        const cnpjFornecedor = linha.children[2].textContent.trim();

                        const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                            `Deseja realmente excluir a nota fiscal ${codigoNf}?`,
                            'Confirmação de Exclusão'
                        );

                        if (!confirmado) return;

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();

                            const resposta = await fetch(
                                `/api/notas-fiscais/${cnpjFornecedor}/${codigoNf}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-XSRF-TOKEN': csrfToken,
                                    },
                                    credentials: 'include',
                                }
                            );

                            if (resposta.ok) {
                                FiberGuardian.Utils.exibirMensagemModal(
                                    `Nota fiscal ${codigoNf} excluída com sucesso.`,
                                    'success'
                                );
                                buscarNotas(paginaAtual);
                            } else {
                                await FiberGuardian.Utils.tratarErroFetch(resposta);
                            }
                        } catch (erro) {
                            console.error('Erro ao excluir nota fiscal:', erro);
                            FiberGuardian.Utils.exibirErroDeRede(
                                'Erro de rede ao excluir a nota fiscal.',
                                null,
                                erro
                            );
                        }
                    }

                    if (btnVerItens) {
                        const linha = btnVerItens.closest('tr');
                        const codigoNf = linha.children[0].textContent.trim();
                        const cnpjFornecedor = linha.children[2].textContent.trim();

                        console.log('[FG] Código NF : ' + codigoNf);
                        console.log('[FG] CNPJ : ' + cnpjFornecedor);

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();
                            const response = await fetch(
                                `/api/item-notas-fiscais/list/${cnpjFornecedor}/${codigoNf}`,
                                {
                                    method: 'GET',
                                    headers: {
                                        Accept: 'application/json',
                                        'X-XSRF-TOKEN': csrfToken,
                                    },
                                    credentials: 'include',
                                }
                            );

                            if (!response.ok) {
                                await FiberGuardian.Utils.tratarErroFetch(response); // corrigido: usar 'response'
                                return;
                            }

                            const itens = await response.json();

                            if (!Array.isArray(itens) || itens.length === 0) {
                                FiberGuardian.Utils.exibirMensagemModal(
                                    'Nenhum item encontrado para esta Nota Fiscal.',
                                    'info',
                                    'Itens da Nota Fiscal'
                                );
                                return;
                            }

                            // monta html da mesma forma que o mock original, com formatação
                            let htmlTabela = `
                <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle">
                    <thead class="table-light">
                    <tr>
                        <th>Cod. Produto</th>
                        <th>Descrição</th>
                        <th class="text-end">Quantidade</th>
                        <th class="text-end">Nº Caixas</th>
                        <th class="text-end">Preço Unitário</th>
                        <th class="text-end">Valor Total</th>
                        <th>Observação</th>
                    </tr>
                    </thead>
                    <tbody>
            `;

                            itens.forEach((item) => {
                                const codigo = item.produto?.codigo ?? '';
                                const descricao = item.produto?.descricao ?? '';
                                const qtd =
                                    typeof item.qtdRecebida === 'number'
                                        ? item.qtdRecebida.toLocaleString('pt-BR')
                                        : item.qtdRecebida ?? '';
                                const nrCaixas = item.nrCaixas ?? '';
                                const precoUnit =
                                    typeof item.precoUnitario === 'number'
                                        ? item.precoUnitario.toLocaleString('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          })
                                        : item.precoUnitario ?? '';
                                const valorTotal =
                                    typeof item.valorTotalItem === 'number'
                                        ? item.valorTotalItem.toLocaleString('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          })
                                        : item.valorTotalItem ?? '';
                                const obs = item.observacao ?? '';

                                htmlTabela += `
                                    <tr>
                                        <td>${codigo}</td>
                                        <td>${descricao}</td>
                                        <td class="text-end">${qtd}</td>
                                        <td class="text-end">${nrCaixas}</td>
                                        <td class="text-end">${precoUnit}</td>
                                        <td class="text-end">${valorTotal}</td>
                                        <td>${obs}</td>
                                    </tr>
                                `;
                            });

                            htmlTabela += `
                                    </tbody>
                                </table>
                                </div>
                            `;

                            FiberGuardian.Utils.exibirMensagemModal(
                                { html: htmlTabela, tamanho: 'xl' },
                                'info',
                                'Itens da Nota Fiscal'
                            );
                        } catch (erro) {
                            console.error(
                                'Erro ao carregar itens da Nota Fiscal:',
                                erro
                            );
                            FiberGuardian.Utils.exibirErroDeRede(
                                'Erro de rede ao carregar os itens da nota fiscal.',
                                null,
                                erro
                            );
                        }
                    }
                });

                document.getElementById('paginacao-container').innerHTML = '';

                console.log('Módulo Tela Pesquisa Recebimento inicializado.');

                const inputFornecedor = document.getElementById('fornecedor');
                const btnBuscarFornecedor =
                    document.getElementById('btnBuscarFornecedor');
                const dropdownFornecedor =
                    document.getElementById('dropdownFornecedor');
                const btnTrocarFornecedor =
                    document.getElementById('btnTrocarFornecedor');

                const inputNrNotFiscal = document.getElementById('nrNotaFiscal');
                const btnBuscarNrNotaFiscal = document.getElementById(
                    'btnBuscarNrNotaFiscal'
                );
                const dropdownNrNotaFiscal =
                    document.getElementById('dropdownNrNotaFiscal');

                const inputProduto = document.getElementById('produto');
                const btnBuscarProduto = document.getElementById('btnBuscarProduto');
                const dropdownProduto = document.getElementById('dropdownProduto');
                const btnTrocarProduto = document.getElementById('btnTrocarProduto');
                let btnSair = document.getElementById('btnSair');
                let btnPesquisarNf = document.getElementById('btnPesquisarNf');
                let btnLimpar = document.getElementById('btnLimpar');

                if (!btnSair || !btnPesquisarNf || !btnLimpar) {
                    console.error(
                        'Botão Sair, Pesquisar Nota Fiscal ou Limpar Pesquisa não encontrado!'
                    );
                    return;
                }

                if (
                    !btnBuscarFornecedor ||
                    !inputFornecedor ||
                    !dropdownFornecedor ||
                    !btnTrocarFornecedor
                ) {
                    console.error('Elementos da busca de Fornecedor não encontrados.');
                    return;
                }

                if (
                    !btnBuscarProduto ||
                    !inputProduto ||
                    !dropdownProduto ||
                    !btnTrocarProduto
                ) {
                    console.error('Elementos da busca de Produto não encontrados.');
                    return;
                }

                if (
                    !btnBuscarNrNotaFiscal ||
                    !inputNrNotFiscal ||
                    !dropdownNrNotaFiscal
                ) {
                    console.error('Elementos da busca de Nota Fiscal não encontrados.');
                    return;
                }

                const dataInicial = document.getElementById('dataInicial');

                /*
            LEMBRAR === VALOR TOTAL
                const valorInput = document.getElementById('valorTotal').value; // "12,34"
                const valorParaJson = valorInput.replace(',', '.');             // "12.34"

                const json = {
                valorTotal: Number(valorParaJson), // ou parseFloat(valorParaJson)
                // outros campos...
                };

                fetch('/api/notas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
                });

            */

                FiberGuardian.Utils.fecharQualquerDropdownAberto(
                    [dropdownFornecedor, dropdownNrNotaFiscal, dropdownProduto],
                    [inputFornecedor, inputProduto, inputNrNotFiscal],
                    [btnBuscarFornecedor, btnBuscarProduto, btnBuscarNrNotaFiscal]
                );

                btnBuscarFornecedor.addEventListener('click', async function () {
                    const codigoParcial = inputFornecedor.value.trim();

                    // Validação defensiva
                    if (!codigoParcial) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'Digite parte do nome do fornecedor para buscar.',
                            'warning',
                            inputFornecedor
                        );
                        return;
                    }

                    try {
                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        const resposta = await fetch(
                            `/api/fornecedores/list/recebimento?nome=${encodeURIComponent(
                                codigoParcial
                            )}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-XSRF-TOKEN': csrfToken,
                                },
                                credentials: 'include',
                            }
                        );

                        if (resposta.ok) {
                            const listaFornecedores = await resposta.json();

                            const { index, item } =
                                await FiberGuardian.Utils.renderizarDropdownGenericoAsync(
                                    {
                                        input: inputFornecedor,
                                        dropdown: dropdownFornecedor,
                                        lista: listaFornecedores,
                                        camposExibir: ['nome', 'cnpj'],
                                        titulosColunas: ['Fornecedor', 'CNPJ'],
                                        msgVazio: 'Nenhum fornecedor encontrado.',
                                    }
                                );

                            cnpjFornecedorSelecionado = item.cnpj;
                            // trava campo fornecedor
                            inputFornecedor.readOnly = true;
                            inputFornecedor.classList.add('campo-desabilitado');

                            // desabilita botão Buscar
                            btnBuscarFornecedor.disabled = true;
                            btnBuscarFornecedor.classList.add('campo-desabilitado');

                            // habilita botão Trocar
                            btnTrocarFornecedor.disabled = false;
                            btnTrocarFornecedor.classList.remove('campo-desabilitado');

                            // Quando clicar em "Trocar fornecedor"
                            btnTrocarFornecedor.addEventListener('click', () => {
                                cnpjFornecedorSelecionado = null;
                                inputFornecedor.value = '';
                                inputFornecedor.readOnly = false;
                                inputFornecedor.classList.remove('campo-desabilitado');

                                btnBuscarFornecedor.disabled = false;
                                btnBuscarFornecedor.classList.remove(
                                    'campo-desabilitado'
                                );

                                btnTrocarFornecedor.disabled = true;
                                btnTrocarFornecedor.classList.add('campo-desabilitado');
                            });
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputFornecedor
                            );
                        }
                    } catch (erro) {
                        console.error('Erro ao buscar fornecedores:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao buscar fornecedores.',
                            inputFornecedor,
                            erro
                        );
                    }
                });

                btnBuscarProduto.addEventListener('click', async function () {
                    const codigoParcial = inputProduto.value.trim();

                    if (!cnpjFornecedorSelecionado) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'É necessario selecionar o produto antes de selecionar o produto.',
                            'warning',
                            inputFornecedor
                        );
                        return;
                    }

                    try {
                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        // Monta a URL com os dois parâmetros
                        const url = new URL(
                            '/api/produtos/list/recebimento',
                            window.location.origin
                        );
                        url.searchParams.append('cnpj', cnpjFornecedorSelecionado);

                        if (codigoParcial) {
                            url.searchParams.append('descricao', codigoParcial);
                        }

                        const resposta = await fetch(url.toString(), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-XSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                        });

                        if (resposta.ok) {
                            const listaProdutos = await resposta.json();

                            const { index, item } =
                                await FiberGuardian.Utils.renderizarDropdownGenericoAsync(
                                    {
                                        input: inputProduto,
                                        dropdown: dropdownProduto,
                                        lista: listaProdutos,
                                        camposExibir: ['descricao', 'codigo'],
                                        titulosColunas: ['Produto', 'Código'],
                                        msgVazio: 'Nenhum produto encontrado.',
                                    }
                                );

                            // Armazena do objeto recebido o código ou descrição
                            codigoProdutoSelecionado = item.codigo;

                            // trava campo Produto
                            inputProduto.readOnly = true;
                            inputProduto.classList.add('campo-desabilitado');

                            // desabilita botão Buscar
                            btnBuscarProduto.disabled = true;
                            btnBuscarProduto.classList.add('campo-desabilitado');

                            // habilita botão Trocar
                            btnTrocarProduto.disabled = false;
                            btnTrocarProduto.classList.remove('campo-desabilitado');

                            // evento de trocar
                            btnTrocarProduto.addEventListener('click', () => {
                                codigoProdutoSelecionado = null;
                                inputProduto.value = '';
                                inputProduto.readOnly = false;
                                inputProduto.classList.remove('campo-desabilitado');

                                btnBuscarProduto.disabled = false;
                                btnBuscarProduto.classList.remove('campo-desabilitado');

                                btnTrocarProduto.disabled = true;
                                btnTrocarProduto.classList.add('campo-desabilitado');
                            });
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputProduto
                            );
                        }
                    } catch (erro) {
                        console.error('Erro ao buscar produtos:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao buscar produtos.',
                            inputProduto,
                            erro
                        );
                    }
                });

                btnBuscarNrNotaFiscal.addEventListener('click', async function () {
                    const codigoParcial = inputNrNotFiscal.value.trim();

                    try {
                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        // Monta a URL com o parâmetro codigo
                        const url = new URL(
                            '/api/notas-fiscais/list',
                            window.location.origin
                        );

                        if (codigoParcial) {
                            url.searchParams.append('codigo', codigoParcial);
                        }

                        const resposta = await fetch(url.toString(), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-XSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                        });

                        if (resposta.ok) {
                            const listaNotasFiscais = (await resposta.json()).map(
                                (nf) => ({
                                    codigoNf: nf.codigoNf,
                                    cnpj: nf.fornecedor.cnpj,
                                    nome: nf.fornecedor.nome,
                                    dataRecebimento: nf.dataRecebimento,
                                    valorTotal: nf.valorTotal,
                                })
                            );

                            const { index, item } =
                                await FiberGuardian.Utils.renderizarDropdownGenericoAsync(
                                    {
                                        input: inputNrNotFiscal,
                                        dropdown: dropdownNrNotaFiscal,
                                        lista: listaNotasFiscais,
                                        camposExibir: [
                                            'codigoNf',
                                            'cnpj',
                                            'nome',
                                            'dataRecebimento',
                                            'valorTotal',
                                        ],
                                        titulosColunas: [
                                            'Nota Fiscal',
                                            'CNPJ',
                                            'Nome',
                                            'Data Recebimento',
                                            'Valor Total',
                                        ],
                                        msgVazio:
                                            'Nenhum produto encontrado ou campo busca vazio.',
                                    }
                                );

                            // Armazena do objeto recebido o código ou descrição
                            nrNotaFiscalSelecionado = item.codigo;
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputNrNotFiscal
                            );
                        }
                    } catch (erro) {
                        console.error('Erro ao buscar notas fiscais:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao buscar notas fiscais.',
                            inputNrNotFiscal,
                            erro
                        );
                    }
                });

                btnSair.replaceWith(btnSair.cloneNode(true));
                btnSair = document.getElementById('btnSair');
                btnSair.addEventListener('click', async () => {
                    const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                        'Deseja realmente voltar ao Menu Principal?',
                        'Sair do Sistema'
                    );

                    if (confirmado) {
                        FiberGuardian.Utils.voltarMenuPrincipal();
                    } else {
                        // Se não confirmou, volta o foco para o campo inicial
                        dataInicial.focus();
                    }
                });

                btnPesquisarNf.replaceWith(btnPesquisarNf.cloneNode(true));
                btnPesquisarNf = document.getElementById('btnPesquisarNf');
                btnPesquisarNf.addEventListener('click', () => buscarNotas(0));

                btnLimpar.replaceWith(btnLimpar.cloneNode(true));
                btnLimpar = document.getElementById('btnLimpar');
                btnLimpar.addEventListener('click', () => {
                    // Zera variáveis globais
                    cnpjFornecedorSelecionado = null;
                    codigoProdutoSelecionado = null;
                    nrNotaFiscalSelecionado = null;

                    // Limpa inputs
                    document.getElementById('dataInicial').value = '';
                    document.getElementById('dataFinal').value = '';
                    document.getElementById('fornecedor').value = '';
                    document.getElementById('produto').value = '';
                    document.getElementById('nrNotaFiscal').value = '';

                    // Reabilita campos que possam ter ficado readonly/disabled
                    document.getElementById('fornecedor').readOnly = false;
                    document
                        .getElementById('fornecedor')
                        .classList.remove('campo-desabilitado');
                    document.getElementById('btnBuscarFornecedor').disabled = false;
                    document.getElementById('btnTrocarFornecedor').disabled = true;

                    document.getElementById('produto').readOnly = false;
                    document
                        .getElementById('produto')
                        .classList.remove('campo-desabilitado');
                    document.getElementById('btnBuscarProduto').disabled = false;
                    document.getElementById('btnTrocarProduto').disabled = true;

                    // Limpa tabela e paginação
                    const tbody = getTabelaBody();
                    if (tbody) tbody.innerHTML = '';
                    document.getElementById('paginacao-container').innerHTML = '';
                });
            } catch (erro) {
                console.error('[FG] erro em configurarEventos:', erro);
            }
        }

        async function buscarNotas(pagina = 0) {
            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                // Captura valores dos filtros
                const dataInicialValor = document.getElementById('dataInicial').value;
                const dataFinalValor = document.getElementById('dataFinal').value;
                const nfCodigo = document.getElementById('nrNotaFiscal').value.trim();
                const fornecedor = cnpjFornecedorSelecionado; // já vem do fluxo do fornecedor
                const produto = codigoProdutoSelecionado;

                if (
                    dataInicialValor &&
                    dataFinalValor &&
                    dataInicialValor > dataFinalValor
                ) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Data Inicial não pode ser maior que Data Final.',
                        'warning',
                        dataInicialValor
                    );
                    return;
                }

                console.log('Código Fornecedor : ' + cnpjFornecedorSelecionado);

                // Monta URL com filtros não vazios
                const url = new URL('/api/notas-fiscais/paged', window.location.origin);
                url.searchParams.append('page', pagina);
                url.searchParams.append('size', tamanhoPagina);

                if (dataInicialValor)
                    url.searchParams.append('dataini', dataInicialValor);
                if (dataFinalValor) url.searchParams.append('datafim', dataFinalValor);
                if (nfCodigo) url.searchParams.append('nfCodigo', nfCodigo);
                if (fornecedor) url.searchParams.append('cnpj', fornecedor);
                if (produto) url.searchParams.append('produtoCodigo', produto);

                const resposta = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    renderizarTabela(dados);
                    paginaAtual = dados.pageNumber ?? pagina; // depende do teu PageDto
                    atualizarPaginacao(dados);
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(resposta, formPesquisa);
                }
            } catch (erro) {
                console.error('Erro ao buscar notas fiscais:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao buscar notas fiscais.',
                    formPesquisa,
                    erro
                );
            }
        }

        function renderizarTabela(dados) {
            const tabelaBody = getTabelaBody();
            if (!tabelaBody) {
                console.error(
                    '[FG] tbody não encontrado — abortando renderização',
                    dados
                );
                return;
            }

            tabelaBody.innerHTML = ''; // limpa antes

            if (!dados.content || dados.content.length === 0) {
                tabelaBody.innerHTML =
                    '<tr><td colspan="7" class="text-center">Nenhuma nota encontrada.</td></tr>';
                return;
            }

            dados.content.forEach((nota) => {
                const linha = document.createElement('tr');

                // Formatando valores
                const valorFormatado = nota.valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                });

                const dataFormatada = new Date(nota.dataRecebimento).toLocaleDateString(
                    'pt-BR'
                );

                /*     linha.innerHTML = `
            <td>${nota.codigoNf}</td>
            <td>${nota.nomeFornecedor}</td>
            <td>${nota.cnpjFornecedor}</td>
            <td>${nota.emailUsuario}</td>
            <td>${dataFormatada}</td>
            <td>${valorFormatado}</td>
            <td>
                <button class="btn btn-sm btn-danger me-1 btn-excluir" type="button">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
            `;
            */

                linha.innerHTML = `
            <td>${nota.codigoNf}</td>
            <td>${nota.nomeFornecedor}</td>
            <td>${nota.cnpjFornecedor}</td>
            <td>${nota.emailUsuario}</td>
            <td>${dataFormatada}</td>
            <td>${valorFormatado}</td>
            <td>
            <div class="dropdown" style="position: relative;">
                <button class="btn btn-sm btn-secondary dropdown-toggle" type="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-v"></i> <!-- ícone de "mais opções" -->
                Ações
                </button>
                <ul class="dropdown-menu dropdown-menu-auto">
                <li>
                    <a class="dropdown-item btn-excluir" href="#">
                    <i class="fas fa-trash"></i> Excluir
                    </a>
                </li>
                <li>
                    <a class="dropdown-item btn-ver-itens" href="#">
                    <i class="fas fa-list"></i> Ver Itens
                    </a>
                </li>
                </ul>
            </div>
            </td>
        `;

                tabelaBody.appendChild(linha);
            });
        }

        function atualizarPaginacao(dados) {
            const paginacaoDiv =
                document.getElementById('paginacao') || document.createElement('div');
            paginacaoDiv.id = 'paginacao';
            paginacaoDiv.className = 'd-flex justify-content-center mt-3';

            paginacaoDiv.innerHTML = `
        <button id="btnAnterior" class="btn btn-secondary me-2" ${
            dados.first ? 'disabled' : ''
        }>Anterior</button>
        <span class="align-self-center">Página ${dados.pageNumber + 1} de ${
                dados.totalPages
            }</span>
        <button id="btnProxima" class="btn btn-secondary ms-2" ${
            dados.last ? 'disabled' : ''
        }>Próxima</button>
    `;

            //document.querySelector('.table-container').appendChild(paginacaoDiv);
            const container = document.getElementById('paginacao-container');
            container.innerHTML = ''; // limpa elementos antigos
            container.appendChild(paginacaoDiv);

            document.getElementById('btnAnterior').addEventListener('click', () => {
                if (paginaAtual > 0) {
                    // evita ir para negativo
                    buscarNotas(paginaAtual - 1);
                }
            });

            document.getElementById('btnProxima').addEventListener('click', () => {
                if (!dados.last) {
                    buscarNotas(paginaAtual + 1);
                }
            });
        }
        return {
            init: configurarEventos,
        };
    })();
})();
