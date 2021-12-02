<template>
  <div id="scene-container" ref="sceneContainer"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'stats.js'
import axios from 'axios'

export default {
  name: 'Image3DView',
  data () {
    return {
      container: null,
      scene: null,
      camera: null,
      controls: null,
      renderer: null,
      stats: null
    }
  },
  methods: {
    init () {
      this.container = this.$refs.sceneContainer
      this.stats = new Stats()
      this.container.appendChild(this.stats.dom)
      const fov = 60
      const aspect = this.container.clientWidth / this.container.clientHeight
      const near = 0.1
      const far = 30
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      camera.position.set(0, 5, 10)
      this.camera = camera
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('#17a2b8')
      const ambientLight = new THREE.HemisphereLight(
        0xffffff,
        0x222222,
        1
      )
      const mainLight = new THREE.DirectionalLight(0xffffff, 4.0)
      mainLight.position.set(10, 10, 10)
      this.scene.add(ambientLight, mainLight)

      // add controls
      this.controls = new OrbitControls(this.camera, this.container)

      // create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.gammaFactor = 2.2
      this.renderer.outputEncoding = THREE.sRGBEncoding
      this.renderer.physicallyCorrectLights = true
      this.container.appendChild(this.renderer.domElement)

      // set aspect ratio to match the new browser window aspect ratio
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)

      const loader = new GLTFLoader()
      loader.load(
        `http://localhost:3000${this.$route.query.url.replace("./images", "")}`,
        gltf => {
          this.scene.add(gltf.scene)
        },
        undefined,
        undefined
      )

      this.renderer.setAnimationLoop(() => {
        this.render()
      })
    },
    render () {
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    },
    async isLogged () {
         try {
            const response = await axios.post('http://localhost:3000/verify/token',
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
    },
    backToList() {
      console.log("..x")
      this.$router.push({ name: 'ListImages', params: { id: this.$route.params.id } })
    }
  },
  mounted () {
    this.isLogged()
    this.init()
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#scene-container {
  height: 100%;
}
.btn-info {
  float: right !important;
}
</style>
