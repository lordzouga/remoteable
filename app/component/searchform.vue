<template lang="html">
    <transition name="slide">
    <div class="row">
          <div class="col-12 search-form">
            <form v-on:submit.prevent="handleForm">
              <div class="form-group">
                <div class="input-group">
                  <span class="input-group-addon"><i class="fas fa-search"></i></span>
                  <!--<input v-model="filtersMutable" class="form-control search-input" id="searchInput" placeholder="python, javascript, java, c++">-->
                  <!--<span class="help-block">Please correct the error</span>-->
                  <inputtag id="inputTagId" ref="inputTagComp" placeholder="" :addTagOnKeys="[188]" 
                  :tags.sync="tags" :addTagOnBlur="true"></inputtag>
                </div>
                <span class="short-message" :class="inputError">{{ shortMessage }}</span>
              </div>
            </form>
          </div>
        </div>
    </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import InputTag from 'vue-input-tag';

export default {
  data:function(){
    return {
      // filtersMutable: this.filters,
      inputError: "",
      tags: this.filters,
      shortMessage: "add comma separated tags. ex: writing, java, javascript"
    }
  },
  props: [
    'filters'
  ],
  methods: {
      handleForm: function(){
        /* check if input form is empty */
        document.activeElement.blur();

        if (!this.tags || !this.tags.length) {    
          this.shortMessage = "please add some tags in the field above";
          this.inputError = "has-error";
          return;
        }

        this.$store.commit("setScrollPos", 0);
        this.shortMessage = "add comma separated tags. ex: writing, java, javascript";
        this.inputError = "";
        if (!(this.$route.path === '/search')){
          // console.log("moving to search page");
          this.$router.push({name:"search", params: {filters: this.tags}});
        }

        this.$store.dispatch('setCurrentSearchAction', this.tags);
        this.$store.dispatch('loadFilteredJobs', {fromSearch: true, data: this.tags});
        this.$store.commit("clearSearchedJobs");
      },
      receiveFocus: function(){
        // document.getElementById("searchInput").focus();
      },
      inputUpdated: function(val){
        console.log(val);
      },
      getTags: function(){
        return this.tags;
      }
  },
  mounted: function(){
    // this.handleForm();
    this.tags = this.getCurrentSearch;
  },
  watch: {
    getCurrentSearch: function(searchVal){
      this.tags = searchVal;
    }
  },
  computed: {
    ...mapGetters(
      [
        'getCurrentSearch'
      ]
    )
  },
  components: {
    inputtag: InputTag
  }
}
</script>

<style lang="css">
.title {
 color: #666666;
 font-weight: bold;
}

.search-form {
  padding-left: 20px;
  padding-right: 33px;
  padding-top: 20px;
  padding-bottom: 4px;
  border-bottom:1px solid #EDEDED;
  background-color: #fff;
  z-index: 12;
}

.form-buttons {
  margin-top: 10px;
  font-family: "Open Sans", Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.form-content {
  z-index: 12;
}

.search-button {
  background-color: #6600CC;
  color: white;
  border-color: #6600CC;
  margin-left: 10px;
}

.close-search {
  margin-bottom: 10px;
  color: #C0C0C0;
}

.search-input {
  border-left-width: 0px;
  font-family: "Lato", Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #666666;
}

.search-input:focus{
  box-shadow: none;
  border-color: #C0C0C0;
  outline: none;
}

.input-group-addon {
  color: #6600CC;
  background-color: transparent;
}

.form-control::-webkit-input-placeholder {
    color: #C0C0C0;
    font-family: "Lato", Arial, Helvetica, sans-serif;
    font-size: 11px;
}

.form-group {
  margin-bottom: 8px;
}

.slide-enter-active {
  transition: all .3s ease;
}

.slide-leave-active {
  transition: all .2s ease;
}

.slide-enter, .slide-leave-to/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(-50px);
  opacity: 0;
}

.search-form .vue-input-tag-wrapper {
  -webkit-appearance: none;
  border-radius: 3px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 36px;
  padding-top: 2px;
  font-family: 'Open Sans';
  color: #666666;
  overflow: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  display: block;
  width: 381px;
  box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);
}

  .search-form .vue-input-tag-wrapper::-webkit-scrollbar {
    display: none;
  }

.search-form .vue-input-tag-wrapper .input-tag .remove:before {
  content: " \00D7";
  font-size: 14px;
  font-weight: 400;
  margin-left: 2px;
  color: #6600cc;
  margin-right: 5px;
}

.search-form .vue-input-tag-wrapper .input-tag {
  background-color: #6600cc1c;
  border: none;
  color: #6600cc;
  padding: 3px;
  padding-left: 8px;
  padding-top: 0px;
  padding-bottom: 0px;
  height: 22px;
  font-family: 'Lato', 'Open Sans';
}

.short-message {
  font-family: 'Lato';
  color: #999999;
  font-size: 11px;
}

.has-error {
  color: red;
}

</style>
