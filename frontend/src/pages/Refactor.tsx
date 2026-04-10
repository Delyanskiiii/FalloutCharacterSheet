import React, { useState, useEffect, useCallback } from 'react';

// --- Types & Constants ---

type PropertyType = 'string' | 'number' | 'stringArray' | 'numberArray' | 'requirements' | 'affection' | 'damageInterface' | 'rangeConfig' | 'uses' | 'json';

export interface Requirement {
  category: string;
  itemName: string;
  property: string;
  affection: string;
  value: any;
}

export interface Affection {
  category: string;
  itemName: string;
  property: string;
  affection: string;
  value: any;
}

export interface Uses {
  type: 'item' | 'tag' | 'category';
  category?: string;
  itemName?: string;
  tag?: string;
}

export interface damageInterface {
  extraDice: string;
  diceMultiplier: number;
}

export interface Item {
  id: number;
  name: string;
  maxTier?: number;
  maxRepeats?: number;
  description?: string;
  requirements?: Requirement[];
  tags?: string[];
  affects?: Affection[];
  stat?: number;
  statFormula?: Affection[];
  uses?: Uses[];
  priceCost?: number;
  useCost?: number;
  weight?: number;
  repairDifficultyCheck?: number;
  repairTime?: number;
  maxUpgrades?: number;
  upgradeDifficultyCheck?: number;
  upgradeTime?: number;
  damage?: damageInterface[];
  criticalHitMultiplier?: number;
  criticalHit?: damageInterface[];
  reload?: number;
  range?: string | { type: 'Melee' } | { type: 'Ranged', normal: number, disadvantage: number };
  equipTime?: number;
  defencePoints?: number;
  damageThreshold?: number;
  armorClass?: number;
  loadWorn?: number;
  duration?: number;
  APtoUse?: number;
}

interface Category {
  name: string;
  items: Item[];
  propertyKeys: string[];
  showProps?: boolean;
  minimized?: boolean;
}

export const PROPERTY_CONFIG: Record<string, PropertyType> = {
  name: 'string',
  maxTier: 'number',
  maxRepeats: 'number',
  description: 'string',
  requirements: 'requirements',
  tags: 'stringArray',
  affects: 'affection',
  stat: 'number',
  statFormula: 'affection',
  uses: 'uses',
  priceCost: 'number',
  useCost: 'number',
  weight: 'number',
  repairDifficultyCheck: 'number',
  repairTime: 'number',
  maxUpgrades: 'number',
  upgradeDifficultyCheck: 'number',
  upgradeTime: 'number',
  damage: 'damageInterface',
  criticalHitMultiplier: 'number',
  criticalHit: 'damageInterface',
  reload: 'number',
  range: 'string',
  equipTime: 'number',
  defencePoints: 'number',
  damageThreshold: 'number',
  armorClass: 'number',
  loadWorn: 'number',
  duration: 'number',
  APtoUse: 'number',
};

export const ITEM_PROPERTY_OPTIONS = Object.keys(PROPERTY_CONFIG);
const DICE_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export const NON_TIERED_PROPS = ['id', 'name', 'maxTier'];
const ARRAY_TYPES: PropertyType[] = ['stringArray', 'numberArray', 'requirements', 'affection', 'uses', 'damageInterface'];

// --- Helper Logic ---

export const getPropertyType = (prop: string): PropertyType => PROPERTY_CONFIG[prop] || 'string';

export const getDefaultValue = (type: PropertyType) => {
  switch (type) {
    case 'number': return 0;
    case 'stringArray':
    case 'numberArray':
    case 'requirements':
    case 'affection':
    case 'rangeConfig':
    case 'uses':
    case 'damageInterface': return [];
    default: return '';
  }
};

const getCategoryKeys = (cat: Category) => (cat.propertyKeys?.length > 0 ? cat.propertyKeys : ['name']);

// --- Sub-Components ---

const TagManager = ({ tags, onTagsChange }: { tags: string[], onTagsChange: (tags: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #aaa', borderRadius: '4px', background: '#fcfcfc' }}>
      <h3 style={{ marginTop: 0 }}>Global Tag Manager</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter tag name..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1, padding: '5px' }}
        />
        <button onClick={handleAdd}>Add Tag</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {tags.map((tag) => (
          <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#e0e0e0', borderRadius: '16px', fontSize: '14px' }}>
            {tag}
            <button onClick={() => onTagsChange(tags.filter((t) => t !== tag))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#666', padding: '0 2px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

function ObjectArrayEditor({ type, value, onChange, categories = [], globalTags = [] }: { type: PropertyType, value: any[], onChange: (val: any[]) => void, categories?: Category[], globalTags?: string[] }) {
  const addItem = (customDefault?: any) => {
    if (customDefault) {
      onChange([...value, customDefault]);
      return;
    }
    const defaults: Record<string, any> = {
      requirements: { category: '', itemName: '', property: 'name', affection: 'equal', value: '' },
      affection: { category: '', itemName: '', property: 'name', affection: 'plus', value: '' },
      uses: { type: 'tag', tag: '' },
      damageInterface: { extraDice: 'd4', diceMultiplier: 1 }
    };
    onChange([...value, defaults[type] || {}]);
  };

  const updateEntry = (idx: number, field: string, val: any) => {
    const next = [...value];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };

  return (
    <div style={{ paddingLeft: '10px', borderLeft: '2px solid #eee' }}>
      {value.map((obj, i) => (
        <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
          {type === 'requirements' && (
            <>
              <select value={obj.category} onChange={e => {
                const next = [...value];
                next[i] = { ...obj, category: e.target.value, itemName: '', property: '' };
                onChange(next);
              }}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              
              <select value={obj.itemName} onChange={e => {
                const next = [...value];
                next[i] = { ...obj, itemName: e.target.value, property: '' };
                onChange(next);
              }}>
                <option value="">Select Item</option>
                {obj.category && <option value="any">Any Item</option>}
                {obj.category && categories.find(c => c.name === obj.category)?.items.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>

              <select value={obj.property} onChange={e => updateEntry(i, 'property', e.target.value)}>
                <option value="">Select Property</option>
                {obj.category && categories.find(c => c.name === obj.category)?.propertyKeys.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>

              <select value={obj.affection} onChange={e => updateEntry(i, 'affection', e.target.value)}>
                {['equal', 'less', 'more'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <PropertyField 
                  propKey={obj.property} 
                  value={obj.value} 
                  onChange={val => updateEntry(i, 'value', val)} 
                  globalTags={globalTags}
                  categories={categories}
                />
              </div>
            </>
          )}
          {type === 'affection' && (
            <>
              <select value={obj.category} onChange={e => {
                const next = [...value];
                next[i] = { ...obj, category: e.target.value, itemName: '', property: '' };
                onChange(next);
              }}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              
              <select value={obj.itemName} onChange={e => {
                const next = [...value];
                next[i] = { ...obj, itemName: e.target.value, property: '' };
                onChange(next);
              }}>
                <option value="">Select Item</option>
                {obj.category && <option value="any">Any Item</option>}
                {obj.category && categories.find(c => c.name === obj.category)?.items.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>

              <select value={obj.property} onChange={e => updateEntry(i, 'property', e.target.value)}>
                <option value="">Select Property</option>
                {obj.category && categories.find(c => c.name === obj.category)?.propertyKeys.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>

              <select value={obj.affection} onChange={e => updateEntry(i, 'affection', e.target.value)}>
                {['replace', 'minus', 'plus', 'divide', 'multiply'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <PropertyField 
                  propKey={obj.property} 
                  value={obj.value} 
                  onChange={val => updateEntry(i, 'value', val)} 
                  globalTags={globalTags}
                  categories={categories}
                />
              </div>
            </>
          )}
          {type === 'uses' && (
            <>
              <span style={{ fontSize: '0.8em', minWidth: '35px' }}>
                {obj.type === 'tag' ? 'Tag:' : 'Item:'}
              </span>
              {obj.type === 'tag' ? (
                <select value={obj.tag || ''} onChange={e => updateEntry(i, 'tag', e.target.value)}>
                  <option value="">Select Tag</option>
                  {globalTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              ) : (
                <>
                  <select value={obj.category || ''} onChange={e => {
                    const next = [...value];
                    next[i] = { ...obj, category: e.target.value, itemName: '' };
                    onChange(next);
                  }}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>

                  {obj.type === 'item' && (
                    <select value={obj.itemName || ''} onChange={e => updateEntry(i, 'itemName', e.target.value)}>
                      <option value="">Select Item</option>
                      {obj.category && <option value="any">Any Item</option>}
                      {obj.category && categories.find(c => c.name === obj.category)?.items.map(item => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </>
          )}
          {type === 'damageInterface' && (
            <>
              <select value={obj.extraDice} onChange={e => updateEntry(i, 'extraDice', e.target.value)}>
                {DICE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="number" value={obj.diceMultiplier} onChange={e => updateEntry(i, 'diceMultiplier', parseFloat(e.target.value))} style={{ width: '50px' }} />
            </>
          )}
          <button onClick={() => onChange(value.filter((_, idx) => idx !== i))}>x</button>
        </div>
      ))}
      {type === 'uses' ? (
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => addItem({ type: 'tag', tag: '' })} style={{ fontSize: '0.8em' }}>+ Add Tag</button>
          <button onClick={() => addItem({ type: 'category', category: '' })} style={{ fontSize: '0.8em' }}>+ Add Category</button>
          <button onClick={() => addItem({ type: 'item', category: '', itemName: '' })} style={{ fontSize: '0.8em' }}>+ Add Item</button>
        </div>
      ) : (
        <button onClick={() => addItem()} style={{ fontSize: '0.8em' }}>+ Add Entry</button>
      )}
    </div>
  );
}

function PropertyField({ propKey, value, onChange, globalTags = [], categories = [] }: { propKey: string, value: any, onChange: (val: any) => void, globalTags?: string[], categories?: Category[] }) {
  const type = getPropertyType(propKey);

  if (propKey === 'tags') {
    const selectedTags = Array.isArray(value) ? value : [];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
        {selectedTags.map((tag, i) => (
          <span key={i} style={{ background: '#e0e0e0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {tag}
            <button onClick={() => onChange(selectedTags.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontWeight: 'bold', color: '#666' }}>×</button>
          </span>
        ))}
        <select value="" onChange={(e) => e.target.value && onChange([...selectedTags, e.target.value])} style={{ padding: '2px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="" disabled>+ Add Tag</option>
          {globalTags.filter(t => !selectedTags.includes(t)).map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </div>
    );
  }

  if (propKey === 'range') {
    const rangeValue = value || { type: 'Melee' }; // Ensure a default structure
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <select
          value={rangeValue.type}
          onChange={(e) => {
            const newType = e.target.value as 'Melee' | 'Ranged';
            if (newType === 'Melee') {
              onChange({ type: 'Melee' });
            } else {
              onChange({ type: 'Ranged', normal: 0, disadvantage: 0 });
            }
          }}
          style={{ padding: '2px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="Melee">Melee</option>
          <option value="Ranged">Ranged</option>
        </select>
        {rangeValue.type === 'Ranged' && (
          <>
            <label>Normal Range:</label>
            <input
              type="number"
              value={rangeValue.normal || 0}
              onChange={(e) => onChange({ ...rangeValue, normal: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1 }}
            />
            <label>Disadvantage Range:</label>
            <input
              type="number"
              value={rangeValue.disadvantage || 0}
              onChange={(e) => onChange({ ...rangeValue, disadvantage: parseFloat(e.target.value) || 0 })}
              style={{ flex: 1 }}
            />
          </>
        )}
      </div>
    );
  }

  if (['requirements', 'affection', 'damageInterface', 'uses'].includes(type)) {
    return <ObjectArrayEditor type={type} value={Array.isArray(value) ? value : []} onChange={onChange} categories={categories} globalTags={globalTags} />;
  }

  if (type === 'stringArray' || type === 'numberArray') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {arr.map((v, i) => (
          <div key={i} style={{ display: 'flex' }}>
            <input type={type === 'numberArray' ? 'number' : 'text'} value={v} onChange={e => {
              const next = [...arr];
              next[i] = type === 'numberArray' ? parseFloat(e.target.value) || 0 : e.target.value;
              onChange(next);
            }} style={{ width: '80px' }} />
            <button onClick={() => onChange(arr.filter((_, idx) => idx !== i))}>x</button>
          </div>
        ))}
        <button onClick={() => onChange([...arr, type === 'numberArray' ? 0 : ''])}>+</button>
      </div>
    );
  }

  return <input type={type === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} style={{ flex: 1 }} />;
}

// --- Main Component ---

const Refactor = ({ characters, loadSheet }: { characters: string[], loadSheet: (name: string) => void }) => {
  const hostname = window.location.hostname;
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [exportFileName, setExportFileName] = useState('categories');

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
            // Tiered array-based types look like Array<Array<T>>.
            if (val.length > 0 && Array.isArray(val[0])) {
              arr = [...val];
            } else {
              arr = [val]; // Wrap single value-array into tier-array
            }
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
            // If we have tiered data (Array<Array<T>>), extract the first tier.
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

  useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => normalizeItem(it, getCategoryKeys(cat)))
    })));
  }, [normalizeItem]);

  const addCategory = () => {
    const existingNames = categories.map(c => c.name.trim());
    let newName = "New Category";
    let i = 1;
    while (existingNames.includes(newName)) {
      newName = `New Category ${i++}`;
    }
    setCategories([...categories, { name: newName, items: [], propertyKeys: ['name'], showProps: false }]);
  };

  const removeCategory = (idx: number) => setCategories(prev => prev.filter((_, i) => i !== idx));
  const updateCategory = (idx: number, patch: Partial<Category>) => setCategories(prev => {
    const next = [...prev];
    next[idx] = { ...next[idx], ...patch };
    return next;
  });

  const toggleCategoryProperty = (catIdx: number, key: string) => {
    const cat = categories[catIdx];
    const keys = getCategoryKeys(cat);
    const nextKeys = keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key];
    const finalKeys = Array.from(new Set([...nextKeys, 'name']));
    updateCategory(catIdx, { propertyKeys: finalKeys, items: cat.items.map(it => normalizeItem(it, finalKeys)) });
  };

  const setItem = (catIdx: number, itemIdx: number, patch: Partial<Item>) => setCategories(prev => {
    const next = [...prev];
    const cat = next[catIdx];
    const keys = getCategoryKeys(cat);
    let item = { ...cat.items[itemIdx] };

    // Migration logic for tiers
    if ('maxTier' in patch) {
      const newMaxTier = patch.maxTier ?? 1;
      const oldMaxTier = item.maxTier ?? 1;

      if (newMaxTier !== oldMaxTier) {
        keys.forEach(prop => {
          if (NON_TIERED_PROPS.includes(prop)) return;
          const val = (item as any)[prop];
          const type = getPropertyType(prop);

          if (newMaxTier >= 2) {
            let newArr = Array.isArray(val) && oldMaxTier >= 2 ? [...val] : [val ?? getDefaultValue(type)];
            while (newArr.length < newMaxTier) newArr.push(getDefaultValue(type));
            (item as any)[prop] = newArr.slice(0, newMaxTier);
          } else if (oldMaxTier >= 2 && Array.isArray(val)) {
            (item as any)[prop] = val[0];
          }
        });
      }
    }

    const updatedItem = { ...item, ...patch };
    const items = [...next[catIdx].items];
    items[itemIdx] = updatedItem as Item;
    next[catIdx] = { ...next[catIdx], items };
    return next;
  });

  const addItem = (catIdx: number) => updateCategory(catIdx, { 
    items: [...categories[catIdx].items, normalizeItem({ name: 'New Item' }, getCategoryKeys(categories[catIdx]))] 
  });

  const removeItem = (catIdx: number, itemIdx: number) => updateCategory(catIdx, { 
    items: categories[catIdx].items.filter((_, i) => i !== itemIdx) 
  });

  const exportAll = async () => {
    const cleanCategories = categories.map(cat => ({
      ...cat,
      items: cat.items.map(it => normalizeItem(it, getCategoryKeys(cat)))
    }));
    const data = JSON.stringify({ categories: cleanCategories, globalTags }, null, 2);
    const fileName = exportFileName.trim() || 'categories';
    const suggestedName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    // Use File System Access API if available (Chrome, Edge, Opera)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return;
      } catch (err: any) {
        // If the user cancels the dialog, just exit
        if (err.name === 'AbortError') return;
        console.error('File System Access API failed, falling back to download...', err);
      }
    }

    // Fallback for browsers that don't support the API (Firefox, Safari)
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
        if (obj.categories) setCategories(obj.categories.map((c: any) => ({ ...c, items: (c.items || []).map((it: any) => normalizeItem(it, c.propertyKeys || ['name'])) })));
        if (obj.globalTags) setGlobalTags(obj.globalTags);
      } catch (err) { console.error('Import failed', err); }
    };
    reader.readAsText(file);
  };

  const renderDMTools = () => (
    <div style={{ padding: '10px', border: '1px solid #888', marginTop: '20px' }}>
      <TagManager tags={globalTags} onTagsChange={setGlobalTags} />
      <h2>DM Category Manager</h2>
      <button onClick={addCategory} style={{ marginBottom: '10px' }}>Add Category</button>
      {categories.map((cat, ci) => {
        const isDuplicate = categories.some((c, i) => i !== ci && c.name.trim() === cat.name.trim() && cat.name.trim() !== "");
        return (
          <div key={ci} style={{ marginBottom: '15px', padding: '5px', border: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => updateCategory(ci, { minimized: !cat.minimized })}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1em', padding: '0 5px' }}
                title={cat.minimized ? "Expand Category" : "Minimize Category"}
              >
                {cat.minimized ? '▶' : '▼'}
              </button>
              <input 
                placeholder="Category name" 
                value={cat.name} 
                onChange={(e) => updateCategory(ci, { name: e.target.value })} 
                style={{ flex: 1, borderColor: isDuplicate ? 'red' : undefined }} 
              />
              <button onClick={() => removeCategory(ci)}>Remove</button>
            </div>
            {isDuplicate && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Category name must be unique.</div>}

          {!cat.minimized && (
            <>
              <button style={{ marginTop: '10px', marginBottom: '8px' }} onClick={() => updateCategory(ci, { showProps: !cat.showProps })}>
                {cat.showProps ? 'Hide' : 'Show'} Item Properties
              </button>
              {cat.showProps && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {ITEM_PROPERTY_OPTIONS.map((prop) => (
                    <label key={prop} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={getCategoryKeys(cat).includes(prop)} disabled={prop === 'name'} onChange={() => toggleCategoryProperty(ci, prop)} />
                      {prop}
                    </label>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <strong>Items</strong>
                <button onClick={() => addItem(ci)} style={{ marginLeft: '5px' }}>+ Item</button>
                {cat.items.map((it, ii) => (
                  <div key={ii} style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd' }}>
                    {getCategoryKeys(cat).map((prop) => {
                      const type = getPropertyType(prop);
                      return (
                        <div key={prop} style={{ marginBottom: '10px' }}>
                          {((it.maxTier ?? 1) >= 2 && !NON_TIERED_PROPS.includes(prop)) ? (
                            <div style={{ padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px' }}>
                              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9em', color: '#444' }}>{prop} (Tiered Values):</div>
                              {[...Array(it.maxTier)].map((_, tIdx) => {
                                const isColumn = type.includes('Array') || ['requirements', 'affection', 'damageInterface', 'uses'].includes(type);
                                return (
                                  <div key={tIdx} style={{ display: 'flex', marginBottom: '8px', gap: '10px', flexDirection: isColumn ? 'column' : 'row' }}>
                                    <label style={{ minWidth: '60px', fontSize: '0.85em', color: '#666', paddingTop: isColumn ? '0' : '4px' }}>Tier {tIdx + 1}:</label>
                                    <PropertyField 
                                      propKey={prop} 
                                      value={(it as any)[prop]?.[tIdx] ?? getDefaultValue(type)} 
                                      onChange={val => {
                                        const old = (it as any)[prop];
                                        const arr = Array.isArray(old) ? [...old] : [old];
                                        while(arr.length <= tIdx) arr.push(getDefaultValue(type));
                                        arr[tIdx] = val;
                                        setItem(ci, ii, { [prop]: arr });
                                      }} 
                                      globalTags={globalTags} 
                                      categories={categories} 
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: type.includes('Array') || ['requirements', 'affection', 'damageInterface', 'uses'].includes(type) ? 'column' : 'row' }}>
                              <label style={{ minWidth: '140px', fontWeight: 'bold' }}>{prop}:</label>
                              <PropertyField propKey={prop} value={(it as any)[prop]} onChange={val => setItem(ci, ii, { [prop]: val })} globalTags={globalTags} categories={categories} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={() => removeItem(ci, ii)}>Delete Item</button>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        );
      })}
      <div style={{ marginTop: '10px' }}>
        <input 
          value={exportFileName} 
          onChange={(e) => setExportFileName(e.target.value)} 
          placeholder="Filename..."
          style={{ marginRight: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={exportAll}>Export Categories</button>
        <input type="file" accept="application/json" onChange={importFile} />
      </div>
    </div>
  );

  return (
    <div>
      {(hostname === 'localhost' || hostname === '127.0.0.1') ? (
        <div>
          <h1>Welcome, DM!</h1>
          {renderDMTools()}
        </div>
      ) : (
        <h1>Select Your Character</h1>
      )}
    </div>
  );
};

export default Refactor;
