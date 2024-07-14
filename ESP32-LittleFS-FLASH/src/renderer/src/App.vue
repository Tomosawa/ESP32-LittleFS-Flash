<script setup lang="ts">
import Versions from './components/Versions.vue'
import Home from './components/Home.vue'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<style>
body{
  background-image: none;
  background-color: #22262A;
}
.v-application__wrap {
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    max-width: 100%;
    min-height: 0;
    position: relative;
    background-color: #22262A;
}
.v-main{
  background-color: #22262A;
}
html{
  overflow: hidden;
}
</style>
<template>
  <v-app>
    <v-main>
     <router-view></router-view>
    </v-main>
  </v-app>
</template>
