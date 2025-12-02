(function () {
  window.FiberGuardian = window.FiberGuardian || {};

  FiberGuardian.TelaListaCadastroUsuario = (function () {
    const API_URL = "/api/usuarios";
    const PAGE_SIZE = 10;
    let paginaAtual = 0;
    let totalPaginas = 1;

    function carregarUsuarios(pagina = 0) {
      fetch(`${API_URL}?page=${pagina}`, {
        method: "GET",
        credentials: "include",
      })
        .then((resp) => {
          if (!resp.ok) throw new Error("Erro ao buscar usuários");
          return resp.json();
        })
        .then((dados) => {
          if (
            !Array.isArray(dados.content) ||
            typeof dados.totalPages !== "number"
          ) {
            throw new Error("Resposta da API em formato inesperado.");
          }
          const usuarios = dados.content;
          totalPaginas = dados.totalPages;
          paginaAtual = dados.pageNumber; // <- correção aqui
          atualizarTabela(usuarios);
          atualizarPaginacao();
        })
        .catch((err) =>
          FiberGuardian.Utils?.exibirMensagem?.(
            "Erro: " + err.message,
            "danger"
          )
        );
    }

    function atualizarTabela(usuarios) {
      const tbody = document.getElementById("tabelaUsuarios");
      if (!tbody) {
        console.warn("Elemento #tabelaUsuarios não encontrado.");
        return;
      }

      tbody.innerHTML = "";

      usuarios.forEach((u, index) => {
        const linha = document.createElement("tr");

        const statusClass = u.ativo ? "status-ativo" : "status-inativo";
        const statusTexto = u.ativo ? "Ativo" : "Inativo";
        const botaoTexto = u.ativo ? "Inativar" : "Ativar";
        const botaoClasse = u.ativo ? "btn-warning" : "btn-success";

        linha.innerHTML = `
          <td>${index + 1 + paginaAtual * PAGE_SIZE}</td>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td class="${statusClass}">${statusTexto}</td>
          <td>
            <button type="button" class="btn btn-sm ${botaoClasse} btn-status" data-email="${
          u.email
        }" data-ativo="${u.ativo}">
              ${botaoTexto}
            </button>
          </td>
        `;

        tbody.appendChild(linha);
      });

      adicionarListeners();
    }

    function adicionarListeners() {
      const botoes = document.querySelectorAll(
        "#tabelaUsuarios button[data-email]"
      );

      botoes.forEach((botao) => {
        botao.addEventListener("click", async () => {
          const email = botao.getAttribute("data-email");
          const ativo = botao.getAttribute("data-ativo") === "true";
          const metodoHttp = ativo ? "DELETE" : "PUT";

          try {
            const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();

            const resposta = await fetch(`${API_URL}/ativo`, {
              method: metodoHttp,
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
              },
              body: JSON.stringify({ email }),
            });

            if (!resposta.ok) {
              throw new Error("Falha ao atualizar status");
            }

            carregarUsuarios(paginaAtual);
          } catch (err) {
            FiberGuardian.Utils?.exibirMensagem?.(
              "Erro: " + err.message,
              "danger"
            );
          }
        });
      });
    }

    function atualizarPaginacao() {
      const paginacao = document.getElementById("paginacaoUsuarios");
      if (!paginacao) {
        console.warn("Elemento #paginacaoUsuarios não encontrado.");
        return;
      }

      paginacao.innerHTML = "";

      for (let i = 0; i < totalPaginas; i++) {
        const item = document.createElement("li");
        item.className = `page-item ${i === paginaAtual ? "active" : ""}`;
        item.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          carregarUsuarios(i);
        });
        paginacao.appendChild(item);
      }
    }

    document.addEventListener("DOMContentLoaded", function () {
      FiberGuardian.TelaListaCadastroUsuario.init();
    });

    return {
      init: () => carregarUsuarios(),
    };
  })();
})();
