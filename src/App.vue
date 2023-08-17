<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div class="switch__wrapper">
      <label for="switch">Change mode</label>
      <input v-model="mode" id="switch" class="switch" type="checkbox" >
    </div>
    <keep-alive>
      <WithoutVUEX v-if="!mode"/>
      <WithVUEX  v-else/>
    </keep-alive>
  </div>
</template>

<script>
import WithoutVUEX from './components/WithoutVUEX.vue'
import WithVUEX from './components/WithVUEX.vue'
export default {
  name: 'App',
  components: {
    WithoutVUEX,
    WithVUEX
  },
  data(){
    return {
      mode: false
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.switch__wrapper {
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

input.switch {
  display: block;
  -moz-appearance: none;
  -webkit-appearance: none;
  -o-appearance: none;
  appearance: none;
  height: 2em;
  width: 3em;
  border-radius: 1em;
  box-shadow: inset -1em 0px 0px 0px rgba(192, 192, 192, 1);
  background-color: white;
  border: 1px solid rgba(192, 192, 192, 1);
  outline: none;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}

input.switch:checked {
  box-shadow: inset 1em 0px 0px 0px rgba(33, 150, 243, 0.5);
  border: 1px solid rgba(33, 150, 243, 1);
}

input.switch:focus {
  outline-width: 0;
}
</style>
