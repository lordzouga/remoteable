import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import App from '../component/app.vue';
import Main from '../component/main.vue';
import Job from '../component/job.vue';
import Saved from '../component/saved.vue';
import SearchResult from '../component/searchresult.vue';
import Filters from '../component/filters.vue';
import store from './store'
import infiniteScroll from 'vue-infinite-scroll'
import feather from 'feather-icons';
import OpenSans from 'typeface-open-sans';
import Lato from 'typeface-lato';
import VueAnalytics from 'vue-analytics';

Vue.use(VueRouter);
Vue.use(infiniteScroll);

const routes = [
  {path: '/', name: 'main', component: Main},
  {path: '/job', name: 'job', component: Job},
  {path: '/saved', name: 'saved', component: Saved},
  {path: '/search', name: 'search', component: SearchResult},
  {path: '/filters', name: 'filters', component: Filters}
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

var app=new Vue({
  el:'#app',
  data:{
    name:'remoteable'
  },
  router,
  store,
  render: h =>h(App)
})

function isDevMode(){
  return !('update_url' in chrome.runtime.getManifest());
}

if (!isDevMode()){
  Vue.use(VueAnalytics, {
    id: 'UA-116015780-1',
    // checkDuplicatedScript: true,
    set: [
      {field: 'checkProtocolTask', value: function(){}}
    ],
    router
  })
}

