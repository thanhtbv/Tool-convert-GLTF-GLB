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
  <div class="tableFixHead">
      <table class="table table-dark table-bordered">
         <thead>
               <tr>
                  <th>#</th>
                  <th>Uploaded files</th>
                  <th>Converted files</th>
                  <th>Curent type</th>
                  <th>Action</th>
               </tr>
         </thead>
         <tbody v-if="images.data">
            <tr v-for="image in images.data.result" :key="image.id">
               <td>{{image.id}}</td>
               <td>
                  <font-awesome-icon icon="arrow-circle-down" @click="downLoadImage(image.original_url, image.new_url, image.type, true)"/>
                  {{image.original_url}}
               </td>
               <td>
                  <font-awesome-icon icon="arrow-circle-down" @click="downLoadImage(image.original_url, image.new_url, image.type)"/>
                  {{image.name}}   
               </td>
               <td>{{image.type}}</td>
               <td>
                  <div class="action">
                     <font-awesome-icon icon="trash" @click="deleteImages(image.id)" style="margin-right: 10px"/>
                     <font-awesome-icon icon="eye" @click="viewImages(image.new_url)"/>
                  </div>
               </td>
            </tr>
         </tbody>
         <tbody v-if="nodata"  class="no-data">
            <td colspan="5">No data</td>
         </tbody>
      </table>
      </div>
   </div>
</template>

<script>
import axios from 'axios'
import path from 'path'
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
      //Load file zip
      onFileChange(e) {
         this.selectedFile = ""
         const selectedFile = e.target.files[0];
         if(selectedFile.size > 20480000) {
            if(confirm("File cannot exceed 20MB")){
               return;
            }
         } else {
            this.selectedFile = selectedFile;
         }
      },
      //Updaload file zip
      onUploadFile() {
         const formData = new FormData();
         const typeFile = this.selectedFile.name.split('.')[1];
         formData.append("file", this.selectedFile);
         this.selectedFile = ""
         let apiUrl = typeFile == "glb" ?
         `http://143.198.204.83:3000/images/${this.$route.params.id}/convert/gltf` :
         `http://143.198.204.83:3000/images/${this.$route.params.id}/convert/glb`
         axios.post(apiUrl, formData)
         .then(async res => {
            this.selected = typeFile ==  "glb" ? "gltf" : "glb"
            await this.getListImage();
         })
         .catch(err => {
            console.log(err);
         });
      },
      // Change list image by type
      async changeTypeImage() {
         await this.getListImage()
      },
      // Delete image
      async deleteImages(id) {
         if(confirm("Do you really want to delete?")){
            await axios.post(`http://143.198.204.83:3000/images/delete/${id}`, {
               responseType: "json",
            })
            await this.getListImage();
         }
      },
      // View image
      async viewImages(url) {
         this.$router.push({ name: 'Image3DView', query: { url: url } })
      },
      // Download image
      async downLoadImage(url, new_url, type, isUploadedFile = false) {
         if(isUploadedFile) {
            if(type == "glb") {
               let pathFile = path.dirname(new_url)
               window.location.href = `http://localhost:3000${pathFile.replace("./images", "")}.zip`
            } else {
               let pathFileGltf = new_url.replace("./images", "")
               let pathFileGltfConverted = pathFileGltf.replace(".gltf", ".glb")
               window.location.href = `http://localhost:3000/${pathFileGltfConverted}`;
            }
         } else {
            window.location.href = `http://localhost:3000${new_url.replace("./images", "")}`;
         }
      },
      // Get list image
      getListImage () {
         return new Promise(async res => {
            this.nodata = false
            this.images = await axios.get(`http://localhost:3000/images/${this.$route.params.id}/${this.selected}`)
            if(!this.images.data.result || this.images.data.result.length == 0) {
               this.nodata = true
            }
            res(this.images)
         })
      },
      // Check user is logged or not
      async isLogged () {
         try {
            const response = await axios.post('http://143.198.204.83:3000/verify/token',
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
      border-block-color: initial;
   }
   table {
      text-align: left;
   }
   .tableFixHead {
      overflow: auto; height: 550px;
   }
   .tableFixHead thead th {
      position: sticky; top: 0; z-index: 1;
   }

   table  {
      border-collapse: collapse; width: 100%;
   }
   th, td { 
      padding: 8px 16px; 
   }
   th {
      background:black;
   }
</style>
