export interface Position {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  cardId: number;
  position: Position;
  health: number;
  maxHealth: number;
  isEnemy: boolean;
  target?: Position;
  level: number;
}

export interface Tower {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  isEnemy: boolean;
  type: 'king' | 'princess';
}

export interface GameState {
  elixir: number;
  enemyElixir: number;
  hand: number[];
  nextCard: number;
  units: Unit[];
  towers: Tower[];
  gameTime: number;
  isMyTurn: boolean;
  matchType: 'ladder' | 'tournament' | 'challenge';
}

export interface BotRecommendation {
  action: 'play_card' | 'wait' | 'defend' | 'attack';
  cardId?: number;
  position?: Position;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  confidence: number;
}