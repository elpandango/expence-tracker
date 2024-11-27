export default {
  async updateProfile(payload: { name?: string; lastName?: string; email?: string }) {
    return await $fetch(`/api/profile`, {
      method: 'PUT',
      body: payload,
    });
  },
  async updateAvatar(avatarBase64: string) {
    return await $fetch(`/api/profile/avatar`, {
      method: 'PUT',
      body: {avatar: avatarBase64},
    });
  },
  async deleteAvatar() {
    return await $fetch(`/api/profile/avatar`, {
      method: 'DELETE',
    });
  },
};
