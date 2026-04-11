import './App.css';
import { CharacterSheet } from './types';
import { useEffect, useState, useCallback } from 'react';
//import characterData from './sheets/Sheet_0.json';
import Main from './pages/Main';
import Refactor, { 
  Category, 
  Item, 
  getPropertyType, 
  getDefaultValue, 
  ARRAY_TYPES, 
  NON_TIERED_PROPS,
  getCategoryKeys
} from './pages/Refactor';
import SheetMaker from './pages/SheetMaker';

type ViewMode = 'character' | 'system' | 'sheet';

function App() {
  const [characters, setCharacters] = useState<string[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [exportFileName, setExportFileName] = useState('categories');
  const [activeSheet, setActiveSheet] = useState<CharacterSheet | null>(null);
  const [view, setView] = useState<ViewMode>('character');

  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.endsWith('.local');

  const fetchActiveGame = useCallback(async () => {
    try {
      const res = await fetch('/active-game');
      const data = await res.json();
      setActiveGame(data.game);
    } catch (err) {
      console.error("Failed to fetch active game:", err);
    }
  }, []);

  const normalizeItem = useCallback((item: Partial<Item>, propertyKeys: string[]): Item => {
    const normalized: any = { id: item.id || Date.now() };
    const mTier = item.maxTier ?? 1;

    propertyKeys.forEach((key) => {
      const type = getPropertyType(key);
      const val = (item as any)[key];
      const isArrType = ARRAY_TYPES.includes(type);

      if (NON_TIERED_PROPS.includes(key)) {
        normalized[key] = val ?? getDefaultValue(type);
      } else if (mTier >= 2) {
        let arr: any[];
        if (Array.isArray(val)) {
          if (isArrType) {
            if (val.length > 0 && Array.isArray(val[0])) arr = [...val];
            else arr = [val];
          } else {
            arr = [...val];
          }
        } else {
          arr = [val ?? getDefaultValue(type)];
        }
        while (arr.length < mTier) arr.push(getDefaultValue(type));
        normalized[key] = arr.slice(0, mTier);
      } else {
        if (Array.isArray(val)) {
          if (isArrType) {
            normalized[key] = (val.length > 0 && Array.isArray(val[0])) ? val[0] : val;
          } else {
            normalized[key] = val[0];
          }
        } else {
          normalized[key] = val ?? getDefaultValue(type);
        }
      }
    });
    return normalized as Item;
  }, []);

  const fetchSystemData = useCallback(async (gameName: string) => {
    try {
      const res = await fetch(`/system?game=${gameName}`);
      const data = await res.json();
      setCategories(data.categories || []);
      setGlobalTags(data.globalTags || []);
    } catch (err) {
      console.error("Failed to fetch system data:", err);
      // Fallback or keep current if server is down
    }
  }, []);

  const fetchCharacters = useCallback(async () => {
    if (!activeGame) return;
    try {
      const res = await fetch(`/game?game=${activeGame}`);
      const data = await res.json();
      setCharacters(data);
    } catch (err) {
      console.error("Failed to fetch characters:", err);
    }
  }, [activeGame]);

  useEffect(() => {
    fetchActiveGame();

    // Poll for active game updates if not on localhost
    if (!isLocalhost) {
      const interval = setInterval(fetchActiveGame, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchActiveGame, isLocalhost]);

  useEffect(() => {
    fetchCharacters();
    if (activeGame) fetchSystemData(activeGame);
  }, [fetchCharacters, fetchSystemData, activeGame]);

  const loadSheet = async (name: string) => {
    try {
      const res = await fetch(`/game/${name}?game=${activeGame}`);
      const data = await res.json();
      setActiveSheet(data);
      setView('character');
    } catch (err) {
      console.error(`Error loading sheet ${name}:`, err);
    }
  };

  const saveSheet = async () => {
    if (!activeSheet) return;

    try {
      const res = await fetch(`/game/${activeSheet.personal.name}?game=${activeGame}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeSheet),
      });

      if (res.ok) alert("Saved to DM's computer!");
      else alert("Save failed.");
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const exportAll = async () => {
    const cleanCategories = categories.map(cat => ({
      ...cat,
      items: cat.items.map(it => normalizeItem(it, getCategoryKeys(cat)))
    }));
    const data = JSON.stringify({ categories: cleanCategories, globalTags }, null, 2);
    const fileName = exportFileName.trim() || 'categories';
    const suggestedName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    // Also notify the server that we are hosting this game now
    try {
      await fetch('/active-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: fileName }),
      });
      setActiveGame(fileName);
    } catch (e) { console.error("Could not sync active game to server", e); }

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File System Access API failed', err);
      }
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        const name = file.name.replace('.json', '');
        
        if (obj.categories) {
          setCategories(obj.categories.map((c: any) => ({ 
            ...c, 
            items: (c.items || []).map((it: any) => normalizeItem(it, getCategoryKeys(c))) 
          })));
        }
        if (obj.globalTags) setGlobalTags(obj.globalTags);
        
        setActiveGame(name);
        setExportFileName(name);
      } catch (err) { console.error('Import failed', err); }
    };
    reader.readAsText(file);
  };

    return (
    <div className="App">
      <nav className="Top-Nav">
        <button onClick={() => setView('character')} style={{ backgroundColor: view === 'character' ? 'rgba(0,255,0,0.2)' : 'transparent' }}>
          Character View
        </button>
        {isLocalhost && (
          <>
            <button onClick={() => setView('system')} style={{ backgroundColor: view === 'system' ? 'rgba(0,255,0,0.2)' : 'transparent' }}>System Maker</button>
            <button onClick={() => setView('sheet')} style={{ backgroundColor: view === 'sheet' ? 'rgba(0,255,0,0.2)' : 'transparent' }}>Sheet Maker</button>
          </>
        )}
        {isLocalhost && (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginLeft: '10px', borderLeft: '1px solid #444', paddingLeft: '10px' }}>
            <input 
              value={exportFileName} 
              onChange={(e) => setExportFileName(e.target.value)} 
              placeholder="Game name..."
              style={{ background: '#111', color: '#00ff00', border: '1px solid #00ff00', padding: '2px 5px', width: '120px' }}
            />
            <button onClick={exportAll} title="Save to File">💾</button>
            <input type="file" accept="application/json" onChange={importFile} style={{ display: 'none' }} id="nav-import" />
            <button onClick={() => document.getElementById('nav-import')?.click()} title="Load from File">📂</button>
          </div>
        )}
        {activeGame && !isLocalhost && <span style={{ color: '#00ff00', marginLeft: '10px', fontSize: '0.8em', opacity: 0.8 }}>HOSTING: {activeGame.toUpperCase()}</span>}
        {activeSheet && <span style={{ marginLeft: 'auto', color: '#00ff00', fontSize: '0.9em', opacity: 0.7 }}>CONNECTED: {activeSheet.personal.name.toUpperCase()}</span>}
      </nav>
      <main className="View-Container">
        {/* System Maker View */}
        <div style={{ display: view === 'system' ? 'block' : 'none', height: '100%' }}>
          <Refactor 
            characters={characters} 
            loadSheet={loadSheet} 
            categories={categories}
            setCategories={setCategories}
            globalTags={globalTags}
            setGlobalTags={setGlobalTags}
            normalizeItem={normalizeItem}
          />
        </div>

        {/* Sheet Maker View */}
        <div style={{ display: view === 'sheet' ? 'block' : 'none', height: '100%', padding: '20px' }}>
          <SheetMaker 
            activeSheet={activeSheet} 
            setActiveSheet={setActiveSheet} 
            saveSheet={saveSheet} 
            categories={categories}
            globalTags={globalTags}
          />
        </div>

        {/* Character View */}
        <div style={{ display: view === 'character' ? 'block' : 'none', height: '100%' }}>
          {!activeGame ? (
            <div style={{ padding: '20px' }}>
              <h1>Waiting for DM to host a game...</h1>
            </div>
          ) : activeSheet ? (
            <Main activeSheet={activeSheet} setActiveSheet={setActiveSheet} saveSheet={saveSheet} />
          ) : (
            <div style={{ padding: '20px' }}>
              <h1>Select Your Character ({activeGame})</h1>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {characters.map(name => (
                  <button key={name} onClick={() => loadSheet(name)} style={{ padding: '10px 20px' }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default App;