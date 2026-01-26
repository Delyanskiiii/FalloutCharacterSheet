export interface Special {
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  inteligence: number;
  agility: number;
  luck: number;
}

export interface CharacterSheet {
  name: string;
  race: string;
  background: string;
  level: number;
  special: Special;
  weapons: string[];
  armor: string[];
  items: string[];
  traits: string[];
  perks: string[];
  caps: number;
  notes: string;
}