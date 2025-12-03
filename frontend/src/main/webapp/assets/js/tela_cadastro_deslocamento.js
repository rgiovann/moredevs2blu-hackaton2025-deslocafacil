(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    // Variáveis "privadas" do módulo (escopo fechado)
    let emailUsuario = null;

    FiberGuardian.TelaCadastroDeslocamento = (function () {
        // --- Helpers internos -------------------------------------------------
        function obterElemento(id) {
            return document.getElementById(id);
        }

        function exibirErroGenerico(mensagem, focoElemento) {
            FiberGuardian.Utils.exibirMensagemModalComFoco(
                mensagem,
                'warning',
                focoElemento
            );
        }

        // --- Limpar formulário ------------------------------------------------
        function limparFormulario() {
            // Campos do HTML
            const campos = [
                'colaborador',
                'origemCidade',
                'origemEstado',
                'origemEndereco',
                'destinoCidade',
                'destinoEstado',
                'destinoEndereco',
                'motivo',
                'dataSaida',
                'dataChegadaPrevista',
                'meioTransporte',
                'custoEstimado',
                'custoReal',
                'observacoes',
            ];

            campos.forEach((id) => {
                const el = obterElemento(id);
                if (!el) return;
                if (
                    el.tagName === 'SELECT' ||
                    el.tagName === 'INPUT' ||
                    el.tagName === 'TEXTAREA'
                ) {
                    // Para select, reset para option default (se houver)
                    if (el.tagName === 'SELECT') {
                        el.selectedIndex = 0;
                    } else {
                        // input/text/textarea
                        el.value = '';
                    }
                    // Remove readOnly/disabled se tiver (por segurança)
                    el.readOnly = false;
                    el.disabled = false;
                    el.classList.remove('campo-desabilitado');
                }
            });

            // Reverter estado do dropdown/seleção de colaborador
            const inputColaborador = obterElemento('colaborador');
            const btnBuscarColaborador = obterElemento('btnBuscarColaborador');
            const btnTrocarColaborador = obterElemento('btnTrocarColaborador');

            emailUsuario = null;

            if (inputColaborador) {
                inputColaborador.value = '';
                inputColaborador.readOnly = false;
                inputColaborador.classList.remove('campo-desabilitado');
                inputColaborador.focus();
            }

            if (btnBuscarColaborador) {
                btnBuscarColaborador.disabled = false;
                btnBuscarColaborador.classList.remove('campo-desabilitado');
            }

            if (btnTrocarColaborador) {
                btnTrocarColaborador.disabled = true;
                btnTrocarColaborador.classList.add('campo-desabilitado');
            }

            // Fecha dropdown se houver utilitário
            if (FiberGuardian?.Utils?.fecharQualquerDropdownAberto) {
                FiberGuardian.Utils.fecharQualquerDropdownAberto(
                    [obterElemento('dropdownColaborador')],
                    [obterElemento('colaborador')],
                    [obterElemento('btnBuscarColaborador')]
                );
            }
        }

        // --- Construir payload e enviar --------------------------------------
        async function enviarDeslocamentoAoBackend(payload, focoEmCasoErro) {
            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

                const resposta = await fetch('/api/deslocamentos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                });

                if (resposta.ok) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco(
                        'Deslocamento gravado com sucesso.',
                        'success',
                        obterElemento('colaborador') || focoEmCasoErro
                    );
                    limparFormulario();
                    return;
                } else if (resposta.status === 403) {
                    FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                } else {
                    await FiberGuardian.Utils.tratarErroFetch(resposta, focoEmCasoErro);
                }
            } catch (erro) {
                console.error('Erro na requisição de gravação de deslocamento:', erro);
                FiberGuardian.Utils.exibirErroDeRede(
                    'Erro de rede ao salvar deslocamento.',
                    focoEmCasoErro,
                    erro
                );
            }
        }

        // --- Handler do botão Salvar -----------------------------------------
        async function handleSalvarDeslocamento() {
            // Captura elementos importantes
            const inputColaborador = obterElemento('colaborador');
            const inputOrigemCidade = obterElemento('origemCidade');
            const selectOrigemEstado = obterElemento('origemEstado');
            const inputOrigemEndereco = obterElemento('origemEndereco');

            const inputDestinoCidade = obterElemento('destinoCidade');
            const selectDestinoEstado = obterElemento('destinoEstado');
            const inputDestinoEndereco = obterElemento('destinoEndereco');

            const inputMotivo = obterElemento('motivo');
            const inputDataSaida = obterElemento('dataSaida');
            const inputDataChegadaPrevista = obterElemento('dataChegadaPrevista');

            const selectMeioTransporte = obterElemento('meioTransporte');

            const inputCustoEstimado = obterElemento('custoEstimado');
            const inputCustoReal = obterElemento('custoReal');
            const inputObservacoes = obterElemento('observacoes');

            // Validações defensivas (mensagens usando seu utilitário)
            // 1) colaborador (emailUsuario deve ter sido definido no dropdown)
            if (!emailUsuario || !emailUsuario.trim()) {
                exibirErroGenerico(
                    'Informe o Colaborador (busque e selecione um usuário).',
                    inputColaborador
                );
                return;
            }

            // 2) Origem cidade
            if (!inputOrigemCidade || !inputOrigemCidade.value.trim()) {
                exibirErroGenerico('Informe a Origem - Cidade.', inputOrigemCidade);
                return;
            }

            // 3) Origem estado
            if (!selectOrigemEstado || !selectOrigemEstado.value) {
                exibirErroGenerico(
                    'Informe a Origem - Estado.',
                    selectOrigemEstado || inputOrigemCidade
                );
                return;
            }

            // 4) Destino cidade
            if (!inputDestinoCidade || !inputDestinoCidade.value.trim()) {
                exibirErroGenerico('Informe a Destino - Cidade.', inputDestinoCidade);
                return;
            }

            // 5) Destino estado
            if (!selectDestinoEstado || !selectDestinoEstado.value) {
                exibirErroGenerico(
                    'Informe o Destino - Estado.',
                    selectDestinoEstado || inputDestinoCidade
                );
                return;
            }

            // 6) Motivo
            if (!inputMotivo || !inputMotivo.value.trim()) {
                exibirErroGenerico('Informe o Motivo do Deslocamento.', inputMotivo);
                return;
            }

            // 7) Data Saida
            if (!inputDataSaida || !inputDataSaida.value) {
                exibirErroGenerico('Informe a Data e Hora de Saída.', inputDataSaida);
                return;
            }

            // 8) Data Chegada Prevista
            if (!inputDataChegadaPrevista || !inputDataChegadaPrevista.value) {
                exibirErroGenerico(
                    'Informe a Data e Hora de Chegada Prevista.',
                    inputDataChegadaPrevista
                );
                return;
            }

            if (inputDataSaida.value >= inputDataChegadaPrevista.value) {
                exibirErroGenerico(
                    'A Data/Hora de Saída deve ser anterior à Data/Hora de Chegada Prevista.',
                    inputDataSaida
                );
                return;
            }

            // 9) Meio Transporte
            if (!selectMeioTransporte || !selectMeioTransporte.value) {
                exibirErroGenerico(
                    'Informe o Meio de Transporte.',
                    selectMeioTransporte
                );
                return;
            }

            // === Construção do payload conforme sua entidade ===
            const payload = {
                usuario: emailUsuario,
                origemCidade: inputOrigemCidade.value.trim(),
                origemEstado: selectOrigemEstado.value,
                origemEndereco: inputOrigemEndereco?.value?.trim() || null,
                destinoCidade: inputDestinoCidade.value.trim(),
                destinoEstado: selectDestinoEstado.value,
                destinoEndereco: inputDestinoEndereco?.value?.trim() || null,
                motivo: inputMotivo.value.trim(),
                dataSaida: FiberGuardian.Utils.converterInputDatetimeParaUtcIso(
                    inputDataSaida.value
                ),
                dataChegadaPrevista:
                    FiberGuardian.Utils.converterInputDatetimeParaUtcIso(
                        inputDataChegadaPrevista.value
                    ),
                meioTransporte: selectMeioTransporte.value,
                custoEstimado:
                    FiberGuardian.Utils.parseCurrencyToNumber(
                        inputCustoEstimado?.value
                    ) ?? null,
                custoReal:
                    FiberGuardian.Utils.parseCurrencyToNumber(inputCustoReal?.value) ??
                    null,
                observacoes: inputObservacoes?.value?.trim() || null,
            };

            // Envia para backend
            await enviarDeslocamentoAoBackend(payload, inputColaborador);
        }

        // --- Bind de eventos --------------------------------------------------
        function configurarEventos() {
            console.log('Módulo TelaCadastroDeslocamento inicializado.');

            const btnBuscarColaborador = obterElemento('btnBuscarColaborador');
            const btnTrocarColaborador = obterElemento('btnTrocarColaborador');
            const inputColaborador = obterElemento('colaborador');
            const dropdownColaborador = obterElemento('dropdownColaborador');

            const btnSalvarDeslocamento = obterElemento('btnSalvarDeslocamento');
            const btnLimparFormulario = obterElemento('btnLimparFormulario');
            const btnSair = obterElemento('btnSair');

            // Verificação básica de elementos essenciais
            if (
                !inputColaborador ||
                !dropdownColaborador ||
                !btnSalvarDeslocamento ||
                !btnLimparFormulario ||
                !btnSair
            ) {
                console.error(
                    'Elementos essenciais não encontrados na página. Verifique IDs esperados.'
                );
                return;
            }

            // --- Integração com dropdown já existente (assumindo que renderiza item/email)
            // O código que popula `emailUsuario` já existia no projeto original no listener de busca.
            // Aqui apenas garantimos que, se o dropdown/renderer chamar uma função de callback para setar email,
            // esse módulo suporta setar emailUsuario. Se seu renderizador já seta a variável global, ótimo.
            // Entretanto, se você quiser, podemos expor um setter público:
            if (!FiberGuardian.TelaCadastroDeslocamento.setUsuarioSelecionado) {
                FiberGuardian.TelaCadastroDeslocamento.setUsuarioSelecionado =
                    function (email) {
                        emailUsuario = email;
                    };
            }

            // Se o dropdown interno do seu utilitário chama um callback retornando 'item' semelhante ao antigo,
            // ele já tem código que seta a variável `emailUsuario` (preservado na sua implementação original).
            // Mantemos apenas a lógica de troca:
            if (btnTrocarColaborador) {
                btnTrocarColaborador.addEventListener('click', () => {
                    emailUsuario = null;
                    if (inputColaborador) {
                        inputColaborador.value = '';
                        inputColaborador.readOnly = false;
                        inputColaborador.classList.remove('campo-desabilitado');
                    }
                    if (btnBuscarColaborador) {
                        btnBuscarColaborador.disabled = false;
                        btnBuscarColaborador.classList.remove('campo-desabilitado');
                    }
                    btnTrocarColaborador.disabled = true;
                    btnTrocarColaborador.classList.add('campo-desabilitado');
                });
            }

            // --- Botão Salvar
            btnSalvarDeslocamento.addEventListener('click', function () {
                handleSalvarDeslocamento();
            });

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
                            await FiberGuardian.Utils.renderizarDropdownGenericoAsync({
                                input: inputColaborador,
                                dropdown: dropdownColaborador,
                                lista: listaUsuarios,
                                camposExibir: ['nome', 'email', 'telefone'],
                                titulosColunas: ['Usuário', 'Email', 'Telefone'],
                                msgVazio: 'Nenhum usuário encontrado.',
                            });
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
                            btnBuscarColaborador.classList.remove('campo-desabilitado');

                            btnTrocarColaborador.disabled = true;
                            btnTrocarColaborador.classList.add('campo-desabilitado');
                        });

                        //console.log('Index:', index);
                        //console.log('Email: [emailUsuario]', emailUsuario);
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

            // --- Botão Limpar
            btnLimparFormulario.addEventListener('click', function () {
                FiberGuardian.Utils.confirmarAcaoAsync(
                    'Deseja limpar o formulário?',
                    'Limpar formulário'
                )
                    .then((confirmado) => {
                        if (confirmado) {
                            limparFormulario();
                        }
                    })
                    .catch((err) => {
                        console.error('Erro ao confirmar limpeza:', err);
                    });
            });

            // --- Botão Sair (usando template fornecido) -------------------------
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

            // --- Mascaramento / comportamento UX mínimo (aplica máscaras já definidas)
            const camposMonetarios = document.querySelectorAll('.campo-monetario');
            camposMonetarios.forEach((campo) => {
                if (FiberGuardian?.Utils?.aplicarMascaraMonetaria) {
                    FiberGuardian.Utils.aplicarMascaraMonetaria(campo);
                }
            });

            // Fecha dropdown caso algo abra por padrão
            if (FiberGuardian?.Utils?.fecharQualquerDropdownAberto) {
                FiberGuardian.Utils.fecharQualquerDropdownAberto(
                    [obterElemento('dropdownColaborador')],
                    [obterElemento('colaborador')],
                    [obterElemento('btnBuscarColaborador')]
                );
            }
        }

        // --- Revealing: expõe init e setter público para usuário selecionado ----
        return {
            init: configurarEventos,
            // permite que outros scripts (p.ex. renderizador do dropdown) informem o email selecionado
            setUsuarioSelecionado: function (email) {
                emailUsuario = email;
            },
        };
    })();
})();
