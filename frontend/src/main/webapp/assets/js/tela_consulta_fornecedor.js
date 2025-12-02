(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaConsultaFornecedor = (function () {
        let globalCnpjFornecedor = null;

        // Função para consultar detalhes do fornecedor
        async function consultarFornecedor() {
            console.log('Cnpj Fornecedor selecionado : ' + globalCnpjFornecedor);

            if (!globalCnpjFornecedor) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Por favor, selecione um fornecedor.',
                    'warning',
                    document.getElementById('fornecedor')
                );
                return;
            }

            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();
                console.log('Token CSRF para consulta:', csrfToken);

                const url = `/api/fornecedores/${globalCnpjFornecedor}`;
                console.log('Consultando fornecedor em:', url);

                const resposta = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                });

                if (resposta.ok) {
                    const dadosFornecedor = await resposta.json();
                    console.log('Detalhes do fornecedor:', dadosFornecedor);
                    document.getElementById('nomeFornecedor').value =
                        dadosFornecedor.nomeFornecedor ||
                        dadosFornecedor.nome ||
                        dadosFornecedor.razaoSocial ||
                        '';
                    document.getElementById('cnpjFornecedor').value =
                        dadosFornecedor.cnpj || '';
                    document.getElementById('emailFornecedor').value =
                        dadosFornecedor.email || '';
                    document.getElementById('telefoneFornecedor').value =
                        dadosFornecedor.telefone || '';

                    document.getElementById('btnEditar').style.display = 'inline-block';
                    document.getElementById('btnSalvar').style.display = 'none';
                    document.getElementById('btnExcluir').style.display =
                        'inline-block';

                    document.getElementById('nomeFornecedor').focus();
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(
                        resposta,
                        document.getElementById('fornecedor')
                    );
                }
            } catch (erro) {
                console.error('Erro de rede ao consultar fornecedor:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao alterar cadastro fornecedor.',
                    document.getElementById('fornecedor'),
                    erro
                );
            }
        }

        // Função para iniciar o modo de edição
        function iniciarEdicao() {
            if (!globalCnpjFornecedor) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Por favor, selecione um fornecedor.',
                    'warning',
                    document.getElementById('fornecedor')
                );
                return;
            }
            document.getElementById('nomeFornecedor').readOnly = false;
            document.getElementById('cnpjFornecedor').readOnly = true;
            document.getElementById('emailFornecedor').readOnly = false;
            document.getElementById('telefoneFornecedor').readOnly = false;

            document.getElementById('btnEditar').style.display = 'none';
            document.getElementById('btnSalvar').style.display = 'inline-block';
            document.getElementById('btnExcluir').style.display = 'none';
            document.getElementById('btnSalvar').style.display = 'inline-block';
        }

        // Função para salvar as alterações
        async function salvarAlteracoes() {
            const inputFornecedor = document.getElementById('fornecedor');

            const cnpj = document.getElementById('cnpjFornecedor').value.trim();
            const nomeFornecedor = document
                .getElementById('nomeFornecedor')
                .value.trim();
            const emailFornecedor = document
                .getElementById('emailFornecedor')
                .value.trim();
            let telefoneFornecedor = document
                .getElementById('telefoneFornecedor')
                .value.trim();

            console.log('Dados a serem salvos:', {
                cnpj,
                nomeFornecedor,
                emailFornecedor,
                telefoneFornecedor,
            });

            if (!nomeFornecedor || !cnpj || !emailFornecedor || !telefoneFornecedor) {
                FiberGuardian.Utils.exibirMensagemModal(
                    'Nome, CNPJ, Email e Telefone são campos obrigatórios.',
                    'warning'
                );
                return;
            }

            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();
                console.log('Token CSRF para salvar:', csrfToken);

                const url = `/api/fornecedores/${globalCnpjFornecedor}`;
                console.log('Salvando alterações em:', url);

                const resposta = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        nomeFornecedor: nomeFornecedor,
                        cnpj: cnpj,
                        email: emailFornecedor,
                        telefone: telefoneFornecedor,
                    }),
                });

                if (resposta.ok) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Alteração cadastro fornecedor realizado com sucesso.',
                        'success',
                        inputFornecedor
                    );
                    limpaCampos();
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(
                        resposta,
                        inputFornecedor
                    );
                }
            } catch (erro) {
                console.error('Erro de rede ao salvar fornecedor:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao alterar cadastro fornecedor.',
                    inputFornecedor,
                    erro
                );
            }
        }

        // Função para excluir o fornecedor
        async function excluirFornecedor() {
            if (!globalCnpjFornecedor) {
                FiberGuardian.Utils.exibirMensagemModalComFoco(
                    'Por favor, selecione um fornecedor.',
                    'warning',
                    document.getElementById('fornecedor')
                );
                return;
            }
            const inputFornecedor = document.getElementById('fornecedor');

            const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                'Deseja realmente excluir fornecedor ?',
                'Excluir fornecedor'
            );

            if (!confirmado) {
                limpaCampos();
                return;
            }

            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                const url = `/api/fornecedores/${globalCnpjFornecedor}`;
                console.log('Excluindo fornecedor em:', url);

                const resposta = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                });

                if (resposta.ok) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Fornecedor excluído com sucesso.',
                        'success',
                        inputFornecedor
                    );
                    limpaCampos();
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(
                        resposta,
                        inputFornecedor
                    );
                }
            } catch (erro) {
                console.error('Erro ao deletar fornecedor:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao deletar fornecedor.',
                    inputFornecedor,
                    erro
                );
            }
        }

        function limpaCampos() {
            globalCnpjFornecedor = null;
            document.getElementById('btnEditar').style.display = 'inline-block';
            document.getElementById('btnSalvar').style.display = 'none';
            document.getElementById('btnExcluir').style.display = 'inline-block';

            document.getElementById('nomeFornecedor').value = '';
            document.getElementById('cnpjFornecedor').value = '';
            document.getElementById('emailFornecedor').value = '';
            document.getElementById('telefoneFornecedor').value = '';

            document.getElementById('nomeFornecedor').readOnly = true;
            document.getElementById('cnpjFornecedor').readOnly = true;
            document.getElementById('emailFornecedor').readOnly = true;
            document.getElementById('telefoneFornecedor').readOnly = true;

            document.getElementById('fornecedor').value = '';
            const btnBuscarFornecedor = document.getElementById('btnBuscarFornecedor');
            const btnTrocarFornecedor = document.getElementById('btnTrocarFornecedor');
            const inputFornecedor = document.getElementById('fornecedor');
            inputFornecedor.value = '';
            inputFornecedor.readOnly = false;
            inputFornecedor.classList.remove('campo-desabilitado');

            btnBuscarFornecedor.disabled = false;
            btnBuscarFornecedor.classList.remove('campo-desabilitado');
            btnTrocarFornecedor.disabled = true;
            btnTrocarFornecedor.classList.add('campo-desabilitado');
        }

        // Configurar eventos
        function configurarEventos() {
            console.log('Módulo TelaConsultaFornecedor inicializado.');

            globalCnpjFornecedor = null; // <<< reseta a variável

            const btnBuscarFornecedor = document.getElementById('btnBuscarFornecedor');
            const btnTrocarFornecedor = document.getElementById('btnTrocarFornecedor');
            const inputFornecedor = document.getElementById('fornecedor');
            const dropdownFornecedor = document.getElementById('dropdownFornecedor');

            const btnConsultar = document.getElementById('btnConsultar');
            const btnEditar = document.getElementById('btnEditar');
            const btnSalvar = document.getElementById('btnSalvar');
            const btnExcluir = document.getElementById('btnExcluir');
            const btnSair = document.getElementById('btnSair');
            const btnVoltar = document.getElementById('btnVoltar');

            if (
                !btnBuscarFornecedor ||
                !inputFornecedor ||
                !dropdownFornecedor ||
                !btnConsultar ||
                !btnEditar ||
                !btnSalvar ||
                !btnExcluir ||
                !btnVoltar
            ) {
                console.error('Elementos da consulta de fornecedor não encontrados:', {
                    btnBuscarFornecedor,
                    inputFornecedor,
                    dropdownFornecedor,
                    btnConsultar,
                    btnEditar,
                    btnSalvar,
                    btnExcluir,
                    btnVoltar,
                });
                exibirMensagemModal(
                    'Erro: Elementos da interface não encontrados.',
                    'danger'
                );
                return;
            }

            btnConsultar.addEventListener('click', consultarFornecedor);
            btnEditar.addEventListener('click', iniciarEdicao);
            btnSalvar.addEventListener('click', salvarAlteracoes);
            btnExcluir.addEventListener('click', excluirFornecedor);

            // Fecha dropdowns quando clicar fora
            FiberGuardian.Utils.fecharQualquerDropdownAberto(
                [dropdownFornecedor],
                [inputFornecedor],
                [btnBuscarFornecedor]
            );

            limpaCampos();

            btnBuscarFornecedor.addEventListener('click', async () => {
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

                        // Guarda CNPJ do fornecedor escolhido
                        globalCnpjFornecedor = item.cnpj;

                        // Trava input + botão Buscar
                        inputFornecedor.readOnly = true;
                        inputFornecedor.classList.add('campo-desabilitado');
                        btnBuscarFornecedor.disabled = true;
                        btnBuscarFornecedor.classList.add('campo-desabilitado');

                        // Habilita botão Trocar
                        btnTrocarFornecedor.disabled = false;
                        btnTrocarFornecedor.classList.remove('campo-desabilitado');

                        // Handler de troca
                        btnTrocarFornecedor.addEventListener(
                            'click',
                            () => {
                                document.getElementById('nomeFornecedor').value = '';
                                document.getElementById('cnpjFornecedor').value = '';
                                document.getElementById('emailFornecedor').value = '';
                                document.getElementById('telefoneFornecedor').value =
                                    '';
                                globalCnpjFornecedor = null;
                                inputFornecedor.value = '';
                                inputFornecedor.readOnly = false;
                                inputFornecedor.classList.remove('campo-desabilitado');

                                btnBuscarFornecedor.disabled = false;
                                btnBuscarFornecedor.classList.remove(
                                    'campo-desabilitado'
                                );

                                btnTrocarFornecedor.disabled = true;
                                btnTrocarFornecedor.classList.add('campo-desabilitado');
                            },
                            { once: true }
                        ); // evita múltiplos listeners
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

            btnSair.addEventListener('click', async () => {
                const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                    'Deseja realmente voltar ao Menu Principal?',
                    'Voltar menu principal'
                );

                if (confirmado) {
                    FiberGuardian.Utils.voltarMenuPrincipal();
                }
                inputFornecedor.focus();
                return;
            });

            btnVoltar.addEventListener('click', async () => {
                limpaCampos();
                return;
            });
        }

        return {
            init: configurarEventos,
        };
    })();
})();
