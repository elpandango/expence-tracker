import {fetchWithAuth} from "~/server/utils/api";

export default {
  async updateProfile(userId: string, payload: { name?: string; lastName?: string; email?: string }) {
    return await $fetch(`/api/profile/${userId}`, {
      method: 'PUT',
      body: payload,
    });
  },
  async updateAvatar(userId: string, avatarBase64: string) {
    return await $fetch(`/api/profile/avatar/${userId}`, {
      method: 'PUT',
      body: {avatar: avatarBase64},
    });
  },
  async deleteAvatar(userId: string) {
    return await $fetch(`/api/profile/avatar/${userId}`, {
      method: 'DELETE',
    });
  }
};
