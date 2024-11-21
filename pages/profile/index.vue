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
        <form>
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
import repositoryFactory from "~/repositories/repositoryFactory";
import {useUserStore} from '~/stores/user';
import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

interface User {
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
}

const userStore = useUserStore();

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

const initializeUserData = (storeUser: User) => {
  user.name = storeUser.name;
  user.lastName = storeUser.lastName;
  user.email = storeUser.email;
  user.avatar = storeUser.avatar;

  savedUser.name = storeUser.name;
  savedUser.lastName = storeUser.lastName;
};

const handleSaveChanges = async () => {
  const userId = userStore.getUserID;

  if (
   user.name === userStore.getUser.name &&
   user.lastName === userStore.getUser.lastName &&
   user.email === userStore.getUser.email
  ) {
    console.log('No changes to save.');
    return;
  }

  const updatedUser = await repositoryFactory.get('User').updateProfile(userId, {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
  });

  initializeUserData(updatedUser);
}

const handleCancel = () => {
  const storeUser = userStore.getUser;
  initializeUserData(storeUser);
}

const handleUploadAvatar = async () => {
  const userId = userStore.getUserID;
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
        const updatedUser = await repositoryFactory.get('User').updateAvatar(userId, avatarBase64);
        user.avatar = updatedUser.avatar;
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  avatarInput.click();
};

const handleRemoveAvatar = async () => {
  const userId = userStore.getUserID;

  try {
    const updatedUser = await repositoryFactory.get('User').deleteAvatar(userId);
    user.avatar = '';
  } catch (error) {
    console.error('Error removing avatar:', error);
  }
};

onMounted(() => {
  const storeUser = userStore.getUser;
  initializeUserData(storeUser);
});
</script>

<style
 src="./styles.scss"
 lang="scss">

</style>