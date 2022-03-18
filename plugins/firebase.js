import firebase from 'firebase'

if (!firebase.apps.length) {
  firebase.initializeApp(
    {
    apiKey: "AIzaSyDbc6Gkd-yyskOVaOGXxKG9EgR13Bq1yaU",
    authDomain: "fir-ex-a58c0.firebaseapp.com",
    projectId: "fir-ex-a58c0",
    storageBucket: "fir-ex-a58c0.appspot.com",
    messagingSenderId: "482287392655",
    appId: "1:482287392655:web:2b85159f8c7f8a52c09dfa",
    measurementId: "G-B9LX7QZ91P"
    }
  )
}
  
export default firebase