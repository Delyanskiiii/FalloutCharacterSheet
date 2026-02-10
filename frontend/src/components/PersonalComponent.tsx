import { Dispatch, SetStateAction } from 'react';
import { CharacterSheet } from '../types';

const PersonalComponent = ({dataName, dataData, activeSheet, setActiveSheet}: {dataName: string, dataData: number, activeSheet: CharacterSheet, setActiveSheet: Dispatch<SetStateAction<CharacterSheet>>}) => {
  return (
    <div style={styles.dataRow}>
      <label style={styles.dataLabel}>{dataName}:</label>
      <input 
        type="text" 
        style={styles.dataInput}
        value={dataData || ""} 
        onChange={(e) => {
          setActiveSheet({
            ...activeSheet,
            personal: {
              ...activeSheet.personal,
              [dataName]: parseInt(e.target.value)
            }
          });
        }}
      />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  dataRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 10px',
    width: '100%',
    boxSizing: 'border-box',
  },
  dataLabel: {
    color: '#00ff00',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  dataInput: {
    flexGrow: 1,
    background: 'rgba(0, 40, 0, 0.3)',
    border: 'none',
    borderBottom: '1px solid #00ff00',
    color: '#00ff00',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '14px',
    outline: 'none',
    padding: '2px 5px',
  }
};

export default PersonalComponent;