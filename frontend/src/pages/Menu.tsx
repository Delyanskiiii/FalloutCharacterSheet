import React from 'react';
import { Item } from "../spreadsheets/interfaces";

const ITEM_PROPERTY_OPTIONS = [
  'name',
  'tiers',
  'maxRepeats',
  'description',
  'requirements',
  'tags',
  'affects',
  'usedBy',
  'priceCost',
  'useCost',
  'weight',
  'repairDifficultyCheck',
  'repairTime',
  'maxUpgrades',
  'upgrades',
  'upgradeDifficultyCheck',
  'upgradeTime',
  'damage',
  'criticalHit',
  'reload',
  'range',
  'equipTime',
  'defencePoints',
  'damageThreshold',
  'armorClass',
  'loadWorn',
];

interface Category {
  name: string;
  items: Item[];
  propertyKeys: string[];
  showProps?: boolean;
}

const Menu = ({characters, loadSheet}: {characters: string[], loadSheet: (name: string) => void}) => {
  const hostname = window.location.hostname;

  const [categories, setCategories] = React.useState<Category[]>([]);

  const itemKeys = ['id', 'name', 'tiers', 'maxRepeats', 'description', 'requirements', 'tags', 'affects', 'usedBy', 'priceCost', 'useCost', 'weight', 'repairDifficultyCheck', 'repairTime', 'maxUpgrades', 'upgrades', 'upgradeDifficultyCheck', 'upgradeTime', 'damage', 'criticalHit', 'reload', 'range', 'equipTime', 'defencePoints', 'damageThreshold', 'armorClass', 'loadWorn'];
  const affections = ['equal', 'less', 'more'];
  const diceOptions = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  // Normalize existing items on mount to ensure arrays are arrays
  React.useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(it => normalizeItem(it, getCategoryKeys(cat)))
    })));
  }, []);

  const getPropertyType = (prop: string): 'string' | 'number' | 'stringArray' | 'numberArray' | 'objectArray' => {
    const numberProps = [
      'tiers', 'maxRepeats', 'priceCost', 'useCost', 'weight', 'repairDifficultyCheck',
      'repairTime', 'maxUpgrades', 'upgradeDifficultyCheck', 'upgradeTime',
      'equipTime', 'defencePoints', 'damageThreshold', 'armorClass', 'loadWorn'
    ];
    const stringArrayProps = ['tags', 'upgrades'];
    const numberArrayProps = ['usedBy'];
    const objectArrayProps = ['requirements', 'affects', 'criticalHit'];
    if (numberProps.includes(prop)) return 'number';
    if (stringArrayProps.includes(prop)) return 'stringArray';
    if (numberArrayProps.includes(prop)) return 'numberArray';
    if (objectArrayProps.includes(prop)) return 'objectArray';
    return 'string';
  };

  const normalizeItem = (item: Item, propertyKeys: string[]) => {
    const normalized: any = { id: item.id };
    propertyKeys.forEach((key) => {
      if (key === 'name') {
        normalized.name = item.name ?? '';
        return;
      }
      const type = getPropertyType(key);
      if (type === 'number') {
        normalized[key] = (item as any)[key] ?? 0;
      } else if (type === 'stringArray' || type === 'numberArray') {
        normalized[key] = Array.isArray((item as any)[key]) ? (item as any)[key] : [''];
      } else if (type === 'objectArray') {
        normalized[key] = Array.isArray((item as any)[key]) ? (item as any)[key] : [];
      } else {
        normalized[key] = (item as any)[key] ?? '';
      }
    });
    return normalized as Item;
  };

  // --- category management helpers ------------------------------------------------
  const addCategory = () => {
    setCategories([
      ...categories,
      { name: '', items: [], propertyKeys: ['name'], showProps: false },
    ]);
  };
  const removeCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };
  const updateCategoryName = (idx: number, value: string) => {
    const copy = [...categories];
    copy[idx].name = value;
    setCategories(copy);
  };

  const getCategoryKeys = (cat: Category) => {
    return Array.isArray(cat.propertyKeys) && cat.propertyKeys.length > 0
      ? cat.propertyKeys
      : ['name'];
  };

  const setCategoryPropertyKeys = (catIdx: number, keys: string[]) => {
    const copy = [...categories];
    const finalKeys = Array.from(new Set([...keys, 'name']));
    copy[catIdx].propertyKeys = finalKeys;
    copy[catIdx].items = copy[catIdx].items.map((it) => normalizeItem(it, finalKeys));
    setCategories(copy);
  };

  const toggleCategoryProperty = (catIdx: number, key: string) => {
    const cat = categories[catIdx];
    const keys = getCategoryKeys(cat);
    const has = keys.includes(key);
    const nextKeys = has ? keys.filter((k) => k !== key) : [...keys, key];

    setCategoryPropertyKeys(catIdx, nextKeys);
  };

  const addItem = (catIdx: number) => {
    const copy = [...categories];
    const propertyKeys = getCategoryKeys(copy[catIdx]);
    const baseItem: any = { id: Date.now() };
    propertyKeys.forEach((key) => {
      const type = getPropertyType(key);
      if (key === 'name') {
        baseItem.name = '';
      } else if (type === 'number') {
        baseItem[key] = 0;
      } else if (type === 'stringArray' || type === 'numberArray') {
        baseItem[key] = [''];
      } else if (type === 'objectArray') {
        baseItem[key] = [];
      } else {
        baseItem[key] = '';
      }
    });
    copy[catIdx].items.push(baseItem as Item);
    setCategories(copy);
  };

  const updateItem = (catIdx: number, itemIdx: number, key: string, value: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const type = getPropertyType(key);
    if (type === 'number') {
      item[key] = parseFloat(value) || 0;
    } else if (type === 'objectArray') {
      try {
        item[key] = JSON.parse(value);
      } catch {
        item[key] = [];
      }
    } else {
      item[key] = value;
    }
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const updateArrayItem = (catIdx: number, itemIdx: number, key: string, arrayIdx: number, value: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const type = getPropertyType(key);
    const arr = [...(item[key] || [])];
    if (type === 'numberArray') {
      arr[arrayIdx] = parseFloat(value) || 0;
    } else {
      arr[arrayIdx] = value;
    }
    item[key] = arr;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const addToArray = (catIdx: number, itemIdx: number, key: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const type = getPropertyType(key);
    const arr = [...(item[key] || [])];
    arr.push(type === 'numberArray' ? 0 : '');
    item[key] = arr;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const removeFromArray = (catIdx: number, itemIdx: number, key: string, arrayIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const arr = [...(item[key] || [])];
    arr.splice(arrayIdx, 1);
    item[key] = arr;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const updateRequirement = (catIdx: number, itemIdx: number, reqIdx: number, field: string, value: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const reqs = [...(item.requirements || [])];
    if (!reqs[reqIdx]) reqs[reqIdx] = { property: 'name', affection: 'equal', value: '' };
    reqs[reqIdx] = { ...reqs[reqIdx], [field]: value };
    item.requirements = reqs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const addRequirement = (catIdx: number, itemIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const reqs = [...(item.requirements || [])];
    reqs.push({ property: 'name', affection: 'equal', value: '' });
    item.requirements = reqs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const removeRequirement = (catIdx: number, itemIdx: number, reqIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const reqs = [...(item.requirements || [])];
    reqs.splice(reqIdx, 1);
    item.requirements = reqs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const updateAffect = (catIdx: number, itemIdx: number, affIdx: number, field: string, value: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const affs = [...(item.affects || [])];
    if (!affs[affIdx]) affs[affIdx] = { property: 'name', value: '' };
    affs[affIdx] = { ...affs[affIdx], [field]: field === 'value' ? value : value };
    item.affects = affs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const addAffect = (catIdx: number, itemIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const affs = [...(item.affects || [])];
    affs.push({ property: 'name', value: '' });
    item.affects = affs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const removeAffect = (catIdx: number, itemIdx: number, affIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const affs = [...(item.affects || [])];
    affs.splice(affIdx, 1);
    item.affects = affs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const updateCriticalHit = (catIdx: number, itemIdx: number, chIdx: number, field: string, value: string) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const chs = [...(item.criticalHit || [])];
    if (!chs[chIdx]) chs[chIdx] = { extraDice: 'd4', damageMultiplier: 1 };
    chs[chIdx] = { ...chs[chIdx], [field]: field === 'damageMultiplier' ? parseFloat(value) || 1 : value };
    item.criticalHit = chs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const addCriticalHit = (catIdx: number, itemIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const chs = [...(item.criticalHit || [])];
    chs.push({ extraDice: 'd4', damageMultiplier: 1 });
    item.criticalHit = chs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const removeCriticalHit = (catIdx: number, itemIdx: number, chIdx: number) => {
    const copy = [...categories];
    const item = { ...copy[catIdx].items[itemIdx] } as any;
    const chs = [...(item.criticalHit || [])];
    chs.splice(chIdx, 1);
    item.criticalHit = chs;
    copy[catIdx].items[itemIdx] = item;
    setCategories(copy);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    const copy = [...categories];
    copy[catIdx].items.splice(itemIdx, 1);
    setCategories(copy);
  };

  const exportAll = () => {
    const data = JSON.stringify({ categories }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
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
        if (obj.categories && Array.isArray(obj.categories)) {
          setCategories(
            obj.categories.map((c: any) => ({
              name: c.name ?? '',
              propertyKeys: Array.isArray(c.propertyKeys) ? c.propertyKeys : ['name'],
              items: Array.isArray(c.items) ? c.items.map((it: any) => {
                const keys = Array.isArray(c.propertyKeys) ? c.propertyKeys : ['name'];
                return normalizeItem(it, keys);
              }) : [],
            })),
          );
        }
      } catch (err) {
        console.error('invalid JSON', err);
      }
    };
    reader.readAsText(file);
  };
  // -------------------------------------------------------------------------------

  const renderDMTools = () => (
    <div style={{ padding: '10px', border: '1px solid #888', marginTop: '20px' }}>
      <h2>DM Category Manager</h2>
      <button onClick={addCategory} style={{ marginBottom: '10px' }}>
        Add Category
      </button>
      {categories.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: '15px', padding: '5px', border: '1px dashed #ccc' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              placeholder="Category name"
              value={cat.name}
              onChange={(e) => updateCategoryName(ci, e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={() => removeCategory(ci)}>Remove</button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button
              style={{ marginBottom: '8px' }}
              onClick={() => {
                const copy = [...categories];
                copy[ci].showProps = !copy[ci].showProps;
                setCategories(copy);
              }}
            >
              {cat.showProps ? 'Hide' : 'Show'} Item Properties
            </button>

            {cat.showProps && (
              <div>
                <strong>Item Properties</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {ITEM_PROPERTY_OPTIONS.map((prop) => {
                    const keys = getCategoryKeys(cat);
                    const checked = keys.includes(prop);
                    return (
                      <label key={prop} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={prop === 'name'}
                          onChange={() => toggleCategoryProperty(ci, prop)}
                        />
                        {prop}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '10px' }}>
            <strong>Items</strong>
            <button onClick={() => addItem(ci)} style={{ marginLeft: '5px' }}>
              + Item
            </button>
            {cat.items.map((it, ii) => (
              <div key={ii} style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd' }}>
                {getCategoryKeys(cat).map((prop) => {
                  const type = getPropertyType(prop);
                  const value = (it as any)[prop];
                  if (type === 'stringArray' || type === 'numberArray') {
                    const arr = Array.isArray(value) ? value : [''];
                    return (
                      <div key={prop} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{prop}</label>
                        {arr.map((val, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            {type === 'numberArray' ? (
                              <input
                                type="number"
                                value={val}
                                onChange={(e) => updateArrayItem(ci, ii, prop, idx, e.target.value)}
                                style={{ flex: 1 }}
                              />
                            ) : (
                              <input
                                value={val}
                                onChange={(e) => updateArrayItem(ci, ii, prop, idx, e.target.value)}
                                style={{ flex: 1 }}
                              />
                            )}
                            <button onClick={() => removeFromArray(ci, ii, prop, idx)}>Remove</button>
                          </div>
                        ))}
                        <button onClick={() => addToArray(ci, ii, prop)}>Add {type === 'numberArray' ? 'Number' : 'String'}</button>
                      </div>
                    );
                  } else if (prop === 'requirements') {
                    const reqs = Array.isArray(value) ? value : [];
                    return (
                      <div key={prop} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{prop}</label>
                        {reqs.map((req: any, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <select value={req.property || 'name'} onChange={(e) => updateRequirement(ci, ii, idx, 'property', e.target.value)}>
                              {itemKeys.map(key => <option key={key} value={key}>{key}</option>)}
                            </select>
                            <select value={req.affection || 'equal'} onChange={(e) => updateRequirement(ci, ii, idx, 'affection', e.target.value)}>
                              {affections.map(aff => <option key={aff} value={aff}>{aff}</option>)}
                            </select>
                            <input value={req.value || ''} onChange={(e) => updateRequirement(ci, ii, idx, 'value', e.target.value)} style={{ flex: 1 }} />
                            <button onClick={() => removeRequirement(ci, ii, idx)}>Remove</button>
                          </div>
                        ))}
                        <button onClick={() => addRequirement(ci, ii)}>Add Requirement</button>
                      </div>
                    );
                  } else if (prop === 'affects') {
                    const affs = Array.isArray(value) ? value : [];
                    return (
                      <div key={prop} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{prop}</label>
                        {affs.map((aff: any, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <select value={aff.property || 'name'} onChange={(e) => updateAffect(ci, ii, idx, 'property', e.target.value)}>
                              {itemKeys.map(key => <option key={key} value={key}>{key}</option>)}
                            </select>
                            <input value={aff.value || ''} onChange={(e) => updateAffect(ci, ii, idx, 'value', e.target.value)} style={{ flex: 1 }} />
                            <button onClick={() => removeAffect(ci, ii, idx)}>Remove</button>
                          </div>
                        ))}
                        <button onClick={() => addAffect(ci, ii)}>Add Affect</button>
                      </div>
                    );
                  } else if (prop === 'criticalHit') {
                    const chs = Array.isArray(value) ? value : [];
                    return (
                      <div key={prop} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{prop}</label>
                        {chs.map((ch: any, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <select value={ch.extraDice || 'd4'} onChange={(e) => updateCriticalHit(ci, ii, idx, 'extraDice', e.target.value)}>
                              {diceOptions.map(die => <option key={die} value={die}>{die}</option>)}
                            </select>
                            <input type="number" value={ch.damageMultiplier || 1} onChange={(e) => updateCriticalHit(ci, ii, idx, 'damageMultiplier', e.target.value)} style={{ flex: 1 }} />
                            <button onClick={() => removeCriticalHit(ci, ii, idx)}>Remove</button>
                          </div>
                        ))}
                        <button onClick={() => addCriticalHit(ci, ii)}>Add Critical Hit</button>
                      </div>
                    );
                  } else if (type === 'objectArray') {
                    const displayValue = JSON.stringify(value, null, 2);
                    return (
                      <div key={prop} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <label style={{ width: '140px' }}>{prop}</label>
                        <textarea
                          style={{ flex: 1, minHeight: '60px' }}
                          value={displayValue}
                          onChange={(e) => updateItem(ci, ii, prop, e.target.value)}
                        />
                      </div>
                    );
                  } else {
                    const displayValue = type === 'number' ? value : value.toString();
                    return (
                      <div key={prop} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <label style={{ width: '140px' }}>{prop}</label>
                        {type === 'number' ? (
                          <input
                            type="number"
                            style={{ flex: 1 }}
                            value={value}
                            onChange={(e) => updateItem(ci, ii, prop, e.target.value)}
                          />
                        ) : (
                          <input
                            style={{ flex: 1 }}
                            value={value}
                            onChange={(e) => updateItem(ci, ii, prop, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  }
                })}
                <button onClick={() => removeItem(ci, ii)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      ))}
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

export default Menu;