import { describe, expect, it } from 'vitest';
import { inferCategoryOptionByDescription } from '~/utils/categoryHelpers';
import type { CategoryOption } from '~/types/categories';

const categories: CategoryOption[] = [
  { name: 'Food', rawName: 'Food', label: 'Food' },
  { name: 'Rental Bill', rawName: 'Rental Bill', label: 'Rental Bill' },
  { name: 'Technology', rawName: 'Technology', label: 'Technology' },
];

describe('inferCategoryOptionByDescription', () => {
  it('matches a category by normalized description keyword', () => {
    const result = inferCategoryOptionByDescription('Покупка в Lidl, хлеб и бананы.', categories);

    expect(result).toEqual(categories[0]);
  });

  it('matches category names through rawName when present', () => {
    const result = inferCategoryOptionByDescription('Оплата Vodafone internet', categories);

    expect(result).toEqual(categories[1]);
  });

  it('returns null when description is empty after normalization', () => {
    expect(inferCategoryOptionByDescription('   ', categories)).toBeNull();
  });

  it('returns null when no matching category option exists in provided list', () => {
    const result = inferCategoryOptionByDescription('ChatGPT monthly subscription', [categories[0]]);

    expect(result).toBeNull();
  });

  it('returns null when keywords are absent', () => {
    const result = inferCategoryOptionByDescription('Random transfer without hints', categories);

    expect(result).toBeNull();
  });
});
