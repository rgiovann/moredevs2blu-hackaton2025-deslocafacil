(function () {
    'use strict';

    window.FiberGuardian = window.FiberGuardian || {};

    // ----------------------------------------------------------------------
    // 1. VARIÁVEIS DE CONTROLE E CONSTANTES
    // ----------------------------------------------------------------------
    const URL_CONSULTA_LAUDOS = '/api/laboratorios/paged';
    const STATUS_REPROVADO = 'REPROVADO';
    const COLSPAN_COUNT = 6;

    let paginaAtual = 0;
    const tamanhoPagina = 20;

    const resultadosTableBody = document.getElementById('resultadosTableBody');
    const paginacaoContainer = document.getElementById('paginacao-container');
    const btnSair = document.getElementById('btnSair'); // Referência ao botão Sair

    // ----------------------------------------------------------------------
    // 2. FUNÇÕES AUXILIARES
    // ----------------------------------------------------------------------

    /**
     * @async
     * Obtém o token CSRF e monta o cabeçalho para as requisições.
     */
    async function obterHeadersComCsrf() {
        const csrf = await FiberGuardian.Utils.obterTokenCsrf();
        if (!csrf) {
            FiberGuardian.Utils.exibirMensagemModal(
                'Erro: Token CSRF não encontrado.',
                'danger'
            );
            throw new Error('CSRF Token missing');
        }
        return {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': csrf,
        };
    }

    /**
     * Escape básico para evitar XSS ao injetar texto em innerHTML.
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str.toString().replace(
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

    /**
     * Função para gerar o HTML da badge de status.
     */
    function badgeStatusHtml(statusRaw) {
        const raw = (statusRaw ?? '').toString().trim();
        if (!raw) return '';

        const s = raw.toUpperCase();
        const cls = s === STATUS_REPROVADO ? 'bg-danger' : 'bg-secondary';

        return `<span class="badge ${cls}">${escapeHtml(raw)}</span>`;
    }

    // ----------------------------------------------------------------------
    // 3. FUNÇÕES PRINCIPAIS DE CONSULTA E RENDERIZAÇÃO
    // ----------------------------------------------------------------------

    /**
     * @async
     * Função principal de busca de laudos reprovados com paginação.
     * @param {number} pagina - O número da página a ser carregada (base 0).
     */
    async function carregarTestesReprovados(pagina = paginaAtual) {
        if (!resultadosTableBody) return;
        resultadosTableBody.innerHTML = `<tr><td colspan="${COLSPAN_COUNT}">Buscando testes reprovados...</td></tr>`;

        try {
            const headers = await obterHeadersComCsrf();

            const url = new URL(URL_CONSULTA_LAUDOS, window.location.origin);
            url.searchParams.append('page', pagina);
            url.searchParams.append('size', tamanhoPagina);
            url.searchParams.append('status', STATUS_REPROVADO);

            const resposta = await fetch(url.toString(), {
                method: 'GET',
                headers: headers,
                credentials: 'include',
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                const testes = dados.content || [];

                // ATUALIZA A PÁGINA APÓS SUCESSO
                paginaAtual = pagina;

                renderizarTabela(testes);
                atualizarPaginacao(dados);
            } else if (resposta.status === 403) {
                FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                renderizarTabela([]);
            } else {
                // Tratamento de erro que utiliza o modal de mensagem genérico
                await FiberGuardian.Utils.tratarErroFetch(
                    resposta,
                    document.getElementById('resultadosContainer')
                );
                renderizarTabela([]);
            }
        } catch (erro) {
            if (erro.message !== 'CSRF Token missing') {
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao buscar laudos reprovados.',
                    null,
                    erro
                );
            }
            if (resultadosTableBody) {
                resultadosTableBody.innerHTML = `<tr><td colspan="${COLSPAN_COUNT}" class="text-center text-danger">Falha ao carregar testes.</td></tr>`;
            }
        }
    }

    /**
     * Renderiza o HTML dos botões de paginação.
     */
    function atualizarPaginacao(dados) {
        if (!paginacaoContainer) return;

        if (dados.totalPages <= 1) {
            paginacaoContainer.innerHTML = '';
            return;
        }

        paginacaoContainer.innerHTML = `
            <div id="paginacao" class="d-flex justify-content-center mt-3">
                <button id="btnAnterior" class="btn btn-secondary me-2" ${
                    dados.first ? 'disabled' : ''
                }>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="align-self-center">Página ${dados.pageNumber + 1} de ${
            dados.totalPages
        }</span>
                <button id="btnProxima" class="btn btn-secondary ms-2" ${
                    dados.last ? 'disabled' : ''
                }>
                    Próxima <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        document.getElementById('btnAnterior')?.addEventListener('click', () => {
            if (paginaAtual > 0) {
                carregarTestesReprovados(paginaAtual - 1);
            }
        });

        document.getElementById('btnProxima')?.addEventListener('click', () => {
            if (!dados.last) {
                carregarTestesReprovados(paginaAtual + 1);
            }
        });
    }

    /**
     * Renderiza as linhas na tabela com os dados dos laudos.
     */
    function renderizarTabela(laudos) {
        if (!resultadosTableBody) return;
        resultadosTableBody.innerHTML = '';

        if (!laudos || laudos.length === 0) {
            resultadosTableBody.innerHTML = `<tr><td colspan="${COLSPAN_COUNT}">Nenhum teste reprovado encontrado.</td></tr>`;
            return;
        }

        laudos.forEach((teste) => {
            const row = document.createElement('tr');
            const id = teste.id || teste.laboratorioId;

            row.dataset.id = id;

            // Formatando data
            const dataTeste = teste.dataRealizacao
                ? new Date(teste.dataRealizacao + 'T00:00:00').toLocaleDateString(
                      'pt-BR'
                  )
                : '';

            row.innerHTML = `
                <td class="align-middle">${escapeHtml(dataTeste)}</td>
                <td class="align-middle">${escapeHtml(
                    teste.empresa || teste.fornecedor?.nome || ''
                )}</td>
                <td class="align-middle">${escapeHtml(
                    teste.numeroNf || teste.notaFiscal?.numero || ''
                )}</td>
                <td class="align-middle">${escapeHtml(
                    teste.codigoProduto || teste.produto?.codigo || ''
                )}</td>
                <td class="align-middle">${badgeStatusHtml(teste.status)}</td>
                <td class="actions-col">
                    <div class="dropdown" style="position: relative;">
                        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-ellipsis-v"></i> Ações
                        </button>
                        <ul class="dropdown-menu dropdown-menu-auto">
                            <li><a class="dropdown-item btn-gerar-pdf" href="#"><i class="fas fa-file-pdf"></i> Baixar PDF</a></li>
                            <li><a class="dropdown-item btn-excluir" href="#"><i class="fas fa-trash"></i> Excluir</a></li>
                            <li class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item btn-abrir-ocorrencia" href="#" data-id="${id}">
                                <i class="fas fa-wrench"></i> Abrir Ocorrência Eng.
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            `;
            resultadosTableBody.appendChild(row);
        });
    }

    /**
     * Função que chama o Core para carregar a página de parecer.
     */
    function abrirOcorrenciaEngenharia(laboratorioId) {
        if (
            window.FiberGuardian &&
            FiberGuardian.Core &&
            FiberGuardian.Core.carregarPagina
        ) {
            FiberGuardian.Core.carregarPagina(
                `tela_cadastro_parecer_engenharia.html?id=${laboratorioId}`
            );
        } else {
            console.error('Core não disponível. Redirecionamento completo será usado.');
            window.location.href = `tela_cadastro_parecer_engenharia.html?id=${laboratorioId}`;
        }
    }

    // ----------------------------------------------------------------------
    // 4. LÓGICA DO BOTÃO SAIR COM CONFIRMAÇÃO (REPLICADA)
    // ----------------------------------------------------------------------

    /**
     * Configura o botão Sair para voltar para o menu principal.
     */
    function configurarBotaoSair() {
        if (btnSair) {
            btnSair.addEventListener('click', async () => {
                // Usa FiberGuardian.Utils.confirmarAcaoAsync para exibir o modal de confirmação
                const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                    'Deseja realmente voltar ao Menu Principal?',
                    'Sair da Consulta'
                );
                if (confirmado) {
                    // Se confirmado, chama a função de navegação do Core/Utils
                    FiberGuardian.Utils.voltarMenuPrincipal();
                }
            });
        }
    }

    // ----------------------------------------------------------------------
    // 5. CONFIGURAÇÃO DE EVENTOS E INICIALIZAÇÃO
    // ----------------------------------------------------------------------

    function configurarEventos() {
        // 1. Carrega a primeira página de testes reprovados
        carregarTestesReprovados(0);

        // 2. Configura o evento do botão Sair (com confirmação via modal)
        configurarBotaoSair();

        // 3. Eventos de Ação na Tabela (Abrir Ocorrência, etc.)
        if (resultadosTableBody) {
            resultadosTableBody.addEventListener('click', async (e) => {
                const btnAbrirOcorrencia = e.target.closest('.btn-abrir-ocorrencia');

                if (btnAbrirOcorrencia) {
                    e.preventDefault();
                    const laboratorioId = btnAbrirOcorrencia.dataset.id;
                    abrirOcorrenciaEngenharia(laboratorioId);
                }

                // Outras ações (PDF, Excluir) devem ser implementadas aqui, se necessário.
            });
        }
    }

    FiberGuardian.TelaConsultaTestesReprovados = (function () {
        return {
            init: configurarEventos,
        };
    })();

    document.addEventListener('DOMContentLoaded', function () {
        // Inicializa o módulo se o Core estiver carregado
        if (
            window.FiberGuardian &&
            FiberGuardian.TelaConsultaTestesReprovados &&
            typeof FiberGuardian.TelaConsultaTestesReprovados.init === 'function'
        ) {
            FiberGuardian.TelaConsultaTestesReprovados.init();
        } else {
            console.error(
                'Módulo [TelaConsultaTestesReprovados] não encontrado. Verifique se fiberguardian_core.js foi carregado corretamente.'
            );
        }
    });
})();
