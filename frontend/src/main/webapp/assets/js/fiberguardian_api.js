(function () {
    // Inicializa o namespace FiberGuardian se não existir
    window.FiberGuardian = window.FiberGuardian || {};

    // Define o submódulo API
    FiberGuardian.API = FiberGuardian.API || {};

    /**
     * Carrega um dropdown (elemento select) com dados de uma API REST.
     * 
     * @param {string} url - URL do endpoint que retorna um JSON Array de objetos.
     * @param {string} selectId - ID do elemento <select> a ser populado.
     * @param {string} valueField - Nome da propriedade do objeto JSON usada como value.
     * @param {string} textField - Nome da propriedade do objeto JSON usada como texto visível.
     */
    FiberGuardian.API.carregarDropdown = function (url, selectId, valueField, textField) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const select = document.getElementById(selectId);
                if (!select) {
                    console.warn(`Elemento select com id '${selectId}' não encontrado.`);
                    return;
                }

                // Limpa opções anteriores
                select.innerHTML = '';

                // Adiciona opção vazia
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- Selecione --';
                select.appendChild(emptyOption);

                // Popula com os dados da API
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[valueField];
                    option.textContent = item[textField];
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error(`Erro ao carregar o dropdown '${selectId}':`, error);
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Erro ao carregar opções</option>';
                }
            });
    };
})();