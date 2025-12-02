(function () {
    window.FiberGuardian = window.FiberGuardian || {};
    let cnpjFornecedorSelecionado = null;
    let codigoProdutoSelecionado = null;
    let codigoNotaFiscalSelecionado = null;
    //let nrNotaFiscalSelecionadoId = null;
    let emailLiberacaoPor = null;

    FiberGuardian.TelaCadastroLaboratorio = (function () {
        function configurarEventos() {
            console.log('Módulo Tela Cadastro Laboratorio inicializado.');
            cnpjFornecedorSelecionado = null;
            codigoProdutoSelecionado = null;
            codigoNotaFiscalSelecionado = null;
            //nrNotaFiscalSelecionadoId = null;
            emailLiberacaoPor = null;
            const inputFornecedor = document.getElementById('fornecedor');
            const btnBuscarFornecedor = document.getElementById('btnBuscarFornecedor');
            const dropdownFornecedor = document.getElementById('dropdownFornecedor');
            const btnTrocarFornecedor = document.getElementById('btnTrocarFornecedor');
            const dateDataLaudoLab = document.getElementById('dataLaudo');

            FiberGuardian.Utils.setCurrentDate(dateDataLaudoLab);

            const inputLiberacaoPor = document.getElementById('inputLiberacaoPor');
            const btnGravarLaudo = document.getElementById('btnGravarLaudo');

            const dropdownLiberacaoPor =
                document.getElementById('dropdownLiberacaoPor');
            const btnBuscarLiberacaoPor = document.getElementById(
                'btnBuscarLiberacaoPor'
            );
            const btnTrocarLiberacaoPor = document.getElementById(
                'btnTrocarLiberacaoPor'
            );

            const inputNrNotFiscal = document.getElementById('nrNotaFiscal');
            const btnBuscarNrNotaFiscal = document.getElementById(
                'btnBuscarNrNotaFiscal'
            );
            const dropdownNrNotaFiscal =
                document.getElementById('dropdownNrNotaFiscal');
            const btnTrocarNotaFiscal = document.getElementById(
                'btnTrocarNrNotaFiscal'
            );
            const btnDownloadNrNotaFiscal = document.getElementById(
                'btnDownloadNrNotaFiscal'
            );

            const inputProduto = document.getElementById('produto');
            const btnBuscarProduto = document.getElementById('btnBuscarProduto');
            const dropdownProduto = document.getElementById('dropdownProduto');
            const btnTrocarProduto = document.getElementById('btnTrocarProduto');

            const btnSair = document.getElementById('btnSair');

            if (
                !btnBuscarLiberacaoPor ||
                !inputLiberacaoPor ||
                !dropdownLiberacaoPor ||
                !btnTrocarLiberacaoPor
            ) {
                console.error(
                    'Elementos da busca de quem liberou o laudo não encontrados.'
                );
                return;
            }

            if (!btnGravarLaudo) {
                console.error('Elementos botao Gravar Laudo não encontrado.');
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
                !dropdownNrNotaFiscal ||
                !btnTrocarNotaFiscal ||
                !btnDownloadNrNotaFiscal
            ) {
                console.error('Elementos da busca de Nota Fiscal não encontrados.');
                return;
            }
            // Função auxiliar para gerenciar o estado dos campos e botões
            function alternarEstadoCampos(input, btnBuscar, btnTrocar, isSelecionado) {
                input.readOnly = isSelecionado;
                input.classList.toggle('campo-desabilitado', isSelecionado);
                btnBuscar.disabled = isSelecionado;
                btnBuscar.classList.toggle('campo-desabilitado', isSelecionado);
                btnTrocar.disabled = !isSelecionado;
                btnTrocar.classList.toggle('campo-desabilitado', !isSelecionado);
            }

            // Funções de reset
            function resetarFornecedor() {
                cnpjFornecedorSelecionado = null;
                inputFornecedor.value = '';
                alternarEstadoCampos(
                    inputFornecedor,
                    btnBuscarFornecedor,
                    btnTrocarFornecedor,
                    false
                );
            }

            function resetarProduto() {
                codigoProdutoSelecionado = null;
                inputProduto.value = '';
                alternarEstadoCampos(
                    inputProduto,
                    btnBuscarProduto,
                    btnTrocarProduto,
                    false
                );
            }

            function resetarNotaFiscal() {
                codigoNotaFiscalSelecionado = null;
                //nrNotaFiscalSelecionadoId = null;
                btnDownloadNrNotaFiscal.disabled = true;
                inputNrNotFiscal.value = '';

                alternarEstadoCampos(
                    inputNrNotFiscal,
                    btnBuscarNrNotaFiscal,
                    btnTrocarNotaFiscal,
                    false
                );
            }

            function resetarLiberacaoPor() {
                emailLiberacaoPor = null;
                inputLiberacaoPor.value = '';

                alternarEstadoCampos(
                    inputLiberacaoPor,
                    btnBuscarLiberacaoPor,
                    btnTrocarLiberacaoPor,
                    false
                );
            }

            FiberGuardian.Utils.fecharQualquerDropdownAberto(
                [
                    dropdownFornecedor,
                    dropdownNrNotaFiscal,
                    dropdownProduto,
                    dropdownLiberacaoPor,
                ],
                [inputFornecedor, inputProduto, inputNrNotFiscal, inputLiberacaoPor],
                [
                    btnBuscarFornecedor,
                    btnBuscarProduto,
                    btnBuscarNrNotaFiscal,
                    btnBuscarLiberacaoPor,
                ]
            );

            btnDownloadNrNotaFiscal.addEventListener('click', async function () {
                if (!codigoNotaFiscalSelecionado) return;

                try {
                    const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                    const url = new URL(
                        `/api/pdf-notas-fiscais/${cnpjFornecedorSelecionado}/${codigoNotaFiscalSelecionado}`,
                        window.location.origin
                    );

                    const resposta = await fetch(url.toString(), {
                        method: 'GET',
                        headers: {
                            Accept: 'application/pdf, application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                    });

                    if (resposta.ok) {
                        // Tratar resposta binária (PDF)
                        const contentType = resposta.headers.get('Content-Type');

                        if (contentType && contentType.includes('application/pdf')) {
                            // PDF retornado diretamente
                            const blob = await resposta.blob();
                            FiberGuardian.Utils.downloadArquivo(
                                blob,
                                `NF_${codigoNotaFiscalSelecionado}.pdf`,
                                'application/pdf'
                            );
                        } else if (resposta.status === 302) {
                            // Redirecionamento para URL externa (S3, etc.)
                            const location = resposta.headers.get('Location');
                            if (location) {
                                window.open(location, '_blank');
                            } else {
                                throw new Error(
                                    'URL de redirecionamento não encontrada'
                                );
                            }
                        }
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputNrNotFiscal
                        );
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao baixar PDF da nota fiscal.',
                        inputNrNotFiscal,
                        erro
                    );
                }
            });

            // Event listener para a busca de fornecedor
            btnBuscarFornecedor.addEventListener('click', async function () {
                const codigoParcial = inputFornecedor.value.trim();
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
                        const { item } =
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputFornecedor,
                                dropdown: dropdownFornecedor,
                                lista: listaFornecedores,
                                camposExibir: ['nome', 'cnpj'],
                                titulosColunas: ['Fornecedor', 'CNPJ'],
                                msgVazio: 'Nenhum fornecedor encontrado.',
                            });
                        if (item) {
                            cnpjFornecedorSelecionado = item.cnpj;
                            alternarEstadoCampos(
                                inputFornecedor,
                                btnBuscarFornecedor,
                                btnTrocarFornecedor,
                                true
                            );
                            resetarNotaFiscal();
                            resetarProduto();
                        }
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputFornecedor
                        );
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao buscar fornecedores.',
                        inputFornecedor,
                        erro
                    );
                }
            });

            // Event listener para o botão de troca de fornecedor
            btnTrocarFornecedor.addEventListener('click', () => {
                resetarFornecedor();
                resetarNotaFiscal();
                resetarProduto();
            });

            // Event listener para o botão de troca de fornecedor
            btnTrocarProduto.addEventListener('click', () => {
                resetarProduto();
            });

            btnTrocarNotaFiscal.addEventListener('click', () => {
                resetarNotaFiscal();
                resetarProduto();
            });

            btnTrocarLiberacaoPor.addEventListener('click', () => {
                resetarLiberacaoPor();
            });

            function limparFormulario() {
                // Resetar variáveis internas
                cnpjFornecedorSelecionado = null;
                codigoProdutoSelecionado = null;
                codigoNotaFiscalSelecionado = null;
                //nrNotaFiscalSelecionadoId = null;
                emailLiberacaoPor = null;

                // Resetar campos de texto do formulário
                const formLaboratorio = document.getElementById('laboratorioForm');
                if (formLaboratorio) {
                    formLaboratorio.reset();
                }

                const dateDataLaudoLab = document.getElementById('dataLaudo');
                FiberGuardian.Utils.setCurrentDate(dateDataLaudoLab);

                // Fornecedor
                if (inputFornecedor && btnBuscarFornecedor && btnTrocarFornecedor) {
                    inputFornecedor.value = '';
                    alternarEstadoCampos(
                        inputFornecedor,
                        btnBuscarFornecedor,
                        btnTrocarFornecedor,
                        false
                    );
                }

                // Produto
                if (inputProduto && btnBuscarProduto && btnTrocarProduto) {
                    inputProduto.value = '';
                    alternarEstadoCampos(
                        inputProduto,
                        btnBuscarProduto,
                        btnTrocarProduto,
                        false
                    );
                }

                // Nota Fiscal
                if (inputNrNotFiscal && btnBuscarNrNotaFiscal && btnTrocarNotaFiscal) {
                    inputNrNotFiscal.value = '';
                    btnDownloadNrNotaFiscal.disabled = true;
                    alternarEstadoCampos(
                        inputNrNotFiscal,
                        btnBuscarNrNotaFiscal,
                        btnTrocarNotaFiscal,
                        false
                    );
                }

                // LiberacaoPor
                if (
                    inputLiberacaoPor &&
                    btnBuscarLiberacaoPor &&
                    btnTrocarLiberacaoPor
                ) {
                    inputLiberacaoPor.value = '';
                    alternarEstadoCampos(
                        inputLiberacaoPor,
                        btnBuscarLiberacaoPor,
                        btnTrocarLiberacaoPor,
                        false
                    );
                }
            }

            const btnLimpar = document.getElementById('btnLimpar');
            if (btnLimpar) {
                btnLimpar.addEventListener('click', limparFormulario);
            }

            btnBuscarNrNotaFiscal.addEventListener('click', async function () {
                const codigoParcial = inputNrNotFiscal.value.trim();
                if (!cnpjFornecedorSelecionado) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'É necessário selecionar um fornecedor antes de buscar a nota fiscal.',
                        'warning',
                        inputFornecedor
                    );
                    return;
                }

                try {
                    const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                    // Monta a URL com PathVariable para o CNPJ e query param para codigo_nf
                    const url = new URL(
                        `/api/notas-fiscais/list/por_fornecedor/${cnpjFornecedorSelecionado}`,
                        window.location.origin
                    );
                    if (codigoParcial) {
                        url.searchParams.append('codigo_nf', codigoParcial);
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
                        const listaNotasFiscais = await resposta.json();

                        const { item } =
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputNrNotFiscal,
                                dropdown: dropdownNrNotaFiscal,
                                lista: listaNotasFiscais,
                                camposExibir: [
                                    'codigoNf',
                                    'cnpj',
                                    'dataRecebimento',
                                    'valorTotal',
                                ],
                                titulosColunas: [
                                    'Nota Fiscal',
                                    'CNPJ',
                                    'Data Recebimento',
                                    'Valor Total NF',
                                ],
                                msgVazio: 'Nenhuma nota fiscal encontrada.',
                            });

                        if (item) {
                            codigoNotaFiscalSelecionado = item.codigoNf;
                            btnDownloadNrNotaFiscal.disabled = false;
                            alternarEstadoCampos(
                                inputNrNotFiscal,
                                btnBuscarNrNotaFiscal,
                                btnTrocarNotaFiscal,
                                true
                            );
                            resetarProduto();
                        }
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputNrNotFiscal
                        );
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao buscar notas fiscais.',
                        inputNrNotFiscal,
                        erro
                    );
                }
            });

            btnBuscarLiberacaoPor.addEventListener('click', async function () {
                const codigoParcial = inputLiberacaoPor.value.trim();
                if (!codigoParcial) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Digite parte do nome do nome do usuário para buscar.',
                        'warning',
                        inputLiberacaoPor
                    );
                    return;
                }

                try {
                    const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

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

                        const { item } =
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputLiberacaoPor,
                                dropdown: dropdownLiberacaoPor,
                                lista: listaUsuarios,
                                camposExibir: ['nome', 'email', 'setor', 'turno'],
                                titulosColunas: ['Usuário', 'Email', 'Setor', 'Turno'],
                                msgVazio: 'Nenhum usuário encontrado.',
                            });

                        if (item) {
                            emailLiberacaoPor = item.email;
                            alternarEstadoCampos(
                                inputLiberacaoPor,
                                btnBuscarLiberacaoPor,
                                btnTrocarLiberacaoPor,
                                true
                            );
                        }
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputLiberacaoPor
                        );
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao buscar notas fiscais.',
                        inputLiberacaoPor,
                        erro
                    );
                }
            });

            // Event listener para a busca de produto
            btnBuscarProduto.addEventListener('click', async function () {
                if (!cnpjFornecedorSelecionado || !codigoNotaFiscalSelecionado) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'É necessário selecionar a nota fiscal e fornecedor antes de selecionar o produto.',
                        'warning',
                        inputFornecedor
                    );
                    return;
                }
                try {
                    const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();
                    // Construir URL correta para buscar itens da nota fiscal
                    const url = new URL(
                        `/api/item-notas-fiscais/list/${cnpjFornecedorSelecionado}/${codigoNotaFiscalSelecionado}`,
                        window.location.origin
                    );

                    console.log('[FG] Buscando itens da nota fiscal:', url.toString());
                    const resposta = await fetch(url.toString(), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                    });
                    if (resposta.ok) {
                        const listaItensNotaFiscal = await resposta.json();
                        const itensFormatados = listaItensNotaFiscal.map((item) => ({
                            codigo: item.produto.codigo,
                            descricao: item.produto.descricao,
                            qtdRecebida: item.qtdRecebida,
                            nrCaixas: item.nrCaixas,
                            observacao: item.observacao || '-',
                            _itemOriginal: item,
                        }));

                        // Renderizar tabela com os itens da nota fiscal
                        const { item } =
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputProduto,
                                dropdown: dropdownProduto,
                                lista: itensFormatados,
                                camposExibir: [
                                    'codigo',
                                    'descricao',
                                    'qtdRecebida',
                                    'nrCaixas',
                                    'observacao',
                                ],
                                titulosColunas: [
                                    'Código',
                                    'Produto',
                                    'Qtde Recebida',
                                    'Nr Caixas',
                                    'Observações',
                                ],
                                msgVazio:
                                    'Nenhum item encontrado para esta nota fiscal.',
                            });
                        if (item) {
                            // Armazenar as informações do item selecionado
                            codigoProdutoSelecionado = item.codigo;
                            //itemNotaFiscalSelecionado = item; // Para ter acesso a todos os dados

                            alternarEstadoCampos(
                                inputProduto,
                                btnBuscarProduto,
                                btnTrocarProduto,
                                true
                            );
                        }
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(
                            resposta,
                            inputProduto
                        );
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede(
                        'Erro de rede ao buscar produtos.',
                        inputProduto,
                        erro
                    );
                }
            });

            // Event listener para o botão de sair
            if (btnSair) {
                btnSair.addEventListener('click', async () => {
                    const confirmacao = await FiberGuardian.Utils.confirmarAcaoAsync(
                        'Tem certeza que deseja sair?',
                        'Sair do Sistema'
                    );
                    if (confirmacao) {
                        FiberGuardian.Utils.voltarMenuPrincipal();
                    }
                });
            }
            if (btnGravarLaudo) {
                btnGravarLaudo.addEventListener('click', async (event) => {
                    event.preventDefault(); // evita submit automático
                    try {
                        console.log('[FG] Iniciando validação e leitura de campos');

                        // Validar campos obrigatórios globais
                        if (
                            !codigoProdutoSelecionado ||
                            !cnpjFornecedorSelecionado ||
                            !codigoNotaFiscalSelecionado ||
                            !emailLiberacaoPor
                        ) {
                            FiberGuardian.Utils.exibirMensagemModalComFoco(
                                'Preencha todos os campos obrigatórios antes de gravar o laudo do laboratório.',
                                'warning',
                                inputFornecedor
                            );
                            return;
                        }

                        // Leitura e parsing dos campos numéricos com fallback
                        const cvm =
                            parseFloat(
                                FiberGuardian.Utils.getInputValue('cvm', '0').replace(
                                    ',',
                                    '.'
                                )
                            ) || 0;
                        const pontosFinos =
                            parseInt(
                                FiberGuardian.Utils.getInputValue('pontosFinos', '0')
                            ) || 0;
                        const pontosGrossos =
                            parseInt(
                                FiberGuardian.Utils.getInputValue('pontosGrossos', '0')
                            ) || 0;
                        const neps =
                            parseInt(FiberGuardian.Utils.getInputValue('neps', '0')) ||
                            0;
                        const hPilosidade =
                            parseFloat(
                                FiberGuardian.Utils.getInputValue(
                                    'hPilosidade',
                                    '0'
                                ).replace(',', '.')
                            ) || 0.01;
                        const resistencia =
                            parseFloat(
                                FiberGuardian.Utils.getInputValue(
                                    'resistencia',
                                    '0'
                                ).replace(',', '.')
                            ) || 0.01;
                        const alongamento =
                            parseFloat(
                                FiberGuardian.Utils.getInputValue(
                                    'alongamento',
                                    '0'
                                ).replace(',', '.')
                            ) || 0.01;
                        const tituloNe =
                            parseFloat(
                                FiberGuardian.Utils.getInputValue(
                                    'tituloNe',
                                    '0'
                                ).replace(',', '.')
                            ) || 0;
                        const torcaoTm =
                            parseInt(
                                FiberGuardian.Utils.getInputValue('torcaoTm', '0')
                            ) || 0;

                        // Leitura de campos de texto/data
                        const status = FiberGuardian.Utils.getInputValue(
                            'status',
                            'APROVADO'
                        ); // Default se necessário
                        const numeroLote = FiberGuardian.Utils.getInputValue(
                            'numeroLote',
                            ''
                        ); // Número do lote vai para observacaoLaudo
                        const observacaoLaudo = FiberGuardian.Utils.getInputValue(
                            'textAreaObservacaoLaudo',
                            ''
                        ); // observacoes
                        const dataRealizacao = FiberGuardian.Utils.getInputValue(
                            'dataLaudo',
                            ''
                        );

                        console.log('[FG] Valores lidos:', {
                            cvm,
                            pontosFinos,
                            pontosGrossos,
                            neps,
                            hPilosidade,
                            resistencia,
                            alongamento,
                            tituloNe,
                            torcaoTm,
                            status,
                            numeroLote,
                            observacaoLaudo,
                            dataRealizacao,
                        });

                        // Montar payload final
                        const payload = {
                            cvm,
                            pontosFinos,
                            pontosGrossos,
                            neps,
                            pilosidade: hPilosidade,
                            resistencia,
                            alongamento,
                            tituloNe,
                            torcaoTm,
                            status,
                            observacaoLaudo,
                            numeroLote,
                            dataRealizacao,
                            cnpj: cnpjFornecedorSelecionado,
                            codigoNf: codigoNotaFiscalSelecionado,
                            codProduto: codigoProdutoSelecionado,
                            emailLaudoLab: emailLiberacaoPor,
                        };

                        console.log('[FG] Payload pronto para envio:', payload);
                        //alert('[FG] Fazendo o fetch...');

                        const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                        const resposta = await fetch('/api/laboratorios', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-XSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                            body: JSON.stringify(payload),
                        });

                        if (resposta.ok) {
                            limparFormulario();
                            FiberGuardian.Utils.exibirMensagemModalComFoco(
                                'Laudo Laboratório gravado com sucesso.',
                                'success',
                                inputFornecedor
                            );
                        } else if (resposta.status === 403) {
                            FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                            FiberGuardian.Utils.voltarMenuPrincipal();
                        } else {
                            await FiberGuardian.Utils.tratarErroFetch(
                                resposta,
                                inputFornecedor
                            );
                        }
                    } catch (erro) {
                        console.error(
                            'Falha na requisição ou montagem do payload:',
                            erro
                        );
                        FiberGuardian.Utils.exibirErroDeRede(
                            'Erro de rede ao gravar laudo laboratório',
                            document.getElementById('fornecedor'),
                            erro
                        );
                        FiberGuardian.Utils.voltarMenuPrincipal();
                    }
                });
            }
        }

        return {
            init: configurarEventos,
        };
    })();
})();
