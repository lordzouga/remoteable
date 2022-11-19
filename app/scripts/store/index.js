import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VuexPersistence from 'vuex-persist'
import stringFormat from 'python-format'
import { setTimeout } from 'timers';
import { print } from 'util';

Vue.use(Vuex)

const vuexLocalStorage = new VuexPersistence({
  key: 'vuex',
  filter: (mutation) => (mutation.type == 'searchedJobs'),
  storage: window.localStorage
});

function loadJobsFromServer(success, failure, whereParam){
  store.commit("setErrorMessage", "");

  axios({
    method: 'get',
    url: 'http://18.216.89.186:9000/document/jobs',
    headers: {'X-BB-SESSION': '2654857b-8336-428a-97d5-80b04e4db7dd'},
    params: {
      where: whereParam,
      page: 0,
      recordsPerPage: 50,
      orderBy: 'timeposted desc'
    }
  })
  .then(success)
  .catch(failure)
}

function getErrorMsg(response){
  if(!response.response) { return "couldn't reach remote server, internet problem?" }

  let errorObj = response.response.data;
  console.log(errorObj.message);

  if (errorObj.http_code){
    if(errorObj.http_code == 401){
      // 401
      return "Authentication error, refresh token and retry";
    } else if (errorObj.http_code == 500){
      // 500
      return "Internal server error";
    } else {
      return "request failed for unknown reason"
    }

  } else {
    return "request failed for unknown reason";
  }
}

function applyData(newData, oldData, jobLimit){
  var newJobsLength = newData.length;
  var jobLength = oldData.length;

  /* The server returns newest jobs first. reverse it so that we can insert correctly */
  var newJobsReversed = newData.slice().reverse();

  for (var i = 0; i < newJobsLength; i++){
    oldData.splice(0, 0, newJobsReversed[i]); // insert into the first position
  }

  if (oldData.length > jobLimit){ // check if limit was exceeded
    var diff = oldData.length - jobLimit;

    oldData.splice(jobLimit, diff); // strip excess jobs
  }

  return oldData;
}

const FILTERED_JOBS_ONLY = "1";
const ALL_JOBS = "2";

const storeConfig = {
  state: {
    jobs: [],
    savedJobs: [],
    filteredJobs: [],
    searchedJobs: [],
    filters: [],
    viewedJobIDs: [],
    scrollPos: 0,
    lastUpdateTime: 0,
    loading: false,
    firstLaunch: true,
    enableFilters: false,
    filtersDirty: false,
    lastFilteredUpdateTime: 0,
    currentSearch: [],
    enableNotifications: false,
    notificationType: FILTERED_JOBS_ONLY,
    unreadCount: 0,
    errorMessage: "",
    savedPageScrollPos: 0,
    searchPageScrollPos: 0,
    lastOpenedJob: {},
    jobLimit: 50,
    page: 0, // add page data here so that we can handle page retries
  },
  actions: {
    loadJobs: function ({ commit }) {
      let curTime = Math.floor(Date.now() / 1000);

      /* if not up to 2 minutes since last update
      if (!curTime - this.state.lastUpdateTime > 2) {
        console.log("Not yet time for update");
        return;
      }*/
      
      commit('setLoading', true);

      var whereParam = 'timeposted > ' + this.state.lastUpdateTime;

      var successCb = function(response){
        /* hide any loading indicator */
        commit('setLoading', false);
        
        console.log("loading jobs successful");
        if (response.data.data.length > 0){
          commit('setJobs', { list: response.data.data });
          var lastJobTime = response.data.data[0].timeposted;

          commit('setLastUpdateTime', lastJobTime);
        }        
      }

      var failureCb = function(error){
        commit('setLoading', false);
        console.log(error);
        commit("setErrorMessage", getErrorMsg(error));
      }

      loadJobsFromServer(successCb, failureCb, whereParam);
  },
  loadFilteredJobs: function(state, filterObj){
    let curTime = Math.floor(Date.now() / 1000);

    /* if not up to 2 minutes since last update 
    if (!curTime - this.state.lastFilteredUpdateTime > 2 * 60) {
      return;
    } */
    // console.log("load filtered called");
    state.commit('setLoading', true);

    var successCb = function(response){
      state.commit('setLoading', false);

      if (response.data.data.length > 0){

        if (filterObj.fromSearch){ // if the call is from the search interface
          state.commit("setSearchedJobs", response.data.data);
        } else {
          state.commit('setFilteredJobs', response.data.data);

          var lastJobTime = response.data.data[0].timeposted;
          state.commit('setLastFilteredUpdateTime', lastJobTime);
          state.commit('setFiltersDirty', false);
        }
      } else if (!filterObj.fromSearch){ // if it is empty but it is also not from search
        state.commit('setFiltersDirty', false);
      }
    }

    var failureCb = function(error){
      state.commit('setLoading', false);
      console.log(error);
      state.commit("setErrorMessage", getErrorMsg(error));
    }
    
    /* remove trailing white spaces */
    var whereParamList = filterObj.data.map(function(d, i){
      return stringFormat("'{}' in tags", d.trim());
    });

    if (!whereParamList || whereParamList.length == 0){
      return;
    }

    var updateTime = !filterObj.fromSearch ? state.state.lastFilteredUpdateTime : 0;

    var whereParam = "(" + whereParamList.join(" or ") + ') and ' + 'timeposted > ' + updateTime;

    loadJobsFromServer(successCb, failureCb, whereParam);
  },
  saveScrollPos: function (state, newPos){
    state.commit('setScrollPos', newPos);
  },
  saveJobAction: function(state, job){
    state.commit('saveJob', job);
  },
  addFilterAction: function(state, filter){
    state.commit('addFilter', filter);
  },
  setFirstLaunchAction: function(state, value){
    state.commit('setFirstLaunch', value);
  },
  toggleFilterAction: function(state, index){
    state.commit('toggleFilter', index);
  },
  setEnableFiltersAction: function(state, value){
    state.commit('setEnableFilters', value);
  },
  deleteSavedJobAction: function(state, value){
    state.commit('deleteSavedJob', value);
  },
  setCurrentSearchAction: function(state, value){
    state.commit("setCurrentSearch", value);
  },
  doFilter: function(store){
    /* remove disabled filter objects */
    var enabledFilters = store.state.filters.filter(function(d){
      return d.checked;
    });
    
    if (enabledFilters.length == 0) {
      store.commit("clearFilteredJobs");
      store.commit("setLastFilteredUpdateTime", 0);
      return;
    }

    /* join all the filters into one list */
    var allFilters = []
    for(var i = 0; i < enabledFilters.length; i++){
      Array.prototype.push.apply(allFilters, enabledFilters[i].tags);
    }

    /* convert to Set() and convert it back to list() to strip duplicate tags */
    var stripped = Array.from(new Set(allFilters));

    var obj = {isList: true, data: stripped};
    store.dispatch("loadFilteredJobs", obj);
  },
  setSearchedJobsAction: function(state, value){
    state.commit("setSearchedJobs", value);
  },
  jobViewedAction: function(state, hash){
    state.commit('addToViewedJobs', hash);
  },
  applyToAllFiltersAction: function(state, value){
    state.commit("applyToAllFilters", value);
  }
  },
  mutations: {
    setJobs: (state, { list }) => {
      applyData(list, state.jobs, state.jobLimit);
      //state.jobs = list;
    },
    setScrollPos: function (state, newPos){
      state.scrollPos = newPos;
    },
    setSavedPageScrollPos: function (state, pos){
      state.savedPageScrollPos = pos;
    },
    setSearchPageScrollPos: function (state, pos){
      state.searchPageScrollPos = pos;
    },
    saveJob: function (state, job){
      state.savedJobs.splice(0, 0, job)
    },
    setLastUpdateTime: function (state, time){
      state.lastUpdateTime = time;
    },
    addMoreJobs: function (state, moreJobs){
      Array.prototype.push.apply(state.jobs, moreJobs);
    },
    savePage: function (state, page){
      state.page = page;
    },
    setFilteredJobs: function (state, filtered){
      applyData(filtered, state.filteredJobs, state.jobLimit);
      // state.filteredJobs = filtered;
    },
    setLoading: function (state, value){
      state.loading = value;
    },
    setFirstLaunch: function(state, value){
      state.firstLaunch = value;
    },
    addFilter: function(state, value){
      state.filters.splice(0, 0, value);
    },
    toggleFilter: function(state, index){
      var temp = state.filters[index];
      temp.checked = !temp.checked;

      state.filters.splice(index, 1, temp);
    },
    setEnableFilters: function(state, value){
      state.enableFilters = value;
      // state.filtersDirty = true;
    },
    setFiltersDirty: function(state, value){
      state.filtersDirty = value;
      
      /* do this to get all the data from the filter */
      // state.lastFilteredUpdateTime = 0;
    },
    setLastFilteredUpdateTime: function(state, value){
      state.lastFilteredUpdateTime = value;
    },
    deleteSavedJob: function(state, job){
      var jobMatch = state.savedJobs.filter(function(j){
        return j.id == job.id;
      });

      if (jobMatch.length > 0){
        var index = state.savedJobs.indexOf(jobMatch[0]); /* use the first instance of the match. Should always be only one item */
        state.savedJobs.splice(index, 1);
      }
    },
    setCurrentSearch: function(state, value){
      state.currentSearch = value;
    },
    setSearchedJobs: function(state, value){
      state.searchedJobs = value;
    },
    addToViewedJobs: function(state, hash){
      state.viewedJobIDs.push(hash);
      state.viewedJobIDs = Array.from(new Set(state.viewedJobIDs));
    },
    applyToAllFilters: function(state, value){
      for(var i = 0; i < state.filters.length; i++){
        var temp = state.filters[i];
        temp.checked = value;

        state.filters.splice(i, 1, temp);
      }

      // state.filtersDirty = true;
    },
    deleteFilter: (state, index) => {
      state.filters.splice(index, 1);
      // state.filtersDirty = true;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setEnableNotifications: (state, value) => {
      state.enableNotifications = value;
    },
    setNotificationType: (state, value) => {
      state.notificationType = value;
    },
    clearFilteredJobs: (state) => {
      let len = state.filteredJobs.length;

      state.filteredJobs.splice(0, len);
    },
    clearSearchedJobs: (state) => {
      let len = state.searchedJobs.length;

      state.searchedJobs.splice(0, len);
    },
    setErrorMessage: (state, msg) => {
      state.errorMessage = msg;
    },
    setLastOpenedJob: (state, job) => {
      state.lastOpenedJob = job;
    },
    saveDefTags: (state, defTag) => {
      var defFilterId = "deftag";

      var oldIndex = state.filters.findIndex(function(item){
        return item.id == defFilterId;
      });

      if (oldIndex == -1){
        var temp = new Object();

        temp.title = "Saved Filters";
        temp.tags = [defTag];
        temp.id = defFilterId;
        temp.checked = true;

        state.filters.splice(0,0, temp);
      } else {
        var filter = state.filters[oldIndex];
        state.filters.splice(oldIndex, 1); // remove it from it's initial position
        if (filter.tags.indexOf(defTag) == -1){
          filter.tags.push(defTag);
        }
        state.filters.splice(0,0, filter)
      }
    }
  },
  getters: {
    getJobs: state => {
      return state.jobs;
    },
    getScrollPos: state => {
      return state.scrollPos;
    },
    getJob: state => {
      return index => state.jobs[index];
    },
    getJobCount: state => {
      return state.jobs.length;
    },
    getSavedJobs: state => {
      return state.savedJobs;
    },
    getSavedJobCount: state => {
      return state.savedJobs.length;
    },
    getSavedJob: state => {
      return index => state.savedJobs[index];
    },
    isJobSaved: state => { // returns true if job is saved
      return job => {
        let filtered = state.savedJobs.filter(function(d){
          return job.id === d.id; 
        });
        
        return filtered.length > 0;
      }
    },
    getLastUpdateTime: state => {
      return state.lastUpdateTime;
    },
    getFilteredJobsCount: state => {
      return state.filteredJobs.length;
    },
    getFilteredJob: state => {
      return index => state.filteredJobs[index];
    },
    getLoading: state => {
      return state.loading;
    },
    getFirstLaunch: state => {
      return state.firstLaunch;
    },
    getFilters: state => {
      return state.filters;
    },
    getFilterToggleState: state => {
      return index => {
        state.filters[index].checked;
      }
    },
    getFilter: state => {
      return index => state.filters[index];
    },
    getFilterCount: state => {
      return state.filters.length;
    },
    getEnableFilters: state => {
      return state.enableFilters;
    },
    getFiltersDirty: state => {
      return state.filtersDirty;
    },
    getCurrentSearch: state => {
      return state.currentSearch;
    },
    getSearchedJobs: state => {
      return state.searchedJobs;
    },
    getSearchedJob: state => {
      return index => state.searchedJobs[index];
    },
    getSearchedJobsCount: state => {
      return state.searchedJobs.length;
    }, 
    getIsJobViewed: state => {
      return hash => new Set(state.viewedJobIDs).has(hash);
    }
  },
  plugins: [vuexLocalStorage.plugin]
}

const store = new Vuex.Store(storeConfig);

export default store
export { storeConfig };