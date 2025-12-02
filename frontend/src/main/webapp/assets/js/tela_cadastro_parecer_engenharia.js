(function () {
    "use strict";

    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaCadastroParecerEngenharia = (function () {
        const URL_CADASTRAR_PARECER = "/api/parecer-engenharia/cadastrar"; // ajuste conforme seu backend

        async function configurarFormulario() {
            const form = document.getElementById("formParecer");
            if (!form) {
                FiberGuardian.Utils.exibirMensagemModal("Erro: Formulário não encontrado.", "danger");
                return;
            }

            const restricaoParcial = document.getElementById("restricaoParcial");
            const restricaoTotal = document.getElementById("restricaoTotal");
            const restricaoAdicional = document.getElementById("restricaoAdicional");

            // mostrar/esconder campo restrição adicional
            if (restricaoParcial && restricaoTotal && restricaoAdicional) {
                restricaoParcial.addEventListener("change", () => {
                    restricaoAdicional.style.display = "block";
                });
                restricaoTotal.addEventListener("change", () => {
                    restricaoAdicional.style.display = "none";
                    restricaoAdicional.value = "";
                });
            }

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const nomeEngenheiro = document.getElementById("nomeEngenheiro");
                const tipoTeste = Array.from(document.querySelectorAll('input[name="tipoTeste"]:checked'))
                    .map(input => input.value);
                const restricao = document.querySelector('input[name="restricao"]:checked')?.value || "";
                const observacao = document.getElementById("observacao");

                // validações obrigatórias
                if (!nomeEngenheiro.value.trim()) {
                    FiberGuardian.Utils.exibirMensagemModalComFoco("O campo Nome Engenheiro é obrigatório.", "danger", nomeEngenheiro);
                    return;
                }
                if (!tipoTeste.length) {
                    FiberGuardian.Utils.exibirMensagemModal("Selecione pelo menos um Tipo de Teste.", "danger");
                    return;
                }
                if (!restricao) {
                    FiberGuardian.Utils.exibirMensagemModal("O campo Restrição é obrigatório.", "danger");
                    return;
                }

                const formData = {
                    nomeEngenheiro: nomeEngenheiro.value.trim(),
                    tipoTeste: tipoTeste,
                    restricao: restricao,
                    restricaoAdicional: restricaoAdicional?.value.trim() || "",
                    observacao: observacao?.value.trim() || ""
                };

                try {
                    const csrf = await FiberGuardian.Utils.obterTokenCsrf();
                    const resposta = await fetch(URL_CADASTRAR_PARECER, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            "X-XSRF-TOKEN": csrf,
                        },
                        body: JSON.stringify(formData),
                    });

                    if (resposta.ok) {
                        FiberGuardian.Utils.exibirMensagemModal("Cadastro realizado com sucesso!", "success");
                        form.reset();
                        restricaoAdicional.style.display = "none";
                    } else if (resposta.status === 403) {
                        FiberGuardian.Utils.exibirMensagemSessaoExpirada();
                    } else {
                        await FiberGuardian.Utils.tratarErroFetch(resposta, nomeEngenheiro);
                    }
                } catch (erro) {
                    FiberGuardian.Utils.exibirErroDeRede("Erro de rede ao cadastrar parecer.", nomeEngenheiro, erro);
                }
            });
        }

        function configurarBotaoImprimir() {
            const btnImprimir = document.getElementById("btnImprimir");
            if (btnImprimir) {
                btnImprimir.addEventListener("click", () => window.print());
            }
        }

        function configurarBotaoSair() {
            const btnSair = document.getElementById("btnSair");
            if (btnSair) {
                btnSair.addEventListener("click", async () => {
                    const confirmado = await FiberGuardian.Utils.confirmarAcaoAsync(
                        "Deseja realmente voltar ao Menu Principal?",
                        "Sair do Sistema"
                    );
                    if (confirmado) {
                        FiberGuardian.Utils.voltarMenuPrincipal();
                    }
                });
            }
        }

        function configurarEventos() {
            configurarFormulario();
            configurarBotaoImprimir();
            configurarBotaoSair();
        }

        document.addEventListener("DOMContentLoaded", () => {
            FiberGuardian.TelaCadastroParecerEngenharia.init();
        });

        return { init: configurarEventos };
    })();
})();

