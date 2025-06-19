function openModal() {
    document.getElementById('modal').style.display = 'block'
}

function closeModal() {
    document.getElementById('modal').style.display = 'none'
}

function saveUser() {
    const nome = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()

    if (!nome || !email || !senha) {
        alert('Preencha nome, email e senha!')
        return
    }

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, senha })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao salvar usuário')
            return res.json()
        })
        .then(() => {
            document.getElementById('userName').value = ''
            document.getElementById('userEmail').value = ''
            document.getElementById('userPassword').value = ''
            close_modal()
            load_users()
        })
        .catch(err => alert(err.message))
}

function load_users() {
    fetch('/api/users')
        .then(res => res.json())
        .then(users => {
            const tbody = document.getElementById('userTableBody')
            if (!tbody) return
            tbody.innerHTML = ''
            users.forEach(user => {
                const status_class =
                    user.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo'
                const is_checked =
                    user.status.toLowerCase() === 'ativo' ? 'checked' : ''
                const row = `<tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status ${status_class}">${user.status}</span></td>
                    <td>
                        <button class="edit" title="Editar usuário" onclick="edit_user(${user.id})">
                            <span class="material-icons">edit</span>
                        </button>
                        <label class="switch" title="Ativar/Inativar usuário">
                            <input type="checkbox" ${is_checked} onchange="toggle_user_status(${user.id}, this.checked)" />
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>`
                tbody.innerHTML += row
            })
        })
}

let editing_user_id = null

function edit_user(id) {
    fetch(`/api/users/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Usuário não encontrado.')
            return res.json()
        })
        .then(user => {
            editing_user_id = id
            document.getElementById('userName').value = user.name
            document.getElementById('userEmail').value = user.email
            document.getElementById('userPassword').value = ''
            document.getElementById('save').textContent = 'Salvar alterações'
            document.getElementById('save').onclick = update_user
            open_modal()
        })
        .catch(err => alert(err.message))
}

function toggle_user_status(id, is_active) {
    const status = is_active ? 'Ativo' : 'Inativo'

    fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar status.')
            return res.json()
        })
        .then(() => load_users())
        .catch(err => alert(err.message))
}

function update_user() {
    const nome = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()

    if (!nome || !email) {
        alert('Preencha nome e email!')
        return
    }

    fetch(`/api/users/${editing_user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, senha })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            document.getElementById('userName').value = ''
            document.getElementById('userEmail').value = ''
            document.getElementById('userPassword').value = ''
            document.getElementById('save').textContent = 'Salvar usuário'
            document.getElementById('save').onclick = save_user
            close_modal()
            load_users()
        })
        .catch(err => alert(err.message))
}

function save_tela() {
    const nome_dispositivo = document.getElementById('dispName').value.trim()
    const endereco_ip = document.getElementById('dispIP').value.trim()

    if (!nome_dispositivo || !endereco_ip) {
        alert('Preencha todos os campos corretamente!')
        return
    }

    fetch('/api/telas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nomeDispositivo: nome_dispositivo,
            enderecoIp: endereco_ip
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao salvar tela')
            return res.json()
        })
        .then(() => {
            document.getElementById('dispName').value = ''
            document.getElementById('dispIP').value = ''
            close_modal()
            load_telas()
        })
        .catch(err => alert(err.message))
}

function load_telas() {
    fetch('/api/telas')
        .then(res => res.json())
        .then(telas => {
            const tbody = document.getElementById('telaTableBody')
            if (!tbody) return
            tbody.innerHTML = ''
            telas.forEach(tela => {
                const status_class =
                    tela.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo'
                const is_checked = tela.status === 'Ativo' ? 'checked' : ''
                const row = document.createElement('tr')
                row.innerHTML = `
                    <td>${tela.idTela}</td>
                    <td>${tela.enderecoIp}</td>
                    <td>${tela.nomeDispositivo}</td>
                    <td><span class="status ${status_class}">${tela.status}</span></td>
                    <td>
                        <div class="acoes">
                            <button class="edit" title="Editar dispositivo" onclick="edit_tela(${tela.idTela})">
                                <span class="material-icons">edit</span>
                            </button>
                            <label class="switch" title="Ativar/Inativar dispositivo">
                                <input type="checkbox" ${is_checked} onchange="toggle_tela_status(${tela.idTela}, this.checked)" />
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

function atualizar_relogio() {
    const agora = new Date()
    const horas = agora.getHours().toString().padStart(2, '0')
    const minutos = agora.getMinutes().toString().padStart(2, '0')
    const segundos = agora.getSeconds().toString().padStart(2, '0')
    const relogio = document.getElementById('relogio')

    if (relogio) {
        relogio.textContent = `${horas}:${minutos}:${segundos}`
    }
}

setInterval(atualizar_relogio, 1000)
atualizar_relogio()

document.addEventListener('DOMContentLoaded', () => {
    const carrossel = document.querySelector('.carrossel_images')
    const imagens = carrossel.querySelectorAll('img')
    let index = 0
    let largura = imagens[0].clientWidth

    function avancar() {
        index++
        if (index >= imagens.length) {
            index = 0
            carrossel.style.transition = 'none'
            carrossel.style.transform = `translateX(0px)`
        } else {
            carrossel.style.transition = 'transform 0.5s ease-in-out'
            carrossel.style.transform = `translateX(-${index * largura}px)`
        }
    }

    setInterval(avancar, 5000)

    window.addEventListener('resize', () => {
        largura = imagens[0].clientWidth
    })
})

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userTableBody')) load_users()
    if (document.getElementById('telaTableBody')) load_telas()

    const carrossel = document.getElementById('carrossel')
    if (carrossel) {
        const slides = Array.from(carrossel.querySelectorAll('img'))
        const container = carrossel.parentElement
        const total = slides.length

        if (total > 0) {
            const clone = slides[0].cloneNode(true)
            carrossel.appendChild(clone)

            let index = 0
            let largura = container.offsetWidth

            function atualizar_transform() {
                carrossel.style.transform = `translateX(${-index * largura}px)`
            }

            function avancar() {
                index++
                carrossel.style.transition = 'transform 0.5s ease-in-out'
                atualizar_transform()

                if (index === total) {
                    setTimeout(() => {
                        carrossel.style.transition = 'none'
                        index = 0
                        atualizar_transform()
                    }, 500)
                }
            }

            setInterval(avancar, 5000)

            window.addEventListener('resize', () => {
                largura = container.offsetWidth
                atualizar_transform()
            })
        }
    }
})

window.addEventListener('click', function (event) {
    const modal = document.getElementById('modal')
    const modalContent = document.querySelector('.modal-content')

    if (event.target === modal) {
        modal.style.display = 'none'
    }
})
