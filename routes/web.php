<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CharacterController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return redirect('/characters');
})->middleware('auth')->name('dashboard');

Route::get('/starwars', function () {
    return view('starwars');
})->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/characters', [CharacterController::class, 'index'])->name('characters.index');
    Route::post('/characters', [CharacterController::class, 'store'])->name('characters.store');
    Route::delete('/characters/{id}', [CharacterController::class, 'destroy'])->name('characters.destroy');
});

require __DIR__.'/auth.php';