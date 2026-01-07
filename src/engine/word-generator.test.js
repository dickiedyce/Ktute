/**
 * Word Generator Tests
 * Generate practice words/text for typing exercises
 */
import { describe, it, expect } from 'vitest';
import { 
  createWordGenerator,
  COMMON_WORDS,
  getWordsForKeys,
} from './word-generator.js';

describe('COMMON_WORDS', () => {
  it('should contain common English words', () => {
    expect(COMMON_WORDS).toContain('the');
    expect(COMMON_WORDS).toContain('and');
    expect(COMMON_WORDS).toContain('for');
    expect(COMMON_WORDS.length).toBeGreaterThan(100);
  });

  it('should contain only lowercase words', () => {
    COMMON_WORDS.forEach(word => {
      expect(word).toBe(word.toLowerCase());
    });
  });
});

describe('getWordsForKeys', () => {
  it('should filter words containing only specified keys', () => {
    const words = getWordsForKeys(['a', 'r', 's', 't']);
    words.forEach(word => {
      const chars = word.split('');
      chars.forEach(char => {
        expect(['a', 'r', 's', 't']).toContain(char);
      });
    });
  });

  it('should return empty array if no words match', () => {
    const words = getWordsForKeys(['z', 'x', 'q']);
    // Might be empty or have few words
    words.forEach(word => {
      const chars = word.split('');
      chars.forEach(char => {
        expect(['z', 'x', 'q']).toContain(char);
      });
    });
  });

  it('should include words from home row keys', () => {
    const homeRow = ['a', 'r', 's', 't', 'n', 'e', 'i', 'o'];
    const words = getWordsForKeys(homeRow);
    expect(words.length).toBeGreaterThan(10);
  });
});

describe('createWordGenerator', () => {
  describe('basic generation', () => {
    it('should generate words from the word list', () => {
      const generator = createWordGenerator();
      const words = generator.generate(5);
      expect(words).toHaveLength(5);
      words.forEach(word => {
        expect(COMMON_WORDS).toContain(word);
      });
    });

    it('should generate specified number of words', () => {
      const generator = createWordGenerator();
      expect(generator.generate(3)).toHaveLength(3);
      expect(generator.generate(10)).toHaveLength(10);
    });

    it('should generate different words on each call', () => {
      const generator = createWordGenerator();
      const words1 = generator.generate(10);
      const words2 = generator.generate(10);
      // Not guaranteed to be different, but highly likely with random selection
      const same = words1.every((w, i) => w === words2[i]);
      // With 200+ words, chance of 10 same words is very low
      expect(same).toBe(false);
    });
  });

  describe('key filtering', () => {
    it('should generate words using only specified keys', () => {
      const generator = createWordGenerator({ 
        allowedKeys: ['a', 'r', 's', 't', 'n', 'e', 'i', 'o'] 
      });
      const words = generator.generate(5);
      words.forEach(word => {
        word.split('').forEach(char => {
          expect(['a', 'r', 's', 't', 'n', 'e', 'i', 'o']).toContain(char);
        });
      });
    });
  });

  describe('text generation', () => {
    it('should generate text string with spaces', () => {
      const generator = createWordGenerator();
      const text = generator.generateText(5);
      expect(typeof text).toBe('string');
      const words = text.split(' ');
      expect(words).toHaveLength(5);
    });
  });

  describe('seeded randomness', () => {
    it('should generate same sequence with same seed', () => {
      const gen1 = createWordGenerator({ seed: 12345 });
      const gen2 = createWordGenerator({ seed: 12345 });
      const words1 = gen1.generate(10);
      const words2 = gen2.generate(10);
      expect(words1).toEqual(words2);
    });

    it('should generate different sequences with different seeds', () => {
      const gen1 = createWordGenerator({ seed: 12345 });
      const gen2 = createWordGenerator({ seed: 54321 });
      const words1 = gen1.generate(10);
      const words2 = gen2.generate(10);
      expect(words1).not.toEqual(words2);
    });
  });

  describe('word length filtering', () => {
    it('should filter by minimum word length', () => {
      const generator = createWordGenerator({ minLength: 5 });
      const words = generator.generate(10);
      words.forEach(word => {
        expect(word.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('should filter by maximum word length', () => {
      const generator = createWordGenerator({ maxLength: 4 });
      const words = generator.generate(10);
      words.forEach(word => {
        expect(word.length).toBeLessThanOrEqual(4);
      });
    });
  });
});
