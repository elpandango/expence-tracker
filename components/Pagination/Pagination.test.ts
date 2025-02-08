import {mount} from '@vue/test-utils';
import {describe, it, expect} from 'vitest';
import {nextTick} from 'vue';
import Pagination from './Pagination.vue';
import BaseButton from '~/components/Buttons/BaseButton.vue';
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

describe('Pagination.vue', () => {
  it('should display the correct page buttons', async () => {
    const wrapper = mount(Pagination, {
      props: {
        data: {
          currentPage: 1,
          hasNextPage: true,
          hasPrevPage: false,
          lastPage: 5,
          nextPage: 2,
          previousPage: 0,
          totalItems: 100,
          posts: []
        }
      }
    });

    const pageButtons = wrapper.findAllComponents(BaseButton);

    expect(pageButtons.length).toBeGreaterThan(0);

    expect(pageButtons[0].attributes()).toHaveProperty('disabled');

    expect(pageButtons[pageButtons.length - 1].attributes()).not.toHaveProperty('disabled');
  });

  it('should emit "page-changed" when page button clicked', async () => {
    const wrapper = mount(Pagination, {
      props: {
        data: {
          currentPage: 1,
          hasNextPage: true,
          hasPrevPage: false,
          lastPage: 5,
          nextPage: 2,
          previousPage: 0,
          totalItems: 100,
          posts: []
        }
      }
    });

    const paginationButtons = wrapper.findAllComponents(BaseButton);

    await paginationButtons[2].trigger('click');

    expect(wrapper.emitted('page-changed')[0]).toEqual([2]);
  });

  it('should show the correct number of pages on mobile', async() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
    });

    const wrapper = mount(Pagination, {
      props: {
        data: {
          currentPage: 3,
          hasNextPage: true,
          hasPrevPage: true,
          lastPage: 5,
          nextPage: 4,
          previousPage: 2,
          totalItems: 100,
          posts: []
        }
      }
    });

    const pageButtons = wrapper.findAllComponents(BaseButton);

    expect(pageButtons.length).toBe(5);
  });
});