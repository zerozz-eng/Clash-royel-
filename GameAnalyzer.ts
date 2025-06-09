import { GameState, BotRecommendation, Position, Unit } from '../models/GameState';
import { Card, CARDS } from '../models/Card';

export class GameAnalyzer {
  private gameState: GameState | null = null;
  private lastAnalysis: number = 0;
  private analysisInterval: number = 100; // 100ms analysis interval

  analyzeGameState(gameState: GameState): BotRecommendation[] {
    this.gameState = gameState;
    const recommendations: BotRecommendation[] = [];

    // Critical defense analysis
    const defenseRecommendation = this.analyzeDefense();
    if (defenseRecommendation) {
      recommendations.push(defenseRecommendation);
    }

    // Attack opportunity analysis
    const attackRecommendation = this.analyzeAttackOpportunity();
    if (attackRecommendation) {
      recommendations.push(attackRecommendation);
    }

    // Elixir management
    const elixirRecommendation = this.analyzeElixirManagement();
    if (elixirRecommendation) {
      recommendations.push(elixirRecommendation);
    }

    // Counter play analysis
    const counterRecommendation = this.analyzeCounterPlay();
    if (counterRecommendation) {
      recommendations.push(counterRecommendation);
    }

    return recommendations.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  private analyzeDefense(): BotRecommendation | null {
    if (!this.gameState) return null;

    const enemyUnits = this.gameState.units.filter(u => u.isEnemy);
    const myTowers = this.gameState.towers.filter(t => !t.isEnemy);

    // Check for immediate threats
    for (const tower of myTowers) {
      const threateningUnits = enemyUnits.filter(unit => 
        this.getDistance(unit.position, tower.position) < 5 && 
        unit.health > 0
      );

      if (threateningUnits.length > 0) {
        const bestDefenseCard = this.findBestDefenseCard(threateningUnits);
        if (bestDefenseCard) {
          const optimalPosition = this.calculateOptimalDefensePosition(threateningUnits, tower.position);
          return {
            action: 'play_card',
            cardId: bestDefenseCard.id,
            position: optimalPosition,
            priority: 'critical',
            reason: `Defend ${tower.type} tower from ${threateningUnits.length} enemy units`,
            confidence: 0.95
          };
        }
      }
    }

    return null;
  }

  private analyzeAttackOpportunity(): BotRecommendation | null {
    if (!this.gameState) return null;

    const enemyTowers = this.gameState.towers.filter(t => t.isEnemy);
    const myUnits = this.gameState.units.filter(u => !u.isEnemy);

    // Look for weak enemy towers
    const weakTower = enemyTowers.find(t => t.health < t.maxHealth * 0.3);
    if (weakTower && this.gameState.elixir >= 4) {
      const attackCard = this.findBestAttackCard();
      if (attackCard) {
        const attackPosition = this.calculateOptimalAttackPosition(weakTower.position);
        return {
          action: 'play_card',
          cardId: attackCard.id,
          position: attackPosition,
          priority: 'high',
          reason: `Attack weak ${weakTower.type} tower (${Math.round(weakTower.health/weakTower.maxHealth*100)}% HP)`,
          confidence: 0.85
        };
      }
    }

    // Check for elixir advantage
    if (this.gameState.elixir > this.gameState.enemyElixir + 2) {
      const pushCard = this.findBestPushCard();
      if (pushCard) {
        return {
          action: 'play_card',
          cardId: pushCard.id,
          position: this.calculatePushPosition(),
          priority: 'medium',
          reason: `Elixir advantage push (${this.gameState.elixir} vs ${this.gameState.enemyElixir})`,
          confidence: 0.75
        };
      }
    }

    return null;
  }

  private analyzeElixirManagement(): BotRecommendation | null {
    if (!this.gameState) return null;

    // Don't waste elixir
    if (this.gameState.elixir >= 9) {
      const cheapCard = this.findCheapestPlayableCard();
      if (cheapCard) {
        return {
          action: 'play_card',
          cardId: cheapCard.id,
          position: this.calculateSafePosition(),
          priority: 'medium',
          reason: 'Prevent elixir waste (9+ elixir)',
          confidence: 0.6
        };
      }
    }

    // Wait for better opportunity
    if (this.gameState.elixir < 4 && this.gameState.units.filter(u => u.isEnemy).length === 0) {
      return {
        action: 'wait',
        priority: 'low',
        reason: 'Build elixir advantage',
        confidence: 0.7
      };
    }

    return null;
  }

  private analyzeCounterPlay(): BotRecommendation | null {
    if (!this.gameState) return null;

    const enemyUnits = this.gameState.units.filter(u => u.isEnemy);
    
    // Identify enemy push composition
    const enemyPush = this.identifyEnemyPush(enemyUnits);
    if (enemyPush.length > 0) {
      const counterCard = this.findBestCounter(enemyPush);
      if (counterCard) {
        return {
          action: 'play_card',
          cardId: counterCard.id,
          position: this.calculateCounterPosition(enemyPush),
          priority: 'high',
          reason: `Counter enemy push with ${counterCard.name}`,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  private findBestDefenseCard(threats: Unit[]): Card | null {
    const availableCards = this.gameState!.hand.map(id => CARDS.find(c => c.id === id)!);
    const affordableCards = availableCards.filter(card => card.cost <= this.gameState!.elixir);

    // Prioritize area damage for swarms
    if (threats.length > 2) {
      const aoeCards = affordableCards.filter(card => 
        card.type === 'spell' || card.name.includes('Wizard') || card.name.includes('Dragon')
      );
      if (aoeCards.length > 0) {
        return aoeCards.sort((a, b) => b.damage - a.damage)[0];
      }
    }

    // Single target high damage
    return affordableCards.sort((a, b) => (b.damage + b.health) - (a.damage + a.health))[0] || null;
  }

  private findBestAttackCard(): Card | null {
    const availableCards = this.gameState!.hand.map(id => CARDS.find(c => c.id === id)!);
    const affordableCards = availableCards.filter(card => card.cost <= this.gameState!.elixir);

    // Prioritize high damage units
    const attackCards = affordableCards.filter(card => 
      card.type === 'troop' && card.damage > 200
    );

    return attackCards.sort((a, b) => b.damage - a.damage)[0] || null;
  }

  private findBestPushCard(): Card | null {
    const availableCards = this.gameState!.hand.map(id => CARDS.find(c => c.id === id)!);
    const affordableCards = availableCards.filter(card => card.cost <= this.gameState!.elixir);

    // Prioritize tanky units for push
    return affordableCards.sort((a, b) => b.health - a.health)[0] || null;
  }

  private findCheapestPlayableCard(): Card | null {
    const availableCards = this.gameState!.hand.map(id => CARDS.find(c => c.id === id)!);
    const affordableCards = availableCards.filter(card => card.cost <= this.gameState!.elixir);

    return affordableCards.sort((a, b) => a.cost - b.cost)[0] || null;
  }

  private findBestCounter(enemyUnits: Unit[]): Card | null {
    const availableCards = this.gameState!.hand.map(id => CARDS.find(c => c.id === id)!);
    const affordableCards = availableCards.filter(card => card.cost <= this.gameState!.elixir);

    // Simple counter logic - can be expanded
    if (enemyUnits.some(u => u.health > 2000)) {
      // Counter tanks with high DPS
      return affordableCards.find(c => c.damage > 300) || affordableCards[0];
    }

    return affordableCards[0] || null;
  }

  private calculateOptimalDefensePosition(threats: Unit[], towerPos: Position): Position {
    // Calculate center point of threats
    const centerX = threats.reduce((sum, u) => sum + u.position.x, 0) / threats.length;
    const centerY = threats.reduce((sum, u) => sum + u.position.y, 0) / threats.length;

    // Position between threats and tower
    return {
      x: (centerX + towerPos.x) / 2,
      y: (centerY + towerPos.y) / 2
    };
  }

  private calculateOptimalAttackPosition(towerPos: Position): Position {
    // Position in front of enemy tower
    return {
      x: towerPos.x,
      y: towerPos.y + (towerPos.y > 0 ? -2 : 2)
    };
  }

  private calculatePushPosition(): Position {
    // Standard bridge position
    return { x: 0, y: -2 };
  }

  private calculateSafePosition(): Position {
    // Back of arena
    return { x: 0, y: 4 };
  }

  private calculateCounterPosition(enemyUnits: Unit[]): Position {
    const centerX = enemyUnits.reduce((sum, u) => sum + u.position.x, 0) / enemyUnits.length;
    const centerY = enemyUnits.reduce((sum, u) => sum + u.position.y, 0) / enemyUnits.length;

    return { x: centerX, y: centerY + 1 };
  }

  private identifyEnemyPush(enemyUnits: Unit[]): Unit[] {
    // Group units that are close together (push formation)
    return enemyUnits.filter(unit => 
      enemyUnits.some(other => 
        other !== unit && this.getDistance(unit.position, other.position) < 3
      )
    );
  }

  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}