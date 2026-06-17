document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(API + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'E-mail ou senha incorretos. Tente novamente.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioTipo', data.tipo_usuario);

        if (data.tipo_usuario === 'superadmin') {
            window.location.href = '../Admin/Dashboard/dashboard.html';

        } else if (data.tipo_usuario === 'coordenador') {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem('coordenadorId', payload.idCoordenador);
            window.location.href = '../Coordenador/Dashboard/dashboard.html';

        } else if (data.tipo_usuario === 'aluno') {
            window.location.href = '../Aluno/Dashboard/aluno.html';
        }

    } catch (err) {
        alert('Erro de conexão com o servidor. Tente novamente.');
        console.error(err);
    }
});
