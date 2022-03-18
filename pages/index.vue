<template>
  <div class="login">
    <div>
      <button @click="login">googleアカウントでログイン</button>
    </div>
  </div>
</template>

  
<script>
import firebase from "~/plugins/firebase";
export default {
  data(){
    return{
      isLoginModalActive: false,
    };
  },
  methods: {
    login() {
      this.isLoginModalActive = true;
      this.google();
    },
    google() {
      const auth = () => {
        return new Promise((resolve, reject) => {
          const authUI = new firebase.auth.GoogleAuthProvider()
          firebase
            .auth()
            .signInWithPopup(authUI)
            .then((result) => {
              resolve(result)
              // this.$router.push('/confirm')
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              const email = error.email;
              const credential = error.credential;
              reject(error);
            });
        });
      };
      const getAccountData = (result) => {
        return new Promise((resolve, reject) => {
          let userObject = {}
          let user = result.user
          userObject.token = result.credential.accessToken;
          userObject.refreshToken = user.refreshToken;
          userObject.uid = user.uid;
          userObject.displayName = user.displayName;
          userObject.photoURL = user.photoURL;
          userObject.uid = user.uid;
          userObject.email = user.email;
          userObject.isNewUser = result.additionalUserInfo.isNewUser;
          userObject.providerId = result.additionalUserInfo.providerId;
          resolve(userObject);
          this.$router.push({path:'/confirm',query:{name:userObject.displayName,email:userObject.email}},)
        });
      };
      Promise.resolve()
        .then(auth)
        .then(getAccountData)
        .catch((error) => this.onRejectted(error));
    },
    onRejectted(error) {
      this.$buefy.toast.open({
        duration: 5000,
        message: `ログインに失敗しました。`,
        position: 'is-bottom',
        type: 'is-danger'
      });
      this.isLoginModalActive = false;p
    },
  },
};
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>