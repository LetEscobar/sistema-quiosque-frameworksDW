let editing_tela_id = null
let dropAtivo = false

function openModal() {
    document.getElementById('modalDispositivo').style.display = 'flex'
    document.getElementById('modalTitle').textContent = editing_tela_id
        ? 'Editar dispositivo'
        : 'Cadastrar dispositivo'
}

function closeModal() {
    document.getElementById('modalDispositivo').style.display = 'none'
    clearForm()
    editing_tela_id = null
    document.getElementById('save').textContent = 'Salvar dispositivo'
    document.getElementById('save').onclick = saveDispositivo
}

function clearForm() {
    const nomeInput = document.getElementById('dispName')
    const ipInput = document.getElementById('dispIP')
    if (nomeInput) {
        nomeInput.value = ''
        nomeInput.setCustomValidity('')
        nomeInput.classList.remove('input-error')
    }
    if (ipInput) {
        ipInput.value = ''
        ipInput.setCustomValidity('')
        ipInput.classList.remove('input-error')
    }
    const nomeError = document.getElementById('dispNameError')
    if (nomeError) nomeError.textContent = ''
    const ipError = document.getElementById('dispIPError')
    if (ipError) ipError.textContent = ''
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

window.addEventListener('drop', e => {
    e.preventDefault()
    dropAtivo = true
    setTimeout(() => (dropAtivo = false), 100)
})
window.addEventListener('dragover', e => e.preventDefault())

window.addEventListener('click', function (event) {
    const modal = document.getElementById('modal')
    if (event.target === modal && !dropAtivo) {
        modal.style.display = 'none'
    }
})

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('telaTableBody')) {
        loadTelas()
        aplicarBusca('#buscaDispositivos', '#telaTableBody')
    }

    document.querySelectorAll('input[required]').forEach(input => {
        const label = input.closest('.item_form')?.querySelector('label')
        if (label && !label.innerHTML.includes('*')) {
            label.innerHTML += ' <span class="required-star">*</span>'
        }
    })

    const modal = document.getElementById('modalDispositivo')
    if (modal) {
        modal.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault()
                const botaoSalvar = document.getElementById('save')
                if (botaoSalvar) botaoSalvar.click()
            }
        })
    }

    function mascaraIP(input) {
        let valor = input.value.replace(/[^0-9.]/g, '')

        const partes = valor
            .split('.')
            .slice(0, 4)
            .map(p => p.slice(0, 3))

        input.value = partes.join('.')
    }

    const handleIpInput = e => mascaraIP(e.target)
    const ipField = document.getElementById('dispIP')
    if (ipField) ipField.addEventListener('input', handleIpInput)

    function isValidIP(ip) {
        const regex =
            /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/
        return regex.test(ip)
    }

    function validateDispositivo() {
        const nome = document.getElementById('dispName')
        const ip = document.getElementById('dispIP')
        let valido = true

        if (!nome.value.trim()) {
            nome.setCustomValidity('O nome é obrigatório.')
            nome.reportValidity()
            valido = false
        } else {
            nome.setCustomValidity('')
        }

        const ipRegex =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

        if (!ipRegex.test(ip.value.trim())) {
            ip.setCustomValidity('IP inválido.')
            ip.reportValidity()
            valido = false
        } else {
            ip.setCustomValidity('')
        }

        return valido
    }

    function saveDispositivo() {
        const nomeInput = document.getElementById('dispName')
        const ipInput = document.getElementById('dispIP')
        const nome_dispositivo = nomeInput.value.trim()
        const endereco_ip = ipInput.value.trim()

        if (!validateDispositivo()) return

        fetch('/api/telas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_dispositivo: nome_dispositivo,
                endereco_ip: endereco_ip
            })
        })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json()
                    if (data.error && data.error.includes('IP')) {
                        const ipError = document.getElementById('dispIPError')
                        ipError.textContent = data.error
                        ipInput.classList.add('input-error')
                    }
                    throw new Error(data.error || 'Erro ao salvar dispositivo')
                }
                return res.json()
            })
            .then(() => {
                nomeInput.value = ''
                ipInput.value = ''
                closeModal()
                loadTelas()
            })
            .catch(err => console.error(err.message))
    }
    window.saveDispositivo = saveDispositivo

    function updateDispositivo() {
        if (!validateDispositivo()) return

        const nome_dispositivo = document
            .getElementById('dispName')
            .value.trim()
        const endereco_ip = document.getElementById('dispIP').value.trim()

        const bodyData = {
            nome_dispositivo: nome_dispositivo,
            endereco_ip: endereco_ip
        }

        fetch(`/api/telas/${editing_tela_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao atualizar dispositivo')
                return res.json()
            })
            .then(() => {
                document.getElementById('dispName').value = ''
                document.getElementById('dispIP').value = ''
                document.getElementById('save').textContent =
                    'Salvar alterações'
                document.getElementById('save').onclick = saveDispositivo
                closeModal()
                loadTelas()
            })
            .catch(err => alert(err.message))
    }
    window.updateDispositivo = updateDispositivo

    function editDispositivo(id) {
        fetch(`/api/telas/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Dispositivo não encontrado.')
                return res.json()
            })
            .then(tela => {
                editing_tela_id = id
                document.getElementById('dispName').value =
                    tela.nome_dispositivo
                const ipInput = document.getElementById('dispIP')
                ipInput.value = tela.endereco_ip
                ipInput.addEventListener('input', handleIpInput)
                document.getElementById('save').textContent =
                    'Salvar alterações'
                document.getElementById('save').onclick = updateDispositivo
                openModal()
                editing_tela_id = id
            })
            .catch(err => alert(err.message))
    }
    window.editDispositivo = editDispositivo

    function toggleDispositivoStatus(id, is_active) {
        const status = is_active ? 'Ativo' : 'Inativo'

        fetch(`/api/telas/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao atualizar status')
                return res.json()
            })
            .then(() => loadTelas())
            .catch(err => alert(err.message))
    }

    window.toggleDispositivoStatus = toggleDispositivoStatus

    function loadTelas() {
        fetch('/api/telas')
            .then(res => res.json())
            .then(telas => {
                const tbody = document.getElementById('telaTableBody')
                if (!tbody) return
                tbody.innerHTML = ''
                telas.forEach(tela => {
                    const status_class =
                        tela.status === 'Ativo' ? 'ativo' : 'inativo'
                    const is_checked = tela.status === 'Ativo' ? 'checked' : ''
                    const row = `
                    <tr>
                        <td>${tela.id_tela}</td>
                        <td>${tela.endereco_ip}</td>
                        <td>${tela.nome_dispositivo}</td>
                        <td><span class="status ${status_class}">${tela.status}</span></td>
                        <td>
                            <button class="edit" onclick="editDispositivo(${tela.id_tela})">
                                <span class="material-icons">edit</span>
                            </button>
                            <label class="switch">
                                <input type="checkbox" ${is_checked}
                                       onchange="toggleDispositivoStatus(${tela.id_tela}, this.checked)">
                                <span class="slider"></span>
                            </label>
                        </td>
                    </tr>
                `
                    tbody.innerHTML += row
                })
            })
            .catch(err => {
                alert('Erro ao carregar dispositivos: ' + err.message)
            })
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadTelas()
    })
})
