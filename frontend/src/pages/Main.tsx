// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import * as Data from '../data';
import { CharacterSheet, Special } from '../types';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SAVED_LAYOUT_KEY = 'user-character-sheet-layout';

const Main = ({activeSheet, setActiveSheet, saveSheet}: {activeSheet: CharacterSheet | null, setActiveSheet: Dispatch<SetStateAction<string>>, saveSheet: () => void}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // 1. Initialize layout from LocalStorage or use Default
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem(SAVED_LAYOUT_KEY);
    return saved ? JSON.parse(saved) : {
      lg: [
        { i: 'a', x: 0, y: 0, w: 3, h: 4 },
        { i: 'b', x: 3, y: 0, w: 6, h: 2 },
        { i: 'c', x: 9, y: 0, w: 3, h: 4 }
      ]
    };
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. This function fires whenever a box is moved or resized
  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(allLayouts));
    console.log("Layout saved to LocalStorage!");
  };

  const exportLayout = () => {
    console.log("Copy this JSON for your code:", JSON.stringify(layouts, null, 2));
    alert("Layout JSON logged to Console (F12)!");
  };

  return (
    /* 3. The Scrollable Wrapper */
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#121212', 
      overflowY: 'auto', // Shows vertical scrollbar when content goes down
      overflowX: 'hidden' 
    }}>
      
      {/* Control Bar */}
      <div style={{ padding: '10px', background: '#333', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={exportLayout} style={{ cursor: 'pointer', padding: '5px 15px' }}>
          Export Layout to Console
        </button>
      </div>

      <Responsive
        className="layout"
        layouts={layouts}
        width={windowWidth}
        onLayoutChange={onLayoutChange} // Hooking up the save logic
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        // draggableHandle=".drag-handle"
      >
        <div key="a" style={{ background: '#1e1e1e', border: '1px solid #00ff00', color: '#00ff00' }}>
          <div className="drag-handle" style={{ background: '#00ff00', color: 'black', padding: '5px', cursor: 'grab' }}>DRAG A</div>
          <div style={{ padding: '10px' }}>Content A</div>
        </div>
        <div key="b" style={{ background: '#1e1e1e', border: '1px solid #00ff00', color: '#00ff00' }}>
          <div className="drag-handle" style={{ background: '#00ff00', color: 'black', padding: '5px', cursor: 'grab' }}>DRAG B</div>
          <div style={{ padding: '10px' }}>Content B</div>
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

          </div>
        </div>
      </Responsive>
    </div>
  );
};

export default Main;