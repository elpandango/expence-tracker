<template>
  <div class="profile-page">
    <h1>{{ $t('components.profilePage.pageTitleText') }}</h1>
    <p class="info">{{ $t('components.profilePage.pageSubtitleText') }}</p>
    <div class="profile-cols">
      <Card
       max-width="50%">
        <div class="avatar-block">
          <div class="avatar">
            <img
             v-if="userStore.avatar.avatar"
             :src="userStore.avatar.avatar"
             alt="User Avatar"
             class="avatar-image"/>
            <div
             v-else
             class="avatar-placeholder">
            </div>
          </div>
          <div class="avatar-name">{{ savedUser.name }} {{ savedUser.lastName }}</div>
          <div class="avatar-actions">
            <BaseButton
             @click="handleUploadAvatar"
             variant="transparent"
             size="big">{{ $t('components.buttons.uploadPhoto') }}
            </BaseButton>
            <BaseButton
             @click="handleRemoveAvatar"
             variant="transparent"
             size="big">{{ $t('components.buttons.removePhoto') }}
            </BaseButton>
          </div>
        </div>
      </Card>
      <Card max-width="50%">
        <Preloader
         height="280px"
         v-if="uiStore.state.isLoading"/>
        <form
         class="profile-form"
         v-else>
          <div class="form-row">
            <FloatLabelInput
             v-model="user.name"
             size="medium"
             label="Name"/>
          </div>
          <div class="form-row">
            <FloatLabelInput
             v-model="user.lastName"
             size="medium"
             label="Last name"/>
          </div>
          <div class="form-row">
            <FloatLabelInput
             v-model="user.email"
             size="medium"
             label="Email"/>
          </div>
          <div class="form-row btn-block">
            <BaseButton
             @click="handleCancel"
             variant="transparent"
             size="big">{{ $t('components.buttons.cancelText') }}
            </BaseButton>
            <BaseButton
             @click="handleSaveChanges"
             size="big">{{ $t('components.buttons.saveText') }}
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
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

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
  user.avatar = userStore.avatar.avatar;

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
        user.avatar = userStore.avatar.avatar;
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
    user.avatar = userStore.avatar.avatar;
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

<style
 lang="scss">
.profile-page {
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;

  @media only screen and (max-width: 1366px) {
    max-width: 860px;
  }

  .profile-form {
    width: 100%;
  }

  .avatar-block {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    .avatar {
      width: 150px;
      height: 150px;
      margin-bottom: 20px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        object-fit: cover;
        box-shadow: var(--box-shadow);
      }
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      box-shadow: var(--box-shadow);
      background-image: url('/images/empty-image.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .avatar-name {
      width: 100%;
      text-align: center;
      font-weight: 500;
      font-size: 18px;
      margin-bottom: 14px;
    }

    .avatar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .button {
      min-width: 120px;
    }
  }

  .profile-cols {
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    @media only screen and (max-width: 1024px) {
      flex-wrap: wrap;
    }

    .card {
      @media only screen and (max-width: 1024px) {
        width: 100%;
        max-width: 100% !important;
      }
    }

  }

  .btn-block {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    .button {
      min-width: 120px;
    }
  }
}
</style>