import './App.css';
import { useEffect, useState, useCallback, Dispatch, SetStateAction } from 'react';
import Refactor, {
  Category,
  Item,
  getPropertyType,
  getDefaultValue,
  ARRAY_TYPES,
  NON_TIERED_PROPS,
  getCategoryKeys
} from './pages/SystemMaker';
import CharacterViewer, { CharacterViewerNav } from './pages/CharacterViewer';
import SheetMaker from './pages/SheetMaker';
import {
  DataManager,
  CategorySelection,
  ItemSelection,
  PropertySelection,
  DiceSelection,
  Uses,
  Calculation,
  Property,
  CharacterSheet,
  GameSystem
} from './DataManager';

type ViewMode = 'character' | 'system' | 'sheet';

function App() {
  const dataManager = DataManager.getInstance();
  const [error, setError] = useState<string | null>(null);
  const [availableSystems, setAvailableSystems] = useState<GameSystem[]>([dataManager.getActiveSystem()]);

  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [systemDefaultSheet, setSystemDefaultSheet] = useState<CharacterSheet | null>(null);
  const [layout, setLayout] = useState<any>(() => {
    const saved = localStorage.getItem('user-character-sheet-layout');
    return saved ? JSON.parse(saved) : {
      lg: [
        { i: 'personal', x: 0, y: 0, w: 3, h: 6 },
        { i: 'special', x: 3, y: 0, w: 6, h: 7 },
        { i: 'skills', x: 0, y: 6, w: 3, h: 10 },
        { i: 'weapons', x: 9, y: 0, w: 3, h: 11 },
        { i: 'armor', x: 9, y: 11, w: 3, h: 9 },
        { i: 'vitals', x: 3, y: 7, w: 6, h: 9 },
        { i: 'traits', x: 0, y: 16, w: 3, h: 15 },
        { i: 'perks', x: 3, y: 16, w: 3, h: 15 },
        { i: 'notes', x: 6, y: 16, w: 3, h: 15 },
        { i: 'inventory', x: 9, y: 20, w: 3, h: 11 }
      ]
    };
  });
  const [activeSheet, setActiveSheet] = useState<CharacterSheet | null>(null);
  const [view, setView] = useState<ViewMode>('character');

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

  const createNewCharacter = () => {
    const name = prompt("Enter character name:");
    if (!name || name.trim() === "") return;

    // Use the system blueprint (defaultSheet) as the base template
    const blueprint = systemDefaultSheet || { personal: {} };
    const newSheet = JSON.parse(JSON.stringify(blueprint));

    // Initialize personal info and ensure it's distinct from the template
    // newSheet.name = { ...(newSheet.name || {}), name: name.trim() };
    newSheet.name = name.trim();

    // Ensure all categories defined in the current layout exist as keys 
    // so they render properly in the Character View (Main)
    if (layout?.lg) {
      layout.lg.forEach((l: any) => {
        if (newSheet[l.i] === undefined) newSheet[l.i] = {};
      });
    }

    setActiveSheet(newSheet as CharacterSheet);
    setView('character');
  };

  const loadDefaultSheet = useCallback(() => {
    const defaultSheet: any = {
      personal: { name: 'Default Character' },
      special: { strength: 5, perception: 5, endurance: 5, charisma: 5, intelligence: 5, agility: 5, luck: 5 },
      skills: {},
      inventory: {}
    };
    setSystemDefaultSheet(defaultSheet as CharacterSheet);
  }, []);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const chars = await dataManager.getCharactersForCurrentSystem();
        setCharacters(chars);
      } catch (err) {
        console.error('Error loading characters:', err);
      }
    };
    loadCharacters();
  }, []);

  const lockGrid = useCallback(() => {
    if (!layout) return;
    const updatedLayouts = { ...layout };
    Object.keys(updatedLayouts).forEach((breakpoint) => {
      const key = breakpoint as keyof typeof updatedLayouts;
      const currentLayout = updatedLayouts[key];
      if (currentLayout) {
        updatedLayouts[key] = currentLayout!.map((item: any) => ({
          ...item,
          isDraggable: !item.isDraggable,
          isResizable: !item.isDraggable,
        }));
      }
    });
    setLayout(updatedLayouts);
  }, [layout]);

  const loadSheet = async (character: any) => {
    try {
      setActiveSheet(character);
      setView('character');
    } catch (err) {
      console.error(`Error loading sheet:`, err);
    }
  };

  const saveSheet = async () => {
    if (!activeSheet) return;

    try {
      await dataManager.saveCharacter(activeSheet);
      alert("Saved to DM's computer!");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Save failed.");
    }
  };

  return (
    <div className="App">
      <nav className="Top-Nav">
        {dataManager.isLocalhost() && (
          <>
            <button className={`button${view === 'system' ? ' active' : ''}`} onClick={() => setView('system')}>System Maker</button>
            <button className={`button${view === 'sheet' ? ' active' : ''}`} onClick={() => setView('sheet')}>Sheet Maker</button>
            <button className={`button${view === 'character' ? ' active' : ''}`} onClick={() => setView('character')}>Character View</button>
            {view === 'character' && activeSheet && <CharacterViewerNav/>}
            <select className="system-input" value={dataManager.getActiveSystem().name} onChange={(e) => {
              const selected = availableSystems.find(sys => sys.name === e.target.value);
              if (selected) {
                dataManager.setActiveSystem(selected);
              }
            }}>
              {availableSystems.map(sys => (
                <option key={sys.name} value={JSON.stringify(sys)}>{sys.name}</option>
              ))}
            </select>
            <button className="button small" onClick={async () => {await dataManager.saveSystem();}} title="Save All">💾</button>
            <button className="button small" onClick={async () => {setAvailableSystems((await dataManager.getAllSystems()).concat(dataManager.getMockSystem()));}} title="Load Systems">📂</button>
          </>
        )}
        {error && <span className="status-error">ERROR: {error}</span>}
      </nav>
      <main className="View-Container">
        {/* System Maker View */}
        <div className={`page-panel${view === 'system' ? '' : ' hidden'}`}>
          <Refactor 
            characters={characters} 
            loadSheet={loadSheet} 
            categories={categories}
            setCategories={setCategories}
            globalTags={globalTags}
            setGlobalTags={setGlobalTags}
            normalizeItem={normalizeItem}
            lockGrid={lockGrid}
            loadDefaultSheet={loadDefaultSheet}
          />
        </div>

        {/* Sheet Maker View */}
        <div className={`page-panel page-panel padded${view === 'sheet' ? '' : ' hidden'}`}>
          <SheetMaker/>
        </div>

        {/* Character View */}
        <div className={`page-panel${view === 'character' ? '' : ' hidden'}`}>
          {activeSheet ? (
            <CharacterViewer/>
          ) : (
            <div className="page-content">
              <h1>Select Your Character ({dataManager.getActiveSystem().name})</h1>
              <div className="grid-row">
                {characters.map(char => (
                  <button key={char.name} className="char-button" onClick={() => loadSheet(char)}>
                    {char.name}
                  </button>
                ))}
                <button onClick={createNewCharacter} className="char-button new">
                  + NEW CHARACTER
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default App;