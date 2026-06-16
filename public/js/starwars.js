const BASE_URL = "https://swapi.py4e.com/api";

let currentEntity = "people";
let currentPage = 1;
let currentData = [];
let filteredData = [];
let currentFilter = "Todos";

const cardsContainer = document.getElementById("cards");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const filtersContainer = document.getElementById("filters");


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

async function fetchData(entity, page) {

    showLoader();
    hideError();

    try {

        const response = await fetch(
            `${BASE_URL}/${entity}/?page=${page}`
        );

        if (!response.ok) {
            throw new Error("Error API");
        }

        const data = await response.json();

        currentData = data.results;
        filteredData = [...currentData];

        renderFilters();
        renderCards(filteredData);
        updatePagination(data);

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

        if (currentEntity === "people") {
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p><b>Género:</b> ${item.gender}</p>
                <p><b>Altura:</b> ${item.height} cm</p>
                <p><b>Peso:</b> ${item.mass} kg</p>
            `;
        } else if (currentEntity === "planets") {
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p><b>Clima:</b> ${item.climate}</p>
                <p><b>Población:</b> ${item.population}</p>
                <p><b>Terreno:</b> ${item.terrain}</p>
            `;
        } else {
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p><b>Modelo:</b> ${item.model}</p>
                <p><b>Clase:</b> ${item.starship_class}</p>
                <p><b>Velocidad:</b> ${item.max_atmosphering_speed}</p>
            `;
        }

        cardsContainer.appendChild(card);

    });

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

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
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
