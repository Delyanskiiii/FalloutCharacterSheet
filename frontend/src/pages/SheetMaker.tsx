import React, { useState, Dispatch, SetStateAction } from 'react';
import { Responsive } from 'react-grid-layout';
import * as Data from '../data';
import { CharacterSheet, Special } from '../types';
import NumberInput from '../components/NumberInput';
import SpecialComponent from '../components/SpecialComponent';
import { Category, getPropertyType, ARRAY_TYPES, NON_TIERED_PROPS } from './Refactor';
import PersonalComponent from '../components/PersonalComponent';
import SkillsComponent from '../components/SkillsComponent';
import TraitsComponent from '../components/TraitsComponent';
import NotesComponent from '../components/NotesComponent';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SAVED_LAYOUT_KEY = 'user-character-sheet-layout';

const PropertyDisplay = ({ prop, value }: { prop: string; value: any }) => {
  const type = getPropertyType(prop);
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;

  const isNativeArray = ARRAY_TYPES.includes(type);
  // Handle tiered values (show first tier for preview)
  const actualValue = !isNativeArray && Array.isArray(value) ? value[0] : value;

  const renderContent = () => {
    if (type === 'requirements' || type === 'affection') {
      return (
        <div style={{ fontSize: '0.85em', color: '#aaa', marginLeft: '10px' }}>
          {actualValue.map((v: any, i: number) => (
            <div key={i}>
              • {v.category && `${v.category}: `}{v.itemName && `${v.itemName} `}
              {v.property} {v.affection} {v.value}
            </div>
          ))}
        </div>
      );
    }
    if (type === 'uses') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '10px' }}>
          {actualValue.map((v: any, i: number) => (
            <span key={i} style={{ fontSize: '0.8em', border: '1px solid #00ff0044', padding: '0 4px', borderRadius: '2px' }}>
              {v.type === 'tag' ? `#${v.tag}` : v.type === 'category' ? `[${v.category}]` : `${v.category}: ${v.itemName}`}
            </span>
          ))}
        </div>
      );
    }
    if (type === 'damageInterface') {
      return <span style={{ marginLeft: '10px' }}>{actualValue.map((d: any) => `${d.diceMultiplier}${d.extraDice}`).join(', ')}</span>;
    }
    if (prop === 'range' && typeof actualValue === 'object') {
      return <span style={{ marginLeft: '10px' }}>{actualValue.type === 'Melee' ? 'Melee' : `Ranged (${actualValue.normal}/${actualValue.disadvantage})`}</span>;
    }
    if (Array.isArray(actualValue)) return <span style={{ marginLeft: '10px' }}>{actualValue.join(', ')}</span>;
    return <span style={{ marginLeft: '10px' }}>{String(actualValue)}</span>;
  };

  return (
    <div style={{ marginBottom: '4px' }}>
      <span style={{ fontSize: '0.7em', textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.5px' }}>{prop}: </span>
      {renderContent()}
    </div>
  );
};

const SheetMaker = ({
  activeSheet, 
  setActiveSheet, 
  categories,
  globalTags,
  layout,
  setLayout
}: {
  activeSheet: CharacterSheet | null, 
  setActiveSheet: Dispatch<SetStateAction<CharacterSheet | null>>, 
  categories: Category[],
  globalTags: string[],
  layout: any,
  setLayout: Dispatch<SetStateAction<any>>
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedCategory, setSelectedCategory] = useState('');

  const CATEGORY_COMPONENTS: Record<string, React.FC<any>> = {
    personal: PersonalComponent,
    special: SpecialComponent,
    skills: SkillsComponent,
    vitality: NumberInput,
    traits: TraitsComponent,
    notes: NotesComponent,
  };

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayout(allLayouts);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(allLayouts));
    console.log("Layout saved to LocalStorage!");
  };

  const lockGrid = () => {
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
  };

  const addCategoryWindow = () => {
    if (!selectedCategory) return;
    if (layout?.lg.find((l: any) => l.i === selectedCategory)) return;

    const newItem = { i: selectedCategory, x: 0, y: 0, w: 4, h: 8 };
    const next = { ...layout, lg: [...(layout?.lg || []), newItem] };
    setLayout(next);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(next));
  };

  const removeWindow = (id: string) => {
    const next = { ...layout, lg: layout.lg.filter((l: any) => l.i !== id) };
    setLayout(next);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(next));
  };

  return (
    <div className='Main'>
      <div style={{ padding: '10px', background: '#333', position: 'sticky', top: 0, zIndex: 10 }}>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', background: '#222', color: '#00ff00', border: '1px solid #00ff00' }}
        >
          <option value="">Select Category...</option>
          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <button onClick={addCategoryWindow} style={{ marginRight: '10px' }}>Add Window</button>

        <button onClick={lockGrid} style={{ cursor: 'pointer', padding: '5px 15px' }}>
          Lock/Unlock Grid
        </button>
      </div>

      <Responsive
        className="Layout"
        layouts={layout}
        width={windowWidth}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
      >
        {layout?.lg.map((item: any) => {
          const categoryName = item.i;
          const systemCategory = categories.find(c => c.name === categoryName);
          const categoryData = (activeSheet as any)?.[categoryName] || {};

          return (
            <div key={categoryName} className="Box">
              <div className="Drag-handle" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ flex: 1, textAlign: 'center', paddingLeft: '20px' }}>{categoryName.toUpperCase()}</span>
                <button 
                  onClick={() => removeWindow(categoryName)} 
                  style={{ background: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: 'bold' }}
                >X</button>
              </div>
              <div className="Box-content">
                {systemCategory ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {systemCategory.items.map((it) => (
                      <div key={it.id} style={{ border: '1px solid #444', padding: '10px', textAlign: 'left', width: '100%' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '4px', borderBottom: '1px solid #333' }}>{it.name}</div>
                        {it.description && (
                          <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '8px', fontStyle: 'italic' }}>
                            {Array.isArray(it.description) ? it.description[0] : it.description}
                          </div>
                        )}
                        {systemCategory.propertyKeys.filter(k => !NON_TIERED_PROPS.includes(k) && k !== 'description').map(prop => (
                          <PropertyDisplay key={prop} prop={prop} value={(it as any)[prop]} />
                        ))}
                      </div>
                    ))}
                    {systemCategory.items.length === 0 && <div style={{ opacity: 0.5 }}>No items defined in system.</div>}
                  </div>
                ) : (
                  Object.entries(categoryData).map(([dataName, dataData]) => {
                    const ComponentToRender = CATEGORY_COMPONENTS[categoryName] || NumberInput;
                    return (
                      <ComponentToRender
                        key={dataName}
                        dataName={dataName}
                        dataData={dataData} 
                        activeSheet={activeSheet} 
                        setActiveSheet={setActiveSheet} 
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </Responsive>
    </div>
  );
};

export default SheetMaker;