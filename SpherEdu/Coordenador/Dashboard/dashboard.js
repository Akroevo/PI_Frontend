document.addEventListener('DOMContentLoaded', async () => {
    const ID_COORD_LOGADO = parseInt(localStorage.getItem('coordenadorId'));

    async function carregarDados() {
        const [subRes, cursosRes, alunosRes, notifRes] = await Promise.all([
            fetch(API + '/submissoes/coordenador/' + ID_COORD_LOGADO, { headers: authHeaders() }),
            fetch(API + '/cursos', { headers: authHeaders() }),
            fetch(API + '/alunos', { headers: authHeaders() }),
            fetch(API + '/notificacoes', { headers: authHeaders() })
        ]);
        if (handleUnauthorized(subRes)) return;

        const submissoes = await subRes.json();
        const cursos = await cursosRes.json();
        const alunos = await alunosRes.json();
        const notificacoes = await notifRes.json();

        atualizarCards(submissoes, cursos, alunos);
        carregarTabelaEmails(notificacoes, submissoes);
    }

    function atualizarCards(submissoes, cursos, alunos) {
        const submissoesArr = Array.isArray(submissoes) ? submissoes : [];
        const cursosArr = Array.isArray(cursos) ? cursos : [];
        const alunosArr = Array.isArray(alunos) ? alunos : [];

        const submissoesPendentes = submissoesArr.filter(s => s.status.toLowerCase() === 'pendente').length;
        const totalHorasValidadas = alunosArr.reduce((soma, aluno) => soma + (aluno.cargaHorariaAcumulada || 0), 0);

        if (document.getElementById('total-alunos'))
            document.getElementById('total-alunos').innerText = alunosArr.length;
        if (document.getElementById('cursos-ativos'))
            document.getElementById('cursos-ativos').innerText = cursosArr.length;
        if (document.getElementById('submissoes-pendentes'))
            document.getElementById('submissoes-pendentes').innerText = submissoesPendentes;
        if (document.getElementById('horas-validadas'))
            document.getElementById('horas-validadas').innerText = `${totalHorasValidadas}h`;
    }

    function carregarTabelaEmails(notificacoes, submissoes) {
        const corpoTabela = document.getElementById('tabela-emails');
        if (!corpoTabela) return;
        corpoTabela.innerHTML = '';

        const idsSubmissoes = (Array.isArray(submissoes) ? submissoes : []).map(s => s.idSubmissao);
        const minhasNotificacoes = (Array.isArray(notificacoes) ? notificacoes : [])
            .filter(n => idsSubmissoes.includes(n.submissao_idSubmissao));

        if (!minhasNotificacoes.length) {
            corpoTabela.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhum e-mail enviado para seus cursos.</td></tr>';
            return;
        }

        minhasNotificacoes.forEach(email => {
            const dataSimples = email.dataEnvio.split(' ')[0].split('-').reverse().join('/');
            corpoTabela.innerHTML += `
                <tr>
                    <td>${dataSimples}</td>
                    <td>${email.destinatario}</td>
                    <td>${email.assunto}</td>
                    <td><span class="status-tag status-enviado" style="color: #27ae60; font-weight: bold;">Enviado</span></td>
                </tr>
            `;
        });
    }

    await carregarDados();
});
