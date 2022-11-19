<template lang="html">
    <div class="row wrap">
        <div class="col-12">
            <div class="row ">   
                <transition
                    v-on:enter="showLoader"
                    v-on:leave="hideLoader">
                    <div class="col-3 col-offset-4 loader" v-if="loading">
                                Loading..
                    </div>
                    <!--<div class="col-12 loader-container" >
                        <div class="row">
                            
                        </div>
                    </div>-->
                </transition>
            </div>

            <div class="row" v-if="jobCount">
                <transition-group name="flip-list"  tag="div" class="col-12" mode="out-in" appear>
                    <joblistitem
                        v-for="index in jobCount"
                        class="job-list-item"
                        :job-index="index"
                        :source="source"
                        :seen="getSeenForIndex()"
                        v-bind:key="getUniqueForIndex(index - 1)">
                    </joblistitem>                  
                </transition-group>
            </div>

            <div v-else class="row">
                <div class="col-12">
                    <div class="row">
                        <div class="col-12 empty-view-icon">
                            <i class="fab fa-earlybirds"> </i>
                        </div>
                    </div>

                    <div class="row"> 
                        <div class="col-12 empty-view-text">
                            <span> {{ getEmptyViewText() }} </span>
                        </div>
                    </div>

                    <div class="row" v-if="source === 2"> 
                        <div class="col-12 empty-view-link" @click="openFiltersPage()">
                            <span> visit <b>filters</b> page </span>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</div>
</template>

<script>

import { mapState } from 'vuex';
import JobListItem from "./joblistitem.vue";
import Bounce from "bounce.js/"

export default {
    data: function(){
        return {
            busy: false,
            page: 0,
            unreadCountMutable: this.unreadCount
        }
    },
    props: {
        source: {
            type: Number,
            default: 0
        },
        jobCount: Number,
        unreadCount: {
            type: Number,
            default: 0
        }
    },
    methods: {
        loadMore: function(){
            this.busy = true;
            /* show animated loading bar here */
            this.$store.dispatch('loadMoreJobs');

            this.busy = false;
        },
        getEmptyViewText: function(){
            if (this.source === 1){ // saved jobs
                return "click the 'star' icon next to jobs to add them here.";
            } else if (this.source === 2){ // filtered jobs
                if (this.isAnyFilterChecked){
                    return "looks like no job matches your filters";
                } else {
                    return "seems you have not activated any filters yet";
                }
            } else if (this.source === 3){ // searched jobs
                return "No job matches your search";
            } else {
                return "No jobs available";
            }
        },
        getUniqueForIndex: function(index){
            if (this.source == 1){
                return this.$store.state.savedJobs[index].id;
            } else if (this.source == 2) {
                return this.$store.state.filteredJobs[index].id;
            } else if (this.source == 3) {
                return this.$store.state.searchedJobs[index].id;
            } else {
                return this.$store.state.jobs[index].id;
            }
        },
        showLoader: function(el){
            var bounce = new Bounce();
            bounce.translate({
                from: {x: 0, y:-50},
                to: {x: 0, y: 60},
                duration: 1000,
                delay: 60,
                stiffness: 2     
            });

            bounce.applyTo(el);
        },
        hideLoader: function(el){
            var bounce = new Bounce();
            bounce.translate({
                from: {x: 0, y:60},
                to: {x: 0, y: -50},
                duration: 4000,
                delay: 0,
                stiffness: 4,
                bounces: 0
            });

            bounce.applyTo(el);
        },
        getSeenForIndex: function(){
            // console.log(this.unreadCountMutable);
            let retVal = this.unreadCountMutable > 0 ? false : true;

            if (this.unreadCountMutable > 0){
                this.unreadCountMutable--
            }
            
            return retVal;
        },
        openFiltersPage: function(){
            this.$router.push({name: 'filters'});
        }
    },
    components: {
        joblistitem: JobListItem
    },
    computed: {
        ...mapState([
            'loading',
            'savedPageScrollPos',
            'searchPageScrollPos',
            'scrollPos'
        ]),
        isAnyFilterChecked: function(){
            var checkedFilters = this.$store.state.filters.filter(function(d){
                return d.checked;
            });

            // console.log("Checked filters length is " + checkedFilters.length);
            
            return checkedFilters && checkedFilters.length > 0;
        }
    },
    mounted: function(){
        var loadIndicator = document.querySelectorAll(".loader");
        
        if (this.loading && loadIndicator.length > 0) {
            this.showLoader(loadIndicator);
        }

        if (this.source === 1){
            document.documentElement.scrollTop = this.savedPageScrollPos;
        } else if (this.source === 3){
            document.documentElement.scrollTop = this.searchPageScrollPos;
        } else {
            document.documentElement.scrollTop = this.scrollPos;
        }
        
    }
}
</script>

<style lang="css">
  .loader{
      position: absolute;
      background-color: #6600CC;
      z-index: 2;
      padding: 5px;
      border-radius: 2px;
      text-align: center;
      color: #fff;
      box-shadow: 1px 1px 1px rgba(83, 83, 83, 0.164);
      margin-top: -50px;
      font-weight: bold;
      font-family: 'Open Sans';
  }

  .wrap {
      overflow: hidden;
      width: 463px;
    }

   .slide-leave-active {
        transition: all .2s ease;
    }

  .slide-enter-active {
      transition: all .2s ease;
  }

  .slide-enter, .slide-leave-to {
      transform: translateY(-50px);
      opacity: 0;
  }

  .loader-container {
      width: 463px;
  }

  .col-centered{
    float: none;
    margin: 0 auto;
}

    .empty-view-icon {
        color: #6600cc24;
        font-size: 170px;
        margin-top: 67px;
        text-align: center;
    }

    .empty-view-text {
        text-align: center;
        color: #999999b8;
        font-family: 'Lato', 'Open Sans';
        font-size: 13px;
    }

    .empty-view-link {
        text-align: center;
        font-family: 'Lato';
        color: #6600CC;
        font-size: 12px;
        cursor: pointer;
    }

    .empty-view-link:hover {
        text-decoration: underline;
    }

    .job-list-item {
        transition: all 0.3s ease-out;
    }

    /* .flip-list-move {
        transition: transform 0.3s;
    }

    .flip-list-leave-active, .flip-list-enter-active{
        transition: opacity 0.3s, transform 0.3s;
    }*/

    .flip-list-leave-active {
         position: absolute;
    }

    .flip-list-leave-to {
        opacity: 0;
        transform: scale(0.5);
    }

    .flip-list-enter{
        opacity: 0;
        transform: translateY(10px);
    }

</style>
