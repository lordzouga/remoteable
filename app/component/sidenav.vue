<template lang="html">
  <div class="btn-group-vertical side-nav" role="group" aria-label="...">
        <button 
        v-for="(button, i) in buttons"
        type="button" 
        class="btn btn-default text-left"
        :class="button.isActive"
        @click="toggle(buttons, i)"> 
        <i class="icon" :data-feather="button.iconName" :id="button.id"></i>{{ button.navName }}</button>
        </button>
</div>
</template>

<script>

import { mapGetters } from 'vuex';

export default {
  data:function(){
    return {
      title:'Vue.js',
      buttons: [
        {
          isActive: "active",
          iconActive: "icon-active",
          iconName: "home",
          navName: "Home",
          id: "is-home"
        },
        {
          isActive: "",
          iconActive: "",
          iconName: "star",
          navName: "Starred",
          id: "saveButton"
        },
        {
          isActive: "",
          iconActive: "",
          iconName: "clock",
          navName: "Visited",
          id: "is-visited"
        },
        {
          isActive: "",
          iconActive: "",
          iconName: "filter",
          navName: "Filters",
          id: "is-filter"
        }
      ]
    }
  },

  methods: {
    toggle: function(buttons, i){
      var clickedButton = buttons[i];
      clickedButton.isActive = "active";

      /* clear selection */
      for(var j=0; j < buttons.length; j++){
        if (j != i){
          buttons[j].isActive = "";
        }
      }

      /* navigate to the page */
      switch(i){
        case 0: //home
          this.$router.push({name: "main"});
          break;
        case 1: //saved
          this.$router.push({name: 'saved'});
          break;
        case 3: //filters
          this.$router.push({name: 'filters'});
          break;
      }
    },

    switchActiveButtons: function(i){
      var clickedButton = this.buttons[i];
      clickedButton.isActive = "active";

      /* clear selection */
      for(var j=0; j < this.buttons.length; j++){
        if (j != i){
          this.buttons[j].isActive = "";
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'getSavedJobCount'
    ])
  },

  watch: {
    getSavedJobCount: function(arg){
      console.log("some shit called " + arg);

      document.getElementById('saveButton').classList.add('do-animate');
      setTimeout(function (){
          document.getElementById("saveButton").classList.remove('do-animate');
        }, 520);
    },
    $route: function(arg){
      let activeButton = 0;
      let NON_EXISTENT = 5;

      if (this.$route.path === '/'){
        activeButton = 0;
      } else if (this.$route.path === '/saved'){
        activeButton = 1;
      } else if (this.$route.path === '/filters'){
        activeButton = 3;
      } else {
        activeButton = NON_EXISTENT;
      }

      if (activeButton != NON_EXISTENT) this.switchActiveButtons(activeButton);
      console.log("route changed " + this.$route.path);
    }
  }
}

</script>

<style scoped lang="css">
  .vue{
    color: #000;
    display: block;
    text-align: center;
  }

  .side-nav .btn {
    border: 0px;
    padding-top: 13px;
    padding-left: 30px; 
    padding-bottom: 13px;
    overflow-x: hidden;
    color: #666666;
    font-family: "Open Sans", Arial, Helvetica, sans-serif;
    border-radius: 0 !important; 
    font-size: 11px;
    width: 220px;
    text-align: left !important;
    border-left: 4px solid transparent;
    margin-left: -1px;
    font-weight: 500;
  }

  .side-nav .btn:hover{
    background-color: rgba(224, 189, 255, 0.27);
  }
  
  .side-nav .btn:focus{
    color: #6600CC;
  }

  .side-nav .active {
    color: #6600CC;
    outline: none;
    box-shadow: none;
    background-color: transparent;
    /*font-weight: bold;*/
    border-left: 4px solid #6600CC;
  }

  .side-nav .fa {
    color:#BFBFBF;
  }

  .side-nav .active .fa {
    color: #D499FF;
  }

  .icon {
    margin-right: 20px;
    font-size: 15px;
    height: 13px;
    margin-bottom: -2px;
  }

  #is-home {
    color: green;
  }

  #saveButton {
    color: #FF6600;
  }

  #is-visited {
    color: blue;
  }

  #is-filter {
    color: #CC33CC;
  }

  @keyframes weave {
    0% {
      color: green;
    }

    10% {
      transform: rotate(-50deg);
    }

    20% {
      transform: rotate(50deg);
    }

    30% {
      transform: rotate(-50deg);
    }

    40% {
      transform: rotate(50deg);
    }

    50% {
      transform: rotate(-50deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes bob {
    0% {
      transform: scale(1.6);
    }

    50% {
      transform: scale(2.0);
    }

    100% {
      transform: scale(1);
    }
  }

  .do-animate {
    color: green;
    animation: bob 0.5s, weave 0.5s;
  }
</style>