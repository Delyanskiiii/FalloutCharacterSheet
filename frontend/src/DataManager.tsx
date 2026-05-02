import { get } from 'http';
import { useState, useCallback } from 'react';
import G from 'react-grid-layout';

export interface CategorySelection {
  category: string;
}

export interface ItemSelection {
  category: string;
  itemName: string;
}

export interface PropertySelection {
  category: string;
  itemName: string;
  property: string;
}

export interface DiceSelection {
  dice: 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  diceMultiplier: number;
}

export interface Uses {
  category?: CategorySelection[];
  itemName?: ItemSelection[];
  tag?: string[];
}

export interface Calculation {
  property: PropertySelection[];
  formula: string;
}

export interface Property {
  name: string;
  value: number | number[] | string | string[] | CategorySelection | CategorySelection[] | ItemSelection | ItemSelection[] | PropertySelection | PropertySelection[]| DiceSelection | DiceSelection[] | Uses | Calculation;
}

export interface Item {
  name: string;
  maxTier?: number;
  properties: Property[];
}

export interface Category {
  name: string;
  propertyKeys: string[];
  items: Item[];
  showProps?: boolean;
  minimized?: boolean;
}

export interface lg {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  moved: boolean;
  static: boolean;
  isDraggable: boolean;
  isResizable: boolean;
}

export interface layout {
  lg: lg[];
  md?: lg[];
  sm?: lg[];
  xs?: lg[];
  xxs?: lg[];
}

export interface CharacterSheet {
  type: 'sheet';
  system: string;
  name: string;
  sheetStructure: layout;
}

export interface GameSystem {
  type: 'system';
  name: string;
  categories: Category[];
  tags: string[];
  sheetStructure: layout;
}

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.local');

export class DataManager {
  private static instance: DataManager;
  private activeSystem: GameSystem = this.getMockSystem();

  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  public getMockSystem(): GameSystem {
    return {name: 'MockSystem', type: 'system', categories: [], tags: [], sheetStructure: {lg: [{"i": "Sample Window","x": 0,"y": 0,"w": 1,"h": 1,"moved": false,"static": false,"isDraggable": true,"isResizable": true}]}};
  }

  public isLocalhost(): boolean {
    return isLocalhost;
  }

  public getActiveSystem(): GameSystem {
    return this.activeSystem;
  }

  public setActiveSystem(game: GameSystem): void {
    this.activeSystem = game;
    this.setCurrentSystem(game.name).catch((error) => {
      console.error('Error setting current system on server:', error);
    });
  }

  public setActiveSystemName(name: string): void {
    this.activeSystem.name = name;
  }

  private validateGameSystem(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push('Data must be an object');
      return { valid: false, errors };
    }

    // Check required root fields
    if (data.type !== 'system') {
      errors.push(`Expected type 'system', got '${data.type}'`);
    }

    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Name must be a non-empty string');
    }

    if (!Array.isArray(data.categories)) {
      errors.push('Categories must be an array');
    } else {
      // Validate each category
      data.categories.forEach((category: any, idx: number) => {
        if (!category.name || typeof category.name !== 'string') {
          errors.push(`Category[${idx}]: name must be a non-empty string`);
        }
        if (!Array.isArray(category.propertyKeys)) {
          errors.push(`Category[${idx}] '${category.name}': propertyKeys must be an array`);
        }
        if (!Array.isArray(category.items)) {
          errors.push(`Category[${idx}] '${category.name}': items must be an array`);
        }
      });
    }

    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    }

    if (!Array.isArray(data.sheetStructure)) {
      errors.push('Sheet structure must be an array');
    } else {
      // Validate each window in sheet
      data.sheetStructure.forEach((window: any, idx: number) => {
        if (typeof window.i !== 'string') {
          errors.push(`Sheet[${idx}]: window id (i) must be a string`);
        }
        if (typeof window.x !== 'number' || typeof window.y !== 'number') {
          errors.push(`Sheet[${idx}]: x and y must be numbers`);
        }
        if (typeof window.w !== 'number' || typeof window.h !== 'number') {
          errors.push(`Sheet[${idx}]: w and h must be numbers`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  async getAllSystems(): Promise<GameSystem[]> {
    try {
      const res = await fetch('/api/systems')
      if (!res.ok) throw new Error('Failed to fetch systems')
      return await res.json()
    } catch (error) {
      throw new Error(`Unable to load systems: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async saveSystem(): Promise<void> {
    try {
      if (this.activeSystem == null) throw new Error('No active system set in DataManager')
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.activeSystem)
      })
      if (!res.ok) throw new Error('Failed to save system')
    } catch (error) {
      throw new Error(`Unable to save system: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getCurrentSystem(): Promise<{ currentSystemName: string | null; system: GameSystem | null }> {
    try {
      const res = await fetch('/api/system/current')
      if (!res.ok) throw new Error('Failed to fetch current system')
      return await res.json()
    } catch (error) {
      throw new Error(`Unable to load current system: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async setCurrentSystem(name: string | null): Promise<void> {
    try {
      const res = await fetch('/api/system/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error('Failed to set current system')
      await res.json()
    } catch (error) {
      throw new Error(`Unable to set current system: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getCharactersForCurrentSystem(): Promise<CharacterSheet[]> {
    try {
      const res = await fetch('/api/characters')
      if (!res.ok) throw new Error('Failed to fetch characters')
      return await res.json()
    } catch (error) {
      throw new Error(`Unable to load characters: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async saveCharacter(character: CharacterSheet): Promise<void> {
    try {
      const res = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character)
      })
      if (!res.ok) throw new Error('Failed to save character')
      await res.json()
    } catch (error) {
      throw new Error(`Unable to save character: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}