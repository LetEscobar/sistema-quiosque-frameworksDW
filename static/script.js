// MODAL CONTROLS
function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// ========== USUÁRIOS ==========

function saveUser() {
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const senha = document.getElementById("userPassword").value.trim();

  if (!name || !email || !senha) {
    alert("Preencha nome, email e senha!");
    return;
  }

  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, senha }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao salvar usuário");
      return res.json();
    })
    .then(() => {
      document.getElementById("userName").value = "";
      document.getElementById("userEmail").value = "";
      document.getElementById("userPassword").value = "";
      closeModal();
      loadUsers();
    })
    .catch((err) => alert(err.message));
}

function loadUsers() {
  fetch("/api/users")
    .then((res) => res.json())
    .then((users) => {
      const tbody = document.getElementById("userTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      users.forEach((user) => {
        const row = `<tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.status}</td>
                        </tr>`;
        tbody.innerHTML += row;
      });
    });
}

// ========== TELAS ==========

function saveTela() {
  const nomeDispositivo = document.getElementById("dispName").value.trim();
  const enderecoIp = document.getElementById("dispIP").value.trim();

  if (!nomeDispositivo || !enderecoIp) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  fetch("/api/telas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeDispositivo, enderecoIp }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao salvar tela");
      return res.json();
    })
    .then(() => {
      document.getElementById("dispName").value = "";
      document.getElementById("dispIP").value = "";
      closeModal();
      loadTelas();
    })
    .catch((err) => alert(err.message));
}

function loadTelas() {
  fetch("/api/telas")
    .then((res) => res.json())
    .then((telas) => {
      const tbody = document.getElementById("telaTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      telas.forEach((tela) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${tela.idTela}</td>
                <td>${tela.enderecoIp}</td>
                <td>${tela.nomeDispositivo}</td>
                <td><span class="status ${tela.status.toLowerCase()}">${
                  tela.status
                }</span></td>
                <td>
                    <button class="edit">✏️</button>
                    <label class="switch">
                        <input type="checkbox" ${
                          tela.status === "Ativo" ? "checked" : ""
                        } />
                        <span class="slider"></span>
                    </label>
                </td>`;
        tbody.appendChild(row);
      });
    })
    .catch((err) => console.error("Erro ao carregar telas:", err));
}

// Detectar qual tela carregar com base no ID do elemento
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userTableBody")) {
    loadUsers();
  }
  if (document.getElementById("telaTableBody")) {
    loadTelas();
  }
});

// relogio tela de exibição

document.addEventListener("DOMContentLoaded", () => {
  function atualizarRelogio() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, "0");
    const minutos = agora.getMinutes().toString().padStart(2, "0");
    const segundos = agora.getSeconds().toString().padStart(2, "0");

    document.getElementById("relogio").textContent =
      `${horas}:${minutos}:${segundos}`;
  }

  setInterval(atualizarRelogio, 1000);
  atualizarRelogio();
});
