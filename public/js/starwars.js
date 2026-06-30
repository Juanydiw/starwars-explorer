const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

let currentData = [];
let filteredData = [];
let currentFilter = "Todos";

const cardsContainer = document.getElementById("cards");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const filtersContainer = document.getElementById("filters");
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const cancelAdd = document.getElementById('cancelAdd');
const addForm = document.getElementById('addForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');
const itemImageInput = document.getElementById('itemImage');
const itemImagePreview = document.getElementById('itemImagePreview');

let editMode = false;
let editId = null;

function showLoader() { loader.style.display = "block"; }
function hideLoader() { loader.style.display = "none"; }
function showError() { errorBox.style.display = "block"; }
function hideError() { errorBox.style.display = "none"; }

// ==========================
// API
// ==========================

async function fetchData() {

    showLoader();
    hideError();

    try {
        const response = await fetch('/characters', {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Error API local');

        const data = await response.json();
        currentData = data;
        filteredData = [...currentData];

        renderFilters();
        renderCards(filteredData);

    } catch (error) {
        showError();
    } finally {
        hideLoader();
    }
}

// ==========================
// RENDERIZADO
// ==========================

function renderCards(data) {

    cardsContainer.innerHTML = "";

    if (data.length === 0) {
        cardsContainer.innerHTML = "<h2>No se encontraron resultados.</h2>";
        return;
    }

    data.forEach(item => {

        const card = document.createElement("div");
        card.className = "card";

        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginBottom = '8px';
            card.appendChild(img);
        }

        const h = document.createElement('h3'); h.textContent = item.name; card.appendChild(h);
        const p1 = document.createElement('p'); p1.innerHTML = `<b>Género:</b> ${item.gender}`; card.appendChild(p1);
        const p2 = document.createElement('p'); p2.innerHTML = `<b>Altura:</b> ${item.height} cm`; card.appendChild(p2);
        const p3 = document.createElement('p'); p3.innerHTML = `<b>Peso:</b> ${item.mass} kg`; card.appendChild(p3);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'tab-btn';
        editBtn.style.marginTop = '8px';
        editBtn.style.marginRight = '8px';
        editBtn.addEventListener('click', () => openEditModal(item));
        card.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.className = 'btn-red';
        delBtn.style.marginTop = '8px';
        delBtn.addEventListener('click', () => {
            if (confirm('Eliminar este personaje?')) {
                deleteItem(item);
            }
        });
        card.appendChild(delBtn);

        cardsContainer.appendChild(card);

    });

}

// ==========================
// ELIMINAR
// ==========================

async function deleteItem(item) {
    try {
        await fetch(`/characters/${item.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        alert('No se pudo eliminar en el servidor');
        return;
    }
    currentData = currentData.filter(x => x.id !== item.id);
    applyFilters();
}

// ==========================
// EDITAR
// ==========================

function openEditModal(item) {
    editMode = true;
    editId = item.id;
    modalTitle.textContent = '✏️ Editar personaje';
    saveBtn.textContent = 'Guardar cambios';

    document.getElementById('itemName').value = item.name || '';
    document.getElementById('itemGender').value = item.gender || '';
    document.getElementById('itemHeight').value = item.height || '';
    document.getElementById('itemMass').value = item.mass || '';

    if (item.image) {
        itemImagePreview.src = item.image;
        itemImagePreview.style.display = 'block';
    } else {
        itemImagePreview.style.display = 'none';
        itemImagePreview.src = '';
    }

    addModal.style.display = 'flex';
}

async function applyEdit(id, fields) {
    try {
        const response = await fetch(`/characters/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify(fields)
        });
        if (!response.ok) throw new Error('Error al actualizar');
        const updated = await response.json();
        currentData = currentData.map(x => x.id === updated.id ? updated : x);
        applyFilters();
    } catch (e) {
        alert('No se pudo guardar el cambio en el servidor');
    }
    resetEditState();
}

function resetEditState() {
    editMode = false;
    editId = null;
    modalTitle.textContent = '➕ Agregar personaje';
    saveBtn.textContent = 'Guardar';
    addModal.style.display = 'none';
    addForm.reset();
    itemImagePreview.style.display = 'none';
    itemImagePreview.src = '';
}

// ==========================
// Interacciones del modal
// ==========================

addBtn.addEventListener('click', () => {
    editMode = false;
    modalTitle.textContent = '➕ Agregar personaje';
    saveBtn.textContent = 'Guardar';
    addForm.reset();
    itemImagePreview.style.display = 'none';
    itemImagePreview.src = '';
    addModal.style.display = 'flex';
});

cancelAdd.addEventListener('click', () => {
    resetEditState();
});

itemImageInput.addEventListener('change', () => {
    const file = itemImageInput.files && itemImageInput.files[0];
    if (!file) {
        itemImagePreview.style.display = 'none';
        itemImagePreview.src = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
        itemImagePreview.src = ev.target.result;
        itemImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

addForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    if (!name) return alert('Nombre requerido');

    const data = {
        name,
        gender: document.getElementById('itemGender').value || 'n/a',
        height: document.getElementById('itemHeight').value || 'n/a',
        mass: document.getElementById('itemMass').value || 'n/a',
    };

    const file = itemImageInput.files && itemImageInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = async function(ev) {
            data.image = ev.target.result;
            if (editMode) {
                await applyEdit(editId, data);
            } else {
                await finalizeSave(data);
            }
        };
        reader.readAsDataURL(file);
    } else {
        (async () => {
            if (editMode) {
                await applyEdit(editId, data);
            } else {
                await finalizeSave(data);
            }
        })();
    }

});

async function finalizeSave(data) {
    try {
        const response = await fetch('/characters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al guardar');
        const created = await response.json();
        currentData.unshift(created);
        applyFilters();
    } catch (e) {
        alert('No se pudo guardar en el servidor');
        return;
    }

    resetEditState();
}

// ==========================
// FILTROS
// ==========================

function renderFilters() {

    filtersContainer.innerHTML = "";

    let values = [...new Set(currentData.map(x => x.gender))];
    values.unshift("Todos");

    values.forEach(value => {

        const btn = document.createElement("button");
        btn.className = value === currentFilter ? "filter-btn active" : "filter-btn";
        btn.textContent = value;

        btn.addEventListener("click", () => {
            currentFilter = value;
            applyFilters();
            renderFilters();
        });

        filtersContainer.appendChild(btn);

    });
}

function applyFilters() {

    const text = document.getElementById("searchInput").value.toLowerCase();

    filteredData = currentData.filter(item => {
        const filterMatch = currentFilter === "Todos" || item.gender === currentFilter;
        const searchMatch = item.name.toLowerCase().includes(text);
        return filterMatch && searchMatch;
    });

    renderCards(filteredData);

}

// ==========================
// EVENTOS
// ==========================

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("retryBtn").addEventListener("click", fetchData);

// ==========================
// INICIO
// ==========================

fetchData();