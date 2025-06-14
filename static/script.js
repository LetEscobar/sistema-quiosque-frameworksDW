// MODAL CONTROLS
function openModal() {
    document.getElementById('modal').style.display = 'block'
}

function closeModal() {
    document.getElementById('modal').style.display = 'none'
}

// ========== USUÁRIOS ==========

function saveUser() {
    const name = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()

    if (!name || !email || !senha) {
        alert('Preencha nome, email e senha!')
        return
    }

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, senha })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao salvar usuário')
            return res.json()
        })
        .then(() => {
            document.getElementById('userName').value = ''
            document.getElementById('userEmail').value = ''
            document.getElementById('userPassword').value = ''
            closeModal()
            loadUsers()
        })
        .catch(err => alert(err.message))
}

function loadUsers() {
    fetch('/api/users')
        .then(res => res.json())
        .then(users => {
            const tbody = document.getElementById('userTableBody')
            if (!tbody) return
            tbody.innerHTML = ''
            users.forEach(user => {
                const statusClass =
                    user.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo'
                const isChecked =
                    user.status.toLowerCase() === 'ativo' ? 'checked' : ''
                const row = `<tr>
                      <td>${user.id}</td>
                      <td>${user.name}</td>
                      <td>${user.email}</td>
                      <td><span class="status ${statusClass}">${user.status}</span></td>
                      <td>
                          <button class="edit" title="Editar usuário" onclick="editUser(${user.id})">
                              <span class="material-icons">edit</span>
                          </button>
                          <label class="switch" title="Ativar/Inativar usuário">
                              <input type="checkbox" ${isChecked} onchange="toggleUserStatus(${user.id}, this.checked)" />
                              <span class="slider"></span>
                          </label>
                      </td>
                  </tr>`
                tbody.innerHTML += row
            })
        })
}

let editingUserId = null

function editUser(id) {
    fetch(`/api/users/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Usuário não encontrado.')
            return res.json()
        })
        .then(user => {
            editingUserId = id
            document.getElementById('userName').value = user.name
            document.getElementById('userEmail').value = user.email
            document.getElementById('userPassword').value = '' // senha vazia por segurança
            document.getElementById('save').textContent = 'Salvar alterações'
            document.getElementById('save').onclick = updateUser
            openModal()
        })
        .catch(err => alert(err.message))
}

function toggleUserStatus(id, isActive) {
    const status = isActive ? 'Ativo' : 'Inativo'

    fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar status.')
            return res.json()
        })
        .then(() => loadUsers())
        .catch(err => alert(err.message))
}

function updateUser() {
    const name = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()

    if (!name || !email) {
        alert('Preencha nome e email!')
        return
    }

    fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, senha })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            document.getElementById('userName').value = ''
            document.getElementById('userEmail').value = ''
            document.getElementById('userPassword').value = ''
            document.getElementById('save').textContent = 'Salvar alterações'
            document.getElementById('save').onclick = saveUser
            closeModal()
            loadUsers()
        })
        .catch(err => alert(err.message))
}

function saveTela() {
    const nomeDispositivo = document.getElementById('dispName').value.trim()
    const enderecoIp = document.getElementById('dispIP').value.trim()

    if (!nomeDispositivo || !enderecoIp) {
        alert('Preencha todos os campos corretamente!')
        return
    }

    fetch('/api/telas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeDispositivo, enderecoIp })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao salvar tela')
            return res.json()
        })
        .then(() => {
            document.getElementById('dispName').value = ''
            document.getElementById('dispIP').value = ''
            closeModal()
            loadTelas()
        })
        .catch(err => alert(err.message))
}

function loadTelas() {
    fetch('/api/telas')
        .then(res => res.json())
        .then(telas => {
            const tbody = document.getElementById('telaTableBody')
            if (!tbody) return
            tbody.innerHTML = ''
            telas.forEach(tela => {
                const statusClass =
                    tela.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo'
                const isChecked = tela.status === 'Ativo' ? 'checked' : ''
                const row = document.createElement('tr')
                row.innerHTML = `
                    <td>${tela.idTela}</td>
                    <td>${tela.enderecoIp}</td>
                    <td>${tela.nomeDispositivo}</td>
                    <td><span class="status ${statusClass}">${tela.status}</span></td>
                    <td>
                        <div class="acoes">
                            <button class="edit" title="Editar dispositivo" onclick="editTela(${tela.idTela})">
                                <span class="material-icons">edit</span>
                            </button>
                            <label class="switch" title="Ativar/Inativar dispositivo">
                                <input type="checkbox" ${isChecked} onchange="toggleTelaStatus(${tela.idTela}, this.checked)" />
                                <span class="slider"></span>
                            </label>
                        </div>
                    </td>
                `
                tbody.appendChild(row)
            })
        })
        .catch(err => console.error('Erro ao carregar telas:', err))
}

function atualizarRelogio() {
    const agora = new Date()
    const horas = agora.getHours().toString().padStart(2, '0')
    const minutos = agora.getMinutes().toString().padStart(2, '0')
    const segundos = agora.getSeconds().toString().padStart(2, '0')

    const horaFormatada = `${horas}:${minutos}:${segundos}`
    const relogio = document.getElementById('relogio')
    if (relogio) {
        relogio.textContent = horaFormatada
    }
}

atualizarRelogio()
setInterval(atualizarRelogio, 1000)

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userTableBody')) {
        loadUsers()
    }
    if (document.getElementById('telaTableBody')) {
        loadTelas()
    }
})
