import { Dispatch, SetStateAction } from 'react';
import { CharacterSheet } from '../types';

const SpecialComponent = ({dataName, dataData, activeSheet, setActiveSheet}: {dataName: string, dataData: number, activeSheet: CharacterSheet, setActiveSheet: Dispatch<SetStateAction<CharacterSheet>>}) => {
  const modifier = dataData - 5;
  const modDisplay = modifier >= 0 ? `+${modifier}` : modifier;

  return (
    <div style={styles.container}>
      <div style={styles.bigLetter}>{dataName.charAt(0).toUpperCase()}</div>
      <div style={styles.fullName}>{dataName}</div>

      <input
        type="number"
        value={dataData}
        min={1}
        max={10}
        style={styles.scoreBox}
        onChange={(e) => {
          setActiveSheet({
            ...activeSheet,
            special: {
              ...activeSheet.special,
              [dataName]: parseInt(e.target.value)
            }
          });
        }} 
      />

      <div style={styles.modifierBox}>
        {modDisplay}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #00ff00',
    backgroundColor: '#050505',
    color: '#00ff00',
    fontFamily: 'monospace',
    width: '80px',
  },
  bigLetter: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    lineHeight: '1',
    fontFamily: '"Courier New", Courier, monospace',
  },
  fullName: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontFamily: '"Courier New", Courier, monospace',
  },
  scoreBox: {
    width: '50px',
    height: '40px',
    border: '2px solid #00ff00',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    outline: 'none',
    appearance: 'none',
    fontFamily: '"Courier New", Courier, monospace',
  },
  modifierBox: {
    width: '35px',
    height: '25px',
    border: '1px solid #00ff00',
    borderTop: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.9rem',
    backgroundColor: '#004400',
    color: '#fff',
    fontFamily: '"Courier New", Courier, monospace',
  }
};

export default SpecialComponent;