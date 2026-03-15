// Interface base used for all items in the game.
// To be used only throughout the app, manual creation of items is not recommended.
// More properties can be added as needed.

export interface Item {
  // Base properties
  id: number;
  name: string;

  // Every property below name can be set uniquely for every tier of the item
  tiers?: number;

  // Propertie for maximum number of times the item can be owned
  maxRepeats?: number;

  // General properties
  description?: string;
  requirements?: Requirement[];
  tags?: string[];
  affects?: Affect[];
  usedBy?: number[];

  // Properties for physical items
  priceCost?: number;
  useCost?: number;
  weight?: number;
  repairDifficultyCheck?: number;
  repairTime?: number;
  maxUpgrades?: number;
  upgrades?: string[];
  upgradeDifficultyCheck?: number;
  upgradeTime?: number;

  // Weapon based properties
  damage?: string;
  criticalHit?: CriticalHit[];
  reload?: string;
  range?: string;

  // Armor based properties
  equipTime?: number;
  defencePoints?: number;
  damageThreshold?: number;
  armorClass?: number;
  loadWorn?: number;
}

interface Requirement {
  property: keyof Item;
  affection: 'equal' | 'less' | 'more';
  value: string;
}

interface Affect {
  property: keyof Item;
  value: string | number;
}

interface CriticalHit {
  extraDice: keyof typeof DICE[];
  damageMultiplier: number;
}

const DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];