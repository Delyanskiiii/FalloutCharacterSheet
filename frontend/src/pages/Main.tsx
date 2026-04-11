import React, { useState, Dispatch, SetStateAction } from 'react';
import { Responsive } from 'react-grid-layout';
import * as Data from '../data';
import { CharacterSheet, Special } from '../types';
import NumberInput from '../components/NumberInput';
import SpecialComponent from '../components/SpecialComponent';
import PersonalComponent from '../components/PersonalComponent';
import SkillsComponent from '../components/SkillsComponent';
import TraitsComponent from '../components/TraitsComponent';
import NotesComponent from '../components/NotesComponent';

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
  lockGrid
}: {
  activeSheet: CharacterSheet | null, 
  setActiveSheet: Dispatch<SetStateAction<CharacterSheet | null>>, 
  saveSheet: () => void,
  layout: any,
  setLayout: Dispatch<SetStateAction<any>>,
  isDM: boolean,
  lockGrid: () => void
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
      </Responsive>
    </div>
  );
};

export default Main;