import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Responsive } from 'react-grid-layout';
import * as Data from '../data';
import { CharacterSheet, Special } from '../types';
import NumberInput from '../components/NumberInput';
import SpecialComponent from '../components/SpecialComponent';
import PersonalComponent from '../components/PersonalComponent';
import SkillsComponent from '../components/SkillsComponent';
import TraitsComponent from '../components/TraitsComponent';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SAVED_LAYOUT_KEY = 'user-character-sheet-layout';

const Main = ({activeSheet, setActiveSheet, saveSheet}: {activeSheet: CharacterSheet | null, setActiveSheet: Dispatch<SetStateAction<CharacterSheet | null>>, saveSheet: () => void}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem(SAVED_LAYOUT_KEY);
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

  localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(layouts));

  const CATEGORY_COMPONENTS: Record<string, React.FC<any>> = {
    personal: PersonalComponent,
    special: SpecialComponent,
    skills: SkillsComponent,
    vitality: NumberInput,
    traits: TraitsComponent,
  };

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(allLayouts));
    console.log("Layout saved to LocalStorage!");
  };

  const exportLayout = () => {
    console.log("Copy this JSON for your code:", JSON.stringify(layouts, null, 2));
    alert("Layout JSON logged to Console (F12)!");
  };

  const lockGrid = () => {
    const layout = (localStorage.getItem(SAVED_LAYOUT_KEY));
    if (!layout) return;
    const updatedLayouts = JSON.parse(layout);

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
    setLayouts(updatedLayouts);
  };

  return (
    <div className='Main'>
      <div style={{ padding: '10px', background: '#333', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={exportLayout} style={{ cursor: 'pointer', padding: '5px 15px' }}>
          Export Layout to Console
        </button>
        <button onClick={() => setActiveSheet(null)}>Back</button>
        <button onClick={saveSheet} style={{ backgroundColor: 'green', color: 'white' }}>
          Save Changes
        </button>
        <button onClick={lockGrid} style={{ cursor: 'pointer', padding: '5px 15px' }}>
          Lock
        </button>
      </div>

      <Responsive
        className="Layout"
        layouts={layouts}
        width={windowWidth}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
      >

        {activeSheet ? Object.entries(activeSheet).map(([categoryName, categoryData]) => (
          <div key={categoryName} className="Box">
            <div className="Drag-handle">{categoryName.toUpperCase()}</div>
            <div className="Box-content">
              {Object.entries(categoryData).map(([dataName, dataData]) => {
                const ComponentToRender = CATEGORY_COMPONENTS[categoryName] || NumberInput;
                return (
                  <ComponentToRender
                    dataName={dataName}
                    dataData={dataData} 
                    activeSheet={activeSheet} 
                    setActiveSheet={setActiveSheet} 
                  />
                );
              })}
            </div>
          </div>
        )) : <div></div>}


        {/* <div key="b" style={{ background: '#1e1e1e', border: '1px solid #00ff00', color: '#00ff00' }}>
          <div className="drag-handle" style={{ background: '#00ff00', color: 'black', padding: '5px', cursor: 'grab' }}>DRAG B</div>
          <div style={{ padding: '10px' }}>Content B
            <div className="Special">
              {(Object.entries(activeSheet.special) as [keyof Special, number][]).map(([key, value]) => {
                return (
                  <div key={key} className="stat-box">
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
                    <small>Mod: {Math.floor((value - 10) / 2)}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div key="c" style={{ background: '#1e1e1e', border: '1px solid #00ff00', color: '#00ff00' }}>
          <div className="drag-handle" style={{ background: '#00ff00', color: 'black', padding: '5px', cursor: 'grab' }}>DRAG C</div>
          <div style={{ padding: '10px' }}>Content C
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
            </div>
          </div>
        </div> */}
      </Responsive>
    </div>
  );
};

export default Main;