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

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const filtersContainer = document.getElementById("filters");
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const cancelAdd = document.getElementById('cancelAdd');
const addForm = document.getElementById('addForm');


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
        currentData = currentData.filter(item => !isItemDeleted(item, entity));
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

// ==========================
// Interacciones del modal Agregar
// ==========================

if (addBtn) {
    addBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
    });
}

if (cancelAdd) {
    cancelAdd.addEventListener('click', () => {
        addModal.style.display = 'none';
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

        let item = { name, _local: true, _id: Date.now().toString() };

        if (cat === 'people') {
            item.gender = document.getElementById('itemGender').value || 'n/a';
            item.height = document.getElementById('itemHeight').value || 'n/a';
            item.mass = document.getElementById('itemMass').value || 'n/a';
        }

        if (cat === 'planets') {
            item.climate = document.getElementById('itemClimate').value || 'n/a';
            item.population = document.getElementById('itemPopulation').value || 'n/a';
            item.terrain = document.getElementById('itemTerrain').value || 'n/a';
        }

        if (cat === 'starships') {
            item.model = document.getElementById('itemModel').value || 'n/a';
            item.starship_class = document.getElementById('itemClass').value || 'n/a';
            item.max_atmosphering_speed = document.getElementById('itemSpeed').value || 'n/a';
        }

        // handle optional image file (async)
        const file = itemImageInput && itemImageInput.files && itemImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                item.image = ev.target.result; // base64 data URL
                finalizeSave(cat, item);
            };
            reader.readAsDataURL(file);
        } else {
            finalizeSave(cat, item);
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
