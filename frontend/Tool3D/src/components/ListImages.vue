<template>
<div class="container col-lg-8">
  <div class="row">
    <div class="col-sm-4">
      <div class="form-group">
      <select v-model="selected" class="form-control col-lg-12" @change="changeTypeImage()">
         <option value="glb">GLB</option>
         <option value="gltf">GLTF</option>
      </select>
   </div>
    </div>
    <div class="col-sm-8 file-upload">
       <div>
         <input class="upload-button" type="file" @change="onFileChange" />
         <button @click="onUploadFile" class="upload-button"
         :disabled="!this.selectedFile"><b>Upload file</b></button>
      </div>
    </div>
  </div>
   <table class="table table-dark table-bordered">
      <thead>
            <tr>
               <th>ID</th>
               <th>Uploaded files</th>
               <th>Converted files</th>
               <th>Curent type</th>
               <th>Action</th>
            </tr>
      </thead>
      <tbody v-if="images.data">
         <tr v-for="image in images.data.result" :key="image.id">
            <td>{{image.id}}</td>
            <td>{{image.original_url}}</td>
            <td>{{image.name}}</td>
            <td>{{image.type}}</td>
            <td>
               <div class="action">
                  <svg @click="downLoadImage(image.original_url, image.new_url, image.type)" width="20" height="20" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                     <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                  </svg>
                  <svg @click="viewImages(image.new_url)"width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                     <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                     <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                  </svg>
                  <svg  @click="deleteImages(image.id)" width="20" height="20" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                     <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
               </div>
            </td>
         </tr>
      </tbody>
      <tbody v-if="nodata"  class="no-data">
         <td colspan="5">No data</td>
      </tbody>
   </table>
   </div>
</template>

<script>
import axios from 'axios'
export default {
   data() {
         return {
            images: [],
            selected: 'glb',
            nodata: 'false',
            selectedFile: "",
         };
    },
  methods: {
      onFileChange(e) {
         this.selectedFile = ""
         const selectedFile = e.target.files[0];
         if(selectedFile.size > 20480000) {
            if(confirm("file is over 20MB")){
               return;
            }
         }
         this.selectedFile = selectedFile;
      },
      onUploadFile() {
         const formData = new FormData();
         const typeFile = this.selectedFile.name.split('.')[1];
         formData.append("file", this.selectedFile);
         this.selectedFile = ""
         let apiUrl = typeFile == "glb" ?
         `http://143.198.204.83/images/${this.$route.params.id}/convert/gltf` :
         `http://143.198.204.83/images/${this.$route.params.id}/convert/glb`
         axios.post(apiUrl, formData)
         .then(async res => {
            this.selected = typeFile !==  "glb" ? "glb" : "gltf"
            setTimeout(() => { this.getListImage(), 1000 });
         })
         .catch(err => {
            console.log(err);
         });
      },
      changeTypeImage() {
         this.getListImage()
      },
      async deleteImages(id) {
         if(confirm("Do you really want to delete?")){
            await axios.post(`http://143.198.204.83/images/delete/${id}`, {
               responseType: "json",
            })
            this.getListImage();
         }
      },
      async viewImages(url) {
         this.$router.push({ name: 'Image3DView', query: { url: url } })
      },
      async downLoadImage(url, new_url, type) {
         if(type = "gltf") {
            window.location.href = `http://143.198.204.83${new_url.replace("./images", "")}`;
         } else {
            window.location.href = `http://143.198.204.83/user/${this.$route.params.id}/${url}`;
         }
      },
      async getListImage () {
         this.nodata = false
         this.images = await axios.get(`http://143.198.204.83/images/${this.$route.params.id}/${this.selected}`,)
         if(!this.images.data.result || this.images.data.result.length == 0) {
            this.nodata = true
         }
      },
      async isLogged () {
         try {
            const response = await axios.post('http://143.198.204.83/verify/token',
               {
                  token: this.getCookie("token"),
               })
         } catch (error) {
            this.$router.push({ name: 'UserPage' })
         }
      },
      getCookie(cname) {
         let name = cname + "=";
         let ca = document.cookie.split(';');
         for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
               c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
               return c.substring(name.length, c.length);
            }
         }
         return "";
      }
   },
   mounted () {
      this.isLogged()
      this.getListImage()
   }
};
</script>
<style scoped>
   .form-control {
      position: right;
      margin-bottom: 10px;
   }
   .form-group {
      display: flex;
   }
   .no-data {
     text-align: center 
   }
   .convert-image {
      position: absolute;
      right: 0px;
      width: 350px;
      border: 1px solid black;
      padding: 10px;
   }
   thead
   {
      background-color: #000000;
      color: white;
   }
   h3 {
      background-color: #28a745;
      color: white;
   }
   .container {
      padding-top: 20px
   }
   .action {
      letter-spacing: 5px;
   }
   .file-upload {
      text-align: right
   }
   .upload-button {
      height: 40px;
      color: black;
      border-radius: 6px;
   }
</style>
