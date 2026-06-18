const ID_COORD_LOGADO = parseInt(localStorage.getItem('coordenadorId'));

let submissaoSelecionada = null;
let _submissoes = [];
let _atividades = [];
let _alunos = [];
let _usuarios = [];
let _regras = [];
let _certificados = [];

async function carregarDados() {
    const [subRes, atRes, alunosRes, regrasRes, certRes] = await Promise.all([
        fetch(API + '/submissoes/coordenador/' + ID_COORD_LOGADO, { headers: authHeaders() }),
        fetch(API + '/atividades', { headers: authHeaders() }),
        fetch(API + '/alunos', { headers: authHeaders() }),
        fetch(API + '/regras', { headers: authHeaders() }),
        fetch(API + '/certificados', { headers: authHeaders() })
    ]);
    if (handleUnauthorized(subRes)) return;
    _submissoes = await subRes.json();
    _atividades = await atRes.json();
    _alunos = await alunosRes.json();
    _usuarios = await usuariosRes.json();
    _regras = await regrasRes.json();
    _certificados = await certRes.json();
    renderTable();
}

function renderTable() {
    const lista = document.getElementById('lista-submissoes');
    const filtroStatus = document.getElementById('filtro-status').value;
    if (!lista) return;
    lista.innerHTML = '';

    const submissoesArr = Array.isArray(_submissoes) ? _submissoes : [];
    const filtradas = submissoesArr.filter(sub => filtroStatus === 'todos' || sub.status === filtroStatus);

    if (!filtradas.length) {
        lista.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma atividade pendente para seus cursos.</td></tr>';
        return;
    }

    filtradas.forEach(sub => {
        const atividade = _atividades.find(a => a.idAtividade === sub.atividade_idAtividade);
        if (!atividade) return;
        const aluno = _alunos.find(a => a.matricula === atividade.aluno_matricula);
        const dataFormatada = sub.dataEnvio.split(' ')[0].split('-').reverse().join('/');

        lista.innerHTML += `
            <tr>
                <td>${dataFormatada}</td>
                <td><strong>${aluno ? aluno.nome : 'Desconhecido'}</strong></td>
                <td>${atividade.titulo}</td>
                <td>${atividade.cargaHorariaSolicitada}h</td>
                <td><span class="status-tag2 status-${sub.status}">${sub.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn-avaliar" onclick="abrirModal(${sub.idSubmissao})">
                        ${sub.status === 'pendente' ? 'Avaliar' : 'Ver Detalhes'}
                    </button>
                </td>
            </tr>
        `;
    });
}

function abrirModal(idSubmissao) {
    submissaoSelecionada = _submissoes.find(s => s.idSubmissao === idSubmissao);
    const atividade = _atividades.find(a => a.idAtividade === submissaoSelecionada.atividade_idAtividade);
    const aluno = _alunos.find(a => a.matricula === atividade.aluno_matricula);
    const usuario = _usuarios.find(u => u.idusuario === aluno.usuario_idusuario);
    const regra = _regras.find(r => r.idRegra === atividade.regra_idRegra);
    const certificado = _certificados.find(c => c.submissao_idSubmissao === idSubmissao);

    document.getElementById('modal-info-header').innerHTML = `
        <p><strong>Aluno:</strong> ${aluno.nome}</p>
        <p><strong>Email:</strong> ${usuario ? usuario.email : 'N/A'}</p>
        <p><strong>Carga horária na categoria (${regra.categoria}):</strong> ${aluno.cargaHorariaAcumulada}h / ${regra.cargaHorariaPermitida}h</p>
    `;
    document.getElementById('cert-img').src = certificado ? certificado.caminhoArquivo : 'https://via.placeholder.com/600x400?text=Sem+Imagem';
    document.getElementById('ocr-raw-text').value = certificado ? certificado.textoOCR : 'Nenhum texto detectado.';
    document.getElementById('ocr-horas').innerText = `${atividade.cargaHorariaSolicitada} horas`;
    document.getElementById('ocr-assunto').innerText = atividade.titulo;
    document.getElementById('val-categoria').value = regra ? regra.categoria : 'Sem categoria';
    document.getElementById('val-horas').value = atividade.cargaHorariaSolicitada;
    document.getElementById('observacao-admin').value = submissaoSelecionada.observacao || '';

    const footer = document.querySelector('.modal-footer');
    if (footer) footer.style.display = submissaoSelecionada.status !== 'pendente' ? 'none' : 'flex';

    document.getElementById('modal-avaliacao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-avaliacao').style.display = 'none';
}

async function processarAvaliacao(novoStatus) {
    const horasAprovadas = parseInt(document.getElementById('val-horas').value);
    const obs = document.getElementById('observacao-admin').value;

    try {
        await fetch(API + '/submissoes/' + submissaoSelecionada.idSubmissao + '/status', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: novoStatus, observacao: obs, horasAprovadas, coordenador_idCoordenador: ID_COORD_LOGADO })
        });
        alert(`Solicitação ${novoStatus.toUpperCase()} com sucesso!`);
        fecharModal();
        await carregarDados();
    } catch (err) {
        console.error('Erro ao processar avaliação:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const filtro = document.getElementById('filtro-status');
    if (filtro) filtro.addEventListener('change', renderTable);
    carregarDados();
});
