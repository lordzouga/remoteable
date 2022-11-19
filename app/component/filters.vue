<template lang="html">
    <transition name="slide-fade">
        <div class="root">
            <filterdialog v-if="showdialog" :show-prop="showdialog" v-on:hide="showdialog=false" class="dialog"></filterdialog>
            <div class="row header">
                <div class="col-1"><i class="fa fa-times close-icon" @click="close()"></i></div>
                <div class="col-3 title">Filters</div>
                <div class="col-offset-4 col-4">
                    <button class="add-button btn btn-default" @click="showdialog = !showdialog">Add Filter</button>
                </div>
            </div>

            <div class="row filter-list">
                <transition-group class="col-12" name="flip-list" tag="div" mode="out-in" appear>
                    <filteritem v-for="index in filterCount" 
                    :filter-index="index - 1"
                    :key="getId(index - 1)"
                    class="flip-list-item"></filteritem>
                </transition-group>
            </div>

            <div class="row foot-nav">
                <div class="col-3 col-offset-6"><span class="footer-button enable-all" @click="doToggleAll(true)">Enable All</span></div>
                <div class="col-3"><span class="footer-button disable-all" @click="doToggleAll(false)">Disable All</span></div>
            </div>
        </div>
    </transition>
</template>

<script>
import FilterDialog from './filterdialog.vue'
import FilterItem from './filteritem.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  data:function(){
    return {
      showdialog: false,
      lastClicked: 0,
      defFilters: [
          {
              title: "Mobile Development",
              tags: ["android", "ios", "ios dev", "react native", "phonegap", "ionic", "ionic framework"],
              checked: false,
              inbuilt: true
          },
          {
              title: "Backend",
              tags: ["python", "ruby", "ruby on rails", "rails", "go", "golang", "nodejs", "node", "php", "mysql", "sql", "backend"],
              checked: false,
              inbuilt: true
          },
          {
              title: "Frontend",
              tags: ["vuejs", "vue", "react", "angularjs", "angular", "ember", "emberjs", "polymer"],
              checked: false,
              inbuilt: true
          },
          {
              title: "Non-Tech",
              tags: ["non tech", "support", "writing", "data entry", "customer service", "data entry", "admin"],
              checked: false,
              inbuilt: true
          }
      ]
    }
  },
  props: [
      'tagsToSave'
  ],
  methods: {
    doToggleAll: function (value) {
        this.$store.commit("applyToAllFilters", value);
    },
    close: function (){
        this.$router.go(-1);
    },
    generateId: function(){
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    getId: function(index){
        return this.filters[index].id;
    }
  },
  components: {
      filterdialog: FilterDialog,
      filteritem: FilterItem
  },
  mounted: function(){
    /* add default filters on the first run of the extension */
    this.defFilters.sort(function(a, b){
        if(b.title > a.title) return 1;
        else if (b.title < a.title) return -1;
        else return 0
    })

    if (this.getFirstLaunch) {
        for(var i = 0; i < this.defFilters.length; i++){
            var temp = this.defFilters[i];

            temp.id = this.generateId() // give it a unique id
            this.$store.dispatch('addFilterAction', temp)
        }
        this.$store.dispatch('setFirstLaunchAction', false);
    }

    if (this.tagsToSave) {
        
    }
  },
  computed: {
      ...mapGetters([
      'getFirstLaunch'
    ]),
    ...mapState([
        'filters'
    ]),
    filterCount: {
        get(){
            return this.$store.state.filters.length;
        }
    }
  },
  watch: {
      filters: function(val){
          this.$store.commit("setFiltersDirty", true);
          this.$store.commit("setLastFilteredUpdateTime", 0);
          this.$store.commit("clearFilteredJobs");
      }
  }
}
</script>

<style scoped lang="css">
    .root {
        position: absolute;
        padding: 0px;
        margin-left: -10px;
    }

    .title {
        color: rgb(119, 119, 119);
        margin-top: 5px;
        font-family: 'Open Sans', Arial, Helvetica, sans-serif;
    }

   .header {
      padding-top: 10px;
      position: fixed;
      z-index: 10;
      background: #ffffff;
      margin-left: -15px;
      align-content: center;
      width: 463px;
      border-bottom: 1px solid #EDEDED;
      padding-bottom: 10px;
    }

    .add-button {
      border-color: transparent;
      color: #fff;
      background-color: #3c763d;
      font-size: 12px;
      font-family: 'Open Sans';
      margin-left: 34px;
      border-radius: 2px;
      box-shadow: 1px 1px 1px 1px #c3c3c3bd;
    }

    .close-icon {
        margin-top: 6.5px;
        color: #999999;
        cursor: pointer;
    }

    .close-icon:hover {
        color: #60c;
    }

    .filter-list {
        margin-top: 52px;
    }

    .foot-nav {
        position: fixed;
        bottom: 0;
        z-index: 10;
        border-top: 1px solid #EDEDED;
        width: 463px;
        padding-top: 15px;
        padding-bottom: 15px;
        color: #999999;
        font-family: 'Open Sans';
        background-color: #ffffff;
    }

    .footer-button {
        cursor: pointer;
    }

    .footer-button:hover {
        color: blueviolet;
    }
    .slide-fade-enter-active {
        transition: all .2s ease;
    }
    .slide-fade-leave-active {
        transition: all .2s ease;
    }

    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateY(50px);
        opacity: 0;
    }

    .flip-list-item {
        transition: all 0.3s ease-out;
    }

    .flip-list-leave-active {
         position: absolute;
    }

    .flip-list-leave-to {
        opacity: 0;
        transform: scale(0.8);
    }

    .flip-list-enter{
        opacity: 0;
        transform: translateY(10px);
    }
</style>
