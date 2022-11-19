<template lang="html">

<div class="container-fluid">
  <div class="row">

  <div class="col-4 side-nav-col affix">
    <div id="brand"></div>
      <sidenav></sidenav>
    </div>
      <div class="col-8 col-offset-4">
        <router-view></router-view>
      </div>
    </div>
</div>
</template>

<script>
import SideNav from './sidenav.vue';
import { mapGetters } from 'vuex'

export default {
  data(){
    return {
      
    }
  },
  components:{
    sidenav: SideNav
  },
  mounted: function () {
    this.$store.dispatch('loadJobs');
  },
  methods: {
    
  },
  computed: {
    ...mapGetters([
      'getLastUpdateTime'
    ])
  }
}
</script>

<style scoped lang="css">
  .container-fluid {
    width: 660px;
    height: 558px;
    padding: 0;
  }

  #brand {
    font-size: 13px;
    margin-right: 40px;
    margin-left: 45px;
    padding-top: 15px;
    padding-bottom: 10px; 
    font-weight: bold;
    color: #666666;
    height: 50px;
  }

  .side-nav-col {
    height: 600px;
    border-right:1px solid #EDEDED;
    overflow: hidden;
  }

</style>
