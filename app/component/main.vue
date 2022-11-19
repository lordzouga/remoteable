<template lang="html">
    <transition name="fade">
    <div class="root">
        <div class="row">
            <div class="col-12 tab-header">
              <div class="row">
                <div class="col-4">
                  <switches ref="switch"
                    v-model="enableFilters" 
                    :emit-on-mount="false"
                    theme="bulma"
                    label="Enable Filters"
                    color="secondary"
                    class="switch"
                    @input="updateFilteredJobs()"></switches>
                </div>
                <div class="col-1 col-offset-2 refresh" @click.stop="doRefresh()"><i id="refreshIcon" class="header-icon" data-feather="rotate-cw" ></i></div>
                <div class="col-1 notification dropdown" id="dropdowntoggle" @click.stop="dropdownOpen()">

                <transition name="slide-left" mode="out-in">
                  <span v-if="enableNotifications" key="notif-on"> <!--<i data-feather="bell" class="header-icon dropdown-toggle" id="dropdownMenu1" 
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" ></i>-->
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell header-icon dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
                  </span>
                  
                  <span v-else key="notif-off"><!--<i data-feather="bell-off" class="header-icon dropdown-toggle" id="dropdownMenu1" 
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"></i>-->
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell-off header-icon dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><path d="M8.56 2.9A7 7 0 0 1 19 9v4m-2 4H2a3 3 0 0 0 3-3V9a7 7 0 0 1 .78-3.22M13.73 21a2 2 0 0 1-3.46 0"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </span>
                </transition>

                  <transition name="slide-out" appear
                    v-on:before-enter="dropDownBeforeEnter"
                    v-on:before-leave="dropDownAfterLeave">
                    <ul v-if="showDropDown" class="dropdown-menu pull-right" ref="notifdropdown" 
                    aria-labelledby="dropdownMenu1" @click.stop v-on-clickaway="clickOutsideDropdown">
                      <li class="notification-menu-item"> 
                        <switches ref="notificationSwitch"
                          v-model="enableNotifications" 
                          :emit-on-mount="false"
                          theme="bulma"
                          label="Notifications"
                          color="secondary"
                          class="switch"
                          :label-bold="true"
                          id="notificationItemSwitch">
                        </switches>
                      </li>
                      <li role="separator" class="divider"></li>
                      <li class="dropdown-header">Get notified for</li>
                      <li class="notification-radio"> <label>Filtered Jobs Only <radio name="filtered only" value="1" v-model="activeNotificationType"/>
                        <!--<input type="radio" value="1" ></input>-->
                        </label></li>
                      <li class="notification-radio"><label>Any job listing 
                        <radio name="all jobs" value="2" v-model="activeNotificationType"/>
                      </label></li>
                    </ul>
                  </transition>

                </div>
                <div class="col-1 search" @click="doShowSearch()" >
                  <i class="search-icon header-icon" data-feather="search"></i>
                </div>
                </div>
              </div>
        </div>

        <div class="wrapper">
            <searchform ref="searchForm" class="searchlayout first wrapped"></searchform>
        </div>

        <div class="row error-message" v-if="errorMessage">
          <div class="col-offset-2 col-8"> {{ errorMessage }} </div>
          <div class="col-offset-2" @click.stop="errorMessage=''">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </div>

        <div class="row joblist wrapped" v-if="enableFilters">
              <div class="col-12"><joblist :source="2" :unread-count="unreadCount" :job-count="getFilteredJobsCount"></joblist></div>
        </div>
        <div v-else class="row joblist wrapped">
            <div class="col-12"><joblist :job-count="getJobCount" :unread-count="unreadCount"></joblist></div>
        </div>
    </div>
    </transition>
</template>

<script>

import JobList from './joblist.vue';
import SearchForm from './searchform.vue';
import Switches from './switches.vue';
import { mapGetters, mapState } from 'vuex';
import feather from 'feather-icons';
import { Radio } from 'vue-checkbox-radio';
import { mixin as clickaway } from 'vue-clickaway';

export default {
  data:function(){
    return {
      showSearch: false,
      showDropDown: false
    }
  },
  mixins: [ clickaway ],
  methods: {
    doShowSearch: function(){
      if (!this.showSearch){
        document.querySelector('.searchlayout').classList.remove("first");
        
        let searchcomp = this.$refs.searchForm;
        searchcomp.receiveFocus();

        this.showSearch = true;
      } else {
        document.querySelector('.searchlayout').classList.add("first");
        this.showSearch = false;
      }
    },
    doRefresh: function(){
      if(this.enableFilters){
        this.$store.dispatch("doFilter");
      } else {
        this.$store.dispatch("loadJobs")
      }
    },
    updateFilteredJobs: function(value){
      console.log("Do filter called " + value);
      //this.$store.dispatch("doFilter");
    },
    dropdownOpen: function(){
      this.showDropDown = !this.showDropDown;
      //this.showDropDown = !this.showDropDown;
    },
    dropDownBeforeEnter: function(el){
      document.getElementById("dropdowntoggle").classList.add("open");
    },
    dropDownAfterLeave: function(el){
      setTimeout(() => {
        document.getElementById("dropdowntoggle").classList.remove("open");
      }, 300);
    },
    clickOutsideDropdown: function(){
      this.showDropDown = false;
    }
  },
  mounted: function(){
    feather.replace();
    if (this.getFiltersDirty){ /* if the filters have been modified */
      // console.log("filters dirty");
      this.$store.dispatch("doFilter");
    }

    // reset notification count if any
    window.chrome.browserAction.setBadgeText( {text: ""} );
    
    // send hit to google analytics
    /* this.$ga.page({
      page: '/',
      title: 'Home page',
      location: "#"
    })*/

    /* if there are unread jobs scroll to top  */
    if (this.unreadCount > 0){
      this.$store.commit('setScrollPos', 0);
    }

    this.$store.commit("resetUnreadCount");
  },
  components:{
    joblist: JobList,
    searchform: SearchForm,
    switches: Switches,
    radio: Radio
  },
  computed: {
    ...mapGetters([
      'getJobCount',
      'getFilteredJobsCount',
      'getFiltersDirty'
    ]),
    ...mapState([
      'loading',
      'unreadCount'
    ]),
    enableFilters: {
      get(){
        return this.$store.state.enableFilters;
      },

      set(value){
        this.$store.dispatch("setEnableFiltersAction", value);
        var mode = value ? "1" : "2"; // "1" == FILTERED ONLY / "2" == ALL NOTIFICATIONS

        this.$store.commit("setNotificationType", mode);
      }
    },
    enableNotifications: {
      get(){
        // feather.replace();
        return this.$store.state.enableNotifications;
      },

      set(value){
        this.$store.commit("setEnableNotifications", value);
      }
    },
    activeNotificationType: {
      get(){
        return this.$store.state.notificationType;
      },

      set(value){
        this.$store.commit("setNotificationType", value);
      }
    },
    errorMessage: {
      get(){
        return this.$store.state.errorMessage;
      },

      set(msg){
        this.$store.commit("setErrorMessage", msg);
      }
    }
  },
  watch: {
    loading: function(){
      if (this.loading) {
        document.getElementById('refreshIcon').classList.add('do-rotate');
      } else {
        document.getElementById('refreshIcon').classList.remove('do-rotate');
      }
    }
  }
}
</script>

<style lang="css">
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

  .refresh-icon {
    font-size: 14px;
    /* color: rgb(133, 133, 133); */
    /* margin-top: 3px; */
    cursor: pointer;
    height: 16px;
    width: 16px;
  }

  .refresh {
    font-family: "Open Sans";
    font-weight: 600;
    color: #8f8f8f;
    padding-right: 0px;
    padding-left: 0px;
    height: 16px;
    width: 16px;
    margin-left: 19%;
  }

  .refresh:hover {
    color: #6600CC;
  }

  .root {
      padding: 0;
      margin-left: -10px;
  }

  .first {
    margin-top: -89px;
  }

  .notification .pull-right {
    right: -50px;
    margin-top: 20px;
  }

  .notification .dropdown-menu {
    min-width: 200px;
  }

  .fade-enter-active{
    transition: opacity .3s;
  }

  .notification {
    padding-left: 0px;
    padding-right: 0px;
    height: 16px;
    width: 16px;
    margin-left: 20px;
  }

  .notification-radio {
    padding-left: 20px;
    padding-bottom: 5px;
  }

  .notification-radio input {
    margin-left: 15px;
  }

  .radio-component {
    display: inline-block;
    margin-left: 15px;
  }

  .notification-radio label {
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    color: #808080;
  }

  li.dropdown-header {
    font-size: 11px;
    margin-bottom: 5px;
  }

  .notification-menu-item {
    cursor: pointer;
    padding-left: 20px;
    padding-top: 10px;
  }

  .notification-menu-item .switch .vue-switcher__label span {
    font-weight: 600 !important;
    font-size: 16px !important;
  }
.header-icon {
  height: 16px;
  width: 16px;
  color: #8f8f8f;
  margin-top: 3px;
  cursor: pointer;
}

.header-icon:hover {
  color: #6600CC;
}

.search {
  color: #8f8f8f;
  cursor: pointer;
  margin-left: 20px;
  width: 16px;
  height: 16px;
  padding-right: 0px;
  padding-left: 0px;
}


.search:hover{
  color: #6600CC;
  /* font-weight: bold; */
  /* position: fixed; */
}

.notification-radio .radio-component>input+label>.input-box {
    border-color: #7f00ff;
    background: #7f00ff;
  }
  
.wrapper {
  margin-top: 50px;
}

.wrapped {
  transition: all 0.3s ease;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

.do-rotate {
  animation:spin 4s linear infinite;
  -webkit-animation: spin 4s linear infinite;
}

.notification-radio .radio-component > input + label > .input-box > .input-box-circle {
  background: #fff;
}

.slide-out-enter-active, .slide-out-leave-active {
  transition: all .3s ease;
}

.slide-out-enter, .slide-out-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: all .3s ease;
}

.slide-left-enter, .slide-left-leave-to {
  transform: scale(0.2);
  opacity: 0.5;
}

.error-message {
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


@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
</style>