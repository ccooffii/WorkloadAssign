import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';

createApp(App)
  .use(ElementPlus)      // set up Element Plus UI library:contentReference[oaicite:7]{index=7}
  .mount('#app');