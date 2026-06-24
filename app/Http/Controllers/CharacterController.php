<?php

namespace App\Http\Controllers;

use App\Models\Character;
use Illuminate\Http\Request;

class CharacterController extends Controller
{
    public function index()
    {
        $characters = Character::all();
        return view('characters.index', compact('characters'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required',
            'gender' => 'required',
            'height' => 'required',
            'mass'   => 'required',
        ]);

        Character::create([
            'name'   => $request->name,
            'gender' => $request->gender,
            'height' => $request->height,
            'mass'   => $request->mass,
        ]);

        return redirect()->route('characters.index');
    }

    public function destroy($id)
    {
        Character::findOrFail($id)->delete();
        return redirect()->route('characters.index');
    }
}