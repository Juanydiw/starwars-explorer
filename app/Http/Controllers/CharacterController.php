<?php

namespace App\Http\Controllers;

use App\Models\Character;
use Illuminate\Http\Request;

class CharacterController extends Controller
{
    public function index()
    {
        return response()->json(Character::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'gender' => 'nullable|string|max:255',
            'height' => 'nullable|string|max:255',
            'mass'   => 'nullable|string|max:255',
            'image'  => 'nullable|string',
        ]);

        $character = Character::create($validated);

        return response()->json($character, 201);
    }

    public function update(Request $request, $id)
    {
        $character = Character::findOrFail($id);

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'gender' => 'nullable|string|max:255',
            'height' => 'nullable|string|max:255',
            'mass'   => 'nullable|string|max:255',
            'image'  => 'nullable|string',
        ]);

        $character->update($validated);

        return response()->json($character);
    }

    public function destroy($id)
    {
        Character::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}