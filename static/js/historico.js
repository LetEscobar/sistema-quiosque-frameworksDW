document
    .getElementById('buscaHistorico')
    .addEventListener('input', function () {
        const termo = this.value.toLowerCase()
        const linhas = document.querySelectorAll('#historicoTableBody tr')
        linhas.forEach(linha => {
            const textoLinha = linha.innerText.toLowerCase()
            linha.style.display = textoLinha.includes(termo) ? '' : 'none'
        })
    })
