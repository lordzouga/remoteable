<template lang="html">
  <div class="dialog-root">
      <div class="row">
        <div class="col-offset-1 col-9"  >
            <transition appear name="bounce">
            <div class="dialog" v-if="show">
                <!-- Filter Dialog Label row -->
                <div class="row">
                    <div class="col-8">
                        <div class="row">
                            <!-- dialog icon-->
                             <div class="col-1"><i class="dialog-icon" data-feather="filter"></i> </div>
                             <!-- dialog name -->
                             <div class="col-offset-1 col-8 dialog-name"> Add Filter</div>
                        </div>                        
                    </div>
                </div>

                <form v-on:submit.stop="saveFilter">
                    <div class="form-group">
                        <input class="form-control dialog-filter-name" v-model="title" id="filtername" placeholder="title">

                        <inputtag ref="inputTagComp" :addTagOnKeys="[188]" :tags.sync="tags" :addTagOnBlur="true"></inputtag>

                        <!--<textarea class="form-control filter-tags" rows="3" v-model="tags" placeholder="comma separated tags"></textarea>-->
                    </div>

                    <span class="short-message" :class="error">{{ msg }}</span>
                    <div class="row button-row">
                        <!-- cancel button -->
                        <div class="col-offset-3 col-2">
                            <button class="btn btn-default cancel-button" type="button" @click="hideDialog"> Cancel</button>
                        </div>

                        <!-- save button -->
                        <div class="col-offset-2 col-3">
                            <button class="btn btn-default save-button" type="button" @click="saveFilter"> Save</button>
                        </div>
                    </div>
                    
                </form>
            </div>
            </transition>
        </div>
      </div>
  </div>
</template>

<script>
import feather from 'feather-icons';
import Bounce from 'bounce.js/';
import InputTag from 'vue-input-tag';

export default {
  data:function(){
    return {
      show: this.showProp,
      title: "",
      tags: this.defTags,
      msg: "add comma separated tags",
      error: ""
    }
  },
  props: {
      showProp: Boolean,
      defTags: {
          type: Array,
          default: function(){
              return []
          }
      }
  },
  beforeMount: function(){
      if (this.defTags.length > 0){
          for(var i = 0; i < this.defTags.length; i++){
              if(this.defTags[i])
                this.$store.commit("saveDefTags", this.defTags[i]);
        }
        this.$emit('saved', "Default Tags");
        this.show = false;
        this.$emit('hide');
      }
  },
  mounted: function(){
      feather.replace();
  },
  methods: {
      showDialog: function(el){
          var bounce = new Bounce();
          bounce.scale({
              from: { x: 0.6, y: 0.6 },
              to: {x: 1, y: 1},
              duration: 500,
              bounces: 2,
              stiffness: 1
          })

          bounce.applyTo(el);
      },
      hideDialog: function(){
        this.show = false;
        this.$emit('hide');
      },
      generateId: function(){
        return '_' + Math.random().toString(36).substr(2, 9);
    },
      saveFilter: function(){ /* save the data from the forms */
        document.activeElement.blur();

        if (!this.title || !this.tags.length){
            this.msg = "no field should be left empty";
            this.error = "dialog-has-error";
            return;
        }

        this.msg = "add comma separated tags";
        this.error = "";

        /* create a filter object */
        var temp = new Object();
        temp.title = this.title;
        
        var splitTags = this.tags;
        var cleanTags = splitTags.map(function(d){
            return d.trim();
        });

        temp.tags = cleanTags;
        temp.checked = true;
        temp.id = this.generateId();

        this.$store.dispatch("addFilterAction", temp);
        this.$emit('saved', temp.title);
        this.hideDialog()
      }
  },
  components: {
      inputtag: InputTag
  }
}

</script>

<style lang="css">
  .dialog-root{
    background-color: rgba(255, 255, 255, 0.26);
    height: 600px;
    width: 463px;
    position: fixed;
    z-index: 30;
  }

  .row .col-9 .dialog {
      background-color: #fff;
      padding: 30px;
      margin-top: 100px;
      box-shadow: 0px 0px 6px 3px #00000033;
      border-top: 5px solid #6600CC;
      border-radius: 3px;
  }

  .dialog-filter-name {
      margin-top: 20px;
      font-family: 'Lato', 'Open Sans';
      font-size: 13px;
      color: #666666;
  }

  .filter-tags {
      margin-top: 30px;
  }

  .dialog-icon {
      color: green;
  }

  .dialog-name {
      font-weight: 600;
      font-family: "Open Sans", Arial, Helvetica, sans-serif;
      color: #666666;
      margin-top: 3px;
  }

  textarea {
      resize: none;
  }

  .save-button {
      border-color: transparent;
      color: #fff;
      background-color: #6600CC;
      font-size: 12px;
      font-family: 'Open Sans';
      margin-left: 22px;
      border-radius: 2px;
      /*box-shadow: 1px 1px 1px 1px #c3c3c3bd;*/
      padding-right: 30px;
      padding-left: 30px;
      margin-left: 12px;
  }

  .button-row {
      margin-top: 20px;
  }

  .cancel-button {
      border-width: 0px;
      font-family: 'Open Sans', Arial, Helvetica, sans-serif;
      color: #6600CC;
      font-size: 12px;
      margin-left: 35px;
  }

  .form-control::-webkit-input-placeholder {
    color: #C0C0C0;
    font-family: "Lato", Arial, Helvetica, sans-serif;
    font-size: 12px;
}

.fade-dialog {
      animation: fade 0.4s;
  }

  .dialog .vue-input-tag-wrapper {
      -webkit-appearance: none;
      margin-top: 20px;
      height: 100px;
      border-radius: 3px;
      display: block;
      overflow: hidden;
      overflow-y: scroll;
      flex-wrap: nowrap;
      box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);
      padding: 10px;
  }

  .dialog .vue-input-tag-wrapper .input-tag {
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

  .dialog .vue-input-tag-wrapper::-webkit-scrollbar {
    display: none;
  }

  .dialog .vue-input-tag-wrapper .input-tag .remove:before {
    content: " \00D7";
    font-size: 14px;
    font-weight: 400;
    margin-left: 2px;
    color: #6600cc;
    margin-right: 5px;
  }

  .short-message {
    font-family: 'Lato';
    color: #999999;
    font-size: 11px;
    }

    .dialog-has-error {
        color: red;
    }

    .dialog .form-control:focus {
        border-color: #6600cc;
        box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px #6600cc91;
    }

  @keyframes fade {
      0% {
          opacity: 0;
          }
      100% {
          opacity: 1;
      }
  }

  .bounce-enter-active {
  -webkit-animation: animation 500ms linear both;
  animation: animation 500ms linear both, fade 0.4s;
}

    .bounce-leave-active {
        -webkit-animation: animation 500ms linear both reverse;
        animation: animation 500ms linear both reverse, fade 0.4s reverse;
    }

/* Generated with Bounce.js. Edit at https://goo.gl/W87onu */

@-webkit-keyframes animation { 
  0% { -webkit-transform: matrix3d(0.6, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.6, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  7.61% { -webkit-transform: matrix3d(0.815, 0, 0, 0, 0, 0.815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.815, 0, 0, 0, 0, 0.815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  11.41% { -webkit-transform: matrix3d(0.895, 0, 0, 0, 0, 0.895, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.895, 0, 0, 0, 0, 0.895, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  15.12% { -webkit-transform: matrix3d(0.953, 0, 0, 0, 0, 0.953, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.953, 0, 0, 0, 0, 0.953, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  18.92% { -webkit-transform: matrix3d(0.992, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.992, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  22.72% { -webkit-transform: matrix3d(1.015, 0, 0, 0, 0, 1.015, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.015, 0, 0, 0, 0, 1.015, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  30.23% { -webkit-transform: matrix3d(1.029, 0, 0, 0, 0, 1.029, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.029, 0, 0, 0, 0, 1.029, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  50.25% { -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 1.006, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.006, 0, 0, 0, 0, 1.006, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  70.27% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); } 
}

@keyframes animation { 
  0% { -webkit-transform: matrix3d(0.6, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.6, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  7.61% { -webkit-transform: matrix3d(0.815, 0, 0, 0, 0, 0.815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.815, 0, 0, 0, 0, 0.815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  11.41% { -webkit-transform: matrix3d(0.895, 0, 0, 0, 0, 0.895, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.895, 0, 0, 0, 0, 0.895, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  15.12% { -webkit-transform: matrix3d(0.953, 0, 0, 0, 0, 0.953, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.953, 0, 0, 0, 0, 0.953, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  18.92% { -webkit-transform: matrix3d(0.992, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.992, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  22.72% { -webkit-transform: matrix3d(1.015, 0, 0, 0, 0, 1.015, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.015, 0, 0, 0, 0, 1.015, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  30.23% { -webkit-transform: matrix3d(1.029, 0, 0, 0, 0, 1.029, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.029, 0, 0, 0, 0, 1.029, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  50.25% { -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 1.006, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.006, 0, 0, 0, 0, 1.006, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  70.27% { -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); } 
}


</style>
