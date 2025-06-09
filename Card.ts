export interface Card {
  id: number;
  name: string;
  cost: number;
  damage: number;
  health: number;
  type: 'troop' | 'spell' | 'building';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  image: string;
}

export const CARDS: Card[] = [
  {
    id: 1,
    name: 'Knight',
    cost: 3,
    damage: 137,
    health: 1344,
    type: 'troop',
    rarity: 'common',
    description: 'A tough melee fighter',
    image: '🛡️'
  },
  {
    id: 2,
    name: 'Archers',
    cost: 3,
    damage: 127,
    health: 304,
    type: 'troop',
    rarity: 'common',
    description: 'A pair of lightly armored ranged attackers',
    image: '🏹'
  },
  {
    id: 3,
    name: 'Fireball',
    cost: 4,
    damage: 572,
    health: 0,
    type: 'spell',
    rarity: 'rare',
    description: 'Annihilates hordes of enemies with explosive damage',
    image: '🔥'
  },
  {
    id: 4,
    name: 'Giant',
    cost: 5,
    damage: 211,
    health: 3275,
    type: 'troop',
    rarity: 'rare',
    description: 'Slow but durable, only attacks buildings',
    image: '👹'
  },
  {
    id: 5,
    name: 'Wizard',
    cost: 5,
    damage: 340,
    health: 598,
    type: 'troop',
    rarity: 'rare',
    description: 'The most awesome man to ever set foot in the arena',
    image: '🧙‍♂️'
  },
  {
    id: 6,
    name: 'Dragon',
    cost: 4,
    damage: 310,
    health: 1070,
    type: 'troop',
    rarity: 'epic',
    description: 'Flying troop that attacks both air and ground',
    image: '🐲'
  },
  {
    id: 7,
    name: 'Lightning',
    cost: 6,
    damage: 864,
    health: 0,
    type: 'spell',
    rarity: 'epic',
    description: 'Strikes the 3 enemies with the highest HP',
    image: '⚡'
  },
  {
    id: 8,
    name: 'Prince',
    cost: 5,
    damage: 633,
    health: 1615,
    type: 'troop',
    rarity: 'epic',
    description: 'Don\'t let the little pony fool you',
    image: '🤴'
  }
];