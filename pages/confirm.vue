<template>
  <div class="confirm">
    <div>
      <h1>ログイン完了！！</h1>
      <p>{{this.$route.query.name}}</p>
      <p>{{this.$route.query.email}}</p>
    </div>
  </div>
</template>

<style scoped>
.confirm {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>