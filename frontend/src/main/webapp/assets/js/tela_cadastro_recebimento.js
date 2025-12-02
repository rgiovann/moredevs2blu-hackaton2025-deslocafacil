(function () {
    window.FiberGuardian = window.FiberGuardian || {};
    // Variáveis globais dentro do escopo do módulo FiberGuardian.TelaCadastroRecebimento
    //  (não vaza para window).
    let cnpjFornecedor = null;
    let emailUsuario = null;
    // Armazena, em memória, os itens da nota fiscal enquanto o usuário trabalha na tela.
    let itensRecebimento = [];

    FiberGuardian.TelaCadastroRecebimento = (function () {
        function configurarEventos() {
            console.log('Módulo TelaRecebimento inicializado.');

            const btnBuscarFornecedor = document.getElementById('btnBuscarFornecedor');
            const btnTrocarFornecedor = document.getElementById('btnTrocarFornecedor');

            const inputFornecedor = document.getElementById('fornecedor');
            const dropdownFornecedor = document.getElementById('dropdownFornecedor');

            const btnBuscarRecebidoPor =
                document.getElementById('btnBuscarRecebidoPor');
            const btnTrocarRecebidoPor =
                document.getElementById('btnTrocarRecebidoPor');
            const inputRecebidoPor = document.getElementById('recebidoPor');
            const dropdownRecebidoPor = document.getElementById('dropdownRecebidoPor');

            const btnBuscarProduto = document.getElementById('btnBuscarProduto');
            const btnTrocarProduto = document.getElementById('btnTrocarProduto');
            const inputProduto = document.getElementById('produto');
            const dropdownProduto = document.getElementById('dropdownProduto');

            const btnAvancar = document.getElementById('btnAvancarItens');
            const section = document.querySelector('section.card'); // pega a section da Etapa 1
            const btnSalvarItem = document.getElementById('btnSalvarItem');

            const quantRecebida = document.getElementById('quantRecebida');
            const numeroCaixas = document.getElementById('numeroCaixas');
            const valorUnit = document.getElementById('valorUnit');
            const infoAdic = document.getElementById('infoRecebimento');

            const btnSair = document.getElementById('btnSair');

            if (
                !btnBuscarFornecedor ||
                !btnTrocarFornecedor ||
                !inputFornecedor ||
                !dropdownFornecedor
            ) {
                console.error('Elementos da busca de Fornecedor não encontrados.');
                return;
            }

            if (
                !btnBuscarRecebidoPor ||
                !btnTrocarRecebidoPor ||
                !inputRecebidoPor ||
                !dropdownRecebidoPor
            ) {
                console.error('Elementos da busca de Recebido por não encontrados.');
                return;
            }

            if (
                !btnBuscarProduto ||
                !btnTrocarProduto ||
                !inputProduto ||
                !dropdownProduto
            ) {
                console.error('Elementos da busca de Produto não encontrados.');
                return;
            }

            btnAvancar.addEventListener('click', function () {
                // Campos obrigatórios
                const inputData = document.getElementById('dataRecebimento');
                const inputNota = document.getElementById('notaFiscal');
                const inputFornecedor = document.getElementById('fornecedor');
                const inputRecebidoPor = document.getElementById('recebidoPor');
                const inputArquivo = document.getElementById('arquivoNota');
                const inputValorTotal = document.getElementById('valorTotal');

                // === Validação defensiva ===
                if (!inputData.value) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Informe a Data de Recebimento.',
                        'warning',
                        inputData
                    );
                    return;
                }
                if (!inputNota.value.trim()) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Informe o Número da Nota Fiscal.',
                        'warning',
                        inputNota
                    );
                    return;
                }
                if (!inputFornecedor.value.trim()) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Informe o Fornecedor.',
                        'warning',
                        inputFornecedor
                    );
                    return;
                }
                if (!inputRecebidoPor.value.trim()) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Informe quem recebeu a Nota Fiscal.',
                        'warning',
                        inputRecebidoPor
                    );
                    return;
                }
                if (!inputArquivo.files || inputArquivo.files.length === 0) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Selecione o Arquivo da Nota Fiscal (PDF).',
                        'warning',
                        inputArquivo
                    );
                    return;
                }
                if (!inputValorTotal.value.trim()) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Informe o Valor Total da Nota Fiscal.',
                        'warning',
                        inputValorTotal
                    );
                    return;
                }

                inputValorTotal.value = FiberGuardian.Utils.formatarValorMonetario(
                    inputValorTotal.value
                );

                // === Se chegou até aqui, todos os campos estão preenchidos ===

                // 1) Desabilitar o botão
                btnAvancar.disabled = true;

                // 2) Tornar os campos da section "readonly" ou "disabled"
                const inputs = section.querySelectorAll(
                    'input, button, select, textarea'
                );

                inputs.forEach((el) => {
                    if (el.id === 'btnAvancarItens') return; // não processa o próprio botão

                    if (el.tagName === 'INPUT') {
                        if (
                            el.type === 'text' ||
                            el.type === 'date' ||
                            el.type === 'number'
                        ) {
                            el.readOnly = true;
                            el.classList.add('campo-desabilitado');
                        } else if (el.type === 'file') {
                            el.disabled = true;
                            el.classList.add('campo-desabilitado');
                        }
                    } else {
                        el.disabled = true;
                        el.classList.add('campo-desabilitado');
                    }
                });

                // Aplica a classe de bloqueio global na section
                section.classList.add('campo-desabilitado');
            });

            const dateDataRecebimento = document.getElementById('dataRecebimento');

            if (dateDataRecebimento) {
                // Preenche com valor padrão só se estiver vazio
                if (!dateDataRecebimento.value) {
                    const hoje = new Date();
                    const yyyy = hoje.getFullYear();
                    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
                    const dd = String(hoje.getDate()).padStart(2, '0');
                    dateDataRecebimento.value = `${yyyy}-${mm}-${dd}`;
                }
            }

            const camposMonetarios = document.querySelectorAll('.campo-monetario');

            camposMonetarios.forEach((campo) => {
                FiberGuardian.Utils.aplicarMascaraMonetaria(campo);
            });

            const camposCalculo = [
                document.getElementById('quantRecebida'),
                document.getElementById('numeroCaixas'),
                document.getElementById('valorUnit'),
            ];

            camposCalculo.forEach((campo) => {
                if (campo) {
                    campo.addEventListener('input', updateCalculations);
                }
            });

            btnSair.addEventListener('click', async () => {
                const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                    'Deseja realmente voltar ao Menu Principal?',
                    'Sair do Sistema'
                );

                if (confirmado) {
                    FiberGuardian.Utils.voltarMenuPrincipal();
                }
                dateDataRecebimento.focus();
                return;
            });

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
                [dropdownFornecedor, dropdownRecebidoPor],
                [inputFornecedor, inputRecebidoPor],
                [btnBuscarFornecedor, btnBuscarRecebidoPor]
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
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputFornecedor,
                                dropdown: dropdownFornecedor,
                                lista: listaFornecedores,
                                camposExibir: ['nome', 'cnpj'],
                                titulosColunas: ['Fornecedor', 'CNPJ'],
                                msgVazio: 'Nenhum fornecedor encontrado.',
                            });

                        // Depois que o usuário selecionar do dropdown
                        cnpjFornecedor = item.cnpj;

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
                            cnpjFornecedor = null;
                            inputFornecedor.value = '';
                            inputFornecedor.readOnly = false;
                            inputFornecedor.classList.remove('campo-desabilitado');

                            btnBuscarFornecedor.disabled = false;
                            btnBuscarFornecedor.classList.remove('campo-desabilitado');

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

            btnBuscarRecebidoPor.addEventListener('click', async function () {
                const codigoParcial = inputRecebidoPor.value.trim();

                // Validação defensiva
                if (!codigoParcial) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Digite parte do nome para buscar.',
                        'warning',
                        inputRecebidoPor
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
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputRecebidoPor,
                                dropdown: dropdownRecebidoPor,
                                lista: listaUsuarios,
                                camposExibir: ['nome', 'email', 'setor', 'turno'],
                                titulosColunas: ['Usuário', 'Email', 'Setor', 'Turno'],
                                msgVazio: 'Nenhum usuário encontrado.',
                            });
                        // Armazena do objeto recebido o email
                        emailUsuario = item.email;

                        // trava campo RecebidoPor
                        inputRecebidoPor.readOnly = true;
                        inputRecebidoPor.classList.add('campo-desabilitado');

                        // desabilita botão Buscar
                        btnBuscarRecebidoPor.disabled = true;
                        btnBuscarRecebidoPor.classList.add('campo-desabilitado');

                        // habilita botão Trocar
                        btnTrocarRecebidoPor.disabled = false;
                        btnTrocarRecebidoPor.classList.remove('campo-desabilitado');

                        // evento de trocar
                        btnTrocarRecebidoPor.addEventListener('click', () => {
                            emailUsuario = null;
                            inputRecebidoPor.value = '';
                            inputRecebidoPor.readOnly = false;
                            inputRecebidoPor.classList.remove('campo-desabilitado');

                            btnBuscarRecebidoPor.disabled = false;
                            btnBuscarRecebidoPor.classList.remove('campo-desabilitado');

                            btnTrocarRecebidoPor.disabled = true;
                            btnTrocarRecebidoPor.classList.add('campo-desabilitado');
                        });

                        //console.log('Index:', index);
                        //console.log('Email: [emailUsuario]', emailUsuario);
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputRecebidoPor
                        );
                    }
                } catch (erro) {
                    console.error('Erro ao buscar usuários:', erro);
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao buscar usuários.',
                        inputRecebidoPor,
                        erro
                    );
                }
            });

            btnBuscarProduto.addEventListener('click', async function () {
                const codigoParcial = inputProduto.value.trim();

                if (!cnpjFornecedor) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'É necessario selecionar o fornecedor antes de selecionar o produto.',
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
                    url.searchParams.append('cnpj', cnpjFornecedor);

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
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputProduto,
                                dropdown: dropdownProduto,
                                lista: listaProdutos,
                                camposExibir: ['descricao', 'codigo'],
                                titulosColunas: ['Produto', 'Código'],
                                msgVazio: 'Nenhum produto encontrado.',
                            });

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

                        //console.log('Index:', index);
                        //console.log('Código Produto:', codigoProdutoSelecionado);
                        // aqui você pode salvar em variável ou mandar para outra função
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

            const inputArquivo = document.getElementById('arquivoNota');
            inputArquivo.addEventListener('change', () => {
                const file = inputArquivo.files[0];
                if (file && file.type !== 'application/pdf') {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Somente arquivos tipo pdf são permitidos.',
                        'warning',
                        document.getElementById('arquivoNota')
                    );
                    inputArquivo.value = ''; // limpa o input
                    return;
                }
            });

            if (btnSalvarItem) {
                btnSalvarItem.addEventListener('click', () => {
                    salvarItem();
                    inputProduto.value = '';
                    quantRecebida.value = '';
                    numeroCaixas.value = '';
                    valorUnit.value = '';
                    infoAdic.value = '';
                    document.getElementById('pesoMedio').value = '';
                    document.getElementById('quantRochas').value = '';
                    document.getElementById('valorTotalItem').value = '';
                    // botão Buscar Fornecedor volta a habilitar
                    btnBuscarProduto.disabled = false;
                    btnBuscarProduto.classList.remove('campo-desabilitado');
                    // Trocar fornecedor permanece desabilitado
                    btnTrocarProduto.disabled = true;
                    btnTrocarProduto.classList.add('campo-desabilitado');
                    // voltar o foco no campo produto
                    inputProduto.focus();
                });
            }

            // Dentro de configurarEventos(), após bind dos outros botões:
            const btnFinalizarNota = document.getElementById('btnFinalizarNota');
            if (btnFinalizarNota) {
                btnFinalizarNota.addEventListener('click', async () => {
                    try {
                        // Verifica se há pelo menos 1 item antes de finalizar
                        if (!itensRecebimento || itensRecebimento.length === 0) {
                            FiberGuardian.Utils.exibirMensagemModalComFoco(
                                'Nota deve ter no mínimo 1 item de nota cadastrado',
                                'warning',
                                document.getElementById('produto')
                            );
                            return;
                        }
                        // === Coleta campos do cabeçalho ===
                        const inputNota = document.getElementById('notaFiscal');
                        const inputData = document.getElementById('dataRecebimento');
                        const inputValorTotal = document.getElementById('valorTotal');
                        const inputArquivo = document.getElementById('arquivoNota');

                        // Validação defensiva mínima (usuário pode burlar travas via console)
                        if (
                            !inputNota.value.trim() ||
                            !cnpjFornecedor ||
                            !emailUsuario ||
                            !inputArquivo.files?.length
                        ) {
                            FiberGuardian.Utils.exibirMensagemModalComFoco(
                                'Preencha todos os campos obrigatórios antes de finalizar a nota.',
                                'warning',
                                inputNota
                            );
                            return;
                        }

                        // === Monta objeto da nota + itens ===
                        const dadosNota = {
                            nota: {
                                codigoNf: inputNota.value.trim(),
                                cnpj: cnpjFornecedor,
                                recebidoPor: emailUsuario,
                                dataRecebimento: inputData.value,
                                valorTotal:
                                    parseFloat(
                                        inputValorTotal.value.replace(',', '.')
                                    ) || 0,
                            },
                            itens: itensRecebimento.map((it) => ({
                                codigoProduto: it.codigo,
                                qtdRecebida: it.quantRecebida,
                                nrCaixas: it.numeroCaixas,
                                precoUnitario: it.valorUnit,
                                observacao: it.observacao || '', // pode estar vazio
                            })),
                        };

                        // === Monta objeto de metadados do PDF ===
                        const pdfMeta = {
                            descricao: `Arquivo nota fiscal ${inputNota.value.trim()} relativa ao fornecedor ${cnpjFornecedor}`,
                        };

                        // === Prepara multipart/form-data ===
                        const formData = new FormData();
                        formData.append(
                            'dadosNota',
                            new Blob([JSON.stringify(dadosNota)], {
                                type: 'application/json',
                            })
                        );
                        formData.append(
                            'pdfMeta',
                            new Blob([JSON.stringify(pdfMeta)], {
                                type: 'application/json',
                            })
                        );
                        formData.append('arquivo', inputArquivo.files[0]);

                        // === CSRF token ===
                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        const resposta = await fetch('/api/notas-fiscais', {
                            method: 'POST',
                            headers: {
                                'X-XSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                            body: formData,
                        });

                        if (resposta.ok) {
                            // Zera array global
                            itensRecebimento = [];
                            renderizarTabelaItens();
                            limpaCabecalhoNotaFiscal();
                            limpaItensNotaFiscal();

                            FiberGuardian.Utils.exibirMensagemModalComFoco(
                                'Nota fiscal gravada com sucesso.',
                                'success',
                                inputNota
                            );

                            // === Reset após sucesso ===
                            itensRecebimento = []; // limpa array global
                            renderizarTabelaItens(); // limpa tabela na tela

                            //document.getElementById('formNotaFiscal').reset(); // se você tiver um <form>
                            cnpjFornecedor = null;
                            emailUsuario = null;

                            return;
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                            FiberGuardian.Utils.voltarMenuPrincipal();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputNota
                            );
                            return;
                        }
                    } catch (erro) {
                        console.error('Falha na requisição:', erro);
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao finalizar nota fiscal',
                            document.getElementById('notaFiscal'),
                            erro
                        );
                        FiberGuardian.Utils.voltarMenuPrincipal();
                    }
                });
            }
        }

        // Delegação de eventos no <tbody> para capturar cliques em "Excluir"
        const tbodyItens = document.getElementById('tabelaItens');
        console.log('[Delegation] tbodyItens encontrado?', !!tbodyItens, tbodyItens);

        if (tbodyItens) {
            tbodyItens.addEventListener('click', function (e) {
                // Log do clique bruto no tbody
                console.log(
                    '[Delegation] click no tbody',
                    'target.node=',
                    e.target?.nodeName,
                    'class=',
                    e.target?.className
                );

                // Usa closest para achar o botão mesmo que o clique seja no texto interno
                const btn = e.target.closest('button.btn-excluir-item');
                console.log('[Delegation] closest(".btn-excluir-item") =>', btn);

                if (!btn) {
                    console.log('[Delegation] clique ignorado (não é botão Excluir)');
                    return;
                }

                const idxAttr = btn.getAttribute('data-index');
                console.log('[Delegation] data-index lido do botão:', idxAttr);

                const idx = Number.parseInt(idxAttr, 10);
                if (Number.isNaN(idx)) {
                    console.warn('[Delegation] data-index inválido/NaN');
                    return;
                }

                excluirItem(idx);
            });
        } else {
            console.error('[Delegation] tbody #tabelaItens NÃO encontrado no DOM.');
        }

        function updateCalculations() {
            const quantRecebida =
                parseInt(document.getElementById('quantRecebida')?.value) || 0;
            const numeroCaixas =
                parseInt(document.getElementById('numeroCaixas')?.value) || 0;

            const valorUnit = FiberGuardian.Utils.parseCurrencyToNumber(
                document.getElementById('valorUnit')?.value
            );

            const rochasPorCaixa = 300;
            const quantRochas = numeroCaixas * rochasPorCaixa;
            document.getElementById('quantRochas').value = quantRochas;

            const pesoMedio =
                quantRecebida > 0 && quantRochas > 0
                    ? (quantRecebida / quantRochas).toFixed(2)
                    : '0,00';
            document.getElementById('pesoMedio').value = pesoMedio;

            const valorTotalItem =
                quantRecebida > 0 ? (valorUnit * quantRecebida).toFixed(2) : '0,00';
            document.getElementById('valorTotalItem').value = valorTotalItem;

            const pesoMedioCaixa =
                numeroCaixas > 0 ? (quantRecebida / numeroCaixas).toFixed(2) : '0,00';
            document.getElementById('pesoMedioCaixa').value = pesoMedioCaixa;
        }

        function salvarItem() {
            const produto = document.getElementById('produto')?.value.trim();
            const codigo =
                typeof codigoProdutoSelecionado !== 'undefined'
                    ? codigoProdutoSelecionado
                    : null;
            const quantRecebida =
                parseInt(document.getElementById('quantRecebida')?.value) || 0;
            const numeroCaixas =
                parseInt(document.getElementById('numeroCaixas')?.value) || 0;
            const valorUnit = FiberGuardian.Utils.parseCurrencyToNumber(
                document.getElementById('valorUnit')?.value
            );
            const valorTotalItem =
                parseFloat(document.getElementById('valorTotalItem')?.value) || 0;
            const observacao = document.getElementById('infoRecebimento')?.value.trim();

            // === Validação defensiva (igual ao cabeçalho) ===
            if (!produto) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Informe o Produto.',
                    'warning',
                    document.getElementById('produto')
                );
                return;
            }
            if (quantRecebida <= 0) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Informe a Quantidade Recebida.',
                    'warning',
                    document.getElementById('quantRecebida')
                );
                return;
            }
            if (numeroCaixas <= 0) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Informe o Número de Caixas.',
                    'warning',
                    document.getElementById('numeroCaixas')
                );
                return;
            }
            if (valorUnit <= 0) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Informe o Valor Unitário.',
                    'warning',
                    document.getElementById('valorUnit')
                );
                return;
            }
            const inputPrecoUnitario = document.getElementById('valorUnit');

            inputPrecoUnitario.value = FiberGuardian.Utils.formatarValorMonetario(
                inputPrecoUnitario.value
            );

            // === Validação de duplicidade ===
            const itemJaExiste = itensRecebimento.some(
                (it) => it.produto === produto && it.codigo === codigo
            );

            if (itemJaExiste) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Este item já foi adicionado à nota fiscal.',
                    'warning',
                    document.getElementById('produto')
                );
                return;
            }

            // Objeto representando o item da NF
            const item = {
                produto: produto,
                codigo: codigo,
                quantRecebida: quantRecebida,
                numeroCaixas: numeroCaixas,
                valorUnit: valorUnit,
                valorTotalItem: valorTotalItem,
                observacao: observacao,
            };

            // Adiciona no array global
            itensRecebimento.push(item);

            console.log('Item salvo em memória:', item);
            console.log('Estado atual do array:', itensRecebimento);

            // Atualiza a tabela dinâmica
            renderizarTabelaItens();

            limpaItensNotaFiscal();
        }

        function renderizarTabelaItens() {
            const tabela = document.getElementById('tabelaItens');
            if (!tabela) {
                console.error('[Render] tbody #tabelaItens não encontrado.');
                return;
            }

            console.log(
                '[Render] Iniciando render. Quantidade de itens em memória:',
                itensRecebimento.length
            );
            tabela.innerHTML = ''; // limpa antes de repopular

            itensRecebimento.forEach((item, index) => {
                const linha = document.createElement('tr');

                linha.innerHTML = `
            <td>${item.produto}</td>
            <td>${item.codigo || ''}</td>
            <td>${item.quantRecebida}</td>
            <td>${item.numeroCaixas}</td>
            <td>R$ ${Number(item.valorUnit).toFixed(2)}</td>
            <td>R$ ${Number(item.valorTotalItem).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-excluir-item" data-index="${index}">
                    Excluir
                </button>
            </td>
        `;

                tabela.appendChild(linha);
            });

            const linhasNoDom = tabela.querySelectorAll('tr').length;
            console.log('[Render] Renderização concluída. Linhas no DOM:', linhasNoDom);
        }

        function excluirItem(index) {
            console.log('[Excluir] Função chamada com index:', index);

            if (index >= 0 && index < itensRecebimento.length) {
                console.log(
                    '[Excluir] Antes de excluir:',
                    JSON.stringify(itensRecebimento)
                );
                itensRecebimento.splice(index, 1);
                console.log(
                    '[Excluir] Depois de excluir:',
                    JSON.stringify(itensRecebimento)
                );
                renderizarTabelaItens();
            } else {
                console.warn('[Excluir] Index fora do intervalo:', index);
            }
        }

        // Função para limpar o cabeçalho da nota fiscal
        function limpaCabecalhoNotaFiscal() {
            const inputNota = document.getElementById('notaFiscal');

            const inputFornecedor = document.getElementById('fornecedor');

            const inputRecebidoPor = document.getElementById('recebidoPor');

            const inputValorTotal = document.getElementById('valorTotal');

            const inputArquivo = document.getElementById('arquivoNota');

            const dateDataRecebimento = document.getElementById('dataRecebimento');

            // Limpa valores
            inputNota.value = '';
            inputNota.readOnly = false;
            inputNota.classList.remove('campo-desabilitado');

            inputFornecedor.value = '';
            inputFornecedor.readOnly = false;
            inputFornecedor.classList.remove('campo-desabilitado');

            inputRecebidoPor.value = '';
            inputRecebidoPor.readOnly = false;
            inputRecebidoPor.classList.remove('campo-desabilitado');

            inputValorTotal.value = '';
            inputValorTotal.readOnly = false;
            inputValorTotal.classList.remove('campo-desabilitado');

            inputArquivo.value = '';
            inputArquivo.readOnly = false;
            inputArquivo.classList.remove('campo-desabilitado');

            // Reseta variáveis globais
            cnpjFornecedor = null;
            emailUsuario = null;

            // Reaplica data atual no calendário

            FiberGuardian.Utils.setCurrentDate(dateDataRecebimento);

            dateDataRecebimento.readOnly = false;
            dateDataRecebimento.classList.remove('campo-desabilitado');

            document.getElementById('btnAvancarItens').disabled = false;
            document
                .getElementById('btnAvancarItens')
                .classList.remove('campo-desabilitado');

            document.getElementById('btnBuscarFornecedor').disabled = false;
            document
                .getElementById('btnBuscarFornecedor')
                .classList.remove('campo-desabilitado');

            document.getElementById('btnTrocarFornecedor').disabled = true;
            document
                .getElementById('btnTrocarFornecedor')
                .classList.add('campo-desabilitado');

            document.getElementById('btnBuscarRecebidoPor').disabled = false;
            document
                .getElementById('btnBuscarRecebidoPor')
                .classList.remove('campo-desabilitado'); // ← e aqui

            document.getElementById('btnTrocarRecebidoPor').disabled = true;
            document
                .getElementById('btnTrocarRecebidoPor')
                .classList.add('campo-desabilitado');
        }

        // Função para limpar os itens da nota fiscal
        function limpaItensNotaFiscal() {
            // Limpa tabela de itens

            // Limpa inputs de item
            const inputProduto = document.getElementById('produto');
            const quantRecebida = document.getElementById('quantRecebida');
            const numeroCaixas = document.getElementById('numeroCaixas');
            const valorUnit = document.getElementById('valorUnit');
            const infoAdic = document.getElementById('infoRecebimento');

            if (inputProduto) {
                inputProduto.value = '';
                inputProduto.readOnly = false;
                inputProduto.classList.remove('campo-desabilitado');
            }
            if (quantRecebida) quantRecebida.value = '';
            if (numeroCaixas) numeroCaixas.value = '';
            if (valorUnit) valorUnit.value = '';
            if (infoAdic) infoAdic.value = '';

            const pesoMedio = document.getElementById('pesoMedio');
            const quantRochas = document.getElementById('quantRochas');
            const valorTotalItem = document.getElementById('valorTotalItem');
            const pesoMedioCaixa = document.getElementById('pesoMedioCaixa');

            if (pesoMedio) pesoMedio.value = '';
            if (quantRochas) quantRochas.value = '';
            if (valorTotalItem) valorTotalItem.value = '';
            if (pesoMedioCaixa) pesoMedioCaixa.value = '';
        }

        // Revealing: expõe apenas as funções públicas
        return {
            init: configurarEventos,
        };
    })();
})();
