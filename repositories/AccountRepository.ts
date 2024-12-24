import type {
  CreateAccountPayload,
  UpdateAccountPayload,
  DeleteAccountPayload
} from "~/server/interfaces/accountsPayload";

export default {
  async createAccount(payload: CreateAccountPayload) {
    try {
      return await $fetch('/api/accounts', {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Account creation failed';
      throw new Error(message);
    }
  },
  async updateAccount(payload: UpdateAccountPayload) {
    const { id, ...data } = payload;
    try {
      return await $fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        body: data,
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Card creation failed';
      throw new Error(message);
    }
  },
  async deleteAccount(accountId: DeleteAccountPayload) {
    try {
      return await $fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'Account deletion failed';
      throw new Error(message);
    }
  },
  async getAllAccounts() {
    try {
      return await $fetch('/api/accounts', {
        method: 'GET',
      });
    } catch (error: any) {
      const message = error?.response?._data?.message || 'No Cards found';
      throw new Error(message);
    }
  },
};
