const API_BASE = API_BASE_URL;
const ADMIN_API = API_BASE_URL + '/admin';

// Bootstrap Modal Instances
let gqmModal, indexModal;

document.addEventListener('DOMContentLoaded', () => {
    gqmModal = new bootstrap.Modal(document.getElementById('gqmModal'));
    indexModal = new bootstrap.Modal(document.getElementById('indexModal'));
    
    loadGqmList();
    loadIndexList();
});

// --- GQM Management ---

async function loadGqmList() {
    try {
        const res = await fetch(`${API_BASE}/gqm`, { headers: { 'X-From-Admin': '1' } });
        const data = await res.json();
        const tbody = document.getElementById('gqm-list');
        tbody.innerHTML = '';

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-3">${item.id}</td>
                <td>${item.name}</td>
                <td><code>${item.desc}</code></td>
                <td>${item.time || '-'}</td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick='openGqmModal(${JSON.stringify(item)})'>编辑</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGqm(${item.id})">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('加载改枪码失败');
    }
}

function openGqmModal(item = null) {
    const title = document.getElementById('gqmModalTitle');
    const idInput = document.getElementById('gqm-id');
    const nameInput = document.getElementById('gqm-name');
    const descInput = document.getElementById('gqm-desc');
    const timeInput = document.getElementById('gqm-time');

    if (item) {
        title.innerText = '编辑改枪码';
        idInput.value = item.id;
        nameInput.value = item.name;
        descInput.value = item.desc;
        timeInput.value = item.time || '';
    } else {
        title.innerText = '新增改枪码';
        idInput.value = '';
        nameInput.value = '';
        descInput.value = '';
        timeInput.value = '';
    }
    gqmModal.show();
}

async function saveGqm() {
    const id = document.getElementById('gqm-id').value;
    const data = {
        name: document.getElementById('gqm-name').value,
        desc: document.getElementById('gqm-desc').value,
        time: document.getElementById('gqm-time').value
    };

    try {
        let res;
        if (id) {
            // Update
            res = await fetch(`${ADMIN_API}/gqm/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create (Use public API for create if available, or admin one)
            res = await fetch(`${API_BASE}/gqm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-From-Admin': '1' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            gqmModal.hide();
            loadGqmList();
        } else {
            alert('保存失败');
        }
    } catch (error) {
        console.error(error);
        alert('保存出错');
    }
}

async function deleteGqm(id) {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
        const res = await fetch(`${ADMIN_API}/gqm/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadGqmList();
        } else {
            alert('删除失败');
        }
    } catch (error) {
        alert('删除出错');
    }
}

// --- Index Management ---

async function loadIndexList() {
    try {
        const res = await fetch(`${ADMIN_API}/index`);
        const data = await res.json();
        const tbody = document.getElementById('index-list');
        tbody.innerHTML = '';

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-3">${item.id}</td>
                <td>${item.title}</td>
                <td>${item.description || '-'}</td>
                <td><a href="${item.url}" target="_blank" class="text-truncate d-inline-block" style="max-width: 200px;">${item.url}</a></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick='openIndexModal(${JSON.stringify(item)})'>编辑</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteIndex(${item.id})">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('加载首页推荐失败');
    }
}

function openIndexModal(item = null) {
    const title = document.getElementById('indexModalTitle');
    const idInput = document.getElementById('index-id');
    const titleInput = document.getElementById('index-title');
    const descInput = document.getElementById('index-desc');
    const urlInput = document.getElementById('index-url');

    if (item) {
        title.innerText = '编辑推荐';
        idInput.value = item.id;
        titleInput.value = item.title;
        descInput.value = item.description || '';
        urlInput.value = item.url;
    } else {
        title.innerText = '新增推荐';
        idInput.value = '';
        titleInput.value = '';
        descInput.value = '';
        urlInput.value = '';
    }
    indexModal.show();
}

async function saveIndex() {
    const id = document.getElementById('index-id').value;
    const data = {
        title: document.getElementById('index-title').value,
        description: document.getElementById('index-desc').value,
        url: document.getElementById('index-url').value
    };

    try {
        let res;
        if (id) {
            res = await fetch(`${ADMIN_API}/index/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${ADMIN_API}/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            indexModal.hide();
            loadIndexList();
        } else {
            alert('保存失败');
        }
    } catch (error) {
        alert('保存出错');
    }
}

async function deleteIndex(id) {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
        const res = await fetch(`${ADMIN_API}/index/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadIndexList();
        } else {
            alert('删除失败');
        }
    } catch (error) {
        alert('删除出错');
    }
}
