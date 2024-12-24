import {defineStore} from 'pinia';
import {useUserStore} from "~/stores/user";
import {useRouter} from 'vue-router';
import AuthRepository from '~/repositories/AuthRepository';
import {emitter} from "~/classes/uiEventBus";

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const userStore = useUserStore();
  const userId = ref<string | null>(null);

  const login = async (user: { email: string; password: string }) => {
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
        }, 500);
      }
    } catch (error: any) {
      emitter.emit('ui:showToast', {
        message: error.message || 'Login failed.',
        type: 'error',
      });
    }
  };

  const register = async (user: { name: string; lastName: string; email: string; password: string }) => {
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
        }, 500);
      }
    } catch (error: any) {
      emitter.emit('ui:showToast', {
        message: error.message || 'Registration failed.',
        type: 'error',
      });
    }
  };

  const logout = async () => {
    try {
      await AuthRepository.logout();
      userStore.isLoggedIn = false;
      userId.value = null;
      emitter.emit('ui:showToast', {
        message: 'Logged out successfully.',
        type: 'success',
      });
      setTimeout(async () => {
        await router.push('/auth');
      }, 200);
    } catch (error: any) {
      emitter.emit('ui:showToast', {
        message: error.message || 'Logout failed.',
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
