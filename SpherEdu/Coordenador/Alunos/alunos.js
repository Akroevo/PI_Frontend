const ID_COORD_LOGADO = parseInt(localStorage.getItem('coordenadorId'));

let editMatricula = null;
const tableBody = document.getElementById('student-table-body');
const modal = document.getElementById('modal-aluno');
const form = document.getElementById('form-aluno');
const cursosContainer = document.getElementById('m-cursos-container');

let _alunos = [];
let _meusCursos = [];

async function carregarDados() {
    const [alunosRes, coordCursosRes] = await Promise.all([
        fetch(API + '/alunos', { headers: authHeaders() }),
        fetch(API + '/coordenadores/' + ID_COORD_LOGADO + '/cursos', { headers: authHeaders() })
    ]);
    if (handleUnauthorized(alunosRes)) return;
    _alunos = await alunosRes.json();
    _meusCursos = await coordCursosRes.json();
    renderTable();
}

function renderCursosCheckboxes() {
    if (!cursosContainer) return;
    cursosContainer.innerHTML = '';
    _meusCursos.forEach(curso => {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.innerHTML = `<input type="checkbox" name="curso" value="${curso.idCurso}"> ${curso.nome}`;
        cursosContainer.appendChild(label);
    });
}

function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    (Array.isArray(_alunos) ? _alunos : []).forEach(aluno => {
        const cursoNomes = (aluno.cursos || []).map(c => c.nome).join(', ') || '<span style="color:gray">Sem curso</span>';
        tableBody.innerHTML += `
            <tr>
                <td>${aluno.matricula}</td>
                <td>${aluno.nome}</td>
                <td>${cursoNomes}</td>
                <td><span class="btn-edit" onclick="openModal('${aluno.matricula}')">Editar</span></td>
            </tr>
        `;
    });
}

function openModal(matricula = null) {
    editMatricula = matricula;
    modal.style.display = 'flex';
    renderCursosCheckboxes();

    const titulo = document.getElementById('modalTitulo');

    if (matricula !== null) {
        if (titulo) titulo.innerText = 'Editar Aluno';
        const aluno = _alunos.find(a => String(a.matricula) === String(matricula));
        document.getElementById('m-matricula').value = aluno.matricula;
        document.getElementById('m-nome').value = aluno.nome;
        const emailField = document.getElementById('m-email');
        if (emailField) emailField.value = aluno.email || '';
        const senhaField = document.getElementById('m-senha');
        if (senhaField) {
            senhaField.value = '******';
            senhaField.disabled = true;
        }
        const idsCursos = (aluno.cursos || []).map(c => c.idCurso);
        document.querySelectorAll('input[name="curso"]').forEach(cb => {
            cb.checked = idsCursos.includes(parseInt(cb.value));
        });
    } else {
        if (titulo) titulo.innerText = 'Novo Aluno';
        form.reset();
        const senhaField = document.getElementById('m-senha');
        if (senhaField) senhaField.disabled = false;
        const matriculaField = document.getElementById('m-matricula');
        if (matriculaField) matriculaField.value = '';
    }
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const selectedCursosIds = Array.from(document.querySelectorAll('input[name="curso"]:checked')).map(cb => parseInt(cb.value));
    const nome = document.getElementById('m-nome').value;
    const emailField = document.getElementById('m-email');
    const senhaField = document.getElementById('m-senha');
    const email = emailField ? emailField.value : null;
    const senha = senhaField ? senhaField.value : null;

    try {
        if (editMatricula !== null) {
            await fetch(API + '/alunos/' + editMatricula, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ nome, cursos: selectedCursosIds })
            });
        } else {
            const usuarioRes = await fetch(API + '/usuarios', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    email,
                    senha,
                    telefone: null,
                    tipo_usuario: 'aluno'
                })
            });
            const usuarioData = await usuarioRes.json();

            await fetch(API + '/alunos', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    nome,
                    dataEntrada: new Date().toISOString().split('T')[0],
                    cargaHorariaAcumulada: 0,
                    usuario_idusuario: usuarioData.id,
                    cursos: selectedCursosIds
                })
            });
        }
        modal.style.display = 'none';
        await carregarDados();
    } catch (err) {
        console.error('Erro ao salvar aluno:', err);
    }
};

window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
window.openModal = openModal;

carregarDados();
