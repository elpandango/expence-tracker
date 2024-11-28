import {defineStore} from 'pinia';
import repositoryFactory from "~/repositories/repositoryFactory";
import {ref} from 'vue';

interface User {
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const loading = ref(true);
  const user = ref<Partial<User>>({
    name: '',
    lastName: '',
    email: '',
  });
  const avatar = ref('');
  const userId = ref<string | null>(null);

  const checkAuth = async () => {
    loading.value = true;
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
      loading.value = false;
    }
  };

  const updateProfile = async (payload: { name?: string, lastName?: string, email?: string }) => {
    loading.value = true;
    const response = await repositoryFactory.get('User').updateProfile(payload);
    user.value = response || {};
    loading.value = false;
  };

  const updateAvatar = async (avatarBase64: string) => {
    loading.value = true;
    const updatedUser = await repositoryFactory.get('User').updateAvatar(avatarBase64);
    user.value.avatar = updatedUser.avatar;
    loading.value = false;
  };

  const deleteAvatar = async () => {
    loading.value = true;
    await repositoryFactory.get('User').deleteAvatar();
    user.value.avatar = '';
    loading.value = false;
  };

  return {user, userId, loading, isLoggedIn, avatar, checkAuth, updateProfile, updateAvatar, deleteAvatar};
});

