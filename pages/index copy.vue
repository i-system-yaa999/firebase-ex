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
    // Google認証を行う関数
    google() {
      // ② Google認証
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
 
      // ③ 認証後のユーザー情報を取得してオブジェクト化
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
 
      // 同期的に順番に処理を実行する
      Promise.resolve()
        // .then(this.setPersistence)
        .then(auth)
        .then(getAccountData)
        // .then((userObject) => this.createPhotoURL(this.userObject))
        // .then((userObject) => this.setPublicUserData(this.userObject))
        // .then((userObject) => this.setPrivateUserData(this.userObject))
        // .then((userObject) => this.setLocalUserData(this.userObject))
        // .then(()=>this.$router.push('/confirm'))
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
    // ① 認証状態を明示的にセットする
    setPersistence() {
      return new Promise((resolve, reject) => {
        firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then((result) => {
            resolve();
          });
      });
    },
    createPublicObj(obj) {
      let publicObj = {};
      publicObj.uid = obj.uid;
      publicObj.providerId = obj.providerId;
      publicObj.isNewUser = obj.isNewUser;
      publicObj.photoURL = obj.photoURL;
      publicObj.displayName = obj.displayName;
 
      return publicObj;
    },
    createPrivateObj(obj) {
      let privateObj = {};
      privateObj.uid = obj.uid;
      privateObj.providerId = obj.providerId;
      privateObj.isNewUser = obj.isNewUser;
      privateObj.email = obj.email;
      privateObj.token = obj.token;
      privateObj.refreshToken = obj.refreshToken;
      return privateObj;
    },
    // ⑤ 公開可能なユーザー情報をFirestoreに登録
    setPublicUserData(userObject) {
      return new Promise((resolve, reject) => {
        let publicUser = firestore.collection('users').doc(userObject.uid);
        // ** usersに登録するObjのみを登録する
        publicUser
          .set(this.createPublicObj(userObject), { merge: true })
          .then((result) => {
            resolve(userObject);
          });
      });
    },
    // ⑥ 非公開のユーザー情報をFirestoreに登録
    setPrivateUserData(userObject) {
      return new Promise((resolve, reject) => {
        let privateUsers = firestore
          .collection('privateUsers')
          .doc(userObject.uid);
        // privateUsersに登録するObjのみを登録する
        privateUsers
          .set(this.createPrivateObj(userObject), { merge: true })
          .then((result) => {
            resolve(userObject);
          });
      });
    },
    // ⑦ ローカルストレージに保持するユーザー情報を設定
    setLocalUserData(userObject) {
      return new Promise((resolve, reject) => {
        let user = firestore.collection('users').doc(userObject.uid);
        user
          .get()
          .then((doc) => {
            if (doc.exists) {
              localStorage.setItem('photoURL', doc.data().photoURL);
              localStorage.setItem('uid', userObject.uid);
              localStorage.setItem('token', userObject.token);
              localStorage.setItem('displayName', doc.data().displayName);
              this.$buefy.toast.open({
                duration: 5000,
                message: `ログインに成功しました`,
                position: 'is-bottom',
                type: 'is-success'
              });
              this.isLoginModalActive = false;
              location.reload();
              resolve(userObject);
            }
          })
          .catch((error) => {
            console.log('ログインに失敗しました。Error getting document:', error);
          });
      });
    },
    // ④ 取得したアイコンのURLをFirestorageに保存して、そのURLをFirestoreに登録する準備
    createPhotoURL(userObject) {
      return new Promise((resolve, reject) => {
        let url = userObject.photoURL;
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
          let blob = xhr.response;
          let storageRef = storage.ref();
          let mountainsRef = storageRef.child(
            `user/${userObject.uid}/image.jpg`
          );
          let uploadTask = mountainsRef.put(blob);
          uploadTask.then((snapshot) => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              console.log(downloadURL);
              // firestorageに登録したURLを登録するオブジェクトに代入
              userObject.photoURL = downloadURL;
              resolve(userObject);
            });
          });
        };
        // メッセージを受け取った後に返信する
        xhr.open('GET', url);
        xhr.send();
      });
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