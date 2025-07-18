document.addEventListener('DOMContentLoaded', function () {
    const inputBusca = document.getElementById('buscaConteudos')
    const selectDispositivo = document.getElementById('filtroDispositivo')
    const tabela = document.getElementById('conteudosTableBody')
    const linhas = tabela.getElementsByTagName('tr')

    document
        .querySelectorAll(
            '#formConteudo input[required], #formEditarConteudo input[required]'
        )
        .forEach(input => {
            const label = input.closest('.item_form')?.querySelector('label')
            if (label && !label.innerHTML.includes('*')) {
                label.innerHTML += ' <span class="required-star">*</span>'
            }
        })

    const formAdd = document.getElementById('formConteudo')
    if (formAdd) {
        formAdd.addEventListener('submit', e => {
            const checked = formAdd.querySelectorAll('.editDispositivo:checked')
            if (checked.length === 0) {
                e.preventDefault()
                alert('Selecione ao menos um dispositivo.')
            }
        })
    }

    function aplicarFiltros() {
        const filtroTexto = inputBusca.value.toLowerCase()
        const filtroDispositivo = selectDispositivo.value.toLowerCase()

        for (let i = 0; i < linhas.length; i++) {
            const colunas = linhas[i].getElementsByTagName('td')
            const id = colunas[0]?.textContent.toLowerCase() || ''
            const nome = colunas[2]?.textContent.toLowerCase() || ''
            const dispositivos = Array.from(
                colunas[3].querySelectorAll('.chip')
            ).map(span => span.textContent.trim().toLowerCase())
            const dataInicio = colunas[4]?.textContent.toLowerCase() || ''
            const dataFim = colunas[5]?.textContent.toLowerCase() || ''

            const matchTexto =
                id.includes(filtroTexto) ||
                nome.includes(filtroTexto) ||
                dataInicio.includes(filtroTexto) ||
                dataFim.includes(filtroTexto)

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
    fetch(`/conteudos/alternar_status/${id}`, {
        method: 'PATCH'
    })
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

function openEditModal() {
    document.getElementById('modalEditar').style.display = 'block'
}

function closeEditModal() {
    document.getElementById('modalEditar').style.display = 'none'
}

function editConteudo(id) {
    fetch(`/conteudos/api/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar conteúdo')
            return res.json()
        })
        .then(conteudo => {
            document.getElementById('editConteudoId').value = conteudo.id
            document.getElementById('editNome').value = conteudo.nome

            document
                .querySelectorAll('#formEditarConteudo .editDispositivo')
                .forEach(cb => {
                    cb.checked = conteudo.dispositivos.includes(
                        parseInt(cb.value)
                    )
                })

            document.getElementById('editInicio').value =
                conteudo.data_inicio?.slice(0, 16) || ''
            document.getElementById('editFim').value =
                conteudo.data_fim?.slice(0, 16) || ''

            openEditModal()
        })
        .catch(err => alert(err.message))
}

document
    .getElementById('formEditarConteudo')
    .addEventListener('submit', function (e) {
        e.preventDefault()
        const id = document.getElementById('editConteudoId').value
        const nome = document.getElementById('editNome').value.trim()
        const dispositivos = Array.from(
            document.querySelectorAll(
                '#formEditarConteudo .editDispositivo:checked'
            )
        ).map(cb => cb.value)

        const data_inicio = document.getElementById('editInicio').value
        const data_fim = document.getElementById('editFim').value

        if (!nome || !data_inicio || !data_fim || dispositivos.length === 0) {
            alert('Preencha todos os campos obrigatórios.')
            return
        }

        fetch(`/conteudos/editar/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, dispositivos, data_inicio, data_fim })
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao salvar alterações')
                closeEditModal()
                location.reload()
            })
            .catch(err => alert(err.message))
    })
