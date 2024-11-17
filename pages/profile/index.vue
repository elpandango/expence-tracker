<template>
  <div class="profile-page">
    <h1>Profile</h1>
    <p class="info">Here you can upload or delete your photo, edit your profile, and save the user data.</p>
    <div class="profile-cols">
      <Card
       max-width="50%">
        <div class="avatar-block">
          <div class="avatar"></div>
          <div class="avatar-name">{{ user.name }} {{ user.lastName }}</div>
          <div class="avatar-actions">
            <BaseButton
             @click="handleCancel"
             variant="transparent"
             size="big">Upload Photo
            </BaseButton>
            <BaseButton
             @click="handleSaveChanges"
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

import FloatLabelInput from "~/components/Forms/Inputs/FloatLabelInput.vue";
import BaseButton from "~/components/Buttons/BaseButton.vue";

const user = reactive({
  name: 'Andre',
  lastName: 'Petrov',
  email: 'elelelele@ddddd.com'
});

const handleSaveChanges = () => {
}
const handleCancel = () => {
}
</script>

<style
 scoped
 lang="scss">
.avatar-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  .avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: grey;
    box-shadow: var(--box-shadow);
    margin-bottom: 14px;
  }

  .avatar-name {
    width: 100%;
    text-align: center;
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
}

.btn-block {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;

  .button {
    min-width: 120px;
  }
}
</style>