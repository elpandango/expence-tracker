import {mount} from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import AvatarDropdown from './AvatarDropdown.vue';
import { useUserStore } from '~/stores/user';
import { useAuthStore } from '~/stores/auth';

vi.mock('~/stores/user', () => ({
  useUserStore: vi.fn(),
}));

vi.mock('~/components/LanguageMenu/LanguageMenu.vue', () => ({
  default: {
    name: 'LanguageMenu',
    template: '<div class="language-menu-stub" />',
  },
}));

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    logout: vi.fn().mockResolvedValue(),
  }),
}));

describe('AvatarDropdown.vue', () => {
  beforeEach(() => {
    const logout = vi.fn().mockResolvedValue(undefined);

    useUserStore.mockReturnValue({
      avatar: null,
    });
    useAuthStore.mockReturnValue({
      logout,
    });
  });

  it('should render the user avatar if userStore.avatar exists', () => {
    useUserStore.mockReturnValue({
      avatar: 'mock-avatar.jpg',
    });
    const wrapper = mount(AvatarDropdown, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });
    const img = wrapper.find('img');

    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('mock-avatar.jpg');
  });

  it('should not render the img tag if userStore.avatar does not exist', () => {
    useUserStore.mockReturnValue({
      avatar: null,
    });

    const wrapper = mount(AvatarDropdown, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(false);
  });

  it('should call logout when clicking the logout button', async () => {
    const authStore = useAuthStore();
    const wrapper = mount(AvatarDropdown, {
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });

    expect(wrapper.find('.dropdown-menu').exists()).toBe(false);

    const toggleButton = wrapper.find('.cursor-pointer');
    await toggleButton.trigger('click');

    expect(wrapper.find('.dropdown-menu').exists()).toBe(true);

    const logoutButton = wrapper.findAll('.dropdown-menu div')
      .find((node) => node.text().includes('Logout'));

    expect(logoutButton?.exists()).toBe(true);
    await logoutButton.trigger('click');

    expect(authStore.logout).toHaveBeenCalled();
  });

});
