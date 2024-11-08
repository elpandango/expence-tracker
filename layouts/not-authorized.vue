<template>
  <div>
    <slot></slot>
  </div>
</template>

<script
 setup
 lang="ts">
import repositoryFactory from "~/repositories/repositoryFactory";

const router = useRouter();

onMounted(async () => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    const data = await repositoryFactory.get('User').getUser(userEmail);

    if (data.status === 200) {
      router.push('/admin/all-posts')
    }
  } catch (err) {
    console.log(err);
  }
});
</script>

<style>

</style>