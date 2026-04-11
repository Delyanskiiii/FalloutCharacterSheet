import React, { useState, Dispatch, SetStateAction } from 'react';
import { Responsive } from 'react-grid-layout';
import * as Data from '../data';
import { CharacterSheet, Special } from '../types';
import { Category, NON_TIERED_PROPS, PropertyDisplay } from './Refactor';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SAVED_LAYOUT_KEY = 'user-character-sheet-layout';

const Main = ({
  activeSheet, 
  setActiveSheet, 
  saveSheet,
  layout,
  setLayout,
  isDM,
  lockGrid,
  categories
}: {
  activeSheet: CharacterSheet | null, 
  setActiveSheet: Dispatch<SetStateAction<CharacterSheet | null>>, 
  saveSheet: () => void,
  layout: any,
  setLayout: Dispatch<SetStateAction<any>>,
  isDM: boolean,
  lockGrid: () => void,
  categories: Category[]
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayout(allLayouts);
    localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(allLayouts));
  };

  const exportLayout = () => {
    console.log("Copy this JSON for your code:", JSON.stringify(layout, null, 2));
    alert("Layout JSON logged to Console!");
  };

  return (
    <div className='Main'>
      {isDM && (
        <div style={{ padding: '10px', background: '#333', position: 'sticky', top: 0, zIndex: 10, display: 'flex', gap: '10px' }}>
          <button onClick={exportLayout} style={{ cursor: 'pointer' }}>Export Layout</button>
          <button onClick={() => setActiveSheet(null)}>Back to Selection</button>
          <button onClick={lockGrid} style={{ cursor: 'pointer' }}>Lock/Unlock Grid</button>
        </div>
      )}

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
              <div className="Drag-handle">{categoryName.toUpperCase()}</div>
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
                  // Object.entries(categoryData).map(([dataName, dataData]) => {
                  //   const ComponentToRender = CATEGORY_COMPONENTS[categoryName] || NumberInput;
                  //   return (
                  //     <ComponentToRender
                  //       key={dataName}
                  //       dataName={dataName}
                  //       dataData={dataData} 
                  //       activeSheet={activeSheet} 
                  //       setActiveSheet={setActiveSheet} 
                  //     />
                  //   );
                  // })
                  <></>
                )}
              </div>
            </div>
          );
        })}
      </Responsive>
    </div>
  );
};

export default Main;