import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CharacterSheet } from '../types';
import Papa from 'papaparse';
import { Trait } from '../types';

const TraitsComponent = ({dataName, dataData, activeSheet, setActiveSheet}: {dataName: string, dataData: number, activeSheet: CharacterSheet, setActiveSheet: Dispatch<SetStateAction<CharacterSheet>>}) => {
  // const [progressionTable, setProgressionTable] = useState<any[]>([]);
  // const [isOpen, setIsOpen] = useState(false);
  // const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  // const [myTraits, setMyTraits] = useState<Trait[]>([]);

  // const handleAddTrait = () => {
  //   if (selectedTrait && !myTraits.find(t => t.Name === selectedTrait.Name)) {
  //     setMyTraits([...myTraits, selectedTrait]);
  //     setIsOpen(false);
  //     setSelectedTrait(null);
  //   }
  // };

  // useEffect(() => {
  //   fetch('../spreadsheets/traits.csv')
  //     .then(response => response.text())
  //     .then(csvString => {
  //       Papa.parse(csvString, {
  //         header: true,
  //         skipEmptyLines: true,
  //         delimiter: ";",
  //         complete: (results) => {
  //           setProgressionTable(results.data);
  //           console.log('progressionTable', progressionTable);
  //         }
  //       });
  //     });
  // }, []);
  
  // const traitsList = progressionTable.map((row: any) => ({
  //   Name: row.Name,
  //   Prerequisite: row.Prerequisite,
  //   Description: row.Description,
  //   WildWasteland: row.WildWasteland
  // }))
  // const getLevelData = (lvl: number) => {
  //   return progressionTable.find(row => parseInt(row.Level) === lvl);
  // };

  // const [isBrowsing, setIsBrowsing] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");

  // const filteredTraits = traitsList.filter(t => 
  //   t.Name.includes(searchTerm)
  // );

  // const toggleTrait = (trait: Trait) => {
  //   if (myTraits.find(t => t.Name === trait.Name)) {
  //     setMyTraits(myTraits.filter(t => t.Name !== trait.Name));
  //   } else {
  //     setMyTraits([...myTraits, trait]);
  //   }
  // };
  
  
  // return (
  //   <div style={traitStyles.container} onMouseDown={(e) => e.stopPropagation()}>
  //     <button 
  //       style={{ color: '#00ff00', background: 'transparent', border: '1px solid #00ff00', cursor: 'pointer' }}
  //       onClick={() => setIsBrowsing(!isBrowsing)}
  //     >
  //       {isBrowsing ? "<- BACK TO MY TRAITS" : "+ ADD TRAIT"}
  //     </button>

  //     {isBrowsing && (
  //       <input 
  //         style={traitStyles.searchBar}
  //         placeholder="SEARCH TRAITS..."
  //         value={searchTerm}
  //         onChange={(e) => setSearchTerm(e.target.value)}
  //       />
  //     )}

  //     <div style={traitStyles.scrollArea} className="custom-scrollbar">
  //       {(isBrowsing ? filteredTraits : myTraits).map((trait) => (
  //         <div 
  //           key={trait.Name} 
  //           style={{
  //             ...traitStyles.traitCard,
  //             borderColor: myTraits.find(t => t.Name === trait.Name) ? '#00ff00' : '#004400'
  //           }}
  //           onClick={() => isBrowsing && toggleTrait(trait)}
  //         >
  //           <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
  //             <span>{trait.Name}</span>
  //             <span style={{ fontSize: '0.8em', opacity: 0.7 }}>[{trait.Prerequisite}]</span>
  //           </div>
  //           <div style={{ fontSize: '0.85em', marginTop: '4px' }}>{trait.Description}</div>
            
  //           {trait.WildWasteland && (
  //             <div style={traitStyles.wildWastelandText}>
  //               WILD WASTELAND: {trait.WildWasteland}
  //             </div>
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  const [table, setTable] = useState<any[]>([]);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    setStatus("Fetching file...");
    fetch('/spreadsheets/traits.csv') // Must be in public/spreadsheets/traits.csv
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(csv => {
        setStatus("Parsing CSV...");
        Papa.parse(csv, {
          header: true,
          delimiter: ";",
          skipEmptyLines: true,
          complete: (results) => {
            console.log("Full Results:", results);
            // Slicing 1 to skip your instruction row
            const data = results.data.slice(1);
            setTable(data);
            setStatus(data.length > 0 ? "Ready" : "Empty Data Array");
          }
        });
      })
      .catch(err => setStatus(`Error: ${err.message}`));
  }, []);

  return (
    <div style={{ color: '#00ff00', fontFamily: 'monospace' }}>
      <div>System Status: {status}</div>
      <div>Items Loaded: {table.length}</div>
      <hr />
      {table.length > 0 ? (
        table.map((t, i) => <div key={i}>{t.Name}</div>)
      ) : (
        <div>No traits to display.</div>
      )}
    </div>
  );
}

const traitStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    height: '100%',
    fontFamily: '"Courier New", Courier, monospace',
  },
  traitCard: {
    border: '1px solid #00ff00',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    cursor: 'pointer',
  },
  searchBar: {
    width: '100%',
    background: 'transparent',
    border: '1px solid #00ff00',
    color: '#00ff00',
    padding: '5px',
    marginBottom: '10px',
    outline: 'none',
  },
  scrollArea: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: '300px', // Adjust based on your box height
    paddingRight: '5px',
  },
  wildWastelandText: {
    color: '#00ffff',
    fontSize: '0.9em',
    marginTop: '5px',
    borderTop: '1px dashed #00ffff',
    paddingTop: '5px'
  }
};

export default TraitsComponent;