let editing_user_id = null;
let dropAtivo = false;

function openModal() {
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function validateName() {
  const nameInput = document.getElementById('userName');
  const error = document.getElementById('nameError');
  const value = nameInput.value.trim();

  if (!value) {
    error.textContent = 'O nome é obrigatório.';
    nameInput.classList.add('input-error');
    return false;
  }

  if (!/^[A-Za-zÀ-ú\s]+$/.test(value)) {
    error.textContent = 'O nome deve conter apenas letras.';
    nameInput.classList.add('input-error');
    return false;
  }

  error.textContent = '';
  nameInput.classList.remove('input-error');
  return true;
}

function validateEmail() {
  const emailInput = document.getElementById('userEmail');
  const error = document.getElementById('emailError');
  const value = emailInput.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) {
    error.textContent = 'O e-mail é obrigatório.';
    emailInput.classList.add('input-error');
    return false;
  }

  if (!regex.test(value)) {
    error.textContent = 'Formato de e-mail inválido.';
    emailInput.classList.add('input-error');
    return false;
  }

  error.textContent = '';
  emailInput.classList.remove('input-error');
  return true;
}

function validatePassword() {
  const passwordInput = document.getElementById('userPassword');
  const error = document.getElementById('passwordError');
  const value = passwordInput.value;

  const lengthOk = value.length >= 8;
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (!value) {
    if (editing_user_id) {
      error.textContent = '';
      passwordInput.classList.remove('input-error');
      return true;
    }
    error.textContent = 'A senha é obrigatória.';
    passwordInput.classList.add('input-error');
    return false;
  }

  if (!lengthOk || !hasNumber || !hasSpecial) {
    error.textContent =
      'A senha deve ter pelo menos 8 caracteres, 1 número e 1 caractere especial.';
    passwordInput.classList.add('input-error');
    return false;
  }

  error.textContent = '';
  passwordInput.classList.remove('input-error');
  return true;
}

function validateAllFields() {
  return validateName() && validateEmail() && validatePassword();
}

function saveUser() {
  if (!validateAllFields()) return;

  const nome = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const senha = document.getElementById('userPassword').value.trim();

  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome, email, senha }),
  })
    .then(res => {
      if (!res.ok)
        throw new Error(
          'Erro ao salvar usuário! Verifique se os dados foram preenchidos corretamente!  '
        );
      return res.json();
    })
    .then(() => {
      document.getElementById('userName').value = '';
      document.getElementById('userEmail').value = '';
      document.getElementById('userPassword').value = '';
      closeModal();
      loadUsers();
    })
    .catch(err => alert(err.message));
}

function updateUser() {
  if (!validateAllFields()) return;

  const nome = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const senha = document.getElementById('userPassword').value.trim();

  const bodyData = { name: nome, email };
  if (senha) bodyData.senha = senha;

  fetch(`/api/users/${editing_user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao atualizar usuário');
      return res.json();
    })
    .then(() => {
      document.getElementById('userName').value = '';
      document.getElementById('userEmail').value = '';
      document.getElementById('userPassword').value = '';
      document.getElementById('save').textContent = 'Salvar usuário';
      document.getElementById('save').onclick = saveUser;
      closeModal();
      loadUsers();
    })
    .catch(err => alert(err.message));
}

function editUser(id) {
  fetch(`/api/users/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Usuário não encontrado.');
      return res.json();
    })
    .then(user => {
      editing_user_id = id;
      document.getElementById('userName').value = user.name;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userPassword').value = '';
      document.getElementById('save').textContent = 'Salvar alterações';
      document.getElementById('save').onclick = updateUser;
      openModal();
    })
    .catch(err => alert(err.message));
}

function toggleUserStatus(id, is_active) {
  const status = is_active ? 'Ativo' : 'Inativo';

  fetch(`/api/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          alert(data.error || 'Erro ao atualizar status.');
          const checkbox = document.querySelector(
            `input[type="checkbox"][onchange*="toggleUserStatus(${id}"]`
          );
          if (checkbox) checkbox.checked = !is_active;
          throw new Error('Erro ao atualizar status');
        });
      }
      return res.json();
    })
    .then(() => loadUsers())
    .catch(err => {
      if (err.message !== 'Erro ao atualizar status') {
        alert('Erro de comunicação com o servidor.');
        const checkbox = document.querySelector(
          `input[type="checkbox"][onchange*="toggleUserStatus(${id}"]`
        );
        if (checkbox) checkbox.checked = !is_active;
      }
    });
}

function loadUsers() {
  fetch('/api/users')
    .then(res => res.json())
    .then(users => {
      const tbody = document.getElementById('userTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      users.forEach(user => {
        const status_class =
          user.status.toLowerCase() === 'ativo' ? 'ativo' : 'inativo';
        const is_checked =
          user.status.toLowerCase() === 'ativo' ? 'checked' : '';
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
                </tr>`;
        tbody.innerHTML += row;
      });
    });
}

function aplicarBusca(inputSelector, tabelaSelector) {
  const input = document.querySelector(inputSelector);
  const tabela = document.querySelector(tabelaSelector);

  if (!input || !tabela) return;

  input.addEventListener('input', () => {
    const termo = input.value.trim().toLowerCase();
    const linhas = tabela.querySelectorAll('tr');

    linhas.forEach(linha => {
      const textoLinha = linha.textContent.toLowerCase();
      linha.style.display = textoLinha.includes(termo) ? '' : 'none';
    });
  });
}

function atualizarRelogio() {
  const agora = new Date();
  const horas = agora.getHours().toString().padStart(2, '0');
  const minutos = agora.getMinutes().toString().padStart(2, '0');
  const segundos = agora.getSeconds().toString().padStart(2, '0');
  const relogio = document.getElementById('relogio');

  if (relogio) {
    relogio.textContent = `${horas}:${minutos}:${segundos}`;
  }
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();

window.addEventListener('drop', e => {
  e.preventDefault();
  dropAtivo = true;
  setTimeout(() => (dropAtivo = false), 100);
});
window.addEventListener('dragover', e => e.preventDefault());

window.addEventListener('click', function (event) {
  const modal = document.getElementById('modal');
  if (event.target === modal && !dropAtivo) {
    modal.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('userTableBody')) {
    loadUsers();
    aplicarBusca('#buscaUsuarios', '#userTableBody');
  }

  document.querySelectorAll('input[required]').forEach(input => {
    const label = input.closest('.item_form')?.querySelector('label');
    if (label && !label.innerHTML.includes('*')) {
      label.innerHTML += ' <span class="required-star">*</span>';
    }
  });

  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const botaoSalvar = document.getElementById('save');
        if (botaoSalvar) botaoSalvar.click();
      }
    });
  }

  const carrossel = document.getElementById('carrossel');
  if (carrossel) {
    const slides = Array.from(carrossel.querySelectorAll('img'));
    const container = carrossel.parentElement;
    const total = slides.length;

    if (total > 0) {
      const clone = slides[0].cloneNode(true);
      carrossel.appendChild(clone);

      let index = 0;
      let largura = container.offsetWidth;

      function atualizarTransform() {
        carrossel.style.transform = `translateX(${-index * largura}px)`;
      }

      function avancar() {
        index++;
        carrossel.style.transition = 'transform 0.5s ease-in-out';
        atualizarTransform();

        if (index === total) {
          setTimeout(() => {
            carrossel.style.transition = 'none';
            index = 0;
            atualizarTransform();
          }, 500);
        }
      }

      setInterval(avancar, 5000);

      window.addEventListener('resize', () => {
        largura = container.offsetWidth;
        atualizarTransform();
      });
    }
  }
});

function create_class(id, name, period, action) {
  document.getElementById('modal').style.display = 'block';
}
