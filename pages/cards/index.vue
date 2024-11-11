<template>
  <div class="cards-page">
    <h1>Here are all your cards</h1>

    <ul class="cards-list">
      <li>
        <Card>
          <PaymentCard/>
          <div class="actions">
            <button>Edit</button>
            <button>Delete</button>
          </div>
        </Card>
      </li>
      <li>
        <Card>
          <PaymentCard/>
          <div class="actions">
            <button>Edit</button>
            <button>Delete</button>
          </div>
        </Card>
      </li>
    </ul>
  </div>
</template>

<script
 setup
 lang="ts">

</script>

<style
 scoped
 lang="scss">
.cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>