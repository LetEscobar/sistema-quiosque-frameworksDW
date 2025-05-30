function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function saveUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    if (!name || !email) {
        alert('Preencha nome e email!');
        return;
    }

    fetch('/api/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email})
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao salvar usuário');
        return res.json();
    })
    .then(() => {
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        closeModal();
        loadUsers();
    })
    .catch(err => alert(err.message));
}

function loadUsers() {
    fetch('/api/users')
    .then(res => res.json())
    .then(users => {
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        users.forEach(user => {
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

document.addEventListener('DOMContentLoaded', loadUsers);
