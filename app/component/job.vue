<template lang="html">
    <transition name="slide-fade">
        <div class="job-root">
            <div class="header">
        <div class="row">
            <div class="col-1 close-icon" @click="closeJob()"><i class="fa fa-times"></i>
            </div>
            
            <div class="col-7 job-title"> {{ pageTitle }} </div>
            <button class="btn btn-default col-2 col-offset-3 apply-button" type="button" @click="goApply()" >Apply</button>
        </div>
        </div>
        
        <div class="row">
            <div class="col-12 job-content">
                <div class="row">
                    <div class="col-12 old-warning" v-if="isJobOld()">
                        <span>This job advert may have expired.</span>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 company">
                        <span> {{ job.company }} </span>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 title">
                        <span> {{ job.title }}</span>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 time-posted">
                        <span> {{ formatTime(job.timeposted) }} </span>
                    </div>
                </div>
                <div class="row">
                    <div class="description col-12" ref="description"></div>
                </div>

                <div class="row">
                    <div class="tag-row col-12">
                        <span v-for="tag in job.tags" @click.prevent="findTag(tag)" class="job-tag" > {{ tag }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </transition>
</template>

<script>
import showdown from 'showdown'
import feather from 'feather-icons'
import moment from 'moment-timezone'

export default {
  data:function(){
    return {
      job: this.$store.state.lastOpenedJob,
      pageTitle: "Job Description"
    }
  },
  created: function(){
      window.addEventListener('scroll', this.pageScrolled)
  },
  destroyed: function(){
      window.removeEventListener('scroll', this.pageScrolled)
  },
  mounted: function(){
    //var jobDes = this.job.description.replace(/(?:\r\n|\r|\n)/g, '</br>');
    var converter = new showdown.Converter();
    converter.setOption('headerLevelStart', 2);
    converter.setOption('smartIndentationFix', true);
    converter.setOption('simpleLineBreaks', true);
    // converter.setOption('disableForced4SpacesIndentedSublists', true);
    converter.setOption('simplifiedAutoLink', true);

    let htmlStr = converter.makeHtml(this.job.description);
    this.$refs.description.innerHTML = htmlStr.replace(/<br \/>/g, '').replace(/<p><br>/g, '<p>');
    
    var style = document.createElement('style');
    style.innerHTML = "a {color: #6600CC !important;}";

    let links = this.$refs.description.getElementsByTagName("a");
    for(var i=0, max=links.length; i<max; i++) {
        let link = links[i];

        console.log(link.href);

        link.addEventListener('click', function(){
            chrome.tabs.create({url: link.href})
        });
    }

    document.body.appendChild(style);

    document.documentElement.scrollTop = 0;
    feather.replace();
  },
  methods: {
      cleanDescription: function(){
          
      },
      closeJob: function(){
          // console.log("closing job");
          this.$router.go(-1);
      },
      trimTitle: function(title){
          if(title.length > 25){
              var newTitle = title.slice(0);
              return newTitle.slice(0, 22) + "..."
          } else return title;
      },
      formatTime: function(timestamp){
           return moment.unix(timestamp).startOf('hour').fromNow();
      },
      isJobOld: function(){
          return (Math.floor(Date.now() / 1000) - this.job.timeposted) >= 60 * 60 * 24 * 7 * 2; // 2 weeks
      },
      findTag: function(tag){

        let tempList = [tag];

        this.$store.dispatch('setCurrentSearchAction', tempList);
        this.$store.dispatch('loadFilteredJobs', {fromSearch: true, data: tempList});
        this.$store.commit("clearSearchedJobs");
        this.$store.commit('setSearchPageScrollPos', 0);

        this.$router.push({name:"search", params: {filters: tempList}});
      },
      goApply: function(){
          // https://remoteok.io/l/65489
           chrome.tabs.create({url: this.job.url})
      },
      pageScrolled: function(){
          var pos = document.documentElement.scrollTop;
          if (pos >= 58){
              var temp;

              if(this.job.title.length > 34){
                  temp = this.job.title.slice(0);
                  temp = temp.slice(0, 30) + "...";
              } else {
                  temp = this.job.title;
              }

              this.pageTitle = temp;
          } else {
              this.pageTitle = "Job Description"
          }
          // console.log(document.documentElement.scrollTop)
      }
  }
}

</script>

<style scoped lang="css">

.header {
    height: 50px;
    padding-top: 5px;
    border-bottom: 1px solid #EDEDED;
    color: #666666;
    z-index: 1;
    width: 463px;
    position: fixed;
    background-color: #fff;
    padding-left: 10px;
    padding-right: 32px;
}

.job-content {
    top: 50px;
}

.job-title {
    margin-top: 9px;
    color: #969696;
    font-family: 'Lato';
    font-weight: 500;
}

.description {
    color: #666666;
    font-family: 'Open Sans', Arial, Helvetica, sans-serif;
    font-size: 12px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    overflow-y: scroll;
    padding-left: 26px;
}

  .job-root {
      margin-left: -25px;
      padding: 0;
      position: relative;
  }

  .title {
      color: #666666;
      font-size: 19px;
      font-family: 'Open Sans';
      font-weight: bold;
      padding-left: 26px;
      padding-right: 17px;
      margin-top: 1px;
  }


    .time-posted {
        margin-top: 1px;
        margin-left: 13px;
        font-family: 'Lato', Helvetica;
        font-size: 12px;
        color: #999999;
    }

  .company {
      color: #999999;
      font-size: 14px;
      font-family: 'Lato';
      padding-left: 26px;
      padding-right: 17px;
      margin-top: 10px;
  }

  .close-icon {
      margin-top: 9px;
      cursor: pointer;
      height: 20px;
      color: #969696;
    }

  .apply-button {
      border-color: transparent;
      color: #fff;
      font-size: 12px;
      border-radius: 2px;
      box-shadow: 1px 1px 1px 1px #6600cc83;
      margin-top: 4px;
      background-color: #6600CC;
      font-size: 12px;
      font-family: 'Open Sans';
      margin-left: 16%;
    }

  .apply-button:hover {
      color: #ffffff;
      background-color: #6600CC;
  }

  .tag-row {
      font-family: 'Lato';
      font-size: 12px;
      color: #999999;
      left: 13px;
      margin-bottom: 30px;
      padding-right: 19px;
      text-align: center;
  }

  .job-tag {
      display: inline-block;
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 2px;
      padding-bottom: 2px;
      margin-right: 10px;
      margin-top: 10px;
      border-radius: 3px;
      border: 1px solid #99999975;
      cursor: pointer;
  }

  .job-tag:hover {
      background-color: #99999924;
  }

  .old-warning {
      background-color: #6600CC;
      padding: 4px;
      left: 15px;
      text-align: center;
      padding-right: 21px;
  }

  .old-warning span {
      
      font-family: 'Lato';
      font-size: 12px;
      color: wheat;
  }
 

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .2s ease;
}

.slide-fade-enter {
  transform: translateY(50px);
  opacity: 0;
}

.slide-fade-leave-to{
    opacity: 0;
}

</style>