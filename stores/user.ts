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
    avatarVersion: 0,
    hasAvatar: false,
  });
  const avatar = ref('');
  const userId = ref<string | null>(null);
  const avatarVersion = ref(0);
  const hasAvatar = ref(false);

  const getAvatarStorageKey = (id: string) => `avatar:${id}`;
  const getAvatarVersionStorageKey = (id: string) => `avatarVersion:${id}`;

  const readCachedAvatar = (id: string) => {
    if (!import.meta.client) return null;

    const cachedAvatar = localStorage.getItem(getAvatarStorageKey(id));
    const cachedVersion = localStorage.getItem(getAvatarVersionStorageKey(id));

    if (!cachedAvatar || !cachedVersion) {
      return null;
    }

    return {
      avatar: cachedAvatar,
      avatarVersion: Number(cachedVersion),
    };
  };

  const writeCachedAvatar = (id: string, avatarBase64: string, version: number) => {
    if (!import.meta.client) return;

    localStorage.setItem(getAvatarStorageKey(id), avatarBase64);
    localStorage.setItem(getAvatarVersionStorageKey(id), String(version));
  };

  const clearCachedAvatar = (id: string | null) => {
    if (!import.meta.client || !id) return;

    localStorage.removeItem(getAvatarStorageKey(id));
    localStorage.removeItem(getAvatarVersionStorageKey(id));
  };

  const checkAuth = async () => {
    emitter.emit('ui:startLoading', 'auth');
    try {
      const response = await repositoryFactory.get('Auth').me();
      user.value = response?.user || {};
      userId.value = response?.user?.userId || null;
      avatarVersion.value = response?.user?.avatarVersion || 0;
      hasAvatar.value = Boolean(response?.user?.hasAvatar);
      isLoggedIn.value = !!response;

      if (!hasAvatar.value) {
        avatar.value = '';
        clearCachedAvatar(userId.value);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      user.value = {
        name: '',
        lastName: '',
        email: '',
        avatarVersion: 0,
        hasAvatar: false,
      };
      avatar.value = '';
      avatarVersion.value = 0;
      hasAvatar.value = false;
      userId.value = null;
      isLoggedIn.value = false;
    } finally {
      emitter.emit('ui:stopLoading', 'auth');
    }
  };

  const updateProfile = async (payload: { name?: string, lastName?: string, email?: string }) => {
    emitter.emit('ui:startLoading', 'default');
    const response = await repositoryFactory.get('User').updateProfile(payload);
    user.value = response || {};
    avatarVersion.value = response?.avatarVersion || avatarVersion.value;
    hasAvatar.value = Boolean(response?.hasAvatar);
    emitter.emit('ui:showToast', {
      message: 'Profile updated successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  const getAvatar = async (force = false) => {
    if (!userId.value || !hasAvatar.value) {
      avatar.value = '';
      clearCachedAvatar(userId.value);
      return;
    }

    const cachedAvatar = readCachedAvatar(userId.value);
    if (
      !force &&
      cachedAvatar?.avatar &&
      cachedAvatar.avatarVersion === avatarVersion.value
    ) {
      avatar.value = cachedAvatar.avatar;
      return;
    }

    const response = await repositoryFactory.get('User').getAvatar();
    avatar.value = response.avatar.avatar;
    avatarVersion.value = response.avatar.avatarVersion || avatarVersion.value;
    hasAvatar.value = Boolean(response.avatar.avatar);
    writeCachedAvatar(userId.value, response.avatar.avatar, avatarVersion.value);
  };

  const updateAvatar = async (avatarBase64: string) => {
    emitter.emit('ui:startLoading', 'default');
    const updatedUser = await repositoryFactory.get('User').updateAvatar(avatarBase64);

    avatar.value = updatedUser.avatar;
    avatarVersion.value = updatedUser.avatarVersion || avatarVersion.value;
    hasAvatar.value = Boolean(updatedUser.avatar);
    user.value = {
      ...user.value,
      avatarVersion: avatarVersion.value,
      hasAvatar: hasAvatar.value,
    };

    if (userId.value && updatedUser.avatar) {
      writeCachedAvatar(userId.value, updatedUser.avatar, avatarVersion.value);
    }

    emitter.emit('ui:showToast', {
      message: 'Avatar updated successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  const deleteAvatar = async () => {
    emitter.emit('ui:startLoading', 'default');
    const response = await repositoryFactory.get('User').deleteAvatar();
    avatar.value = '';
    avatarVersion.value = response.avatarVersion || avatarVersion.value;
    hasAvatar.value = false;
    user.value = {
      ...user.value,
      avatarVersion: avatarVersion.value,
      hasAvatar: false,
    };
    clearCachedAvatar(userId.value);
    emitter.emit('ui:showToast', {
      message: 'Avatar deleted successfully!',
      type: 'success',
    });
    emitter.emit('ui:stopLoading', 'default');
  };

  return {
    user,
    userId,
    isLoggedIn,
    avatar,
    avatarVersion,
    hasAvatar,
    checkAuth,
    updateProfile,
    getAvatar,
    updateAvatar,
    deleteAvatar,
  };
});
