(function () {
    window.FiberGuardian = window.FiberGuardian || {};

    FiberGuardian.TelaCheckpoint = (function () {
        let deslocamentoId = null;
        const MOCK_USUARIO = 'Fulano da Silva';

        // Mock do deslocamento selecionado (id=4)
        const MOCK_DESLOCAMENTO = {
            id: 4,
            origem: 'Curitiba',
            destino: 'São Paulo',
            dataSaida: '2025-12-03 16:00',
        };

        // Checkpoints referentes ao deslocamento 4
        const MOCK_CHECKPOINTS = [
            {
                descricao: 'Saída do Hotel',
                icone: 'hotel',
                cor: '#1E40AF',
                localizacao: 'Rua Felipe Schmidt 100 - Florianópolis',
                data_realizada: '2025-12-01 05:00',
                observacoes: 'Checkpoint de partida criado automaticamente',
            },
            {
                descricao: 'Parada Combustível',
                icone: 'gas-pump',
                cor: '#FBBF24',
                localizacao: 'Posto BR-101 km 215',
                data_realizada: '2025-12-01 07:15',
                observacoes: 'Abastecimento completo',
            },
            {
                descricao: 'Almoço em Garopaba',
                icone: 'utensils',
                cor: '#F59E0B',
                localizacao: 'Garopaba - SC',
                data_realizada: '2025-12-01 09:30',
                observacoes: 'Parada para refeição',
            },
            {
                descricao: 'Congestionamento Severo',
                icone: 'circle-exclamation',
                cor: '#EF4444',
                localizacao: 'BR-101 km 310 - Divisa SC/RS',
                data_realizada: '2025-12-01 14:00',
                observacoes: 'Acidente na pista - 4h parado',
            },
            {
                descricao: 'Entrada Porto Alegre',
                icone: 'map-pin',
                cor: '#F97316',
                localizacao: 'Região Metropolitana POA',
                data_realizada: '2025-12-01 15:45',
                observacoes: 'Trânsito normalizado',
            },
            {
                descricao: 'Chegada Congresso',
                icone: 'building',
                cor: '#10B981',
                localizacao: 'Av. Borges de Medeiros 300 - POA',
                data_realizada: '2025-12-01 16:30',
                observacoes: 'Checkpoint de chegada criado automaticamente',
            },
        ];
        async function init() {
            document.getElementById('btnSair').addEventListener('click', () => {
                FiberGuardian.Utils.voltarMenuPrincipal();
            });

            document
                .getElementById('btnAdicionarCheckpoint')
                .addEventListener('click', () => {
                    abrirModalEdicao();
                });

            // Escuta evento global vindo da consulta
            document.addEventListener('abrirCheckpointsDeslocamento', (e) => {
                const { deslocamentoId: id, nomeColaborador, origemDestino } = e.detail;
                deslocamentoId = id;
                document.getElementById('deslocamentoId').value = id;
                document.getElementById('infoDeslocamento').innerHTML = `
          <strong>${nomeColaborador}</strong><br>
          <small class="text-muted">${origemDestino}</small>
        `;
                document.getElementById('deslocamentoIdDisplay').textContent = id;
                carregarCheckpoints();
            });
        }

        async function carregarCheckpoints() {
            try {
                const csrfToken = await FiberGuardian.Utils.obterTokenCsrf();
                const resp = await fetch(
                    `/api/checkpoints/deslocamento/${deslocamentoId}`,
                    {
                        headers: { 'X-XSRF-TOKEN': csrfToken },
                        credentials: 'include',
                    }
                );

                if (!resp.ok) throw new Error('Erro ao carregar checkpoints');

                const checkpoints = await resp.json();
                renderizarCheckpoints(checkpoints);
            } catch (err) {
                FiberGuardian.Utils.exibirMensagemModal(
                    'Erro ao carregar checkpoints: ' + err.message,
                    'danger'
                );
            }
        }

        function renderizarCheckpoints(lista) {
            const container = document.getElementById('listaCheckpoints');
            if (!lista || lista.length === 0) {
                container.innerHTML = `<div class="text-center py-5 text-muted"><i class="fas fa-route fa-3x mb-3"></i><p>Nenhum checkpoint cadastrado.</p></div>`;
                return;
            }

            container.innerHTML = lista
                .map(
                    (cp) => `
          <div class="card-body d-flex align-items-center">
             <div class="flex-fill">
              <h6 class="mb-1">
                <i class="fas ${
                    cp.icone || 'fa-map-marker-alt'
                } checkpoint-icon" style="color: ${cp.cor}"></i>
                <strong>${cp.descricao || 'Sem descrição'}</strong>
              </h6>
              <small class="text-muted">
                ${cp.localizacao ? cp.localizacao + ' • ' : ''}
                ${
                    cp.categoria === 'PARTIDA'
                        ? 'Partida'
                        : cp.categoria === 'CHEGADA'
                        ? 'Chegada'
                        : 'Intermediário'
                }
              </small>
              ${
                  cp.observacoes
                      ? `<p class="mt-2 mb-0 text-muted small">${cp.observacoes}</p>`
                      : ''
              }
            </div>
            <div class="ms-3">
              <button class="btn btn-sm btn-outline-primary me-1 btn-editar-cp" data-id="${
                  cp.id
              }">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-excluir-cp" data-id="${
                  cp.id
              }">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `
                )
                .join('');

            // Eventos
            document.querySelectorAll('.btn-editar-cp').forEach((btn) => {
                btn.addEventListener('click', () =>
                    abrirModalEdicao(lista.find((c) => c.id == btn.dataset.id))
                );
            });
            document.querySelectorAll('.btn-excluir-cp').forEach((btn) => {
                btn.addEventListener('click', () => excluirCheckpoint(btn.dataset.id));
            });
        }

        function abrirModalEdicao(checkpoint = null) {
            const modal = new bootstrap.Modal(
                document.getElementById('modalCheckpoint')
            );
            const form = document.getElementById('formCheckpoint');

            if (checkpoint) {
                document.getElementById('modalCheckpointTitulo').textContent =
                    'Editar Checkpoint';
                form.querySelectorAll('input, select, textarea').forEach((el) => {
                    if (el.id) el.value = checkpoint[el.id] || '';
                });
            } else {
                document.getElementById('modalCheckpointTitulo').textContent =
                    'Novo Checkpoint';
                form.reset();
                document.getElementById('deslocamentoId').value = deslocamentoId;
            }

            modal.show();
        }

        registrarEventos();

        // =======================
        // Eventos
        // =======================

        function registrarEventos() {
            const select = document.getElementById('selectDeslocamento');

            select.addEventListener('change', async function () {
                deslocamentoId = this.value;

                if (!deslocamentoId) return;

                mostrarBlocoInfo();
                renderLabelDeslocamento();
                renderTabelaCheckpoints();
            });
        }

        // =======================
        // Renderização: Label
        // =======================

        function renderLabelDeslocamento() {
            const el = document.getElementById('labelResumoDeslocamento');

            const texto = `Usuário: ${MOCK_USUARIO} — Deslocamento: ${
                MOCK_DESLOCAMENTO.origem
            } → ${MOCK_DESLOCAMENTO.destino} — Data Saída: ${formatarData(
                MOCK_DESLOCAMENTO.dataSaida
            )}`;

            el.textContent = texto;
        }

        // =======================
        // Renderização: Tabela
        // =======================

        function renderTabelaCheckpoints() {
            const tbody = document.getElementById('tabelaCheckpointsBody');
            tbody.innerHTML = '';

            MOCK_CHECKPOINTS.forEach((cp) => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${MOCK_DESLOCAMENTO.origem} → ${MOCK_DESLOCAMENTO.destino}</td>
                    <td>${cp.descricao}</td>

                    <td>
                        <i class="fa-solid fa-${cp.icone}" style="color:${
                    cp.cor
                }; font-size:1.3rem"></i>
                    </td>

                    <td>${cp.localizacao}</td>
                    <td>${formatarData(cp.data_realizada)}</td>
                    <td>${cp.observacoes}</td>
                `;

                tbody.appendChild(tr);
            });
        }

        // =======================
        // Suporte
        // =======================

        function mostrarBlocoInfo() {
            const bloco = document.getElementById('blocoInfoDeslocamento');
            bloco.classList.remove('d-none');
        }

        function formatarData(dataISO) {
            if (!dataISO) return '-';

            const [data, hora] = dataISO.split(' ');
            const [ano, mes, dia] = data.split('-');

            return `${dia}/${mes}/${ano} ${hora}`;
        }

        return { init };
    })();
})();
