<template>
  <div class="profile-page">
    <h1>Profile</h1>
    <p class="info">Here you can upload or delete your photo, edit your profile, and save the user data.</p>
    <div class="profile-cols">
      <Card
       max-width="50%">
        <div class="avatar-block">
          <div class="avatar">
            <img
             v-if="user.avatar"
             :src="user.avatar"
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
             size="big">Upload Photo
            </BaseButton>
            <BaseButton
             @click="handleRemoveAvatar"
             variant="transparent"
             size="big">Remove Photo
            </BaseButton>
          </div>
        </div>
      </Card>
      <Card max-width="50%">
        <Preloader
         height="280px"
         v-if="uiStore.state.isLoading"/>
        <form class="profile-form"
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
             size="big">Cancel
            </BaseButton>
            <BaseButton
             @click="handleSaveChanges"
             size="big">Save
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
import {useUserStore} from '~/stores/user';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";
import type {User} from '~/server/interfaces/user';
import {useUIStore} from "~/stores/ui";
import {emitter} from "~/classes/uiEventBus";

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
  user.avatar = userStore.user.avatar;

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
        user.avatar = userStore.user.avatar;
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
    user.avatar = userStore.user.avatar;
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
 src="./styles.scss"
 lang="scss">

</style>