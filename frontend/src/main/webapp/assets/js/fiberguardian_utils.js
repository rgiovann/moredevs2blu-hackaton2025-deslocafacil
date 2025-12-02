(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.Utils = (function () {
        'use strict';
        console.log('FiberGuardian.Utils carregado com sucesso.');

        function getCookie(nome) {
            const cookies = document.cookie.split('; ');
            for (const cookie of cookies) {
                const [chave, valor] = cookie.split('=');
                if (chave === nome) {
                    return decodeURIComponent(valor);
                }
            }
            return null;
        }

        async function obterNovoToken() {
            const resposta = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'include',
            });

            if (resposta.status >= 500) {
                throw new Error(
                    `HTTP ${resposta.status} - O sistema está temporariamente fora do ar.`
                );
            }
            if (!resposta.ok) {
                throw new Error(`Erro ao obter token CSRF : HTTP ${resposta.status}`);
            }

            const dados = await resposta.json();
            if (!dados.token) {
                throw new Error('Token CSRF não retornado pelo servidor.');
            }

            return dados.token;
        }

        async function obterTokenCsrf() {
            const tokenExistente = getCookie('XSRF-TOKEN');
            return tokenExistente || (await obterNovoToken());
        }

        function obterCampo(form, nomeCampo) {
            return form.querySelector(`[name="${nomeCampo}"]`);
        }

        function exibirMensagemSessaoExpirada() {
            exibirMensagemModal(
                'Acesso negado. Sua sessão expirou ou você não tem permissão.. Por favor, faça login novamente.',
                'danger'
            );
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }

        function exibirErroDeRede(
            mensagemPersonalizada,
            campoFoco = null,
            erroOriginal = null
        ) {
            const msgDetalhado =
                erroOriginal instanceof Error
                    ? `${mensagemPersonalizada} : ${erroOriginal.message}`
                    : mensagemPersonalizada;

            exibirMensagemModalComFoco(msgDetalhado, 'danger', campoFoco);
        }

        function exibirMensagemModal(mensagemOuConfig, tipo = 'info,', titulo = null) {
            const modalEl = document.getElementById('modalMensagemSistema');
            if (!modalEl) return;

            const dialogEl = modalEl.querySelector('.modal-dialog');
            if (!dialogEl) return;

            // Resetar classes para evitar acúmulo
            dialogEl.className = 'modal-dialog';

            let mensagem = '';
            let usarHtml = false;
            let tamanho = null;

            if (typeof mensagemOuConfig === 'object') {
                if (mensagemOuConfig.html) {
                    mensagem = mensagemOuConfig.html;
                    usarHtml = true;
                } else {
                    mensagem = mensagemOuConfig.texto || '';
                }
                tamanho = mensagemOuConfig.tamanho || null; // 👈 novo
            } else {
                mensagem = mensagemOuConfig;
            }

            // aplica tamanho dinamicamente
            if (tamanho === 'lg') {
                dialogEl.classList.add('modal-lg');
            } else if (tamanho === 'xl') {
                dialogEl.classList.add('modal-xl');
            }

            const tituloEl = modalEl.querySelector('.modal-title');
            if (tituloEl) {
                // se não passar título, mantém o que já existe no HTML ("Aviso")
                tituloEl.textContent = titulo || tituloEl.textContent;
            }

            const bodyEl = modalEl.querySelector('.modal-body');
            if (usarHtml) {
                bodyEl.innerHTML = mensagem;
            } else {
                bodyEl.textContent = mensagem;
            }

            // título/cores do modal
            const headerEl = modalEl.querySelector('.modal-header');
            if (headerEl) {
                headerEl.className = 'modal-header';
                const tipoCor = {
                    danger: 'bg-danger text-white',
                    warning: 'bg-warning text-dark',
                    success: 'bg-success text-white',
                    info: 'bg-info text-white',
                    primary: 'bg-primary text-white',
                };
                headerEl.className += ' ' + (tipoCor[tipo] || 'bg-warning text-dark');
            }

            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }

        /*
        function exibirMensagemModal(mensagem, tipo = 'info') {
            const modalEl = document.getElementById('modalMensagemSistema');
            if (!modalEl) return;

            const tituloEl = modalEl.querySelector('.modal-title');
            const corpoEl = modalEl.querySelector('.modal-body');

            if (tituloEl) tituloEl.textContent = 'Aviso';

            if (corpoEl) {
                if (typeof mensagem === 'object' && mensagem.html) {
                    // Novo modo: recebe HTML pronto
                    corpoEl.innerHTML = mensagem.html;
                } else {
                    // Modo antigo: texto simples
                    corpoEl.innerHTML = mensagem;
                }
            }

            const headerEl = modalEl.querySelector('.modal-header');
            if (headerEl) {
                headerEl.className = 'modal-header';
                const tipoCor = {
                    danger: 'bg-danger text-white',
                    warning: 'bg-warning text-dark',
                    success: 'bg-success text-white',
                    info: 'bg-info text-white',
                    primary: 'bg-primary text-white',
                };
                headerEl.className += ' ' + (tipoCor[tipo] || 'bg-warning text-dark');
            }

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }


        function exibirMensagemModal(mensagem, tipo = 'info') {
            const modalEl = document.getElementById('modalMensagemSistema');
            if (!modalEl) return;

            const tituloEl = modalEl.querySelector('.modal-title');
            const corpoEl = modalEl.querySelector('.modal-body');

            if (tituloEl) tituloEl.textContent = 'Aviso';
            //if (corpoEl) corpoEl.textContent = mensagem;  //corpoEl.innerHTML = mensagem;
            // insiro mensagem com tag html para quebra de linha <br> por isso
            // preciso usar innerHTML
            if (corpoEl) corpoEl.innerHTML = mensagem;

            const headerEl = modalEl.querySelector('.modal-header');
            if (headerEl) {
                headerEl.className = 'modal-header';
                const tipoCor = {
                    danger: 'bg-danger text-white',
                    warning: 'bg-warning text-dark',
                    success: 'bg-success text-white',
                    info: 'bg-info text-white',
                    primary: 'bg-primary text-white',
                };
                headerEl.className += ' ' + (tipoCor[tipo] || 'bg-warning text-dark');
            }

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
        */

        function escapeHTML(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function exibirMensagemModalComFoco(mensagem, tipo, campoAlvo) {
            if (!mensagem || !campoAlvo) return;

            const modalEl = document.getElementById('modalMensagemSistema');
            if (!modalEl) {
                console.warn('Modal de mensagem não encontrado.');
                return;
            }

            function handler() {
                campoAlvo.focus();
                modalEl.removeEventListener('hidden.bs.modal', handler);
            }

            modalEl.addEventListener('hidden.bs.modal', handler);

            FiberGuardian.Utils.exibirMensagemModal(mensagem, tipo);
        }

        // async function tratarErroFetch(resposta, titulo = 'Erro', campoAlvo = null) {
        async function tratarErroFetch(resposta, campoAlvo = null) {
            let mensagem = 'Erro inesperado ao processar a requisição.';
            console.groupCollapsed(`↪️ tratarErroFetch: status ${resposta.status}`);

            try {
                const contentType = resposta.headers.get('Content-Type') || '';
                console.log('📦 Content-Type:', contentType);

                if (contentType.includes('application/json')) {
                    console.log('📥 Tentando parsear JSON da resposta...');
                    const json = await resposta.json();
                    console.log('✅ JSON recebido:', json);

                    if (json?.userMessage) {
                        mensagem = json.userMessage;
                        console.log('🟢 Mensagem principal extraída:', mensagem);

                        if (Array.isArray(json.errorObjects)) {
                            const detalhes = json.errorObjects
                                .map(
                                    (err) =>
                                        `Campo: ${escapeHTML(
                                            err.name
                                        )} - Problema: ${escapeHTML(err.userMessage)}`
                                )
                                .join('<br>');
                            mensagem += '<br>' + detalhes;
                        }
                    } else if (resposta.status === 403) {
                        mensagem =
                            'Acesso negado. Sua sessão expirou ou você não tem permissão.';
                        console.warn('⚠️ Erro 403 sem userMessage.');
                    } else {
                        console.warn('JSON válido mas sem userMessage.');
                    }
                } else {
                    console.warn(
                        '⚠️ Resposta não é JSON. Tentando exibir texto bruto...'
                    );
                    const texto = await resposta.text();
                    console.log('📄 Conteúdo da resposta:', texto);
                    mensagem = `Erro ${resposta.status} - ${resposta.statusText}`;
                }
            } catch (e) {
                console.error('❌ Erro ao interpretar a resposta:', e);

                if (resposta.status === 403) {
                    mensagem =
                        'Acesso negado. Sua sessão expirou ou você não tem permissão.';
                    console.warn('⚠️ Erro 403 capturado no catch.');
                }
            }

            console.log('📢 Mensagem final ao usuário:', mensagem);
            console.groupEnd();
            if (campoAlvo !== null) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    mensagem,
                    'danger',
                    campoAlvo
                );
            } else {
                FiberGuardian.Utils.exibirMensagemModal(mensagem, 'danger');
            }
        }

        function iniciarWatcherDeSessao() {
            iniciarMonitoramentoSessao();
        }

        async function realizarLogout() {
            const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                'Deseja realmente sair do sistema?',
                'Sair do Sistema'
            );

            if (confirmado) {
                try {
                    const csrfToken = await obterTokenCsrf();
                    const resp = await fetch('/api/fg-logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'X-XSRF-TOKEN': csrfToken,
                        },
                    });

                    if (!resp.ok) throw new Error('Erro ao encerrar sessão');

                    sessionStorage.removeItem('usuario');
                    window.location.href = 'login.html';
                } catch (e) {
                    exibirMensagemModal('Erro no logout: ' + e.message, 'danger');
                }
            }
        }

        function renderizarDropdownGenericoAsync({
            input,
            dropdown,
            lista,
            camposExibir,
            titulosColunas,
            msgVazio = 'Nenhum item encontrado.',
        }) {
            return new Promise((resolve) => {
                dropdown.innerHTML = '';

                const tabela = document.createElement('table');
                tabela.className = 'table table-sm table-hover mb-0';
                tabela.style.border = '1px solid #b5d4f5';
                tabela.style.borderRadius = '4px';
                tabela.style.tableLayout = 'fixed';
                tabela.style.width = '100%';

                const numColunas = titulosColunas.length;
                const larguraPorColuna = `${100 / numColunas}%`;

                const thead = document.createElement('thead');
                const trHead = document.createElement('tr');

                titulosColunas.forEach((titulo) => {
                    const th = document.createElement('th');
                    th.textContent = titulo;
                    th.style.width = larguraPorColuna;
                    th.style.minWidth = larguraPorColuna;
                    trHead.appendChild(th);
                });

                thead.appendChild(trHead);
                tabela.appendChild(thead);

                const tbody = document.createElement('tbody');

                if (!Array.isArray(lista) || lista.length === 0) {
                    const linha = document.createElement('tr');
                    const celula = document.createElement('td');
                    celula.colSpan = numColunas;
                    celula.className = 'text-muted text-center';
                    celula.textContent = msgVazio;
                    linha.appendChild(celula);
                    tbody.appendChild(linha);
                } else {
                    lista.forEach((item, index) => {
                        const linha = document.createElement('tr');
                        linha.style.cursor = 'pointer';

                        camposExibir.forEach((campo) => {
                            const celula = document.createElement('td');
                            celula.textContent = item[campo] || '';
                            celula.style.width = larguraPorColuna;
                            celula.style.minWidth = larguraPorColuna;
                            linha.appendChild(celula);
                        });

                        linha.addEventListener('click', () => {
                            input.value = item[camposExibir[0]] || '';
                            dropdown.classList.remove('show');
                            input.focus();
                            resolve({ index, item });
                        });

                        tbody.appendChild(linha);
                    });
                }

                tabela.appendChild(tbody);
                dropdown.appendChild(tabela);
                dropdown.classList.add('show');
            });
        }

        function fecharQualquerDropdownAberto(dropdowns, inputs, botoes) {
            document.addEventListener('click', (event) => {
                dropdowns.forEach((dropdownEl, index) => {
                    const inputEl = inputs[index];
                    const botaoBuscar = botoes[index];

                    if (
                        dropdownEl.classList.contains('show') &&
                        !dropdownEl.contains(event.target) &&
                        event.target !== inputEl &&
                        event.target !== botaoBuscar
                    ) {
                        dropdownEl.classList.remove('show');
                        setTimeout(() => inputEl.focus(), 10);
                    }
                });
            });
        }

        // Função para aplicar máscara monetária com vírgula e duas casas decimais
        function aplicarMascaraMonetaria(input) {
            input.addEventListener('input', () => {
                //console.log('Digitando em:', input.id, 'valor atual:', input.value); // DEBUG

                // Permitir apenas dígitos e vírgula
                input.value = input.value.replace(/[^\d,]/g, '');

                // Permitir apenas uma vírgula
                const partes = input.value.split(',');
                if (partes.length > 2) {
                    input.value = partes[0] + ',' + partes[1];
                }

                // Limitar a 2 casas decimais
                if (partes[1]?.length > 2) {
                    partes[1] = partes[1].slice(0, 2);
                    input.value = partes[0] + ',' + partes[1];
                }
            });
        }

        function formatarValorMonetario(valor) {
            if (!valor) return '0,00';

            // Substitui vírgula por ponto para facilitar parseFloat
            let numero = valor.replace(',', '.');
            let parsed = parseFloat(numero);

            if (isNaN(parsed)) return '0,00';

            // Converte para string com 2 casas decimais e volta vírgula
            return parsed.toFixed(2).replace('.', ',');
        }

        function confirmarAcao(mensagem, callbackSim, titulo = 'Confirmação') {
            const modalEl = document.getElementById('modalConfirmacaoGenerico');
            const modalTitulo = document.getElementById('modalConfirmacaoTitulo');
            const modalMensagem = document.getElementById('modalConfirmacaoMensagem');
            const btnSim = document.getElementById('btnConfirmacaoSim');

            if (!modalEl) {
                console.error('Modal de confirmação não encontrado.');
                return;
            }

            modalTitulo.textContent = titulo;
            modalMensagem.textContent = mensagem;

            const novoBtnSim = btnSim.cloneNode(true);
            btnSim.parentNode.replaceChild(novoBtnSim, btnSim);

            novoBtnSim.addEventListener('click', () => {
                bootstrap.Modal.getInstance(modalEl).hide();
                if (typeof callbackSim === 'function') {
                    callbackSim();
                }
            });

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }

        function confirmarAcaoAsync(mensagem, titulo = 'Confirmação') {
            return new Promise((resolve) => {
                const modalEl = document.getElementById('modalConfirmacaoGenerico');
                const modalTitulo = document.getElementById('modalConfirmacaoTitulo');
                const modalMensagem = document.getElementById(
                    'modalConfirmacaoMensagem'
                );
                const btnSim = document.getElementById('btnConfirmacaoSim');
                const btnNao = document.getElementById('btnConfirmacaoNao');

                if (!modalEl) {
                    console.error('Modal de confirmação não encontrado.');
                    resolve(false);
                    return;
                }
                const headerEl = modalEl.querySelector('.modal-header');
                headerEl.className += ' ' + 'bg-warning text-dark';

                modalTitulo.textContent = titulo;
                modalMensagem.textContent = mensagem;

                const novoBtnSim = btnSim.cloneNode(true);
                const novoBtnNao = btnNao.cloneNode(true);
                btnSim.parentNode.replaceChild(novoBtnSim, btnSim);
                btnNao.parentNode.replaceChild(novoBtnNao, btnNao);

                novoBtnSim.addEventListener('click', () => {
                    bootstrap.Modal.getInstance(modalEl).hide();
                    resolve(true);
                });

                novoBtnNao.addEventListener('click', () => {
                    bootstrap.Modal.getInstance(modalEl).hide();
                    resolve(false);
                });

                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            });
        }

        function voltarMenuPrincipal() {
            console.log('[FiberGuardian] Voltando ao menu principal...');

            const container = document.getElementById('conteudo-principal');
            if (container) {
                // Restaura classes de centralização para tela inicial
                container.className =
                    'content d-flex justify-content-center align-items-center text-center';

                // Restaura conteúdo inicial
                container.innerHTML = `
            <div>
                <img src="assets/img/logo-fiberguardian.png" alt="Logotipo FiberGuardian" class="img-fluid mb-4" style="max-width: 400px;">
                <p class="lead texto-container">Selecione uma opção no menu lateral para começar</p>
            </div>`;

                console.info('[FiberGuardian] Menu principal restaurado.');
                // 🔔 Dispara evento para unificar comportamento
                document.dispatchEvent(
                    new CustomEvent('fiberGuardian:paginaCarregada', {
                        detail: { pagina: 'index.html' },
                    })
                );
                console.log(
                    '[FiberGuardian] fiberGuardian:paginaCarregada disparado (index.html)'
                );
            } else {
                console.warn(
                    '[FiberGuardian] Container principal não encontrado, redirecionando...'
                );
                window.location.href = 'index.html';
            }
        }

        /**
         * Converte um valor monetário (pt-BR ou en-US) em número JS.
         * Aceita string com vírgula ou ponto como separador decimal.
         * Retorna sempre Number, ou 0 em caso de falha.
         */
        function parseCurrencyToNumber(value) {
            if (!value) return 0;
            if (typeof value === 'number') return value; // já é numérico
            const sanitized = value.replace(/\./g, '').replace(',', '.');
            // remove separadores de milhar e ajusta decimal
            const parsed = parseFloat(sanitized);
            return isNaN(parsed) ? 0 : parsed;
        }

        function downloadArquivo(blob, nomeArquivo, tipoMime) {
            try {
                // Criar URL temporária para o blob
                const url = window.URL.createObjectURL(blob);

                // Criar link temporário para download
                const link = document.createElement('a');
                link.href = url;
                link.download = nomeArquivo;
                link.style.display = 'none';

                // Adicionar ao DOM, clicar e remover
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Liberar memória
                window.URL.revokeObjectURL(url);

                console.info(`Download iniciado: ${nomeArquivo}`);
            } catch (erro) {
                console.error('Erro ao iniciar download:', erro);
                throw new Error('Não foi possível iniciar o download do arquivo');
            }
        }

        /**
         * Retorna o valor de um input pelo ID, ou um valor padrão se não encontrado.
         * Substitui repetição de document.getElementById(...).value em formulários.
         *
         * @param {string} id - ID do elemento input
         * @param {string} defaultValue - Valor padrão caso o input não exista
         * @returns {string} - Valor do input ou defaultValue
         */
        function getInputValue(id, defaultValue = '') {
            const el = document.getElementById(id);
            return el ? el.value : defaultValue;
        }

        function setCurrentDate(inputElement) {
            if (!inputElement) {
                console.warn(
                    '[FG] FiberGuardian.Utils.setCurrentDate: elemento não fornecido'
                );
                return;
            }

            const hoje = new Date();
            const yyyy = hoje.getFullYear();
            const mm = String(hoje.getMonth() + 1).padStart(2, '0');
            const dd = String(hoje.getDate()).padStart(2, '0');
            inputElement.value = `${yyyy}-${mm}-${dd}`;
        }

        // Exporta apenas o necessário
        return {
            obterTokenCsrf,
            obterNovoToken,
            iniciarWatcherDeSessao,
            exibirMensagemModal,
            tratarErroFetch,
            realizarLogout,
            exibirMensagemModalComFoco,
            obterCampo,
            exibirMensagemSessaoExpirada,
            exibirErroDeRede,
            fecharQualquerDropdownAberto,
            renderizarDropdownGenericoAsync,
            aplicarMascaraMonetaria,
            formatarValorMonetario,
            confirmarAcaoAsync,
            voltarMenuPrincipal,
            parseCurrencyToNumber,
            downloadArquivo,
            getInputValue,
            setCurrentDate,
        };
    })();
})();
