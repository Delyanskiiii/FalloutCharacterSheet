import React, { useState, useEffect, useCallback } from 'react';

// --- Types & Constants ---

type PropertyType = 'string' | 'number' | 'stringArray' | 'numberArray' | 'requirements' | 'affects' | 'criticalHit' | 'json';

export interface Requirement {
  category: string;
  itemName: string;
  property: string;
  affection: string;
  value: string | number;
}

export interface Affect {
  property: string;
  value: string | number;
}

export interface CriticalHit {
  extraDice: string;
  damageMultiplier: number;
}

export interface Item {
  id: number;
  name: string;
  maxTiers?: number;
  currentTier?: number;
  maxRepeats?: number;
  description?: string;
  requirements?: Requirement[];
  tags?: string[];
  affects?: Affect[];
  usedBy?: number[];
  priceCost?: number;
  useCost?: number;
  weight?: number;
  repairDifficultyCheck?: number;
  repairTime?: number;
  maxUpgrades?: number;
  upgrades?: string[];
  upgradeDifficultyCheck?: number;
  upgradeTime?: number;
  damage?: string;
  criticalHit?: CriticalHit[];
  reload?: string;
  range?: string;
  equipTime?: number;
  defencePoints?: number;
  damageThreshold?: number;
  armorClass?: number;
  loadWorn?: number;
}

interface Category {
  name: string;
  items: Item[];
  propertyKeys: string[];
  showProps?: boolean;
}

const PROPERTY_CONFIG: Record<string, PropertyType> = {
  name: 'string',
  maxTiers: 'number',
  currentTier: 'number',
  maxRepeats: 'number',
  description: 'string',
  requirements: 'requirements',
  tags: 'stringArray',
  affects: 'affects',
  usedBy: 'numberArray',
  priceCost: 'number',
  useCost: 'number',
  weight: 'number',
  repairDifficultyCheck: 'number',
  repairTime: 'number',
  maxUpgrades: 'number',
  upgrades: 'stringArray',
  upgradeDifficultyCheck: 'number',
  upgradeTime: 'number',
  damage: 'string',
  criticalHit: 'criticalHit',
  reload: 'string',
  range: 'string',
  equipTime: 'number',
  defencePoints: 'number',
  damageThreshold: 'number',
  armorClass: 'number',
  loadWorn: 'number',
};

const ITEM_PROPERTY_OPTIONS = Object.keys(PROPERTY_CONFIG);
const DICE_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

// --- Helper Logic ---

const getPropertyType = (prop: string): PropertyType => PROPERTY_CONFIG[prop] || 'string';

const getDefaultValue = (type: PropertyType) => {
  switch (type) {
    case 'number': return 0;
    case 'stringArray':
    case 'numberArray':
    case 'requirements':
    case 'affects':
    case 'criticalHit': return [];
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

const ObjectArrayEditor = ({ type, value, onChange, categories = [] }: { type: PropertyType, value: any[], onChange: (val: any[]) => void, categories?: Category[] }) => {
  const addItem = () => {
    const defaults: Record<string, any> = {
      requirements: { category: '', itemName: '', property: 'name', affection: 'equal', value: '' },
      affects: { property: 'name', value: '' },
      criticalHit: { extraDice: 'd4', damageMultiplier: 1 }
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
              <input value={obj.value} onChange={e => updateEntry(i, 'value', e.target.value)} style={{ width: '60px' }} />
            </>
          )}
          {type === 'affects' && (
            <>
              <select value={obj.property} onChange={e => updateEntry(i, 'property', e.target.value)}>
                {ITEM_PROPERTY_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <input value={obj.value} onChange={e => updateEntry(i, 'value', e.target.value)} style={{ width: '60px' }} />
            </>
          )}
          {type === 'criticalHit' && (
            <>
              <select value={obj.extraDice} onChange={e => updateEntry(i, 'extraDice', e.target.value)}>
                {DICE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="number" value={obj.damageMultiplier} onChange={e => updateEntry(i, 'damageMultiplier', parseFloat(e.target.value))} style={{ width: '50px' }} />
            </>
          )}
          <button onClick={() => onChange(value.filter((_, idx) => idx !== i))}>x</button>
        </div>
      ))}
      <button onClick={addItem} style={{ fontSize: '0.8em' }}>+ Add Entry</button>
    </div>
  );
};

const PropertyField = ({ propKey, value, onChange, globalTags = [], categories = [] }: { propKey: string, value: any, onChange: (val: any) => void, globalTags?: string[], categories?: Category[] }) => {
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

  if (['requirements', 'affects', 'criticalHit'].includes(type)) {
    return <ObjectArrayEditor type={type} value={Array.isArray(value) ? value : []} onChange={onChange} categories={categories} />;
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
};

// --- Main Component ---

const Refactor = ({ characters, loadSheet }: { characters: string[], loadSheet: (name: string) => void }) => {
  const hostname = window.location.hostname;
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>([]);

  const normalizeItem = useCallback((item: Partial<Item>, propertyKeys: string[]): Item => {
    const normalized: any = { id: item.id || Date.now() };
    propertyKeys.forEach((key) => {
      const type = getPropertyType(key);
      normalized[key] = (item as any)[key] ?? getDefaultValue(type);
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
    const items = [...next[catIdx].items];
    items[itemIdx] = { ...items[itemIdx], ...patch };
    next[catIdx] = { ...next[catIdx], items };
    return next;
  });

  const addItem = (catIdx: number) => updateCategory(catIdx, { 
    items: [...categories[catIdx].items, normalizeItem({ name: 'New Item' }, getCategoryKeys(categories[catIdx]))] 
  });

  const removeItem = (catIdx: number, itemIdx: number) => updateCategory(catIdx, { 
    items: categories[catIdx].items.filter((_, i) => i !== itemIdx) 
  });

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ categories, globalTags }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.json';
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
              <input 
                placeholder="Category name" 
                value={cat.name} 
                onChange={(e) => updateCategory(ci, { name: e.target.value })} 
                style={{ flex: 1, borderColor: isDuplicate ? 'red' : undefined }} 
              />
              <button onClick={() => removeCategory(ci)}>Remove</button>
            </div>
            {isDuplicate && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Category name must be unique.</div>}

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
                    <div key={prop} style={{ display: 'flex', marginBottom: '10px', flexDirection: type.includes('Array') || ['requirements', 'affects', 'criticalHit'].includes(type) ? 'column' : 'row' }}>
                      <label style={{ minWidth: '140px', fontWeight: 'bold' }}>{prop}:</label>
                      <PropertyField propKey={prop} value={(it as any)[prop]} onChange={val => setItem(ci, ii, { [prop]: val })} globalTags={globalTags} categories={categories} />
                    </div>
                  );
                })}
                <button onClick={() => removeItem(ci, ii)}>Delete Item</button>
              </div>
            ))}
          </div>
        </div>
        );
      })}
      <div style={{ marginTop: '10px' }}>
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
