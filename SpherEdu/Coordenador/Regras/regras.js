const ID_COORD_LOGADO = parseInt(localStorage.getItem('coordenadorId'));

let editIdRegra = null;
const tableBody = document.getElementById('regras-table-body');
const modal = document.getElementById('modal-regras');
const form = document.getElementById('form-regras');
const cursoSelect = document.getElementById('filtro-curso');

let _meusCursos = [];
let _regras = [];

function mostrarMensagemTabela(msg) {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">${msg}</td></tr>`;
}

async function carregarCursos() {
    if (!cursoSelect) {
        console.error('Elemento #filtro-curso não encontrado no HTML.');
        mostrarMensagemTabela('Erro ao carregar página: elemento de seleção de curso não encontrado.');
        return;
    }

    if (!ID_COORD_LOGADO || Number.isNaN(ID_COORD_LOGADO)) {
        mostrarMensagemTabela('Não foi possível identificar o coordenador logado. Faça login novamente.');
        return;
    }

    try {
        const res = await fetch(API + '/coordenadores/' + ID_COORD_LOGADO + '/cursos', { headers: authHeaders() });
        if (handleUnauthorized(res)) return;

        if (!res.ok) {
            mostrarMensagemTabela('Erro ao buscar seus cursos. Tente novamente mais tarde.');
            return;
        }

        _meusCursos = await res.json();

        if (!Array.isArray(_meusCursos) || !_meusCursos.length) {
            mostrarMensagemTabela('Nenhum curso está associado a este coordenador. Contate o administrador.');
            return;
        }

        popularCursos();
        await carregarRegras();
    } catch (err) {
        console.error('Erro ao carregar cursos do coordenador:', err);
        mostrarMensagemTabela('Erro de conexão ao buscar seus cursos.');
    }
}

function popularCursos() {
    if (!cursoSelect) return;
    cursoSelect.innerHTML = '';
    _meusCursos.forEach(c => {
        const option = document.createElement('option');
        option.value = c.idCurso;
        option.textContent = c.nome;
        cursoSelect.appendChild(option);
    });
    cursoSelect.selectedIndex = 0;
}

function getCursoIdAtual() {
    if (!cursoSelect || !cursoSelect.value) return null;
    return parseInt(cursoSelect.value);
}

async function carregarRegras() {
    const idCurso = getCursoIdAtual();
    if (!idCurso) {
        mostrarMensagemTabela('Selecione um curso para ver suas regras.');
        return;
    }

    try {
        const res = await fetch(API + '/regras/curso/' + idCurso, { headers: authHeaders() });
        if (handleUnauthorized(res)) return;

        if (!res.ok) {
            mostrarMensagemTabela('Erro ao buscar regras deste curso.');
            return;
        }

        _regras = await res.json();
        renderTable();
    } catch (err) {
        console.error('Erro ao carregar regras:', err);
        mostrarMensagemTabela('Erro de conexão ao buscar regras.');
    }
}

function renderTable() {
    const idCurso = getCursoIdAtual();
    const cursoObj = _meusCursos.find(c => c.idCurso === idCurso);
    let somaTotal = 0;
    tableBody.innerHTML = '';

    const regrasArr = Array.isArray(_regras) ? _regras : [];

    if (!regrasArr.length) {
        mostrarMensagemTabela('Nenhuma regra cadastrada para este curso.');
    }

    regrasArr.forEach(regra => {
        somaTotal += regra.cargaHorariaPermitida;
        tableBody.innerHTML += `
            <tr>
                <td>${regra.categoria}</td>
                <td>${regra.cargaHorariaMin}h</td>
                <td>${regra.cargaHorariaMax}h</td>
                <td>${regra.cargaHorariaPermitida}h</td>
                <td>${regra.descricao}</td>
                <td>
                    <span class="btn-edit" onclick="openModal(${regra.idRegra})">Editar</span>
                </td>
            </tr>
        `;
    });

    const contador = document.getElementById('contador-horas');
    if (contador && cursoObj) {
        const limite = cursoObj.cargaHorariaTotal;
        contador.innerText = `Total do Curso: ${somaTotal} / ${limite}h`;
        contador.style.color = somaTotal === limite ? 'green' : (somaTotal > limite ? 'red' : '#333');
    }
}

window.openModal = (idRegra = null) => {
    editIdRegra = idRegra;
    modal.style.display = 'flex';
    const titulo = document.getElementById('modalTitulo');

    if (idRegra !== null) {
        titulo.innerText = 'Editar Categoria';
        const r = _regras.find(reg => reg.idRegra === idRegra);
        document.getElementById('m-nome').value = r.categoria;
        document.getElementById('m-min').value = r.cargaHorariaMin;
        document.getElementById('m-max').value = r.cargaHorariaMax;
        document.getElementById('m-permitida').value = r.cargaHorariaPermitida;
        document.getElementById('m-regra').value = r.descricao;
    } else {
        titulo.innerText = 'Nova Categoria';
        form.reset();
    }
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const idCurso = getCursoIdAtual();
    const cursoObj = _meusCursos.find(c => c.idCurso === idCurso);

    const vMin = parseInt(document.getElementById('m-min').value) || 0;
    const vMax = parseInt(document.getElementById('m-max').value) || 0;
    const vPermitida = parseInt(document.getElementById('m-permitida').value) || 0;
    const vDesc = document.getElementById('m-regra').value;
    const vCat = document.getElementById('m-nome').value;

    if (vPermitida < vMin || vPermitida > vMax) {
        alert(`Erro: A carga Permitida (${vPermitida}h) deve estar entre o Mínimo e o Máximo.`);
        return;
    }

    const somaOutras = (Array.isArray(_regras) ? _regras : [])
        .filter(r => r.idRegra !== editIdRegra)
        .reduce((acc, curr) => acc + curr.cargaHorariaPermitida, 0);

    if (cursoObj && somaOutras + vPermitida > cursoObj.cargaHorariaTotal) {
        alert(`Erro: A soma ultrapassa o limite do curso (${cursoObj.cargaHorariaTotal}h).`);
        return;
    }

    const body = { curso_idCurso: idCurso, categoria: vCat, cargaHorariaMin: vMin, cargaHorariaMax: vMax, cargaHorariaPermitida: vPermitida, descricao: vDesc };

    try {
        const res = editIdRegra !== null
            ? await fetch(API + '/regras/' + editIdRegra, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
            : await fetch(API + '/regras', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });

        if (handleUnauthorized(res)) return;

        if (!res.ok) {
            const erro = await res.json().catch(() => ({}));
            alert(erro.message || 'Erro ao salvar regra.');
            return;
        }

        modal.style.display = 'none';
        await carregarRegras();
    } catch (err) {
        console.error('Erro ao salvar regra:', err);
        alert('Erro de conexão ao salvar regra.');
    }
};

window.deleteRegra = async () => {
    if (editIdRegra !== null && confirm('Deseja excluir esta regra definitivamente?')) {
        try {
            const res = await fetch(API + '/regras/' + editIdRegra, { method: 'DELETE', headers: authHeaders() });
            if (handleUnauthorized(res)) return;
            if (!res.ok) {
                alert('Erro ao excluir regra.');
                return;
            }
            modal.style.display = 'none';
            await carregarRegras();
        } catch (err) {
            console.error('Erro ao excluir regra:', err);
            alert('Erro de conexão ao excluir regra.');
        }
    }
};

window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

if (cursoSelect) cursoSelect.addEventListener('change', carregarRegras);
carregarCursos();
