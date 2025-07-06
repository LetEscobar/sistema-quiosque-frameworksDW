let editing_campanha_id = null

function openModal() {
    document.getElementById('modalCampanha').style.display = 'flex'
    document.getElementById('modalTitle').textContent = editing_campanha_id
        ? 'Editar campanha'
        : 'Cadastrar campanha'
}

function closeModal() {
    document.getElementById('modalCampanha').style.display = 'none'
    clearForm()
    editing_campanha_id = null
    document.getElementById('save').textContent = 'Salvar campanha'
    document.getElementById('save').onclick = saveCampanha
}

function clearForm() {
    document.getElementById('campanhaTitulo').value = ''
    document.getElementById('campanhaInicio').value = ''
    document.getElementById('campanhaFim').value = ''
    document.getElementById('campanhaCor').value = '#2f80ed'
    ;['campanhaTitulo', 'campanhaCor', 'campanhaInicio', 'campanhaFim'].forEach(
        id => {
            const input = document.getElementById(id)
            if (input) input.setCustomValidity('')
        }
    )
}

function aplicarBusca(inputSelector, tabelaSelector) {
    const input = document.querySelector(inputSelector)
    const tabela = document.querySelector(tabelaSelector)

    if (!input || !tabela) return

    input.addEventListener('input', () => {
        const termo = input.value.trim().toLowerCase()
        const linhas = tabela.querySelectorAll('tr')

        linhas.forEach(linha => {
            const textoLinha = linha.textContent.toLowerCase()
            linha.style.display = textoLinha.includes(termo) ? '' : 'none'
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('campanhaTableBody')) {
        loadCampanhas()
        aplicarBusca('#buscaCampanhas', '#campanhaTableBody')
    }

    document.querySelectorAll('input[required]').forEach(input => {
        const label = input.closest('.item_form')?.querySelector('label')
        if (label && !label.innerHTML.includes('*')) {
            label.innerHTML += ' <span class="required-star">*</span>'
        }
    })

    function validateTitulo() {
        const tituloInput = document.getElementById('campanhaTitulo')
        const value = tituloInput.value.trim()

        let message = ''
        if (!value) {
            message = 'O título é obrigatório.'
        }

        tituloInput.setCustomValidity(message)
        return message === ''
    }

    function validateCor() {
        const corInput = document.getElementById('campanhaCor')
        const value = corInput.value.trim()

        let message = ''
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            message = 'Cor hexadecimal inválida.'
        }

        corInput.setCustomValidity(message)
        return message === ''
    }

    function validateInicio() {
        const inicioInput = document.getElementById('campanhaInicio')
        const value = inicioInput.value
        let message = ''
        if (!value) {
            message = 'A data de início é obrigatória.'
        }
        inicioInput.setCustomValidity(message)
        return message === ''
    }

    function validateFim() {
        const fimInput = document.getElementById('campanhaFim')
        const value = fimInput.value
        let message = ''
        if (!value) {
            message = 'A data de fim é obrigatória.'
        }
        fimInput.setCustomValidity(message)
        return message === ''
    }

    const tituloInput = document.getElementById('campanhaTitulo')
    const corInput = document.getElementById('campanhaCor')
    const inicioInput = document.getElementById('campanhaInicio')
    const fimInput = document.getElementById('campanhaFim')

    if (tituloInput) {
        tituloInput.addEventListener('input', () => {
            validateTitulo()
            tituloInput.reportValidity()
        })
    }

    if (corInput) {
        corInput.addEventListener('input', () => {
            validateCor()
            corInput.reportValidity()
        })
    }

    if (inicioInput) {
        inicioInput.addEventListener('input', () => {
            validateInicio()
            inicioInput.reportValidity()
        })
    }

    if (fimInput) {
        fimInput.addEventListener('input', () => {
            validateFim()
            fimInput.reportValidity()
        })
    }

    function validateAllFields() {
        validateTitulo()
        validateCor()
        validateInicio()
        validateFim()
        return [
            'campanhaTitulo',
            'campanhaCor',
            'campanhaInicio',
            'campanhaFim'
        ]
            .map(id => document.getElementById(id))
            .every(input => input.reportValidity())
    }

    function saveCampanha() {
        if (!validateAllFields()) return

        const titulo = document.getElementById('campanhaTitulo').value.trim()
        const cor = document.getElementById('campanhaCor').value.trim()
        const inicio = document.getElementById('campanhaInicio').value
        const fim = document.getElementById('campanhaFim').value

        fetch('/api/campanhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, cor, inicio, fim })
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao salvar campanha.')
                return res.json()
            })
            .then(() => {
                closeModal()
                loadCampanhas()
            })
            .catch(err => alert(err.message))
    }
    window.saveCampanha = saveCampanha

    function updateCampanha() {
        if (!validateAllFields()) return

        const titulo = document.getElementById('campanhaTitulo').value.trim()
        const cor = document.getElementById('campanhaCor').value.trim()
        const inicio = document.getElementById('campanhaInicio').value
        const fim = document.getElementById('campanhaFim').value

        fetch(`/api/campanhas/${editing_campanha_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, cor, inicio, fim })
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao atualizar campanha.')
                return res.json()
            })
            .then(() => {
                editing_campanha_id = null
                closeModal()
                loadCampanhas()
            })
            .catch(err => alert(err.message))
    }
    window.updateCampanha = updateCampanha

    function editCampanha(id) {
        fetch(`/api/campanhas/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Erro ao carregar campanha.')
                return res.json()
            })
            .then(campanha => {
                editing_campanha_id = id
                document.getElementById('campanhaTitulo').value =
                    campanha.titulo
                document.getElementById('campanhaCor').value = campanha.cor
                document.getElementById('campanhaInicio').value =
                    campanha.inicio || ''
                document.getElementById('campanhaFim').value =
                    campanha.fim || ''
                document.getElementById('save').textContent =
                    'Salvar alterações'
                document.getElementById('save').onclick = updateCampanha
                openModal()
            })
            .catch(err => alert(err.message))
    }

    window.editCampanha = editCampanha

    function toggleCampanhaStatus(id, isActive) {
        const status = isActive ? 'Ativo' : 'Inativo'

        fetch(`/api/campanhas/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao atualizar status.')
                return res.json()
            })
            .then(() => loadCampanhas())
            .catch(err => alert(err.message))
    }

    window.toggleCampanhaStatus = toggleCampanhaStatus

    function loadCampanhas() {
        fetch('/api/campanhas')
            .then(res => res.json())
            .then(campanhas => {
                const tbody = document.getElementById('campanhaTableBody')
                tbody.innerHTML = ''
                campanhas.forEach(campanha => {
                    const status_class =
                        campanha.status === 'Ativo' ? 'ativo' : 'inativo'
                    const is_checked =
                        campanha.status === 'Ativo' ? 'checked' : ''

                    // Formatar datas para exibir em dd/mm/yyyy hh:mm
                    function formatDate(dt) {
                        if (!dt) return ''
                        const d = new Date(dt)
                        const day = String(d.getDate()).padStart(2, '0')
                        const month = String(d.getMonth() + 1).padStart(2, '0')
                        const year = d.getFullYear()
                        const hours = String(d.getHours()).padStart(2, '0')
                        const minutes = String(d.getMinutes()).padStart(2, '0')
                        return `${day}/${month}/${year} ${hours}:${minutes}`
                    }

                    const row = `
                <tr>
                    <td>${campanha.id}</td>
                    <td>${campanha.titulo}</td>
                    <td>
                        <span class="status" style="background:${
                            campanha.cor
                        };color:#fff">
                            ${campanha.cor}
                        </span>
                    </td>
                    <td>${formatDate(campanha.inicio)}</td>
                    <td>${formatDate(campanha.fim)}</td>
                    <td>
                        <span class="status ${status_class}">${
                        campanha.status
                    }</span>
                    </td>
                    <td class="acoes">
                        <button class="edit" onclick="editCampanha(${
                            campanha.id
                        })">
                            <span class="material-icons">edit</span>
                        </button>
                        <label class="switch">
                            <input type="checkbox" ${is_checked} onchange="toggleCampanhaStatus(${
                        campanha.id
                    }, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>
                `

                    tbody.innerHTML += row
                })
            })
            .catch(err => alert('Erro ao carregar campanhas: ' + err.message))
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadCampanhas()
    })
})
