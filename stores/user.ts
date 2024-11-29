import {defineStore} from 'pinia';
import {ref} from 'vue';
import type { User } from '~/server/interfaces/user';
import repositoryFactory from "~/repositories/repositoryFactory";
import {emitter} from "~/classes/uiEventBus";

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const user = ref<Partial<User>>({
    name: '',
    lastName: '',
    email: '',
  });
  const avatar = ref('');
  const userId = ref<string | null>(null);

  const checkAuth = async () => {
    emitter.emit('ui:startLoading', 'auth');
    try {
      const response = await repositoryFactory.get('Auth').me();
      user.value = response?.user || {};
      userId.value = response?.user?.userId || null;
      isLoggedIn.value = !!response;
    } catch (err) {
      console.error('Error checking auth:', err);
      user.value = {
        name: '',
        lastName: '',
        email: '',
      };
      isLoggedIn.value = false;
    } finally {
      emitter.emit('ui:stopLoading', 'auth');
    }
  };

  const updateProfile = async (payload: { name?: string, lastName?: string, email?: string }) => {
    emitter.emit('ui:startLoading', 'default');
    const response = await repositoryFactory.get('User').updateProfile(payload);
    user.value = response || {};
    emitter.emit('ui:showToast', {
      message: 'Profile updated successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  const updateAvatar = async (avatarBase64: string) => {
    emitter.emit('ui:startLoading', 'default');
    const updatedUser = await repositoryFactory.get('User').updateAvatar(avatarBase64);
    user.value.avatar = updatedUser.avatar;
    emitter.emit('ui:showToast', {
      message: 'Avatar updated successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  const deleteAvatar = async () => {
    emitter.emit('ui:startLoading', 'default');
    await repositoryFactory.get('User').deleteAvatar();
    user.value.avatar = '';
    emitter.emit('ui:showToast', {
      message: 'Avatar deleted successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  return {user, userId, isLoggedIn, avatar, checkAuth, updateProfile, updateAvatar, deleteAvatar};
});

