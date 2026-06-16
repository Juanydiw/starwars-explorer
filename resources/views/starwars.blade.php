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

    <div class="pagination">
        <button id="prevBtn">Anterior</button>
        <button id="nextBtn">Siguiente</button>
    </div>

</div>

<script src="{{ asset('js/starwars.js') }}"></script>

</body>
</html>
