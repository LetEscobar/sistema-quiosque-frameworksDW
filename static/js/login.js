document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePassword.textContent = 'visibility';
    } else {
      passwordInput.type = 'password';
      togglePassword.textContent = 'visibility_off';
    }
  });
});
