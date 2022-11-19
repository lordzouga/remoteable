// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';
import axios from 'axios';
import stringFormat from 'python-format';
import chromereload from 'chromereload';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);

  if(details.reason == "update" && details.previousVersion === "1.0.4"){
    console.log("Update detected. Implementing changes")

    /* take the time of the newest item and make it the last update time */
    var storage = localStorage.getItem('vuex');
    if (!(typeof(storage) === "undefined")){
      var storageObject = JSON.parse(storage);
      if (storageObject.jobs && storageObject.jobs.length > 0){
        storageObject.lastUpdateTime = storageObject.jobs[0].timeposted;
      }

      if (storageObject.filteredJobs && storageObject.filteredJobs.length > 0){
        storageObject.lastFilteredUpdateTime = storageObject.filteredJobs[0].timeposted;
      }
    }

    localStorage.setItem("vuex", JSON.stringify(storageObject));
  }
});

if (!isPopUpOpen()){
  console.log("Popup not open");
}

// chrome.browserAction.setBadgeText({text: '5'});

/* init storage */
if (!localStorage.getItem('vuex')){
  localStorage.setItem('vuex', JSON.stringify({}));
}

var store = JSON.parse(localStorage.getItem('vuex')); 

if (!store.lastUpdateTime) store.lastUpdateTime = 0;
if (!store.lastFilteredUpdateTime) store.lastFilteredUpdateTime = 0;
if (!store.jobs) store.jobs = [];
if (!store.filteredJobs) store.filteredJobs = [];
if (!store.jobLimit) store.jobLimit = 50;
if (!store.filters) store.filters = [];
if (!store.enableFilters) store.enableFilters = false;
if (typeof(store.enableNotifications) === "undefined") store.enableNotifications = false;
if (!store.unreadCount) store.unreadCount = 0;

localStorage.setItem("vuex", JSON.stringify(store));

/* Takes newData and inserts it into oldData in a reverse order

    @param newData: List of items to be inserted
    @param oldData: List of data to be inserted into 
    
    @returns a list representing the merged data*/
export function applyNewData(newData, oldData){
  // store = JSON.parse(localStorage.getItem('vuex')); /* Do this to make sure you have fresh data everytime */

  var newJobsLength = newData.length;
  var jobLength = oldData.length;
  var jobLimit = store.jobLimit;

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


export function requestFromBackend(success, failure, whereParam){
  axios({
    method: 'get',
    url: 'http://18.216.89.186:9000/document/jobs',
    headers: {'X-BB-SESSION': '2654857b-8336-428a-97d5-80b04e4db7dd'},
    params: {
      where: whereParam,
      page: 0,
      recordsPerPage: store.jobLimit,
      orderBy: 'timeposted desc'
    }
  })
  .then(success)
  .catch(failure)
}

export function loadAllJobs(){
  var success = function(response){
    if (isPopUpOpen()) return;

    if (response.data.data.length > 0){
      applyNewData(response.data.data, store.jobs);
      store.lastUpdateTime = response.data.data[0].timeposted;

      handleNotification(response.data.data);
      //commit changes
      localStorage.setItem("vuex", JSON.stringify(store))
    }
  };

  var failure = function(error){
    console.log(error);
  };

  var whereParam = 'timeposted > ' + store.lastUpdateTime;

  requestFromBackend(success, failure, whereParam);
}

export function joinFilters(){
  store = JSON.parse(localStorage.getItem('vuex'));

  /* check if there are any active filters */
  /* remove disabled filter objects */
  var enabledFilters = store.filters.filter(function(d){
    return d.checked;
  });

  if (enabledFilters.length === 0){ // if no filters are enabled, no need to continue
    return [];
  }
  
  /* join all the filters into one list */
  var allFilters = [];
  for(var i = 0; i < enabledFilters.length; i++){
    Array.prototype.push.apply(allFilters, enabledFilters[i].tags);
  }

  /* convert to Set() and convert it back to list() to strip duplicate tags */
  var stripped = Array.from(new Set(allFilters));

  /* remove trailing white spaces */
  var whereParamList = stripped.map(function(d, i){
    return stringFormat("'{}' in tags", d.trim());
  });

  return whereParamList;
}

export function loadFiltered(){
  store = JSON.parse(localStorage.getItem('vuex'));

  var whereParamList = joinFilters();
  if (whereParamList.length == 0){ // no filters enabled
    return;
  }

  /* build a conditional param for the backend */
  var whereParam = "(" + whereParamList.join(" or ") + ') and ' + 'timeposted > ' + store.lastFilteredUpdateTime;

  var success = function(response){
    if (isPopUpOpen()) return;

    if (response.data.data.length > 0){
      applyNewData(response.data.data, store.filteredJobs);

      store.lastFilteredUpdateTime = response.data.data[0].timeposted;

      /* send notification here */
      handleNotification(response.data.data);
      //commit changes
      localStorage.setItem("vuex", JSON.stringify(store));
    }
  }

  var failure = function(error){
    console.log(error);
  }

  requestFromBackend(success, failure, whereParam);
}

export function isPopUpOpen(){
  var views = chrome.extension.getViews({ type: 'popup' });

  return views && views.length > 0;
}

export function handleNotification(items){
  if (store.enableNotifications){
    /* check if notifications are enabled or not */
    var id  = 'remoteable';
    var title;
    var iconUrl;
    var message;
    var defImage = "../images/icon-16.png";

    chrome.notifications.clear(id, function(cleared){
      console.log("Notification cleared value is " + cleared);
    });

    if (items.length === 1){
      title = items[0].title;
      iconUrl = items[0].logo.length > 0 ? items[0].logo : defImage;
      message = "new job from " + items[0].company;
    } else {
      let jobTitles;

      title = "New jobs available from " + items.length + " companies";
      iconUrl = defImage;

      jobTitles = items.map((d) => {
        return d.title;
      });

      message = jobTitles.join(", ");
    }

    var opt = {
      type: "basic",
      title: title,
      message: message,
      iconUrl: iconUrl
    }

    var callback = (notifId) => {
      console.log("Notification callback called " + notifId);
    }

    if (!isPopUpOpen()){
      chrome.notifications.create(id, opt, callback);
    }
  }
  
  if (!isPopUpOpen()){
    store.unreadCount += items.length;
    chrome.browserAction.getBadgeText({}, function(badgeText){
      let oldCount = parseInt(badgeText);

      if(!oldCount) oldCount = 0;
      chrome.browserAction.setBadgeText({ text: String(oldCount + items.length) });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#6600CC" });    
    });
  }
}

if (!store.testing){
  setInterval(function(){
    // refresh the store values
    store = JSON.parse(localStorage.getItem('vuex'));

    if (store.enableFilters) { loadFiltered(); }
    else {
      loadAllJobs();
    }

    // localStorage.setItem("vuex", JSON.stringify(store));
  }, 3 * 60 * 1000);
} else {
  console.log("Testing is Live");
}
