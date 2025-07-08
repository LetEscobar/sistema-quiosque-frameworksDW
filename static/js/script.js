let editing_user_id_global_global = null
let dropAtivo = false

let carrosselInterval = null
let conteudoTimeout = null
let carrosselIndex = 0
const SLIDE_DURATION = 10000

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId)
    if (!input) return
    if (input.type === 'password') {
        input.type = 'text'
        icon.textContent = 'visibility'
    } else {
        input.type = 'password'
        icon.textContent = 'visibility_off'
    }
}

function atualizarRelogio() {
    const agora = new Date()
    const horas = agora.getHours().toString().padStart(2, '0')
    const minutos = agora.getMinutes().toString().padStart(2, '0')
    const segundos = agora.getSeconds().toString().padStart(2, '0')
    const relogio = document.getElementById('relogio')
    if (relogio) {
        relogio.textContent = `${horas}:${minutos}:${segundos}`
    }
}
setInterval(atualizarRelogio, 1000)
atualizarRelogio()

function atualizarTransform() {
    const carrossel = document.getElementById('carrossel_images')
    if (carrossel) {
        carrossel.style.transition = 'transform 0.5s ease-in-out'
        carrossel.style.transform = `translateX(-${carrosselIndex * 100}%)`
    }
}

window.addEventListener('resize', atualizarTransform)

function iniciarCarrossel() {
    const carrossel = document.getElementById('carrossel_images')
    if (!carrossel) return

    const slides = Array.from(carrossel.querySelectorAll('.slide'))
    if (slides.length <= 1) return

    const primeiroSlide = slides[0].cloneNode(true)
    primeiroSlide.classList.add('clone')
    carrossel.appendChild(primeiroSlide)

    let index = 0
    const totalSlides = slides.length + 1

    clearInterval(carrosselInterval)
    carrosselIndex = 0
    carrossel.style.transition = 'none'
    carrossel.style.transform = `translateX(0%)`

    carrosselInterval = setInterval(() => {
        index++
        carrosselIndex = index

        carrossel.style.transition = 'transform 0.5s ease-in-out'
        carrossel.style.transform = `translateX(-${index * 100}%)`

        if (index === totalSlides - 1) {
            setTimeout(() => {
                carrossel.style.transition = 'none'
                carrossel.style.transform = `translateX(0%)`
                index = 0
                carrosselIndex = 0
            }, 500)
        }
    }, SLIDE_DURATION)
}

window.iniciarCarrossel = iniciarCarrossel

function atualizarConteudo() {
    fetch('/api/quiosque-data')
        .then(res => res.json())
        .then(data => {
            const container = document.querySelector('.container_quiosque')
            const carrossel = document.getElementById('carrossel_images')

            if (container) {
                const cor = data.background || '#0f7df2'
                container.style.background = `linear-gradient(to bottom, ${cor}, black)`
            }

            let totalSlides = 0
            if (
                carrossel &&
                Array.isArray(data.imagens) &&
                data.imagens.length > 0
            ) {
                carrossel.innerHTML = ''
                data.imagens.forEach(src => {
                    const slide = document.createElement('div')
                    slide.classList.add('slide')

                    const img = document.createElement('img')
                    img.src = `/static/${src}`
                    img.alt = 'Slide'

                    slide.appendChild(img)
                    carrossel.appendChild(slide)
                })

                totalSlides = data.imagens.length
                iniciarCarrossel()
            }

            const intervalo = Math.max(totalSlides, 1) * SLIDE_DURATION
            clearTimeout(conteudoTimeout)
            conteudoTimeout = setTimeout(atualizarConteudo, intervalo)
        })
        .catch(err => console.error('Erro ao buscar dados do quiosque:', err))
}

function openModal() {
    document.getElementById('modal').style.display = 'block'
    const titulo = editing_user_id_global_global
        ? 'Editar usuário'
        : 'Cadastrar usuário'
    document.getElementById('modalTitle').textContent = titulo

    const passwordInput = document.getElementById('userPassword')
    const passwordLabel = passwordInput
        .closest('.item_form')
        ?.querySelector('label')

    if (editing_user_id_global_global) {
        passwordInput.removeAttribute('required')
        const star = passwordLabel?.querySelector('.required-star')
        if (star) star.remove()
    } else {
        passwordInput.setAttribute('required', '')
        if (passwordLabel && !passwordLabel.querySelector('.required-star')) {
            passwordLabel.innerHTML += ' <span class="required-star">*</span>'
        }
    }

    if (!editing_user_id_global_global) {
        clearForm()
        document.getElementById('save').textContent = 'Salvar usuário'
        document.getElementById('save').onclick = saveUser
    }

    document.getElementById('userName').focus()
}

function closeModal() {
    document.getElementById('modal').style.display = 'none'
    editing_user_id_global_global = null
    clearForm()
    document.getElementById('modalTitle').textContent = 'Cadastrar usuário'
    document.getElementById('save').textContent = 'Salvar usuário'
    document.getElementById('save').onclick = saveUser
}

function clearForm() {
    document.getElementById('userName').value = ''
    document.getElementById('userEmail').value = ''
    document.getElementById('userPassword').value = ''
    ;['userName', 'userEmail', 'userPassword'].forEach(id => {
        const input = document.getElementById(id)
        if (input) input.setCustomValidity('')
    })
}

function validateName() {
    const input = document.getElementById('userName')
    const value = input.value.trim()
    let message = ''
    if (!value) {
        message = 'O nome é obrigatório.'
    } else if (!/^[A-Za-zÀ-ú\s]+$/.test(value)) {
        message = 'O nome deve conter apenas letras.'
    }
    input.setCustomValidity(message)
    return message === ''
}

function validateEmail() {
    const input = document.getElementById('userEmail')
    const value = input.value.trim()
    let message = ''

    const emailRegex = /^[^\s@]+@(estudante\.ifms\.edu\.br|ifms\.edu\.br)$/i

    if (!value) {
        message = 'O e-mail é obrigatório.'
    } else if (!emailRegex.test(value)) {
        message =
            'O e-mail deve ser institucional (ifms.edu.br ou estudante.ifms.edu.br).'
    }

    input.setCustomValidity(message)
    return message === ''
}

function validatePassword() {
    const input = document.getElementById('userPassword')
    const value = input.value
    let message = ''

    const lengthOk = value.length >= 8
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (!value) {
        if (!editing_user_id_global_global) {
            message = 'A senha é obrigatória.'
        }
    } else if (!lengthOk || !hasNumber || !hasSpecial) {
        message =
            'A senha deve ter pelo menos 8 caracteres, 1 número e 1 caractere especial.'
    }

    input.setCustomValidity(message)

    return message === '' || (editing_user_id_global_global && value === '')
}

function validateAllFields() {
    validateName()
    validateEmail()
    validatePassword()
    const form = document.getElementById('userForm')
    return form ? form.reportValidity() : false
}

function saveUser() {
    if (!validateAllFields()) return

    const nome = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, senha })
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao salvar usuário!')
            return res.json()
        })
        .then(() => {
            closeModal()
            loadUsers()
        })
        .catch(err => alert(err.message))
}

function updateUser() {
    if (!validateAllFields()) return

    const nome = document.getElementById('userName').value.trim()
    const email = document.getElementById('userEmail').value.trim()
    const senha = document.getElementById('userPassword').value.trim()
    const bodyData = { name: nome, email }
    if (senha) bodyData.senha = senha

    fetch(`/api/users/${editing_user_id_global}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            closeModal()
            loadUsers()
        })
        .catch(err => alert(err.message))
}

function editUser(id) {
    fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(user => {
            editing_user_id_global = id
            document.getElementById('userName').value = user.name
            document.getElementById('userEmail').value = user.email
            document.getElementById('userPassword').value = ''
            const passInput = document.getElementById('userPassword')
            const passLabel = passInput
                .closest('.item_form')
                ?.querySelector('label')
            passInput.removeAttribute('required')
            const star = passLabel?.querySelector('.required-star')
            if (star) star.remove()
            document.getElementById('save').textContent = 'Salvar alterações'
            document.getElementById('save').onclick = updateUser
            openModal()
        })
        .catch(err => alert(err.message))
}

function toggleUserStatus(id, is_active) {
    const status = is_active ? 'Ativo' : 'Inativo'
    fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
        .then(res => res.json())
        .then(() => loadUsers())
        .catch(err => alert('Erro ao atualizar status: ' + err.message))
}

function loadUsers() {
    fetch('/api/users')
        .then(res => res.json())
        .then(users => {
            const tbody = document.getElementById('userTableBody')
            tbody.innerHTML = ''
            users.forEach(user => {
                const status_class =
                    user.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo'
                const is_checked =
                    user.status.toLowerCase() === 'ativo' ? 'checked' : ''
                const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status ${status_class}">${user.status}</span></td>
                    <td>
                        <button class="edit" onclick="editUser(${user.id})">
                            <span class="material-icons">edit</span>
                        </button>
                        <label class="switch">
                            <input type="checkbox" ${is_checked} onchange="toggleUserStatus(${user.id}, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>`
                tbody.innerHTML += row
            })
        })
}

function openProfileModal() {
    if (!current_user_id) return
    fetch(`/api/users/${current_user_id}`)
        .then(res => res.json())
        .then(user => {
            document.getElementById('profileName').value = user.name
            document.getElementById('profilePassword').value = ''
            document.getElementById('profileModal').style.display = 'block'
            document.getElementById('profileName').focus()
        })
        .catch(err => alert('Erro ao carregar usuário: ' + err.message))
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none'
}

function validateProfilePassword() {
    const input = document.getElementById('profilePassword')
    const value = input.value
    let message = ''

    if (value) {
        const lengthOk = value.length >= 8
        const hasNumber = /\d/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        if (!lengthOk || !hasNumber || !hasSpecial) {
            message =
                'A senha deve ter pelo menos 8 caracteres, 1 número e 1 caractere especial.'
        }
    }

    input.setCustomValidity(message)
    return message === ''
}

function saveProfile() {
    if (!current_user_id) return
    const nome = document.getElementById('profileName').value.trim()
    const senhaInput = document.getElementById('profilePassword')
    const senha = senhaInput.value.trim()
    if (!validateProfilePassword()) {
        senhaInput.reportValidity()
        return
    }
    const bodyData = { name: nome }
    if (senha) bodyData.senha = senha

    fetch(`/api/users/${current_user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            closeProfileModal()
            const span = document.querySelector('.topbar .profile span')
            if (span) span.textContent = `Olá, ${nome}!`
        })
        .catch(err => alert(err.message))
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none'
}

function validateProfilePassword() {
    const input = document.getElementById('profilePassword')
    const value = input.value
    let message = ''

    if (value) {
        const lengthOk = value.length >= 8
        const hasNumber = /\d/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        if (!lengthOk || !hasNumber || !hasSpecial) {
            message =
                'A senha deve ter pelo menos 8 caracteres, 1 número e 1 caractere especial.'
        }
    }

    input.setCustomValidity(message)
    return message === ''
}

function saveProfile() {
    if (!current_user_id) return
    const nome = document.getElementById('profileName').value.trim()
    const senhaInput = document.getElementById('profilePassword')
    const senha = senhaInput.value.trim()
    if (!validateProfilePassword()) {
        senhaInput.reportValidity()
        return
    }
    const bodyData = { name: nome }
    if (senha) bodyData.senha = senha

    fetch(`/api/users/${current_user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            closeProfileModal()
            const span = document.querySelector('.topbar .profile span')
            if (span) span.textContent = `Olá, ${nome}!`
        })
        .catch(err => alert(err.message))
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none'
}

function saveProfile() {
    if (!current_user_id) return
    const nome = document.getElementById('profileName').value.trim()
    const senha = document.getElementById('profilePassword').value.trim()
    const bodyData = { name: nome }
    if (senha) bodyData.senha = senha

    fetch(`/api/users/${current_user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar usuário')
            return res.json()
        })
        .then(() => {
            closeProfileModal()
            const span = document.querySelector('.topbar .profile span')
            if (span) span.textContent = `Olá, ${nome}!`
        })
        .catch(err => alert(err.message))
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

function enviarPing() {
    fetch('/conteudos/ping', {
        method: 'POST'
    })
        .then(res => {
            if (!res.ok) throw new Error('Falha no ping')
            return res.json()
        })
        .then(data => {
            console.log('✔️ Check-in feito:', data.nome)
        })
        .catch(err => {
            console.warn('❌ Falha ao fazer check-in', err)
        })
}

setInterval(enviarPing, 60 * 1000)
enviarPing()

document.addEventListener('DOMContentLoaded', () => {
    iniciarCarrossel()
    atualizarRelogio()
    atualizarConteudo()
    if (document.getElementById('userTableBody')) {
        loadUsers()
        aplicarBusca('#buscaUsuarios', '#userTableBody')
    }

    const modal = document.getElementById('modal')
    if (modal) {
        modal.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault()
                const botaoSalvar = document.getElementById('save')
                if (botaoSalvar) botaoSalvar.click()
            }
        })
    }

    const editLink = document.getElementById('editProfileLink')
    if (editLink) {
        editLink.addEventListener('click', e => {
            e.preventDefault()
            openProfileModal()
        })
    }

    const profileModal = document.getElementById('profileModal')
    if (profileModal) {
        profileModal.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault()
                saveProfile()
            }
        })
    }

    const nomeInput = document.getElementById('userName')
    const emailInput = document.getElementById('userEmail')
    const senhaInput = document.getElementById('userPassword')

    if (nomeInput) {
        nomeInput.addEventListener('input', () => {
            validateName()
            nomeInput.reportValidity()
        })
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            validateEmail()
            emailInput.reportValidity()
        })
    }

    if (senhaInput) {
        senhaInput.addEventListener('input', () => {
            validatePassword()
            senhaInput.reportValidity()
        })
    }

    const perfilSenhaInput = document.getElementById('profilePassword')
    if (perfilSenhaInput) {
        perfilSenhaInput.addEventListener('input', () => {
            validateProfilePassword()
            perfilSenhaInput.reportValidity()
        })
    }
})
