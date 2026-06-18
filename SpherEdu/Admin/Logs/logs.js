let todosOsLogs = [];

function formatarData(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    const dia  = String(d.getDate()).padStart(2, '0');
    const mes  = String(d.getMonth() + 1).padStart(2, '0');
    const ano  = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min  = String(d.getMinutes()).padStart(2, '0');
    const seg  = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

function badgeLevel(level) {
    const l = (level || '').toLowerCase();
    if (l === 'error') return `<span class="badge-delete">${level.toUpperCase()}</span>`;
    if (l === 'warn')  return `<span class="badge-update">${level.toUpperCase()}</span>`;
    return `<span class="badge-insert">${(level || 'INFO').toUpperCase()}</span>`;
}

function formatarMeta(meta) {
    if (!meta) return '-';
    try {
        const obj = typeof meta === 'string' ? JSON.parse(meta) : meta;
        if (Object.keys(obj).length === 0) return '-';
        return Object.entries(obj)
            .map(([k, v]) => `<b>${k}:</b> ${v}`)
            .join('<br>');
    } catch {
        return String(meta);
    }
}

function renderizarTabela(logs) {
    const corpo = document.getElementById('tabela-logs');
    const contador = document.getElementById('contador-logs');

    if (!logs.length) {
        corpo.innerHTML = `<tr><td colspan="4" class="sem-logs">Nenhum log encontrado.</td></tr>`;
        contador.textContent = '';
        return;
    }

    contador.textContent = `Exibindo ${logs.length} registro${logs.length !== 1 ? 's' : ''}`;

    corpo.innerHTML = logs.map(log => `
        <tr>
            <td style="white-space: nowrap;">${formatarData(log.timestamp)}</td>
            <td>${badgeLevel(log.level)}</td>
            <td>${log.message || '-'}</td>
            <td class="log-meta">${formatarMeta(log.meta)}</td>
        </tr>
    `).join('');
}

function aplicarFiltros() {
    const busca  = document.getElementById('input-busca').value.toLowerCase().trim();
    const level  = document.getElementById('filtro-level').value.toLowerCase();

    const filtrados = todosOsLogs.filter(log => {
        const matchLevel   = !level  || (log.level || '').toLowerCase() === level;
        const matchBusca   = !busca  || (log.message || '').toLowerCase().includes(busca);
        return matchLevel && matchBusca;
    });

    renderizarTabela(filtrados);
}

async function carregarLogs() {
    const corpo = document.getElementById('tabela-logs');
    const contador = document.getElementById('contador-logs');
    corpo.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#999;">Carregando...</td></tr>`;
    contador.textContent = '';

    try {
        const res = await fetch(API + '/logs', { headers: authHeaders() });
        if (handleUnauthorized(res)) return;

        if (!res.ok) {
            corpo.innerHTML = `<tr><td colspan="4" class="sem-logs">Erro ao carregar logs (${res.status}).</td></tr>`;
            return;
        }

        const dados = await res.json();
        todosOsLogs = Array.isArray(dados) ? dados : [];
        aplicarFiltros();
    } catch (err) {
        console.error('Erro ao carregar logs:', err);
        corpo.innerHTML = `<tr><td colspan="4" class="sem-logs">Falha na conexão com o servidor.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarLogs();

    document.getElementById('filtro-level').addEventListener('change', aplicarFiltros);
    document.getElementById('input-busca').addEventListener('input', aplicarFiltros);
});
