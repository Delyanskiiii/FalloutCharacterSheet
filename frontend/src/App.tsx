import './App.css';
import { CharacterSheet } from './types';
import { useEffect, useState } from 'react';
import characterData from './sheets/Sheet_0.json';
import Main from './pages/Main';
import Menu from './pages/Menu';

function App() {
  const [characters, setCharacters] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<CharacterSheet | null>(characterData);

  useEffect(() => {
    // fetch('/api/sheets')
    //   .then(res => res.json())
    //   .then(data => setCharacters(data));
  }, []);

  const loadSheet = (name: string) => {
    fetch(`/api/sheets/${name}`)
      .then(res => res.json())
      .then(data => setActiveSheet(data));
    console.log('activeSheet', activeSheet);
  };

  const saveSheet = () => {
    if (!activeSheet) return;

    fetch(`/api/sheets/${activeSheet.personal.name}`, {
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
      <Main activeSheet={activeSheet} setActiveSheet={setActiveSheet} saveSheet={saveSheet} />
    );
  } else {
    return (
      <Menu characters={characters} loadSheet={loadSheet} />
    );
  }
}
export default App;