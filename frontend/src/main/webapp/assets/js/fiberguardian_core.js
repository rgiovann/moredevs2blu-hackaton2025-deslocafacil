(function () {
    // Garante que o namespace FiberGuardian exista no escopo global
    window.FiberGuardian = window.FiberGuardian || {};

    // Define o submódulo CORE
    FiberGuardian.Core = (function () {
        'use strict';

        const scriptsCarregados = new Set();

        const pageToScriptMap = {
            'tela_cadastro_deslocamento.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_deslocamento.js',
            ],
            'tela_cadastro_fornecedor.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_fornecedor.js',
            ],
            'tela_consulta_fornecedor.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_consulta_fornecedor.js',
            ],
            'tela_cadastro_produto.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_produto.js',
            ],
            'tela_consulta_produto.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_consulta_produto.js',
            ],
            'tela_cadastro_laboratorio.html': [
                'assets/js/fiberguardian_core.js',
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_laboratorio.js',
            ],
            'tela_consulta_laboratorio.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/fiberguardian_core.js',
                'assets/js/tela_consulta_laboratorio.js',
            ],
            'tela_consulta_testes_reprovados.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/fiberguardian_core.js',
                'assets/js/tela_consulta_testes_reprovados.js',
            ],
            'tela_cadastro_parecer_engenharia.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_parecer_engenharia.js',
            ],
            'tela_cadastro_usuario.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_cadastro_usuario.js',
            ],
            'tela_alteracao_cadastro_usuario.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_alteracao_cadastro_usuario.js',
            ],
            'tela_lista_cadastro_usuario.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_lista_cadastro_usuario.js',
            ],
            'tela_consulta_deslocamento.html': [
                'assets/js/fiberguardian_utils.js',
                'assets/js/tela_consulta_deslocamento.js',
            ],
        };

        /**
         * Verifica se a sessão backend ainda é válida chamando /api/sessao/valida.
         * Caso não seja válida, limpa o sessionStorage e redireciona para login.html.
         * Retorna Promise<boolean> para ser usado em async/await.
         */
        async function validarSessao() {
            try {
                console.log('Realizando fetch [/api/sessao/valida]...');
                const resposta = await fetch('/api/sessao/valida', {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                });
                if (resposta.ok) {
                    return true;
                } else {
                    console.warn('Sessão inválida ou expirada.');
                    sessionStorage.removeItem('usuario');
                    window.location.href = 'login.html';
                    return false;
                }
            } catch (e) {
                console.error('Erro ao validar sessão:', e);
                sessionStorage.removeItem('usuario');
                window.location.href = 'login.html';
                return false;
            }
        }

        /**
         * Inicialização da aplicação na tela principal (index.html).
         * Valida sessão no backend e recupera dados do usuário do sessionStorage.
         */
        async function inicializarApp() {
            // Só executa se estivermos na página principal (evita rodar em outras)
            if (!document.getElementById('conteudo-principal')) {
                return;
            }

            // Valida a sessão no backend
            const sessaoValida = await validarSessao();
            if (!sessaoValida) {
                return; // Já redirecionou para login
            }

            // dentro de inicializarApp()
            document.addEventListener(
                'fiberGuardian:paginaCarregada',
                function (event) {
                    console.log(
                        '[FG] Evento fiberGuardian:paginaCarregada recebido:',
                        event.detail
                    );

                    const pagina = event?.detail?.pagina;
                    console.log(`[FG] detail.pagina = ${pagina}`);

                    if (pagina === 'index.html') {
                        console.log('[FG] É index.html -> chamando recolherSubmenus()');
                        recolherSubmenus();
                    } else {
                        console.log('[FG] Não é index.html, nenhum recolhimento feito');
                    }
                }
            );

            // Recupera dados do usuário no sessionStorage
            const dadosUsuario = sessionStorage.getItem('usuario');
            if (dadosUsuario) {
                try {
                    FiberGuardian.UsuarioLogado = JSON.parse(dadosUsuario);
                    console.log(
                        'Usuário logado recuperado:',
                        FiberGuardian.UsuarioLogado
                    );
                    aplicarControleDeAcesso(FiberGuardian.UsuarioLogado.role);

                    // VINCULAR o botão de logout dinamicamente
                    const btnLogout = document.getElementById('btnLogout');
                    if (btnLogout) {
                        btnLogout.addEventListener('click', async (e) => {
                            e.preventDefault();
                            console.log('Fazendo logout do sistema...');
                            await FiberGuardian.Utils.realizarLogout();
                        });
                    }
                } catch (erro) {
                    console.warn(
                        'Erro ao interpretar dados do usuário no sessionStorage:',
                        erro
                    );
                    sessionStorage.removeItem('usuario');
                    window.location.href = 'login.html';
                }
            } else {
                console.warn('Usuário não autenticado. Redirecionando para login.');
                window.location.href = 'login.html';
            }
        }

        function aplicarControleDeAcesso(roleUsuario) {
            const elementos = document.querySelectorAll('[data-role-allowed]');
            elementos.forEach((el) => {
                const roles = el
                    .getAttribute('data-role-allowed')
                    .split(',')
                    .map((r) => r.trim().toUpperCase());
                if (!roles.includes(roleUsuario.toUpperCase())) {
                    el.classList.add('d-none');
                }
            });
        }

        /**
         * Fecha todos os submenus do menu lateral.
         */
        function recolherSubmenus() {
            console;
            document.querySelectorAll('.sidebar .collapse.show').forEach(function (el) {
                let bsCollapse = bootstrap.Collapse.getInstance(el);
                if (!bsCollapse) {
                    bsCollapse = new bootstrap.Collapse(el, { toggle: false });
                }
                bsCollapse.hide();
            });
        }

        function carregarScriptsSequencial(scripts, paginaOrigem) {
            console.log(`Carregando ${scripts.length} script(s) para: ${paginaOrigem}`);
            let i = 0;

            function carregarProximo() {
                if (i >= scripts.length) {
                    inicializarModuloPrincipal(paginaOrigem);
                    return;
                }

                const src = scripts[i];
                if (scriptsCarregados.has(src)) {
                    console.log(`Script em cache: ${src}`);
                    i++;
                    carregarProximo();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    scriptsCarregados.add(src);
                    console.log(`Carregado: ${src}`);
                    i++;
                    carregarProximo();
                };
                script.onerror = () => {
                    console.error(`Erro ao carregar: ${src}`);
                    i++;
                    carregarProximo();
                };
                document.head.appendChild(script);
            }

            carregarProximo();
        }

        function inicializarModuloPrincipal(paginaOrigem) {
            const nomeModulo = paginaOrigem
                .replace('.html', '')
                .replace(/_/g, ' ')
                .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
                .replace(/\s+/g, '');

            console.log(`Inicializando módulo: [${nomeModulo}]`);

            if (FiberGuardian[nomeModulo]?.init instanceof Function) {
                FiberGuardian[nomeModulo].init();
            } else {
                console.warn(
                    `Módulo [${nomeModulo}] não encontrado ou sem método init().`
                );
            }
        }

        function carregarPagina(pagina) {
            console.log(`Carregando página: ${pagina}`);

            fetch(pagina)
                .then((res) => {
                    if (!res.ok)
                        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    return res.text();
                })
                .then((html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    if (doc.querySelectorAll('script:not([src])').length > 0) {
                        console.error('HTML rejeitado por conter script inline.');
                        document.getElementById('conteudo-principal').innerHTML = `
                          <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle"></i>
                            Erro: Conteúdo rejeitado por conter scripts inline.
                          </div>`;
                        return;
                    }

                    const container = document.getElementById('conteudo-principal');
                    if (container) {
                        // Remove classes de centralização ao injetar conteúdo
                        container.className = 'content';
                        container.innerHTML = html;
                        console.info(`[FiberGuardian] Página '${pagina}' carregada.`);
                    }

                    /*
                    document.dispatchEvent(
                        new CustomEvent('fiberGuardian:paginaCarregada', {
                            detail: { pagina: 'index.html' },
                        })
                    );
                    console.log(
                        '[FG] Disparado fiberGuardian:paginaCarregada inicial (index.html)'
                    );
                    */

                    const scripts = pageToScriptMap[pagina];
                    if (scripts?.length) {
                        carregarScriptsSequencial(scripts, pagina);
                    } else {
                        console.warn(`Nenhum script associado a ${pagina}`);
                    }
                })
                .catch((erro) => {
                    console.error('Falha ao carregar conteúdo:', erro);
                    document.getElementById('conteudo-principal').innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle"></i>
                            Erro ao carregar conteúdo: ${erro.message}
                        </div>`;
                });
        }

        function limparCacheScripts() {
            scriptsCarregados.clear();
            console.log('Cache de scripts limpo');
        }

        function verificarCacheScripts() {
            console.log('Scripts em cache:', Array.from(scriptsCarregados));
            return Array.from(scriptsCarregados);
        }

        // Exporta somente o que for necessário
        return {
            carregarPagina,
            limparCacheScripts,
            verificarCacheScripts,
            inicializarApp,
        };
    })();
})();
