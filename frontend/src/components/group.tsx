// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SAVED_LAYOUT_KEY = 'user-character-sheet-layout';

const FullScreenGrid = () => {
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
          <div style={{ padding: '10px' }}>Content C</div>
        </div>
      </Responsive>
    </div>
  );
};

export default FullScreenGrid;