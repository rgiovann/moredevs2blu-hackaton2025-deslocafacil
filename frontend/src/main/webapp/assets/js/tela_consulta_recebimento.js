(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaConsultaRecebimento = (function () {
        // Variáveis globais dentro do escopo do módulo FiberGuardian.TelaCadastroRecebimento
        //  (não vaza para window).
        let emailUsuario = null;

        const formPesquisa = document.getElementById('formPesquisa');

        let paginaAtual = 0;
        const tamanhoPagina = 20;

        // helper no topo do módulo
        function getTabelaBody() {
            return document.querySelector('.table-container table tbody');
        }

        function configurarEventos() {
            try {
                emailUsuario = null;
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
                    const btnVerMapa = e.target.closest('.btn-ver-mapa');
                    const btnExcluir = e.target.closest('.btn-excluir');

                    // evita logs/fluxos desnecessários para outros clicks
                    if (!btnVerMapa && !btnExcluir) return;

                    if (btnVerMapa) {
                        const linha = btnVerMapa.closest('tr');
                        const codigoNf = linha.children[0].textContent.trim();
                        const cnpjColaborador = linha.children[2].textContent.trim();

                        const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                            `Deseja realmente excluir o deslocamento ${codigoNf}?`,
                            'Confirmação de Exclusão'
                        );

                        if (!confirmado) return;

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();

                            const resposta = await fetch(
                                `/api/deslocamentos/${cnpjColaborador}/${codigoNf}`,
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
                                    `Deslocamento ${codigoNf} excluída com sucesso.`,
                                    'success'
                                );
                                buscarNotas(paginaAtual);
                            } else {
                                await FiberGuardian.Utils.tratarErroFetch(resposta);
                            }
                        } catch (erro) {
                            console.error('Erro ao excluir deslocamento:', erro);
                            FiberGuardian.Utils.exibirErroDeRede(
                                'Erro de rede ao excluir o deslocamento.',
                                null,
                                erro
                            );
                        }
                    }

                    if (btnExcluir) {
                        const linha = btnExcluir.closest('tr');
                        const codigoNf = linha.children[0].textContent.trim();
                        const cnpjColaborador = linha.children[2].textContent.trim();

                        console.log('[FG] Código NF : ' + codigoNf);
                        console.log('[FG] CNPJ : ' + cnpjColaborador);

                        try {
                            const csrfToken =
                                await FiberGuardian.Utils.obterTokenCsrf();
                            const response = await fetch(
                                `/api/item-notas-fiscais/list/${cnpjColaborador}/${codigoNf}`,
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

                console.log('Módulo Tela Pesquisa Deslocamento inicializado.');

                const inputColaborador = document.getElementById('colaborador');
                const btnBuscarColaborador =
                    document.getElementById('btnBuscarColaborador');
                const dropdownColaborador =
                    document.getElementById('dropdownColaborador');
                const btnTrocarColaborador =
                    document.getElementById('btnTrocarColaborador');

                let btnSair = document.getElementById('btnSair');
                let btnPesquisarDeslocamento = document.getElementById(
                    'btnPesquisarDeslocamento'
                );
                let btnLimpar = document.getElementById('btnLimpar');

                if (!btnSair || !btnPesquisarDeslocamento || !btnLimpar) {
                    console.error(
                        'Botão Sair, Pesquisar Deslocamento ou Limpar Pesquisa não encontrado!'
                    );
                    return;
                }

                if (
                    !btnBuscarColaborador ||
                    !inputColaborador ||
                    !dropdownColaborador ||
                    !btnTrocarColaborador
                ) {
                    console.error('Elementos da busca de Colaborador não encontrados.');
                    return;
                }

                const dataInicial = document.getElementById('dataInicial');

                FiberGuardian.Utils.fecharQualquerDropdownAberto([inputColaborador]);

                // --- Botão Buscar colaborador
                btnBuscarColaborador.addEventListener('click', async function () {
                    const codigoParcial = inputColaborador.value.trim();

                    // Validação defensiva
                    if (!codigoParcial) {
                        FiberGuardian.Utils.exibirMensagemModalComFoco(
                            'Digite parte do nome para buscar.',
                            'warning',
                            inputColaborador
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
                                        input: inputColaborador,
                                        dropdown: dropdownColaborador,
                                        lista: listaUsuarios,
                                        camposExibir: ['nome', 'email', 'telefone'],
                                        titulosColunas: [
                                            'Usuário',
                                            'Email',
                                            'Telefone',
                                        ],
                                        msgVazio: 'Nenhum usuário encontrado.',
                                    }
                                );
                            // Armazena do objeto recebido o email
                            emailUsuario = item.email;

                            // trava campo Colaborador
                            inputColaborador.readOnly = true;
                            inputColaborador.classList.add('campo-desabilitado');

                            // desabilita botão Buscar
                            btnBuscarColaborador.disabled = true;
                            btnBuscarColaborador.classList.add('campo-desabilitado');

                            // habilita botão Trocar
                            btnTrocarColaborador.disabled = false;
                            btnTrocarColaborador.classList.remove('campo-desabilitado');

                            // evento de trocar
                            btnTrocarColaborador.addEventListener('click', () => {
                                emailUsuario = null;
                                inputColaborador.value = '';
                                inputColaborador.readOnly = false;
                                inputColaborador.classList.remove('campo-desabilitado');

                                btnBuscarColaborador.disabled = false;
                                btnBuscarColaborador.classList.remove(
                                    'campo-desabilitado'
                                );

                                btnTrocarColaborador.disabled = true;
                                btnTrocarColaborador.classList.add(
                                    'campo-desabilitado'
                                );
                            });
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputColaborador
                            );
                        }
                    } catch (erro) {
                        console.error('Erro ao buscar usuários:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao buscar usuários.',
                            inputColaborador,
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
                        dataInicial.focus();
                    }
                });

                btnPesquisarDeslocamento.replaceWith(
                    btnPesquisarDeslocamento.cloneNode(true)
                );
                btnPesquisarDeslocamento = document.getElementById(
                    'btnPesquisarDeslocamento'
                );
                btnPesquisarDeslocamento.addEventListener('click', () =>
                    buscarNotas(0)
                );

                btnLimpar.replaceWith(btnLimpar.cloneNode(true));
                btnLimpar = document.getElementById('btnLimpar');
                /*
                btnLimpar.addEventListener('click', () => {
                    // Zera variáveis globais
                    emailUsuario = null;

                    // Limpa inputs
                    document.getElementById('dataInicial').value = '';
                    document.getElementById('dataFinal').value = '';
                    document.getElementById('colaborador').value = '';
                    document.getElementById('status').value = '';
                    document.getElementById('nrNotaFiscal').value = '';

                    // Reabilita campos que possam ter ficado readonly/disabled
                    document.getElementById('colaborador').readOnly = false;
                    document
                        .getElementById('colaborador')
                        .classList.remove('campo-desabilitado');
                    document.getElementById('btnBuscarColaborador').disabled = false;
                    document.getElementById('btnTrocarColaborador').disabled = true;
                    // Limpa tabela e paginação
                    const tbody = getTabelaBody();
                    if (tbody) tbody.innerHTML = '';
                    document.getElementById('paginacao-container').innerHTML = '';
                });
                */
                btnLimpar.addEventListener('click', () => {
                    try {
                        // 1. Zera variáveis globais do módulo
                        emailUsuario = null;
                        paginaAtual = 0;

                        // 2. Limpa todos os campos do formulário
                        const form = document.getElementById('formPesquisa');
                        if (form) {
                            form.reset(); // método nativo que limpa todos os inputs
                        }

                        // Garantia adicional (caso o reset não pegue algum campo)
                        document.getElementById('dataInicial').value = '';
                        document.getElementById('dataFinal').value = '';
                        document.getElementById('colaborador').value = '';
                        document.getElementById('status').value = '';

                        // 3. Reabilita campos que possam estar travados
                        const inputColaborador = document.getElementById('colaborador');
                        const btnBuscarColaborador =
                            document.getElementById('btnBuscarColaborador');
                        const btnTrocarColaborador =
                            document.getElementById('btnTrocarColaborador');

                        if (inputColaborador) {
                            inputColaborador.readOnly = false;
                            inputColaborador.classList.remove('campo-desabilitado');
                        }

                        if (btnBuscarColaborador) {
                            btnBuscarColaborador.disabled = false;
                            btnBuscarColaborador.classList.remove('campo-desabilitado');
                        }

                        if (btnTrocarColaborador) {
                            btnTrocarColaborador.disabled = true;
                            btnTrocarColaborador.classList.add('campo-desabilitado');
                        }

                        // 4. Limpa a tabela usando o helper existente
                        const tbody = getTabelaBody();
                        if (tbody) {
                            tbody.innerHTML = '';
                        } else {
                            // Fallback: busca diretamente
                            const tbodyFallback = document.querySelector(
                                '.table-container table tbody'
                            );
                            if (tbodyFallback) {
                                tbodyFallback.innerHTML = '';
                            }
                        }

                        // 5. Limpa a paginação
                        const paginacaoContainer =
                            document.getElementById('paginacao-container');
                        if (paginacaoContainer) {
                            paginacaoContainer.innerHTML = '';
                        }

                        // 6. Retorna foco para o primeiro campo
                        const dataInicial = document.getElementById('dataInicial');
                        if (dataInicial) {
                            dataInicial.focus();
                        }

                        console.log('[DF] Pesquisa limpa com sucesso.');
                    } catch (erro) {
                        console.error('[DF] Erro ao limpar pesquisa:', erro);
                        FiberGuardian.Utils.exibirMensagemModal(
                            'Erro ao limpar os campos. Tente novamente.',
                            'error'
                        );
                    }
                });
            } catch (erro) {
                console.error('[DF] erro em configurarEventos:', erro);
            }
        }

        async function buscarNotas(pagina = 0) {
            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                // Captura valores dos filtros
                const dataInicialValor = document.getElementById('dataInicial').value;
                const dataFinalValor = document.getElementById('dataFinal').value;
                //const colaborador = emailUsuario; // já vem do fluxo do colaborador
                const status = document.getElementById('status').value.trim();

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

                console.log('Código Colaborador : ' + emailUsuario);

                // Monta URL com filtros não vazios
                const url = new URL('/api/deslocamentos/paged', window.location.origin);
                url.searchParams.append('page', pagina);
                url.searchParams.append('size', tamanhoPagina);

                if (dataInicialValor)
                    url.searchParams.append('dataini', dataInicialValor);
                if (dataFinalValor) url.searchParams.append('datafim', dataFinalValor);
                if (emailUsuario) url.searchParams.append('emailUsuario', emailUsuario);
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
                    paginaAtual = dados.pageNumber ?? pagina; // depende do teu PageDto
                    atualizarPaginacao(dados);
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(resposta, formPesquisa);
                }
            } catch (erro) {
                console.error('Erro ao buscar deslocamentos:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao buscar deslocamentos.',
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
                    '<tr><td colspan="7" class="text-center">Nenhuma deslocamento encontrado.</td></tr>';
                return;
            }

            dados.content.forEach((deslocamento) => {
                const linha = document.createElement('tr');

                // Formatando valores
                const valorPrevistoFormatado =
                    deslocamento.custoEstimado != null
                        ? deslocamento.custoEstimado.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                          })
                        : '-';

                const valorRealFormatado =
                    deslocamento.custoReal != null
                        ? deslocamento.custoReal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                          })
                        : '-';

                const dataSaidaFormatada = deslocamento.dataSaida
                    ? new Date(deslocamento.dataSaida).toLocaleDateString('pt-BR')
                    : '-';

                const dataChegadaPrevistaFormatada = deslocamento.dataChegadaPrevista
                    ? new Date(deslocamento.dataChegadaPrevista).toLocaleDateString(
                          'pt-BR'
                      )
                    : '-';

                const dataChegadaRealFormatada = deslocamento.dataChegadaReal
                    ? new Date(deslocamento.dataChegadaReal).toLocaleDateString('pt-BR')
                    : '-';

                const origemDestino = `${deslocamento.origemCidade}/${deslocamento.origemEstado} → ${deslocamento.destinoCidade}/${deslocamento.destinoEstado}`;

                linha.innerHTML = `
            <td>${deslocamento.nomeUsuario}</td>
            <td>${origemDestino}</td>
            <td>${deslocamento.status}</td>
            <td>${dataSaidaFormatada}</td>
            <td>${dataChegadaPrevistaFormatada}</td>
            <td>${dataChegadaRealFormatada}</td>
            <td>${valorPrevistoFormatado}</td>
            <td>${valorRealFormatado}</td>
            <td>
            <div class="dropdown" style="position: relative;">
                <button class="btn btn-sm btn-secondary dropdown-toggle" type="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-v"></i> <!-- ícone de "mais opções" -->
                Ações
                </button>
                <ul class="dropdown-menu dropdown-menu-auto">
                <li>
                    <a class="dropdown-item btn-ver-mapa" href="#">
                    <i class="fas fa-map-location-dot"></i> Ver mapa
                    </a>
                </li>
                <li>
                    <a class="dropdown-item btn-excluir" href="#">
                    <i class="fas fa-trash"></i> Excluir
                    </a>
                </li>
                <li>
                    <a class="dropdown-item btn-custo-real" href="#">
                    <i class="fas fa-money-bill-wave"></i> Custo Real
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
