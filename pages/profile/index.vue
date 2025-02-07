<template>
  <div class="max-w-[860px] w-full m-auto">
    <h1 class="font-semibold text-3xl mb-4">{{ $t('components.profilePage.pageTitleText') }}</h1>
    <p class="info mb-4">{{ $t('components.profilePage.pageSubtitleText') }}</p>
    <div class="flex flex-wrap md:flex-nowrap gap-4">
      <Card class="w-full md:w1/2">
        <div class="block">
          <div class="mb-4">
            <img
             v-if="userStore.avatar"
             :src="userStore.avatar"
             alt="User Avatar"
             class="rounded-full shadow-lg m-auto w-36 h-36 object-cover">
            <div
             v-else
             class="w-32 h-32 bg-cover bg-center m-auto"
             style="background-image: url('/images/empty-image.png');"/>
          </div>
          <div class="text-center text-lg mb-4">{{ savedUser.name }} {{ savedUser.lastName }}</div>
          <div class="flex gap-4 justify-center">
            <BaseButton
             variant="transparent"
             size="big"
             @click="handleUploadAvatar">{{ $t('components.buttons.uploadPhoto') }}
            </BaseButton>
            <BaseButton
             variant="transparent"
             size="big"
             @click="handleRemoveAvatar">{{ $t('components.buttons.removePhoto') }}
            </BaseButton>
          </div>
        </div>
      </Card>
      <Card class="w-full md:w1/2">
        <Preloader
         v-if="uiStore.state.isLoading"
         height="280px"/>
        <form
         v-else
         class="w-full">
          <div class="form-row mb-4">
            <BaseInput
             v-model="user.name"
             size="medium"
             label="Name"/>
          </div>
          <div class="form-row mb-4">
            <BaseInput
             v-model="user.lastName"
             size="medium"
             label="Last name"/>
          </div>
          <div class="form-row mb-4">
            <BaseInput
             v-model="user.email"
             size="medium"
             label="Email"/>
          </div>
          <div class="form-row btn-block flex justify-end gap-2">
            <BaseButton
             variant="transparent"
             size="big"
             @click="handleCancel">{{ $t('components.buttons.cancelText') }}
            </BaseButton>
            <BaseButton
             size="big"
             @click="handleSaveChanges">{{ $t('components.buttons.saveText') }}
            </BaseButton>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script
 setup
 lang="ts">
import type {User} from '~/server/interfaces/user';
import {useSeoConfig} from "~/use/useSeoConfig";
import {useUserStore} from '~/stores/user';
import {useUIStore} from "~/stores/ui";
import {emitter} from "~/classes/uiEventBus";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import BaseInput from "~/components/Forms/Inputs/BaseInput.vue";

const seoMeta = useSeoConfig();
useSeoMeta(seoMeta.value);

const userStore = useUserStore();
const uiStore = useUIStore();

const user = reactive<User>({
  name: '',
  lastName: '',
  email: '',
  avatar: ''
});

const savedUser = reactive({
  name: '',
  lastName: '',
});

const initializeUserData = () => {
  user.name = userStore.user.name;
  user.lastName = userStore.user.lastName;
  user.email = userStore.user.email;
  user.avatar = userStore.avatar;

  savedUser.name = userStore.user.name;
  savedUser.lastName = userStore.user.lastName;
};

const handleSaveChanges = async () => {
  if (
   user.name === userStore.user.name &&
   user.lastName === userStore.user.lastName &&
   user.email === userStore.user.email
  ) {
    console.log('No changes to save.');
    return;
  }

  await userStore.updateProfile({
    name: user.name,
    lastName: user.lastName,
    email: user.email,
  });

  initializeUserData();
}

const handleCancel = () => {
  initializeUserData();
}

const handleUploadAvatar = async () => {
  const avatarInput = document.createElement('input');
  avatarInput.type = 'file';
  avatarInput.accept = 'image/*';

  avatarInput.onchange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const avatarBase64 = reader.result as string;

      try {
        await userStore.updateAvatar(avatarBase64);
        await userStore.getAvatar();
        user.avatar = userStore.avatar;
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  avatarInput.click();
};

const handleRemoveAvatar = async () => {
  try {
    await userStore.deleteAvatar();
    await userStore.getAvatar();
    user.avatar = userStore.avatar;
  } catch (error) {
    console.error('Error removing avatar:', error);
  }
};

onMounted(async () => {
  emitter.emit('ui:startLoading', 'default');
  initializeUserData();
  emitter.emit('ui:stopLoading', 'default');
});
</script>

<style></style>