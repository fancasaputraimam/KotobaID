import { Flashcard, SRSLevel } from '../types/flashcard';

/**
 * Spaced Repetition System (SRS) Algorithm
 * Based on SuperMemo SM-2 algorithm with modifications
 */

export class SRSAlgorithm {
  // Default intervals for learning phases (in minutes/days)
  private static readonly LEARNING_INTERVALS = [1, 10, 60 * 24]; // 1 min, 10 min, 1 day
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  private static readonly MAX_EASE_FACTOR = 4.0;

  /**
   * Calculate the next review interval based on user response
   * @param card - The flashcard being reviewed
   * @param quality - User response quality (1-5)
   *   1: Salah total
   *   2: Salah tapi ingat setelah melihat jawaban
   *   3: Benar dengan susah payah
   *   4: Benar dengan mudah
   *   5: Benar sangat mudah
   * @returns Updated flashcard with new SRS values
   */
  static processReview(card: Flashcard, quality: 1 | 2 | 3 | 4 | 5): Flashcard {
    const now = new Date();
    const updatedCard: Flashcard = {
      ...card,
      lastReviewDate: now,
      totalReviews: card.totalReviews + 1,
      updatedAt: now
    };

    // Update accuracy
    if (quality >= 3) {
      updatedCard.correctAnswers = card.correctAnswers + 1;
    }
    updatedCard.accuracy = (updatedCard.correctAnswers / updatedCard.totalReviews) * 100;

    // Process based on current state
    if (card.repetitions === 0) {
      // New card or card being relearned
      return this.processNewCard(updatedCard, quality);
    } else {
      // Existing card being reviewed
      return this.processExistingCard(updatedCard, quality);
    }
  }

  private static processNewCard(card: Flashcard, quality: 1 | 2 | 3 | 4 | 5): Flashcard {
    if (quality < 3) {
      // Incorrect answer - restart learning
      card.repetitions = 0;
      card.interval = this.LEARNING_INTERVALS[0] / (60 * 24); // Convert to days
      card.easeFactor = Math.max(this.MIN_EASE_FACTOR, card.easeFactor - 0.2);
    } else {
      // Correct answer - advance in learning
      card.repetitions = 1;
      card.interval = this.LEARNING_INTERVALS[1] / (60 * 24); // 10 minutes in days
      
      if (quality === 4) {
        card.easeFactor = Math.min(this.MAX_EASE_FACTOR, card.easeFactor + 0.1);
      } else if (quality === 5) {
        card.easeFactor = Math.min(this.MAX_EASE_FACTOR, card.easeFactor + 0.15);
      }
    }

    card.nextReviewDate = this.calculateNextReviewDate(card.interval);
    return card;
  }

  private static processExistingCard(card: Flashcard, quality: 1 | 2 | 3 | 4 | 5): Flashcard {
    if (quality < 3) {
      // Incorrect answer - back to learning
      card.repetitions = 0;
      card.interval = this.LEARNING_INTERVALS[0] / (60 * 24);
      card.easeFactor = Math.max(this.MIN_EASE_FACTOR, card.easeFactor - 0.2);
    } else {
      // Correct answer - calculate new interval
      card.repetitions += 1;
      
      // Update ease factor based on quality
      const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      card.easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        Math.min(this.MAX_EASE_FACTOR, card.easeFactor + easeChange)
      );

      // Calculate new interval
      if (card.repetitions === 1) {
        card.interval = 1; // 1 day
      } else if (card.repetitions === 2) {
        card.interval = 6; // 6 days
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }

      // Ensure minimum interval of 1 day
      card.interval = Math.max(1, card.interval);
    }

    card.nextReviewDate = this.calculateNextReviewDate(card.interval);
    return card;
  }

  private static calculateNextReviewDate(intervalDays: number): Date {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Math.round(intervalDays));
    nextDate.setHours(6, 0, 0, 0); // Set to 6 AM for consistent review time
    return nextDate;
  }

  /**
   * Get the SRS level of a card based on its state
   */
  static getSRSLevel(card: Flashcard): SRSLevel {
    if (card.repetitions === 0) {
      return SRSLevel.NEW;
    }

    if (card.repetitions === 1) {
      return SRSLevel.LEARNING_1;
    }

    if (card.repetitions === 2) {
      return SRSLevel.LEARNING_2;
    }

    if (card.interval < 21) {
      return SRSLevel.YOUNG;
    }

    if (card.interval < 100) {
      return SRSLevel.MATURE;
    }

    return SRSLevel.MASTERED;
  }

  /**
   * Determine if a card is due for review
   */
  static isDueForReview(card: Flashcard): boolean {
    const now = new Date();
    return card.nextReviewDate <= now;
  }

  /**
   * Get cards that are due for review today
   */
  static getDueCards(cards: Flashcard[]): Flashcard[] {
    return cards.filter(card => this.isDueForReview(card));
  }

  /**
   * Sort cards by priority for studying
   * Priority: Overdue -> New -> Learning -> Review (by ease factor)
   */
  static sortCardsByPriority(cards: Flashcard[]): Flashcard[] {
    const now = new Date();
    
    return cards.sort((a, b) => {
      const aDaysOverdue = Math.floor((now.getTime() - a.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24));
      const bDaysOverdue = Math.floor((now.getTime() - b.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Prioritize overdue cards
      if (aDaysOverdue > 0 && bDaysOverdue <= 0) return -1;
      if (bDaysOverdue > 0 && aDaysOverdue <= 0) return 1;
      
      // Then new cards
      if (a.repetitions === 0 && b.repetitions > 0) return -1;
      if (b.repetitions === 0 && a.repetitions > 0) return 1;
      
      // Then learning cards
      if (a.repetitions < 3 && b.repetitions >= 3) return -1;
      if (b.repetitions < 3 && a.repetitions >= 3) return 1;
      
      // For review cards, prioritize harder cards (lower ease factor)
      if (a.repetitions >= 3 && b.repetitions >= 3) {
        return a.easeFactor - b.easeFactor;
      }
      
      // Default to next review date
      return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
    });
  }

  /**
   * Create a new flashcard with default SRS values
   */
  static createNewCard(
    uid: string,
    front: string,
    back: string,
    type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence',
    category: string
  ): Omit<Flashcard, 'id'> {
    const now = new Date();
    
    return {
      uid,
      front,
      back,
      type,
      category,
      difficulty: 3,
      interval: 0,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      repetitions: 0,
      nextReviewDate: now, // Available for immediate study
      lastReviewDate: now,
      totalReviews: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageResponseTime: 0,
      tags: [],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Calculate study statistics
   */
  static calculateStats(cards: Flashcard[]): {
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewCards: number;
    masteredCards: number;
    dueToday: number;
    averageAccuracy: number;
  } {
    const dueCards = this.getDueCards(cards);
    
    const stats = cards.reduce((acc, card) => {
      const level = this.getSRSLevel(card);
      
      switch (level) {
        case SRSLevel.NEW:
          acc.newCards++;
          break;
        case SRSLevel.LEARNING_1:
        case SRSLevel.LEARNING_2:
        case SRSLevel.LEARNING_3:
          acc.learningCards++;
          break;
        case SRSLevel.YOUNG:
        case SRSLevel.MATURE:
          acc.reviewCards++;
          break;
        case SRSLevel.MASTERED:
          acc.masteredCards++;
          break;
      }
      
      acc.totalAccuracy += card.accuracy;
      return acc;
    }, {
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      masteredCards: 0,
      totalAccuracy: 0
    });

    return {
      totalCards: cards.length,
      ...stats,
      dueToday: dueCards.length,
      averageAccuracy: cards.length > 0 ? stats.totalAccuracy / cards.length : 0
    };
  }
}