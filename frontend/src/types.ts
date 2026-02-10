export interface Ability {
  name: string;
  value: number;
  min: number;
  max: number;
  modifier: number;
}

export interface Skill {
  name: string;
  dependencies: string[];
  value: number;
}

export interface Perk {
  name: string;
  reqirements: string[];
  description: string;
  value: {

  }
  variant: boolean;
  variantDescription: string;
  variantValue: number;

}

export interface Item {
  name: string;
  data: {
    value: number;
    modifier: number;
  }
}

export interface Personal {
  name: string;
  race: string;
  raceVariant: string;
  background: string;
  level: number;
}

export interface Special {
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  inteligence: number;
  agility: number;
  luck: number;
}

export interface Skills {
  weapons: string[];
  armor: string[];
  items: string[];
  traits: string[];
  perks: string[];
  caps: number;
  notes: string;
}

export interface Trait {
  Name: string;
  Prerequisite: string;
  Description: string;
  WildWasteland: string;
}

export interface CharacterSheet {
  personal: Personal;
  special: Special;
  skills: Skills;
  traits: Trait[];
}