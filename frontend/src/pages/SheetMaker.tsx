import { useState, useCallback } from 'react';
import { DataManager, lg } from '../DataManager';
import { Responsive } from 'react-grid-layout';

function SheetMaker() {
  const dataManager = DataManager.getInstance();
  const [layout, setLayout] = useState(dataManager.getActiveSystem().sheetStructure);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayout(allLayouts);
  };

  return (
    <div className='SheetMaker'>
      {/* Navigation controls moved to main nav bar */}
      <Responsive className="Layout" layouts={layout} width={windowWidth} onLayoutChange={onLayoutChange}>
        {layout.lg.map((item: lg) => {
          return (
            <div key={item.i} className="Box">
              <div className="Drag-handle">{item.i.toUpperCase()}</div>
              <div className="Box-content">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* {systemCategory.items.map((it) => (
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
                  ))} */}
                </div>
              </div>
            </div>
          );
        })}
      </Responsive>
    </div>
  );
};

export default SheetMaker;