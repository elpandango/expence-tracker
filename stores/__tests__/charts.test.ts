import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';
import {useChartStore} from '~/stores/charts';
import repositoryFactory from "~/repositories/repositoryFactory";

vi.mock('~/repositories/repositoryFactory');

describe('Charts Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial chart data as null', () => {
    const store = useChartStore();

    expect(store.chartDataByType.allTransactions).toBeNull();
    expect(store.chartDataByType.topCategories).toBeNull();
    expect(store.chartDataByType.allCategories).toBeNull();
    expect(store.chartDataByType.cashAndCards).toBeNull();
  });

  it('should fetch chart data and return it', async () => {
    const store = useChartStore();
    const mockData = { someKey: 'someValue' };

    repositoryFactory.get.mockReturnValue({
      getChartsData: vi.fn().mockResolvedValue(mockData),
    });

    const result = await store.getChartsData('some query');

    expect(result).toEqual(mockData);

    expect(repositoryFactory.get).toHaveBeenCalledWith('Charts');
    expect(repositoryFactory.get('Charts').getChartsData).toHaveBeenCalledWith('some query');
  });
});