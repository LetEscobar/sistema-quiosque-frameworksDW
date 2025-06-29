document.addEventListener('DOMContentLoaded', function () {
    const inputBusca = document.getElementById('buscaConteudos')
    const selectDispositivo = document.getElementById('filtroDispositivo')
    const tabela = document.getElementById('conteudosTableBody')
    const linhas = tabela.getElementsByTagName('tr')

    function aplicarFiltros() {
        const filtroTexto = inputBusca.value.toLowerCase()
        const filtroDispositivo = selectDispositivo.value.toLowerCase()

        for (let i = 0; i < linhas.length; i++) {
            const colunas = linhas[i].getElementsByTagName('td')
            const id = colunas[0]?.textContent.toLowerCase() || ''
            const nome = colunas[1]?.textContent.toLowerCase() || ''
            const dispositivos = colunas[4]?.textContent.toLowerCase() || ''

            const matchTexto =
                id.includes(filtroTexto) || nome.includes(filtroTexto)
            const matchDispositivo =
                !filtroDispositivo || dispositivos.includes(filtroDispositivo)

            if (matchTexto && matchDispositivo) {
                linhas[i].style.display = ''
            } else {
                linhas[i].style.display = 'none'
            }
        }
    }

    inputBusca.addEventListener('input', aplicarFiltros)
    selectDispositivo.addEventListener('change', aplicarFiltros)
})

function toggleConteudoStatus(id, ativar) {
    fetch(`/alternar_status/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao alternar status.')
            return response.json()
        })
        .then(data => {
            const novoStatus = data.status
            const novaClasse = novoStatus === 'Ativo' ? 'ativo' : 'inativo'

            const linhas = document.querySelectorAll('#conteudosTableBody tr')
            for (const linha of linhas) {
                const colunaId = linha.querySelector('td')
                if (colunaId && parseInt(colunaId.textContent.trim()) === id) {
                    const statusSpan = linha.querySelector('.status')
                    if (statusSpan) {
                        statusSpan.textContent = novoStatus
                        statusSpan.classList.remove('ativo', 'inativo')
                        statusSpan.classList.add(novaClasse)
                    }
                    break
                }
            }
        })
        .catch(error => {
            console.error(error)
            alert(
                'Erro ao atualizar status. Recarregue a página ou tente novamente.'
            )
            const checkbox = document.querySelector(
                `input[type="checkbox"][onchange*="toggleConteudoStatus(${id}"]`
            )
            if (checkbox) checkbox.checked = !ativar
        })
}
