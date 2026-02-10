import { Dispatch, SetStateAction } from 'react';
import { CharacterSheet } from '../types';

const NumberInput = ({dataName, dataData, activeSheet, setActiveSheet}: {dataName: string, dataData: number, activeSheet: CharacterSheet, setActiveSheet: Dispatch<SetStateAction<CharacterSheet>>}) => {
  return (
    <div className="number-input">
      <label>{dataName.toUpperCase()}</label>
      <input
        type="number"
        value={dataData}
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
    </div>
  );
}
export default NumberInput;