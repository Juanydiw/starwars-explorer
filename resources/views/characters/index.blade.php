<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Personajes - Star Wars</title>
    <link rel="stylesheet" href="{{ asset('css/starwars.css') }}">
    <style>
        input {
            padding: 10px;
            margin: 5px;
            border-radius: 8px;
            border: none;
            background: #1e1e1e;
            color: white;
        }
        .form-box {
            background: #151515;
            border: 1px solid #2e2e2e;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .btn-red {
            background: red;
            color: white;
            padding: 8px 15px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            margin-top: 10px;
        }
        .btn-logout {
            background: #333;
            color: white;
            padding: 8px 15px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            text-decoration: none;
        }
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
<div class="container">

    <div class="top-bar">
        <h1>⭐ Personajes Guardados ⭐</h1>
        <form action="{{ route('logout') }}" method="POST">
            @csrf
            <button type="submit" class="btn-logout">Cerrar sesión</button>
        </form>
    </div>

    <div class="form-box">
        <h3 style="color:#ffe81f; margin-bottom:15px">➕ Agregar personaje</h3>
        <form action="{{ route('characters.store') }}" method="POST">
            @csrf
            <input type="text" name="name" placeholder="Nombre" required>
            <input type="text" name="gender" placeholder="Género" required>
            <input type="text" name="height" placeholder="Altura (cm)" required>
            <input type="text" name="mass" placeholder="Peso (kg)" required>
            <button type="submit" class="tab-btn active" style="padding:10px 20px">Guardar</button>
        </form>
    </div>

    <div class="cards">
        @forelse($characters as $character)
        <div class="card">
            <h3>{{ $character->name }}</h3>
            <p><b>Género:</b> {{ $character->gender }}</p>
            <p><b>Altura:</b> {{ $character->height }} cm</p>
            <p><b>Peso:</b> {{ $character->mass }} kg</p>
            <form action="{{ route('characters.destroy', $character->id) }}" method="POST">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn-red">Eliminar</button>
            </form>
        </div>
        @empty
        <p style="color:#ddd">No hay personajes guardados todavía.</p>
        @endforelse
    </div>

    <div style="text-align:center; margin-top:30px">
        <a href="/starwars" class="tab-btn active" style="padding:12px 25px; text-decoration:none">← Volver al Explorer</a>
    </div>

</div>
</body>
</html>