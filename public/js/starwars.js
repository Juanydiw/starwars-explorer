const BASE_URLS = [
    "https://swapi.py4e.com/api",
    "https://swapi.dev/api"
];
let activeBaseUrl = BASE_URLS[0];

let currentEntity = "people";
let currentPage = 1;
let currentData = [];
let filteredData = [];
let currentFilter = "Todos";

const cardsContainer = document.getElementById("cards");

function getItemId(item, entity) {
    if (item._id) return item._id;
    if (item.url) return item.url;
    return `${entity}-${item.name}`;
}

function loadDeletedItems(entity) {
    try {
        const raw = localStorage.getItem('custom_sw_deleted');
        if (!raw) return [];
        const obj = JSON.parse(raw);
        return obj[entity] || [];
    } catch (e) {
        return [];
    }
}

function saveDeletedItem(entity, id) {
    const raw = localStorage.getItem('custom_sw_deleted');
    let obj = {};
    if (raw) {
        try { obj = JSON.parse(raw); } catch (e) { obj = {}; }
    }
    if (!obj[entity]) obj[entity] = [];
    if (!obj[entity].includes(id)) obj[entity].push(id);
    localStorage.setItem('custom_sw_deleted', JSON.stringify(obj));
}

function isItemDeleted(item, entity) {
    const id = getItemId(item, entity);
    return loadDeletedItems(entity).includes(id);
}

// overrides for edited API items
function loadOverrides(entity) {
    try {
        const raw = localStorage.getItem('custom_sw_overrides');
        if (!raw) return {};
        const obj = JSON.parse(raw);
        return obj[entity] || {};
    } catch (e) {
        return {};
    }
}

function saveOverride(entity, id, data) {
    const raw = localStorage.getItem('custom_sw_overrides');
    let obj = {};
    if (raw) {
        try { obj = JSON.parse(raw); } catch (e) { obj = {}; }
    }
    if (!obj[entity]) obj[entity] = {};
    obj[entity][id] = data;
    localStorage.setItem('custom_sw_overrides', JSON.stringify(obj));
}

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const filtersContainer = document.getElementById("filters");
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const cancelAdd = document.getElementById('cancelAdd');
const addForm = document.getElementById('addForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');

let editMode = false;
let editEntity = null;
let editId = null;


// ==========================
// UTILIDADES
// ==========================

function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

function showError() {
    errorBox.style.display = "block";
}

function hideError() {
    errorBox.style.display = "none";
}


// ==========================
// API
// ==========================

async function fetchData(entity, page, triedUrls = []) {

    showLoader();
    hideError();

    try {

        const response = await fetch(
            `${activeBaseUrl}/${entity}/?page=${page}`
        );

        if (!response.ok) {
            throw new Error("Error API");
        }

        const data = await response.json();

        currentData = data.results.map(item => ({ ...item, _id: getItemId(item, entity) }));
        filteredData = [...currentData];

        // cargar items locales para esta entidad
        const local = loadLocalItems(entity);
        currentData = [...local, ...currentData];
        // aplicar overrides y filtrado por eliminados
        const overrides = loadOverrides(entity);
        currentData = currentData.map(item => {
            const id = getItemId(item, entity);
            if (overrides[id]) {
                return { ...item, ...overrides[id], _overridden: true };
            }
            return item;
        }).filter(item => !isItemDeleted(item, entity));
        filteredData = [...currentData];

        renderFilters();
        renderCards(filteredData);
        updatePagination(data);

    } catch (error) {

        // Si la API falla, intentar con el host alternativo.
        const alternateUrl = BASE_URLS.find(url => url !== activeBaseUrl && !triedUrls.includes(url));
        if (alternateUrl) {
            activeBaseUrl = alternateUrl;
            return fetchData(entity, page, [...triedUrls, activeBaseUrl]);
        }

        // Si la API falla con ambos hosts, intentar cargar ítems locales y mostrarlos.
        const local = loadLocalItems(entity);
        if (local.length > 0) {
            currentData = [...local];
            filteredData = [...currentData];
            renderFilters();
            renderCards(filteredData);
            hideError();
        } else {
            showError();
        }

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

        // show image if present
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginBottom = '8px';
            card.appendChild(img);
        }

        if (currentEntity === "people") {
            const h = document.createElement('h3'); h.textContent = item.name; card.appendChild(h);
            const p1 = document.createElement('p'); p1.innerHTML = `<b>Género:</b> ${item.gender}`; card.appendChild(p1);
            const p2 = document.createElement('p'); p2.innerHTML = `<b>Altura:</b> ${item.height} cm`; card.appendChild(p2);
            const p3 = document.createElement('p'); p3.innerHTML = `<b>Peso:</b> ${item.mass} kg`; card.appendChild(p3);
        } else if (currentEntity === "planets") {
            const h = document.createElement('h3'); h.textContent = item.name; card.appendChild(h);
            const p1 = document.createElement('p'); p1.innerHTML = `<b>Clima:</b> ${item.climate}`; card.appendChild(p1);
            const p2 = document.createElement('p'); p2.innerHTML = `<b>Población:</b> ${item.population}`; card.appendChild(p2);
            const p3 = document.createElement('p'); p3.innerHTML = `<b>Terreno:</b> ${item.terrain}`; card.appendChild(p3);
        } else {
            const h = document.createElement('h3'); h.textContent = item.name; card.appendChild(h);
            const p1 = document.createElement('p'); p1.innerHTML = `<b>Modelo:</b> ${item.model}`; card.appendChild(p1);
            const p2 = document.createElement('p'); p2.innerHTML = `<b>Clase:</b> ${item.starship_class}`; card.appendChild(p2);
            const p3 = document.createElement('p'); p3.innerHTML = `<b>Velocidad:</b> ${item.max_atmosphering_speed}`; card.appendChild(p3);
        }

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'tab-btn';
        editBtn.style.marginTop = '8px';
        editBtn.style.marginRight = '8px';
        editBtn.addEventListener('click', () => {
            openEditModal(item, currentEntity);
        });
        card.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.className = 'btn-red';
        delBtn.style.marginTop = '8px';
        delBtn.addEventListener('click', () => {
            if (confirm('Eliminar este ítem?')) {
                deleteItem(currentEntity, item);
            }
        });
        card.appendChild(delBtn);

        cardsContainer.appendChild(card);

    });

}


// ==========================
// LOCAL STORAGE: guardar ítems creados por el usuario
// ==========================

function loadLocalItems(entity) {
    try {
        const raw = localStorage.getItem('custom_sw_items');
        if (!raw) return [];
        const obj = JSON.parse(raw);
        return (obj[entity] || []).map(item => ({ ...item, _id: getItemId(item, entity), _local: true }));
    } catch (e) {
        return [];
    }
}

function saveLocalItem(entity, item) {
    const raw = localStorage.getItem('custom_sw_items');
    let obj = {};
    if (raw) {
        try { obj = JSON.parse(raw); } catch (e) { obj = {}; }
    }
    if (!obj[entity]) obj[entity] = [];
    obj[entity].unshift(item);
    localStorage.setItem('custom_sw_items', JSON.stringify(obj));
}

function deleteItem(entity, item) {
    const id = getItemId(item, entity);
    if (item._local) {
        const raw = localStorage.getItem('custom_sw_items');
        if (raw) {
            let obj = {};
            try { obj = JSON.parse(raw); } catch (e) { obj = {}; }
            if (obj[entity]) {
                obj[entity] = obj[entity].filter(x => getItemId(x, entity) !== id);
                localStorage.setItem('custom_sw_items', JSON.stringify(obj));
            }
        }
    } else {
        saveDeletedItem(entity, id);
    }

    currentData = currentData.filter(x => getItemId(x, entity) !== id);
    applyFilters();
}

// Global edit helpers (available outside form block)
function openEditModal(item, entity) {
    editMode = true;
    editEntity = entity;
    editId = getItemId(item, entity);
    if (modalTitle) modalTitle.textContent = '✏️ Editar ítem';
    if (saveBtn) saveBtn.textContent = 'Guardar cambios';

    // set category select
    if (itemCategory) {
        itemCategory.value = entity;
        itemCategory.dispatchEvent(new Event('change'));
    }

    if (document.getElementById('itemName')) document.getElementById('itemName').value = item.name || '';
    if (entity === 'people') {
        if (document.getElementById('itemGender')) document.getElementById('itemGender').value = item.gender || '';
        if (document.getElementById('itemHeight')) document.getElementById('itemHeight').value = item.height || '';
        if (document.getElementById('itemMass')) document.getElementById('itemMass').value = item.mass || '';
    }
    if (entity === 'planets') {
        if (document.getElementById('itemClimate')) document.getElementById('itemClimate').value = item.climate || '';
        if (document.getElementById('itemPopulation')) document.getElementById('itemPopulation').value = item.population || '';
        if (document.getElementById('itemTerrain')) document.getElementById('itemTerrain').value = item.terrain || '';
    }
    if (entity === 'starships') {
        if (document.getElementById('itemModel')) document.getElementById('itemModel').value = item.model || '';
        if (document.getElementById('itemClass')) document.getElementById('itemClass').value = item.starship_class || '';
        if (document.getElementById('itemSpeed')) document.getElementById('itemSpeed').value = item.max_atmosphering_speed || '';
    }

    const itemImagePreview = document.getElementById('itemImagePreview');
    if (itemImagePreview) {
        if (item.image) {
            itemImagePreview.src = item.image;
            itemImagePreview.style.display = 'block';
        } else {
            itemImagePreview.style.display = 'none';
            itemImagePreview.src = '';
        }
    }

    if (addModal) addModal.style.display = 'flex';
}

function applyEdit(entity, id, fields) {
    // update local item if present
    const localRaw = localStorage.getItem('custom_sw_items');
    if (localRaw) {
        try {
            const obj = JSON.parse(localRaw);
            if (obj[entity]) {
                const idx = obj[entity].findIndex(x => getItemId(x, entity) === id);
                if (idx !== -1) {
                    obj[entity][idx] = { ...obj[entity][idx], ...fields };
                    localStorage.setItem('custom_sw_items', JSON.stringify(obj));
                    // update currentData
                    currentData = currentData.map(x => getItemId(x, entity) === id ? { ...x, ...fields } : x);
                    applyFilters();
                    resetEditState();
                    return;
                }
            }
        } catch (e) {}
    }

    // otherwise save as override for API items
    saveOverride(entity, id, fields);
    currentData = currentData.map(x => getItemId(x, entity) === id ? { ...x, ...fields, _overridden: true } : x);
    applyFilters();
    resetEditState();
}

function resetEditState() {
    editMode = false;
    editEntity = null;
    editId = null;
    if (modalTitle) modalTitle.textContent = '➕ Agregar ítem';
    if (saveBtn) saveBtn.textContent = 'Guardar';
    if (addModal) addModal.style.display = 'none';
    if (addForm) addForm.reset();
    const itemImagePreview = document.getElementById('itemImagePreview');
    if (itemImagePreview) { itemImagePreview.style.display = 'none'; itemImagePreview.src = ''; }
    if (itemCategory) itemCategory.dispatchEvent(new Event('change'));
}

// ==========================
// Interacciones del modal Agregar
// ==========================

if (addBtn) {
    addBtn.addEventListener('click', () => {
        // prepare modal for adding a new item
        editMode = false;
        modalTitle.textContent = '➕ Agregar ítem';
        saveBtn.textContent = 'Guardar';
        addForm.reset();
        const itemImagePreview = document.getElementById('itemImagePreview');
        if (itemImagePreview) { itemImagePreview.style.display = 'none'; itemImagePreview.src = ''; }
        itemCategory.value = 'people';
        itemCategory.dispatchEvent(new Event('change'));
        addModal.style.display = 'flex';
    });
}

if (cancelAdd) {
    cancelAdd.addEventListener('click', () => {
        resetEditState();
    });
}

// alternar campos según categoría
const itemCategory = document.getElementById('itemCategory');
if (itemCategory) {
    itemCategory.addEventListener('change', () => {
        const cat = itemCategory.value;
        document.getElementById('peopleFields').style.display = cat === 'people' ? 'block' : 'none';
        document.getElementById('planetFields').style.display = cat === 'planets' ? 'block' : 'none';
        document.getElementById('starshipFields').style.display = cat === 'starships' ? 'block' : 'none';
    });
}

if (addForm) {
    // handle image preview
    const itemImageInput = document.getElementById('itemImage');
    const itemImagePreview = document.getElementById('itemImagePreview');
    if (itemImageInput) {
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
    }

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = itemCategory.value;
        const name = document.getElementById('itemName').value.trim();

        if (!name) return alert('Nombre requerido');

        // collect form fields into an object
        const data = { name };

        if (cat === 'people') {
            data.gender = document.getElementById('itemGender').value || 'n/a';
            data.height = document.getElementById('itemHeight').value || 'n/a';
            data.mass = document.getElementById('itemMass').value || 'n/a';
        }

        if (cat === 'planets') {
            data.climate = document.getElementById('itemClimate').value || 'n/a';
            data.population = document.getElementById('itemPopulation').value || 'n/a';
            data.terrain = document.getElementById('itemTerrain').value || 'n/a';
        }

        if (cat === 'starships') {
            data.model = document.getElementById('itemModel').value || 'n/a';
            data.starship_class = document.getElementById('itemClass').value || 'n/a';
            data.max_atmosphering_speed = document.getElementById('itemSpeed').value || 'n/a';
        }

        // handle optional image file (async)
        const file = itemImageInput && itemImageInput.files && itemImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                data.image = ev.target.result; // base64 data URL
                if (editMode) {
                    applyEdit(editEntity || cat, editId, data);
                } else {
                    const item = { ...data, _local: true, _id: Date.now().toString() };
                    finalizeSave(cat, item);
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (editMode) {
                applyEdit(editEntity || cat, editId, data);
            } else {
                const item = { ...data, _local: true, _id: Date.now().toString() };
                finalizeSave(cat, item);
            }
        }

    });

    
}

function finalizeSave(cat, item) {
    saveLocalItem(cat, item);

    if (currentEntity === cat) {
        currentData.unshift(item);
        applyFilters();
    }

    addModal.style.display = 'none';
    addForm.reset();
    const itemImagePreview = document.getElementById('itemImagePreview');
    if (itemImagePreview) { itemImagePreview.style.display = 'none'; itemImagePreview.src = ''; }
    itemCategory.dispatchEvent(new Event('change'));
}


// ==========================
// FILTROS
// ==========================

function renderFilters() {

    filtersContainer.innerHTML = "";

    let values = [];

    if (currentEntity === "people") {
        values = [...new Set(currentData.map(x => x.gender))];
    }

    if (currentEntity === "planets") {
        values = [...new Set(currentData.map(x => x.climate))];
    }

    if (currentEntity === "starships") {
        values = [...new Set(currentData.map(x => x.starship_class))];
    }

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

        let filterMatch = true;

        if (currentFilter !== "Todos") {
            if (currentEntity === "people")
                filterMatch = item.gender === currentFilter;

            if (currentEntity === "planets")
                filterMatch = item.climate === currentFilter;

            if (currentEntity === "starships")
                filterMatch = item.starship_class === currentFilter;
        }

        const searchMatch = item.name.toLowerCase().includes(text);

        return filterMatch && searchMatch;

    });

    renderCards(filteredData);

}


// ==========================
// PAGINACION
// ==========================

function updatePagination(data) {
    document.getElementById("prevBtn").disabled = !data.previous;
    document.getElementById("nextBtn").disabled = !data.next;
}

function nextPage() {
    currentPage++;
    fetchData(currentEntity, currentPage);
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchData(currentEntity, currentPage);
    }
}


// ==========================
// EVENTOS
// ==========================

document.querySelectorAll(".tab-btn[data-type]").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn[data-type]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentEntity = btn.dataset.type;
        currentPage = 1;
        currentFilter = "Todos";

        document.getElementById("searchInput").value = "";

        fetchData(currentEntity, currentPage);

    });
});

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("nextBtn").addEventListener("click", nextPage);
document.getElementById("prevBtn").addEventListener("click", prevPage);
document.getElementById("retryBtn").addEventListener("click", () => {
    fetchData(currentEntity, currentPage);
});


// ==========================
// INICIO
// ==========================

fetchData(currentEntity, currentPage);
