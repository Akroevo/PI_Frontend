const ID_COORD_LOGADO = parseInt(localStorage.getItem('coordenadorId'));

const tableBody = document.getElementById('student-table-body');
const tableSemCurso = document.getElementById('sem-curso-table-body');
const modal = document.getElementById('modal-aluno');
const form = document.getElementById('form-aluno');
const cursosContainer = document.getElementById('m-cursos-container');

let _alunosDoCoordenador = [];
let _alunosSemCurso = [];
let _meusCursos = [];
let _alunoSelecionado = null;

async function carregarDados() {
  const [meusAlunosRes, semCursoRes, cursosRes] = await Promise.all([
    fetch(API + '/coordenadores/' + ID_COORD_LOGADO + '/alunos', { headers: authHeaders() }),
    fetch(API + '/alunos/sem-curso', { headers: authHeaders() }),
    fetch(API + '/coordenadores/' + ID_COORD_LOGADO + '/cursos', { headers: authHeaders() })
  ]);
  if (handleUnauthorized(meusAlunosRes)) return;
  _alunosDoCoordenador = await meusAlunosRes.json();
  _alunosSemCurso = await semCursoRes.json();
  _meusCursos = await cursosRes.json();
  renderTables();
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

function renderTables() {
  if (tableBody) {
    tableBody.innerHTML = '';
    (Array.isArray(_alunosDoCoordenador) ? _alunosDoCoordenador : []).forEach(aluno => {
      const cursoNomes = (aluno.cursos || []).map(c => c.nome).join(', ') || '<span style="color:gray">Sem curso</span>';
      tableBody.innerHTML += `
        <tr>
          <td>${aluno.matricula}</td>
          <td>${aluno.nome}</td>
          <td>${cursoNomes}</td>
          <td><span class="btn-edit" onclick="openModal('${aluno.matricula}', false)">Editar cursos</span></td>
        </tr>
      `;
    });
  }

  if (tableSemCurso) {
    tableSemCurso.innerHTML = '';
    (Array.isArray(_alunosSemCurso) ? _alunosSemCurso : []).forEach(aluno => {
      tableSemCurso.innerHTML += `
        <tr>
          <td>${aluno.matricula}</td>
          <td>${aluno.nome}</td>
          <td><span class="btn-edit" onclick="openModal('${aluno.matricula}', true)">Adicionar ao curso</span></td>
        </tr>
      `;
    });
  }
}

function openModal(matricula, semCurso) {
  _alunoSelecionado = matricula;
  modal.style.display = 'flex';
  renderCursosCheckboxes();

  const fonte = semCurso ? _alunosSemCurso : _alunosDoCoordenador;
  const aluno = fonte.find(a => String(a.matricula) === String(matricula));

  document.getElementById('m-matricula').value = aluno.matricula;
  document.getElementById('m-nome').value = aluno.nome;

  if (!semCurso) {
    const idsCursos = (aluno.cursos || []).map(c => c.idCurso);
    document.querySelectorAll('input[name="curso"]').forEach(cb => {
      cb.checked = idsCursos.includes(parseInt(cb.value));
    });
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const selectedCursosIds = Array.from(document.querySelectorAll('input[name="curso"]:checked')).map(cb => parseInt(cb.value));

  try {
    await fetch(API + '/alunos/' + _alunoSelecionado, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ cursos: selectedCursosIds })
    });
    modal.style.display = 'none';
    await carregarDados();
  } catch (err) {
    console.error('Erro ao salvar aluno:', err);
  }
};

window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
window.openModal = openModal;

carregarDados();
