import { useState, useCallback } from 'react';

export interface CategorySelection {
  category: string;
}

export interface ItemSelection {
  category: string;
  itemName: string;
}

export interface PropertySelection {
  category: string;
  itemName: string;
  property: string;
}

export interface DiceSelection {
  dice: 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  diceMultiplier: number;
}

export interface Uses {
  category?: CategorySelection[];
  itemName?: ItemSelection[];
  tag?: string[];
}

export interface Calculation {
  property: PropertySelection[];
  formula: string;
}

export interface Property {
  name: string;
  value: number | number[] | string | string[] | CategorySelection | CategorySelection[] | ItemSelection | ItemSelection[] | PropertySelection | PropertySelection[]| DiceSelection | DiceSelection[] | Uses | Calculation;
}

export interface Item {
  name: string;
  maxTier?: number;
  properties: Property[];
}

export interface Category {
  name: string;
  propertyKeys: string[];
  items: Item[];
  showProps?: boolean;
  minimized?: boolean;
}

export interface Windows {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  moved: boolean;
  static: boolean;
  isDraggable: boolean;
  isResizable: boolean;
}

export interface GameSystem {
  name: string;
  categories: Category[];
  tags: string[];
  sheet: Windows[];
}

const [activeGame, setActiveGame] = useState<GameSystem | null>(null);
// const [activeSheet, setActiveSheet] = useState< | null>(null);


const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.endsWith('.local');


export class DataManager {

  static async load<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load data from ${url}`);
    return response.json();
  }

  static async save<T>(url: string, data: T): Promise<boolean> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  }


  // static fetchActiveGame = useCallback(async () => {
  // try {
  //     const res = await fetch('/active-game');
  //     const data = await res.json();
  //     setActiveGame(data.game);
  // } catch (err) {
  //     console.error("Failed to fetch active game:", err);
  // }
  // }, []);

  // static fetchSystemData = useCallback(async (gameName: string) => {
  //   try {
  //     const res = await fetch(`/system?game=${gameName}`);
  //     const data = await res.json();
  //     setCategories(data.categories || []);
  //     setGlobalTags(data.globalTags || []);
  //     if (data.layout) setLayout(data.layout);
  //     if (data.defaultSheet) setSystemDefaultSheet(data.defaultSheet);
  //   } catch (err) {
  //     console.error("Failed to fetch system data:", err);
  //     // Fallback or keep current if server is down
  //   }
  // }, []);

  // static fetchCharacters = useCallback(async () => {
  //   if (!activeGame) return;
  //   try {
  //     const res = await fetch(`/game?game=${activeGame}`);
  //     const data = await res.json();
  //     setCharacters(data);
  //   } catch (err) {
  //     console.error("Failed to fetch characters:", err);
  //   }
  // }, [activeGame]);

  // static loadSheet = async (name: string) => {
  //   try {
  //     const res = await fetch(`/game/${name}?game=${activeGame}`);
  //     const data = await res.json();
  //     setActiveSheet(data);
  //     setView('character');
  //   } catch (err) {
  //     console.error(`Error loading sheet ${name}:`, err);
  //   }
  // };

  // static saveSheet = async () => {
  //   if (!activeSheet) return;

  //   try {
  //     const res = await fetch(`/game/${activeSheet.name}?game=${activeGame}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(activeSheet),
  //     });

  //     if (res.ok) alert("Saved to DM's computer!");
  //     else alert("Save failed.");
  //   } catch (err) {
  //     console.error("Error saving:", err);
  //   }
  // };

  static normalizeItem = useCallback((item: Partial<Item>, propertyKeys: string[]): Item => {
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

  static exportAll = async () => {
    const cleanCategories = categories.map(cat => ({
      ...cat,
      items: cat.items.map(it => normalizeItem(it, getCategoryKeys(cat)))
    }));
    const data = JSON.stringify({ categories: cleanCategories, globalTags, layout, defaultSheet: systemDefaultSheet }, null, 2);
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
        return fileName;
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
    return fileName;
  }

  static importFile(file: File): Promise<GameSystem & { name: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(reader.result as string);
          const name = file.name.replace('.json', '');
          
          if (obj.categories) {
            obj.categories = obj.categories.map((c: any) => ({ 
              ...c, 
              items: (c.items || []).map((it: any) => this.normalizeItem(it, getCategoryKeys(c))) 
            }));
          }
          resolve({ ...obj, name });
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}