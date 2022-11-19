<template lang="html">
    <!--<transition name="fade-in" appear>-->
  <div @click="showJob(job)" class="job-item">
      <div class="row">
                <div class="col-6">
                    <div class="company-name">{{ job.company }}</div>
                </div>
                 <div class="col-3 col-offset-3 time-row">
                    <i v-if="!seenVal" class="fa fa-circle seen-indicator"> </i>
                    <span class="time-posted">{{ formatTime(job.timeposted) }}</span></div>
            </div>
            <div class="row">
                <div class="col-12">
                    <span class="title" :class="viewed">{{ job.title }}</span></div>
            </div>
         <div class="row">
            <div class="col-12">
                <span  :class="viewed"  class="job-description" >{{ job.summary }}</span>
            </div>
        </div>
        <div class="row">
            <div class="col-10">
                <span v-for="tag in job.tags.slice(0, 6)" class="tag" @click.stop="doSearch(tag)">{{ tag.trim() }}</span>
            </div>
                <div class="col-1 col-offset-1">
                    <transition 
                    name="slide-fade"
                    mode="out-in"
                    v-on:enter="doAnimateStar"
                    v-bind:css="false">
                        <i :ref="'icon-'+jobIndex"
                        v-if="isJobSaved(job)"
                        @click.stop="saveJob()" 
                        key="saved" 
                        class="fas fa-star saved star" aria-hidden="true"></i>
                        <i :ref="'icon-'+jobIndex" v-else @click.stop="saveJob()" key="save" class="far fa-star not-saved star" aria-hidden="true"></i>
                    </transition>
                </div>
        </div>
    </div>
  </div>
  <!--</transition>-->
</template>

<script>
import { mapState } from 'vuex';
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex';
import showdown from 'showdown';
import moment from 'moment-timezone';
import Bounce from 'bounce.js/';

export default {
  data:function(){
    return {
     isSaved: false,
     color: "new",
     seenVal: this.seen
    }
  },
  props: {
      jobIndex: Number,
      source: Number,
      seen: {
          type: Boolean,
          default: true
      }
  },
  mounted: function(){
    // document.documentElement.scrollTop = this.scrollPos;
  },
  methods: {
      showJob: function(job_details){
          switch(this.source){
            case 1:
                this.$store.commit('setSavedPageScrollPos', document.documentElement.scrollTop);
                break;
            case 3:
                this.$store.commit('setSearchPageScrollPos', document.documentElement.scrollTop);
                break;
            case 2:
            default:
                this.$store.commit('setScrollPos', document.documentElement.scrollTop);
          }
          
          this.$store.dispatch("jobViewedAction", this.job.id);
          this.$store.commit('setLastOpenedJob', this.job);
          this.$router.push({name:"job", params: {job: job_details}});
      },
    saveJob: function(){
        //  check if job is already saved
        if(!this.isJobSaved(this.job)){
             this.$store.dispatch('saveJobAction', this.job)
        } else {
            this.$store.dispatch('deleteSavedJobAction', this.job)
        }
    },
    formatTime: function(timestamp){
        /* let curTime = Math.floor(Date.now() / 1000);
        if (curTime - timestamp < 60 * 60 * 24 * 7 * 2){ // two weeks
            this.color = "new";
        } else if (curTime - timestamp < 60 * 60 * 24 * 7 * 4){ // a month
            this.color = "fairly-new";
        } else {
            this.color = "old";
        }*/

        return moment.unix(timestamp).startOf('hour').fromNow();
    },
    doSearch: function(tag){
        let tempList = [tag]
        
        this.$store.dispatch('setCurrentSearchAction', tempList);
        this.$store.dispatch('loadFilteredJobs', {fromSearch: true, data: tempList});
        this.$store.commit("clearSearchedJobs");

        if (!(this.$route.path === '/search')){ /* if not on the search page, go there */
            if (this.$route.path == '/saved'){
                this.$store.commit('setSavedPageScrollPos', document.documentElement.scrollTop);
            } else {
                this.$store.commit("setScrollPos", document.documentElement.scrollTop); // save current scroll pos
            }

            this.$store.commit('setSearchPageScrollPos', 0);
            this.$router.push({name:"search", params: {filters: tempList}});
        } 
    },
    doAnimateStar: function(el, done){
        var bounce = new Bounce();
          bounce.scale({
              from: { x: 0.2, y: 0.2 },
              to: {x: 1, y: 1},
              duration: 700,
              bounces: 3,
              stiffness: 1
          })

         bounce.applyTo(el);
         done();
    }
  },
  computed: {
      ...mapState([
      'scrollPos',
      'savedPageScrollPos',
      'searchPageScrollPos'
      ]),

      ...mapGetters([
          'getJob',
          'getSavedJob',
          'getFilteredJob',
          'getSearchedJob',
          'isJobSaved',
          'getIsJobViewed'
      ]),
      ...mapActions([
          'saveJobAction'
      ]),
      job: function(){ 
          var index = this.jobIndex - 1; // do this because v-for starts with 1
          
          if (this.source === 0 ) return this.getJob(index);
          else if (this.source === 1) return this.getSavedJob(index);
          else if (this.source === 2) return this.getFilteredJob(index);
          else if (this.source === 3) return this.getSearchedJob(index);
      },
      viewed: function(){
          return this.getIsJobViewed(this.job.id) ? "viewed" : "";
      }
  }
}
</script>

<style scoped lang="css">
  .job-item {
      padding-top: 7px;
      padding-bottom: 15px;
      padding-left: 20px;
      padding-right: 30px;
      font-family: "Open Sans", Arial, Helvetica, sans-serif;
      border-bottom:1px solid #EDEDED;
      cursor: pointer;
      margin-left: -15px;
      margin-right: -7px;
      overflow-x: hidden; 
  }

  .job-item:hover {
      background-color: #F2F2F2;
  }

  .far, .fas {
      font-size: 13px; 
  }

  .img-thumbnail {
      padding: 0px;
      border: 0px;
      height: 22px;
      width: 25px;
    }

    .alt-img {
        font-size: 13px;
        /*border: 3px solid rgba(102, 0, 204, 0.356);*/
        color: rgba(102, 0, 204, 0.329);
        font-weight: bolder;
        padding: 3px;
        border-radius: 3px;
        text-align: center;
        background: rgb(255, 254, 254);
    }

    .company-row {
        display: flex;
        align-items: center;
    }

    .tag {
        color: #999999;
        font-size: 11px;
        font-family: 'Open Sans';
        padding-right: 8px;
        transition: color 0.2s linear;
        /* border: solid transparent 1px; */
        border-radius: 2px;
        /* border-radius: 3px; */
    }

    .tag:hover {
        color: #6600CC;
        /* border: solid #6600CC 1px; */
    }

  .title {
    color: #666666;
    font-weight: bold;
    font-size: 13px;
  }

  .company-name{
    color: #999999;
    font-size: 11px;
    margin-top: 3px;
  }

  .seen-indicator {
       font-size: 5px;
       color: #6600CC;
       padding-right: 5px;
       margin-bottom: 3px;
  }
    
  .with-logo {
    margin-left: -20px;
  }

  .time-posted{
    color: #999999ce;
    font-size: 12px;
  }

  .time-row{
      padding-right: 3px !important;
      text-align: right;
      margin-top: 3px;
  }

    .new {
        color: rgba(0, 128, 0, 0.39);
    }

    .fairly-new {
        color: #0000ff75;
    }

    .old {
        color: #ff00006b;
    }

  .tags{
    color: #999999;
    font-size: 11px;
    font-family: monospace;
  }

  .job-description{
    color: #666666;
    font-size: 12px;
    font-family: 'Lato', 'Open Sans', Arial, Helvetica, sans-serif;
    font-weight: 400;
  }

    .viewed {
        color: rgba(80, 80, 80, 0.603);
    }

  .row .row {
      margin-top: 5px;
  }

  .saved {
      color: #ff6600;
  }

  .star {
      font-size: 12px;
      transition: font-size 0.2s;
  }

  .star:hover {
      font-size: 14px;
  }

  .not-saved {
      color: #999999;
  }

  .not-saved:hover {
      color: #6600CC;
  }

  /*.slide-fade-enter-active {
  transition: all .3s ease;
  }*/

.slide-fade-leave-active {
  transition: all .5s ease;
}

.slide-fade-leave
/* .slide-fade-leave-active below version 2.1.8 */ {
  /* opacity: 0; */
  transform: scale(0.5);
}

.fade-in-enter-active, .fade-in-leave-active {
    transition: all .2s ease;
}

.fade-in-enter, .fade-in-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

</style>
