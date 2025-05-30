function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function saveUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;

    fetch('/api/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email})
    }).then(() => {
        closeModal();
        loadUsers();
    });
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
