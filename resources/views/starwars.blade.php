<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Star Wars Explorer</title>
    <link rel="stylesheet" href="{{ asset('css/starwars.css') }}">
</head>
<body>

<div class="container">

    <h1>⭐ Star Wars Explorer ⭐</h1>

    <div class="controls">
        <button class="tab-btn active" data-type="people">Personajes</button>
        <button class="tab-btn" data-type="planets">Planetas</button>
        <button class="tab-btn" data-type="starships">Naves</button>
    </div>

    <div class="controls">
        <input type="text" id="searchInput" placeholder="Buscar en la galaxia...">
        <button id="addBtn" class="tab-btn add-btn" style="margin-left:12px">➕ Agregar</button>
    </div>

    <div id="filters" class="filter-container"></div>

    <div class="loader" id="loader">
        <div class="spinner"></div>
        <p>Cargando datos de la galaxia...</p>
    </div>

    <div id="errorBox" class="error-box">
        <h3>⚠ No pudimos contactar a la galaxia</h3>
        <p>La API de Star Wars no responde.</p>
        <button id="retryBtn">Reintentar</button>
    </div>

    <div id="cards" class="cards"></div>

    <!-- Modal Agregar -->
    <div id="addModal" class="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); align-items:center; justify-content:center;">
        <div class="modal-box" style="background:#0f0f0f; padding:20px; border-radius:12px; width:420px; max-height:80vh; overflow:auto; border:1px solid #2e2e2e;">
            <h3 id="modalTitle" style="color:#ffe81f; margin-bottom:10px">➕ Agregar ítem</h3>
            <form id="addForm">
                <label style="display:block; margin-bottom:6px">Categoría</label>
                <select id="itemCategory" style="width:100%; padding:8px; margin-bottom:10px; border-radius:8px; background:#1e1e1e; color:#fff; border:none">
                    <option value="people">Personaje</option>
                    <option value="planets">Planeta</option>
                    <option value="starships">Nave</option>
                </select>

                <input type="text" id="itemName" placeholder="Nombre" required style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />

                <label style="display:block; margin:8px 0 6px">Foto (opcional)</label>
                <input type="file" id="itemImage" accept="image/*" style="width:100%; padding:6px; margin-bottom:8px; background:#1e1e1e; color:#fff; border:none" />
                <img id="itemImagePreview" src="" alt="Preview" style="display:none; max-width:100%; max-height:240px; object-fit:cover; border-radius:8px; margin-bottom:8px;" />

                <div id="peopleFields">
                    <input type="text" id="itemGender" placeholder="Género" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemHeight" placeholder="Altura (cm)" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemMass" placeholder="Peso (kg)" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                </div>

                <div id="planetFields" style="display:none">
                    <input type="text" id="itemClimate" placeholder="Clima" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemPopulation" placeholder="Población" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemTerrain" placeholder="Terreno" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                </div>

                <div id="starshipFields" style="display:none">
                    <input type="text" id="itemModel" placeholder="Modelo" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemClass" placeholder="Clase" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                    <input type="text" id="itemSpeed" placeholder="Velocidad" style="width:100%; padding:8px; margin-bottom:8px; border-radius:8px; background:#1e1e1e; color:#fff; border:none" />
                </div>

                <div style="display:flex; gap:8px; justify-content:flex-end">
                    <button type="button" id="cancelAdd" class="tab-btn">Cancelar</button>
                    <button type="submit" class="tab-btn active" id="saveBtn">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <div class="pagination">
        <button id="prevBtn">Anterior</button>
        <button id="nextBtn">Siguiente</button>
    </div>

</div>

<script src="{{ asset('js/starwars.js') }}"></script>

</body>
</html>
