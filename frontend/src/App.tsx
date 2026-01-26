import React from 'react';
import logo from './logo.svg';
import './App.css';
import { CharacterSheet, Special } from './types';
import { useEffect, useState } from 'react';
import * as Data from './data';

function App() {
  const [characters, setCharacters] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<CharacterSheet | null>(null);

  useEffect(() => {
    fetch('/api/sheets')
      .then(res => res.json())
      .then(data => setCharacters(data));
  }, []);

  const loadSheet = (name: string) => {
    fetch(`/api/sheets/${name}`)
      .then(res => res.json())
      .then(data => setActiveSheet(data));
    console.log('activeSheet', activeSheet);
  };

  const saveSheet = () => {
    if (!activeSheet) return;

    fetch(`/api/sheets/${activeSheet.name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activeSheet),
    })
      .then((res) => {
        if (res.ok) alert("Saved to DM's computer!");
        else alert("Save failed.");
      })
      .catch((err) => console.error("Error saving:", err));
  };

  if (activeSheet) {
    return (
      <div className="CharacterSheet">
        <div className="PersonalInfo">
          <input
            type="text"
            className="Name"
            value={activeSheet.name}
            onChange={(e) => {
              setActiveSheet({
                ...activeSheet,
                name: e.target.value
              });
            }} 
          />
          <select
            value={activeSheet.race}
            className="Race"
            onChange={(e) => {
              setActiveSheet({
                ...activeSheet,
                race: e.target.value
              });
            }}
          >
            {Data.RACES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            value={activeSheet.background}
            className="Background"
            onChange={(e) => {
              setActiveSheet({
                ...activeSheet,
                background: e.target.value
              });
            }}
          >
            {Data.BACKGROUNDS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input 
            type="number"
            className="Level"
            min={1}
            max={30}
            value={activeSheet.level} 
            onChange={(e) => {
              setActiveSheet({
                ...activeSheet,
                level: parseInt(e.target.value)
              });
            }} 
          />
          <button onClick={() => setActiveSheet(null)}>Back</button>
          <button onClick={saveSheet} style={{ backgroundColor: 'green', color: 'white' }}>
            Save Changes
          </button>
        </div>
        <div className="Skills"></div>
        <div className="Special">
          {(Object.entries(activeSheet.special) as [keyof Special, number][]).map(([key, value]) => {
            return (
              <div key={key} className="stat-box">
                {/* Uppercase the key (str -> STR) */}
                <label>{key.toUpperCase()}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => {
                    setActiveSheet({
                      ...activeSheet,
                      special: {
                        ...activeSheet.special,
                        [key]: parseInt(e.target.value)
                      }
                    });
                  }} 
                />
                {/* Bonus: Show the modifier */}
                <small>Mod: {Math.floor((value - 10) / 2)}</small>
              </div>
            );
          })}
        </div>
        <div className="ArmorAndStats"></div>
        <div className="Weapons"></div>
        <div className="CapsAndLoad"></div>
        <div className="TraitsAndPerks"></div>
        <div className="Notes"></div>
      </div>
    );
  }

  return (
    <div>
      <h1>Select Your Character</h1>
      {characters.map(name => (
        <button key={name} onClick={() => loadSheet(name)}>
          {name}
        </button>
      ))}
    </div>
  );
}

export default App;