import {defineStore} from 'pinia';
import {useUserStore} from "~/stores/user";
import {useFinanceStore} from "~/stores/finance";
import {useRouter} from 'vue-router';
import AuthRepository from '~/repositories/AuthRepository';
import {emitter} from "~/classes/uiEventBus";

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const userStore = useUserStore();
  const financeStore = useFinanceStore();
  const userId = ref<string | null>(null);

  const login = async (user: { email: string; password: string }) => {
    emitter.emit('ui:startLoading', 'default');
    try {
      const {status, userId: id} = await AuthRepository.login(user);

      if (status === 200 && id) {
        userStore.isLoggedIn = true;
        userId.value = id;
        emitter.emit('ui:showToast', {
          message: 'Logged in successfully.',
          type: 'success',
        });

        setTimeout(async () => {
          await router.push('/');
        }, 300);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      emitter.emit('ui:showToast', {
        message,
        type: 'error',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const register = async (user: { name: string; lastName: string; email: string; password: string }) => {
    emitter.emit('ui:startLoading', 'default');
    try {
      const {status} = await AuthRepository.register(user);
      if (status === 200) {
        emitter.emit('ui:showToast', {
          message: 'Registered successfully.',
          type: 'success',
        });
        userStore.isLoggedIn = true;
        setTimeout(async () => {
          await router.push('/');
        }, 300);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      emitter.emit('ui:showToast', {
        message,
        type: 'error',
      });
      emitter.emit('ui:stopLoading', 'default');
    }
  };

  const logout = async () => {
    try {
      await AuthRepository.logout();
      userStore.isLoggedIn = false;
      userId.value = null;

      userStore.user = {
        name: '',
        lastName: '',
        email: '',
      };

      emitter.emit('ui:showToast', {
        message: 'Logged out successfully.',
        type: 'success',
      });
      financeStore.resetDataOnLogout();
      await router.push('/auth');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed.';
      emitter.emit('ui:showToast', {
        message,
        type: 'error',
      });
    }
  };

  return {
    userId,
    login,
    register,
    logout,
  };
});
