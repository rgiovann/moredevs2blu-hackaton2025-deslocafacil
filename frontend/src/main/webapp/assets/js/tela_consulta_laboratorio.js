(function () {
    window.FiberGuardian = window.FiberGuardian || {};
    // Variáveis globais dentro do escopo do módulo FiberGuardian.TelaCadastroRecebimento
    //  (não vaza para window).
    let cnpjFornecedorSelecionado = null;
    //let codigoProdutoSelecionado = null;
    let codigoNotFiscalSelecionada = null;
    let emailUsuarioSelecionado = null;

    const formPesquisa = document.getElementById('formPesquisa');

    let paginaAtual = 0;
    const tamanhoPagina = 20;

    FiberGuardian.TelaConsultaLaboratorio = (function () {
        // helper no topo do módulo
        function getTabelaBody() {
            return document.querySelector('.table-container table tbody');
        }

        // Gera o HTML da badge de status com fallback seguro
        function badgeStatusHtml(statusRaw) {
            const raw = (statusRaw ?? '').toString().trim();
            if (!raw) return ''; // sem status -> célula vazia (mantém comportamento atual)

            const s = raw.toUpperCase();
            const cls =
                s === 'APROVADO'
                    ? 'bg-success'
                    : s === 'REPROVADO'
                    ? 'bg-danger'
                    : 'bg-secondary'; // fallback neutro p/ valores inesperados

            // Escape para evitar XSS (OWASP: output encoding)
            return `<span class="badge ${cls}">${escapeHtml(raw)}</span>`;
        }

        // Escape básico para texto injetado em innerHTML
        function escapeHtml(str) {
            return str.replace(
                /[&<>"']/g,
                (m) =>
                    ({
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;',
                    }[m])
            );
        }

        function configurarEventos() {
            try {
                cnpjFornecedorSelecionado = null;
                //codigoProdutoSelecionado = null;
                codigoNotFiscalSelecionada = null;
                emailUsuarioSelecionado = null;
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
                    const btnGerarPdf = e.target.closest('.btn-gerar-pdf');

                    // evita logs/fluxos desnecessários para outros clicks
                    if (!btnExcluir && !btnGerarPdf) return;

                    if (btnExcluir) {
                        const linha = btnExcluir.closest('tr');
                        const laboratorioId = linha.dataset.id;
                        const codigoNf = linha.children[0].textContent.trim();
                        const codigoProduto = linha.children[3].textContent.trim();

                        const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                            `Deseja realmente excluir o teste de laboratorio relativo a Nota
                            Fiscal ${codigoNf} produto ${codigoProduto} ?`,
                            'Confirmação de Exclusão'
                        );

                        if (!confirmado) return;

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();

                            const resposta = await fetch(
                                `/api/laboratorios/${laboratorioId}`,
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
                                    `Teste de laboratório excluído com sucesso.`,
                                    'success'
                                );
                                buscarLaudos(paginaAtual);
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
                    if (btnGerarPdf) {
                        const linha = btnGerarPdf.closest('tr');
                        const laboratorioId = linha.dataset.id;

                        // pegar a data da célula da tabela (assumindo DD/MM/YY)
                        // O LocalDate do Java espera, por padrão, o formato ISO-8601 yyyy-MM-dd
                        const dataRaw = linha.children[7]?.textContent.trim() ?? '';
                        const [dia, mes, ano] = dataRaw.split('/');
                        const dataFormatada = `20${ano}-${mes}-${dia}`; // 20 + YY para gerar YYYY

                        const jsonBody = {
                            numeroNf: linha.children[0]?.textContent.trim() ?? '',
                            cnpj: linha.children[1]?.textContent.trim() ?? '',
                            empresa: linha.children[2]?.textContent.trim() ?? '',
                            codigoProduto: linha.children[3]?.textContent.trim() ?? '',
                            descricao: linha.children[4]?.textContent.trim() ?? '',
                            numeroLote: linha.children[5]?.textContent.trim() ?? '',
                            emailEmitidoPor:
                                linha.children[6]?.textContent.trim() ?? '',
                            dataRealizacaoNaFormatado: dataFormatada, //
                            observacoes: linha.children[8]?.textContent.trim() ?? '',
                            status: linha.children[9]?.textContent.trim() ?? '',
                        };

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();

                            const resposta = await fetch(
                                `/api/laboratorios/pdf/${laboratorioId}`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-XSRF-TOKEN': csrfToken,
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify(jsonBody),
                                }
                            );

                            if (resposta.ok) {
                                const blob = await resposta.blob(); // recebe o PDF como Blob
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `Laudo_${jsonBody.cnpj}_${jsonBody.numeroNf}.pdf`; // nome do arquivo para download
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                            } else {
                                await FiberGuardian.Utils.tratarErroFetch(resposta);
                            }
                        } catch (erro) {
                            console.error('Erro ao gerar PDF:', erro);
                            FiberGuardian.Utils.exibirErroDeRede(
                                'Erro de rede ao gerar o PDF.',
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

                const inputEmitidoPor = document.getElementById('recebidoPor');
                const btnBuscarEmitidoPor =
                    document.getElementById('btnBuscarRecebidoPor');
                const dropdownEmitidoPor =
                    document.getElementById('dropdownRecebidoPor');
                const btnTrocarEmitidoPor =
                    document.getElementById('btnTrocarRecebidoPor');

                let btnSair = document.getElementById('btnSair');
                let btnConsultarLaudo = document.getElementById('btnConsultarLaudo');
                let btnLimpar = document.getElementById('btnLimpar');

                if (!btnSair || !btnConsultarLaudo || !btnLimpar) {
                    console.error(
                        'Botão Sair, Pesquisar Nota Fiscal ou Limpar Pesquisa não encontrado!'
                    );
                    return;
                }

                if (
                    !btnBuscarEmitidoPor ||
                    !inputEmitidoPor ||
                    !dropdownEmitidoPor ||
                    !btnTrocarEmitidoPor
                ) {
                    console.error('Elementos da busca de Usuário não encontrados.');
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
                    !btnBuscarNrNotaFiscal ||
                    !inputNrNotFiscal ||
                    !dropdownNrNotaFiscal
                ) {
                    console.error('Elementos da busca de Nota Fiscal não encontrados.');
                    return;
                }

                const dataInicial = document.getElementById('dataInicial');

                FiberGuardian.Utils.fecharQualquerDropdownAberto(
                    [dropdownFornecedor, dropdownNrNotaFiscal, dropdownEmitidoPor],
                    [inputFornecedor, inputNrNotFiscal, inputEmitidoPor],
                    [btnBuscarFornecedor, btnBuscarNrNotaFiscal, btnBuscarEmitidoPor]
                );

                btnBuscarEmitidoPor.addEventListener('click', async function () {
                    const codigoParcial = inputEmitidoPor.value.trim();

                    // Validação defensiva
                    if (!codigoParcial) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'Digite parte do nome do usário para buscar.',
                            'warning',
                            inputFornecedor
                        );
                        return;
                    }
                    // Monta a URL com PathVariable para o CNPJ e query param para codigo_nf
                    const url = new URL(
                        `/api/usuarios/lista-usuario-por-role`,
                        window.location.origin
                    );

                    url.searchParams.append('nome', codigoParcial);

                    // adiciona o filtro de role (sempre em caixa alta)
                    if (FiberGuardian?.UsuarioLogado?.role) {
                        url.searchParams.append(
                            'role',
                            FiberGuardian.UsuarioLogado.role.toUpperCase()
                        );
                    }

                    try {
                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        const resposta = await fetch(url.toString(), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-XSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                        });

                        if (resposta.ok) {
                            const listaUsuarios = await resposta.json();

                            const { index, item } =
                                await FiberGuardian.Utils.renderizarDropdownGenericoAsync(
                                    {
                                        input: inputEmitidoPor,
                                        dropdown: dropdownEmitidoPor,
                                        lista: listaUsuarios,
                                        camposExibir: [
                                            'nome',
                                            'email',
                                            'setor',
                                            'turno',
                                        ],
                                        titulosColunas: [
                                            'Usuário',
                                            'Email',
                                            'Setor',
                                            'Turno',
                                        ],
                                        msgVazio: 'Nenhum usuário encontrado.',
                                    }
                                );

                            emailUsuarioSelecionado = item.email;
                            // trava campo fornecedor
                            inputEmitidoPor.readOnly = true;
                            inputEmitidoPor.classList.add('campo-desabilitado');

                            // desabilita botão Buscar
                            btnBuscarEmitidoPor.disabled = true;
                            btnBuscarEmitidoPor.classList.add('campo-desabilitado');

                            // habilita botão Trocar
                            btnTrocarEmitidoPor.disabled = false;
                            btnTrocarEmitidoPor.classList.remove('campo-desabilitado');

                            // Quando clicar em "Trocar fornecedor"
                            btnTrocarEmitidoPor.addEventListener('click', () => {
                                emailUsuarioSelecionado = null;
                                inputEmitidoPor.value = '';
                                inputEmitidoPor.readOnly = false;
                                inputEmitidoPor.classList.remove('campo-desabilitado');

                                btnBuscarEmitidoPor.disabled = false;
                                btnBuscarEmitidoPor.classList.remove(
                                    'campo-desabilitado'
                                );

                                btnTrocarEmitidoPor.disabled = true;
                                btnTrocarEmitidoPor.classList.add('campo-desabilitado');
                            });
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputEmitidoPor
                            );
                        }
                    } catch (erro) {
                        console.error('Erro ao buscar fornecedores:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao buscar fornecedores.',
                            inputEmitidoPor,
                            erro
                        );
                    }
                });

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
                            codigoNotFiscalSelecionada = item.codigoNf;
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

                btnConsultarLaudo.replaceWith(btnConsultarLaudo.cloneNode(true));
                btnConsultarLaudo = document.getElementById('btnConsultarLaudo');
                btnConsultarLaudo.addEventListener('click', () => buscarLaudos(0));

                btnLimpar.replaceWith(btnLimpar.cloneNode(true));
                btnLimpar = document.getElementById('btnLimpar');

                btnLimpar.addEventListener('click', () => {
                    cnpjFornecedorSelecionado = null;
                    codigoNotFiscalSelecionada = null;
                    emailUsuarioSelecionado = null;

                    document.getElementById('dataInicial').value = '';
                    document.getElementById('dataFinal').value = '';
                    document.getElementById('fornecedor').value = '';
                    document.getElementById('nrNotaFiscal').value = '';

                    // Reabilita campos que possam ter ficado readonly/disabled
                    document.getElementById('fornecedor').readOnly = false;
                    document
                        .getElementById('fornecedor')
                        .classList.remove('campo-desabilitado');
                    document.getElementById('btnBuscarFornecedor').disabled = false;
                    document.getElementById('btnTrocarFornecedor').disabled = true;

                    // Limpa tabela e paginação
                    const tbody = getTabelaBody();
                    if (tbody) tbody.innerHTML = '';
                    document.getElementById('paginacao-container').innerHTML = '';
                });
            } catch (erro) {
                console.error('[FG] erro em configurarEventos:', erro);
            }
        }

        async function buscarLaudos(pagina = 0) {
            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                const dataInicialValor = document.getElementById('dataInicial').value;
                const dataFinalValor = document.getElementById('dataFinal').value;
                const notafiscal = codigoNotFiscalSelecionada ?? '';
                const fornecedor = cnpjFornecedorSelecionado ?? '';
                const email = emailUsuarioSelecionado ?? '';
                const status = document.getElementById('status').value;

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

                // Monta URL com filtros
                const url = new URL('/api/laboratorios/paged', window.location.origin);
                url.searchParams.append('page', pagina ?? 0);
                url.searchParams.append('size', tamanhoPagina ?? 20);

                if (dataInicialValor)
                    url.searchParams.append('dataini', dataInicialValor);
                if (dataFinalValor) url.searchParams.append('datafim', dataFinalValor);
                if (notafiscal) url.searchParams.append('notafiscal', notafiscal);
                if (fornecedor) url.searchParams.append('cnpj', fornecedor);
                if (email) url.searchParams.append('email', email);
                if (status) url.searchParams.append('status', status);

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
                    paginaAtual = dados.pageNumber ?? pagina;
                    atualizarPaginacao(dados);
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(resposta, formPesquisa);
                }
            } catch (erro) {
                console.error('Erro ao buscar laudos:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao buscar laudos.',
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
                    '<tr><td colspan="11" class="text-center">Nenhum laudo encontrado.</td></tr>';
                return;
            }

            dados.content.forEach((lab) => {
                const linha = document.createElement('tr');
                linha.dataset.id = lab.id;

                // dataRealizacao em (dd-mm-yy)
                const dataFormatada = lab.dataRealizacao
                    ? new Date(lab.dataRealizacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                      })
                    : '';

                linha.innerHTML = `
            <td style="max-width:80px;">${escapeHtml(lab.numeroNf ?? '')}</td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:60px;" title="${escapeHtml(
                lab.cnpj ?? ''
            )}" aria-label="${escapeHtml(lab.cnpj ?? '')}">
                ${escapeHtml(lab.cnpj ?? '')}
            </div>
            </td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:90px;" title="${escapeHtml(
                lab.empresa ?? ''
            )}" aria-label="${escapeHtml(lab.empresa ?? '')}">
                ${escapeHtml(lab.empresa ?? '')}
            </div>
            </td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:60px;" title="${escapeHtml(
                lab.codigoProduto ?? ''
            )}" aria-label="${escapeHtml(lab.codigoProduto ?? '')}">
                ${escapeHtml(lab.codigoProduto ?? '')}
            </div>
            </td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:90px;" title="${escapeHtml(
                lab.descricao ?? ''
            )}" aria-label="${escapeHtml(lab.descricao ?? '')}">
                ${escapeHtml(lab.descricao ?? '')}
            </div>
            </td>
            <td style="max-width:120px;">${escapeHtml(lab.numeroLote ?? '')}</td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:120px;" title="${escapeHtml(
                lab.emailEmitidoPor ?? ''
            )}" aria-label="${escapeHtml(lab.emailEmitidoPor ?? '')}">
                ${escapeHtml(lab.emailEmitidoPor ?? '')}
            </div>
            </td>
            <td style="max-width:120px;">${escapeHtml(dataFormatada ?? '')}</td>
            <td class="align-middle">
            <div class="text-truncate" style="max-width:130px;" title="${escapeHtml(
                lab.observacoes ?? ''
            )}" aria-label="${escapeHtml(lab.observacoes ?? '')}">
                ${escapeHtml(lab.observacoes ?? '')}
            </div>
            </td>
            <td style="max-width:90px;" class="text-center">${badgeStatusHtml(
                lab.status
            )}</td>
            <td class="actions-col">
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
                    <a class="dropdown-item btn-gerar-pdf" href="#">
                    <i class="fas fa-file-pdf"></i> Baixar PDF
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

            const container = document.getElementById('paginacao-container');
            container.innerHTML = '';
            container.appendChild(paginacaoDiv);

            document.getElementById('btnAnterior').addEventListener('click', () => {
                if (paginaAtual > 0) {
                    buscarLaudos(paginaAtual - 1);
                }
            });

            document.getElementById('btnProxima').addEventListener('click', () => {
                if (!dados.last) {
                    buscarLaudos(paginaAtual + 1);
                }
            });
        }

        return {
            init: configurarEventos,
        };
    })();
})();
