<template lang="html">
  <div class="saved-root">
    <div class="row">
            <div class="col-12 tab-header">
              <div class="row">
                <div class="col-1" @click.stop="closePage()">
                  <i class="fa fa-times close-starred-icon"></i>
                </div>

                <div class="col-2 starred-title">
                  <span>Starred</span>
                </div>
              </div>
            </div>
        </div>
        <joblist class="jobs" :source='source' :job-count='count'></joblist>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import JobList from "./joblist.vue";

export default {
  data:function(){
    return {
      title:'Vue.js',
      source: 1 // 0 => All jobs, 1 => Saved Jobs, 2 => History
    }
  },
  methods: {
    closePage: function(){
      this.$router.go(-1);
    }
  },
  components: {
    joblist: JobList
  },
  computed: {
    ...mapGetters({
      count: 'getSavedJobCount'
    })
  }
}
</script>

<style scoped lang="css">

  .tab-header {
    height: 50px;
    border-bottom:1px solid #EDEDED;
    font-family: "Open Sans", Arial, Helvetica, sans-serif;
    padding-top: 15px;
    font-size: 13px;
    position: fixed;
    z-index: 15;
    align-content: center;
    background: #fff;
    padding-left: 20px;
  }

  .saved-root {
      padding: 0;
      margin-left: -10px;
  }

  .jobs {
    margin-top: 50px;
  }

  .close-starred-icon {
    color: #999999;
    cursor: pointer;
  }

  .close-starred-icon:hover {
    color: rebeccapurple;
  }

  .starred-title {
    font-family: 'Open Sans';
    font-weight: 600;
    color: #999999;
    padding-left: 0px;
  }
</style>
