<template lang="html">
    <transition name="slide-fade">
    <div class="row">
        <div class="col-12 search-root">
            <filterdialog v-if="showdialog" 
            :show-prop="showdialog" 
            v-on:hide="showdialog=false"
            v-on:saved="filterSaved"
            :def-tags="filters"></filterdialog>
        <div class="row">
            <div class="col-12 search-header">
                <div class="row">
                    <div class="col-1 close-button" @click="closeFilter()"><i class="fa fa-times"></i></div>
                    <div class="col-2 search-label"> Search</div>
                    <div class="col-2 col-offset-6">
                        <button class="save-search-button btn btn-default" @click="saveFilters()">save</button></div>
                </div>
                <div class="filter-form"><searchform :filters='filters' ref="searchForm"></searchform></div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12 search-content">
                <div class="row error-message" v-if="errorMessage">
                    <div class="col-offset-2 col-8"> {{ errorMessage }} </div>
                    <div class="col-offset-2" @click.stop="errorMessage=''">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                </div>
                
                <joblist :source='source' :job-count='getSearchedJobsCount'></joblist>
            </div>
        </div>
        <div class="row">
            <transition
                v-on:enter="showLoader"
                v-on:leave="hideLoader">
                <div class="col-4 col-offset-2 filter-saved" v-if="showSavedAlert"> <i class="far fa-check-circle"></i>Filter saved successfully!</div>
            </transition>
        </div>
        </div>
    </div>
    </transition>
</template>

<script>

import SearchForm from './searchform.vue';
import JobList from './joblist.vue';
import FilterDialog from './filterdialog.vue';
import { mapGetters } from 'vuex';
import Bounce from 'bounce.js/';

export default {
  data:function(){
    return {
        source: 3,
        filters: this.$route.params.filters,
        showdialog: false,
        showSavedAlert: false,
        savedFilterName: ""
    }
  },
  components: {
      searchform: SearchForm,
      joblist: JobList,
      filterdialog: FilterDialog
  },
  computed: {
      ...mapGetters([
          "getFilteredJobsCount",
          "getSearchedJobsCount"
      ]),
      errorMessage: {
          get(){
              return this.$store.state.errorMessage;
          },
          set(msg){
              this.$store.commit("setErrorMessage", msg);
          }
      }
  },
  methods: {
      closeFilter: function(){
          this.$store.commit("setSearchPageScrollPos", 0); // reset scroll pos
          this.$router.go(-1);
      },
      filterSaved: function(name){
          this.savedFilterName = name;
          this.showSavedAlert = true;

          var self = this;

          setTimeout(() => {
              self.showSavedAlert = false;
          }, 2 * 1000);
      },
      showLoader: function(el){
            var bounce = new Bounce();
            bounce.translate({
                from: {x: 0, y: 100},
                to: {x: 0, y: -30},
                duration: 1000,
                /* delay: 70, */
                stiffness: 3,
                bounces: 4
            });

            bounce.applyTo(el);
        },
    hideLoader: function(el){
        var bounce = new Bounce();
        bounce.translate({
            from: {x: 0, y:-30},
            to: {x: 0, y: 100},
            duration: 1000,
            /* delay: 0, */
            stiffness: 4,
            bounces: 0
        });

        bounce.applyTo(el);
    },
    saveFilters: function(){
        var search = this.$refs.searchForm;
        this.filters = search.getTags();

        this.showdialog = true;
    }
  },
  mounted: function(){
      // debugger;
      // this.$store.dispatch('filterJobs', this.filters)
  }
}
</script>


<style scoped lang="css">
    .filter-saved {
        position: fixed;
        background-color: #6600CC;
        z-index: 2;
        padding: 5px;
        padding-right: 15px;
        padding-left: 15px;
        border-radius: 3px;
        text-align: center;
        color: #fff;
        box-shadow: 1px 1px 1px rgba(83, 83, 83, 0.164);
        bottom: 30px;
        font-family: 'Open Sans'
    }

    .filter-saved .far.fa-check-circle {
        color: #06d606;
        margin-right: 10px;
    }

  .search-root {
      padding: 0px;
      margin-left: 15px;
      /* position: absolute; */
  }

  .search-header {
      padding-top: 10px;
      position: fixed;
      z-index: 10;
      background: #ffffff;
      margin-left: -10px;
      width: 463px;
    }

  .search-content {
      margin-top: 134px;
      margin-left: -10px;
  }

  .search-label {
      color: #666666;
      font-weight: bold;
      margin-top: 8px;
  }

  .col-centered{
    float: none;
    margin: 0 auto;
}

  .close-button {
      color: #666666;
      cursor: pointer;
      margin-top: 8px;
      margin-left: 4px;
  }

  .save-search-button {
      margin-top: 4px;
      border-color: transparent;
      color: #fff;
      background-color: #3c763d;
      font-size: 12px;
      font-family: 'Open Sans';
      margin-left: 14px;
      border-radius: 2px;
      box-shadow: 1px 1px 1px 1px #c3c3c3bd;
  }

  .save-search-button:hover {
      color: #ffffff;
      background-color: #3c763d;
      border-color: transparent;
  }

  .error-message {
    /* margin-top: 114px; */
    background-color: red;
    color: white;
    font-size: 11px;
    padding-bottom: 5px;
    padding-top: 5px;
    font-family: 'Open Sans', Arial, Helvetica, sans-serif;
}

.error-message svg {
  height: 16px;
  stroke-width: 5px;
  cursor: pointer;
}

.error-message svg:hover {
  height: 18px;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .2s ease;
}

.slide-fade-enter
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(50px);
}

.slide-fade-leave-to {
    opacity: 0;
}

</style>

