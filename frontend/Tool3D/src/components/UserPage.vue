<template>
  <div id="app">
   <div class="login-page">
      <transition name="fade">
         <div v-if="!registerActive" class="wallpaper-login"></div>
      </transition>
      <div class="wallpaper-register"></div>

      <div class="container">
         <div class="row">
            <div class="col-lg-4 col-md-6 col-sm-8 mx-auto">
               <div v-if="isLoginFailed" class="alert alert-danger" role="alert">
                  Login Failed
               </div>
               <div v-if="!registerActive" class="card login" v-bind:class="{ error: emptyFields }">
                  <h1>Sign In</h1>
                  <form class="form-group">
                     <input v-model="userLogin" type="text" class="form-control" placeholder="Username" required>
                     <input v-model="passwordLogin" type="password" class="form-control" placeholder="Password" required>
                     <input type="submit" class="form-control btn btn-primary" @click.prevent="doLogin">
                     <p>Don't have an account? <a href="#" @click="registerActive = !registerActive,
                     isLoginFailed = false, invalidPassword = false, registerFailed = false, emptyFields = false">Sign up here</a>
                     </p>
                  </form>
               </div>
               <div v-if="invalidPassword && !registerFailed" class="alert alert-danger" role="alert">
                  Invalid password
               </div>
               <div v-if="registerFailed && !invalidPassword" class="alert alert-danger" role="alert">
                  Register Failed
               </div>
               <div v-if="registerActive" class="card register" v-bind:class="{ error: emptyFields }">
                  <h1>Sign Up</h1>
                  <form class="form-group">
                     <input v-model="userNameReg" type="text" class="form-control" placeholder="Username" required>
                     <input v-model="passwordReg" type="password" class="form-control" placeholder="Password" required>
                     <input v-model="confirmReg" type="password" class="form-control" placeholder="Confirm Password" required>
                     <input type="submit" class="form-control btn btn-primary" @click.prevent="doRegister">
                     <p>Already have an account? <a href="#" @click="registerActive = !registerActive,
                     isLoginFailed = false, invalidPassword = false, registerFailed = false, emptyFields = false">Sign in here</a>
                     </p>
                  </form>
               </div>
            </div>
         </div>

      </div>
   </div>
</div>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      registerActive: false,
      userLogin: "",
      passwordLogin: "",
      userNameReg: "",
      passwordReg: "",
      confirmReg: "",
      emptyFields: false,
      isLoginFailed: false,
      invalidPassword: false,
      registerFailed: false
    }
  },
  methods: {
    async doLogin() {
         if (this.userLogin === "" || this.passwordLogin === "") {
            this.emptyFields = true;
         } else {
            try {
               const response = await axios.post('http://localhost:3000/login/', 
               {
                  username: this.userLogin,
                  password: this.passwordLogin
               })
               if (response) {
                  document.cookie = "token =" + response.data.result.jwt + ";"
                  document.cookie = "id =" + response.data.result.id + ";"
                  this.$router.push({ name: 'ListImages', params: { id: response.data.result.id } })
               }
            } catch (err) {
               this.isLoginFailed = true
            }
         }
      },
      async doRegister() {
         this.invalidPassword = false
         if (this.userNameReg === "" || this.passwordReg === "" || this.confirmReg === "") {
            this.emptyFields = true;
         } else {
            if (this.passwordReg !=this.confirmReg) {
               this.invalidPassword = true
               return;
            }
            try {
               const response = await axios.post('http://localhost:3000/register/', 
               {
                  username: this.userNameReg,
                  password: this.passwordReg
               })
               if (response) {
                  location.reload();
               }
            } catch (err) {
               this.registerFailed = true
            }
         }
      }
  }
}
</script>

<style scoped>
   p {
      line-height: 1rem;
   }

   .card {
      padding: 20px;
   }

   .form-control {
      margin-bottom: 10px !important;
   }

   .login-page {
      align-items: center;
      display: flex;
      height: 100vh;
      transition: opacity .5s;
   }

   .btn-primary {
      margin-bottom: 10px;
      text-align: center
   }
</style>

