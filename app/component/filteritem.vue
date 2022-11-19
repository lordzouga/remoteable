<template lang="html">
    <div class="row">
        <div class="col-12 filter-body" v-on:click="toggleFilter(index, $event)">
            <!-- Filter name and checbox row -->
            <div class="row">
                <div class="col-6 filter-name">{{ filter.title }}</div>
                <div class="col-offset-4 col-2 parent">
                    <!--<input type="checkbox" :ref="'checkbox'+index" v-model="checked" v-on:click.stop="doCheck()">-->
                    <switches :ref="'checkbox'+index" 
                    v-model="checked" 
                    v-on:click.stop="doCheck()" 
                    :emit-on-mount="false"
                    theme="bulma"
                    color="secondary"
                    class="switch"></switches>
                </div>
            </div>
            <!-- tag row -->
            <div class="row">
                <div class="col-12 tags"> {{ filter.tags.join(", ") }}</div>
            </div>

            <!-- delete button row -->
            <div class="row" v-if="!filter.inbuilt">
                <div class="col-1 col-offset-10 delete" @click.stop="doDelete()"><i class="delete-icon" data-feather="trash"></i></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Switches from './switches.vue'
import feather from 'feather-icons'

export default {
  data:function(){
    return {
      title:'Vue.js'
    }
  },
  props: [
      'filterIndex',
  ],
  methods: {
      toggleFilter: function(index, e){
        console.log("toggle called");

        let checkbox = this.$refs['checkbox' + index];
        checkbox.trigger(e);
      },
      doCheck: function(){
          console.log("switch clicked");
      },
      doDelete: function(){
          this.$store.commit("deleteFilter", this.index);
      }
    },
    computed: {
        filter: function(){
            //console.log(this.index);
             return this.getFilter(this.index);
        },

        checked: {
            get() {
                return this.$store.state.filters[this.index].checked;
            },
            set(value){
                console.log("setter called " + value);
                this.$store.dispatch('toggleFilterAction', this.index);
            }
        },
        index: function(){ /* iterate the list from behind */
            return this.filterIndex
        },
        ...mapGetters([
            'getFilter',
            'getFilterCount'
        ])
    },
    mounted: () => {
        feather.replace();
    },
    components: {
        Switches
    }
}
</script>

<style scoped lang="css">
  .filter-body {
        padding-top: 15px;
        padding-bottom: 12px;
        border-bottom: 1px solid #EDEDED;
        cursor: pointer;
        padding-right: 40px;
        padding-left: 19px;
    }

    .filter-body:hover {
        background-color: #F2F2F2;
    }

    .checkbox {
        margin-top: 0px;
        margin-bottom: 0px;
    }

    .filter-name {
        font-family: 'Open Sans', Arial, Helvetica, sans-serif;
        font-weight: 600;
        color: #8c8c8c;
    }

    .tags {
        font-family: 'Open Sans', Arial, Helvetica, sans-serif;
        font-size: 13px;
        color: #999999;
        margin-top: 6px;
        padding-right: 22px;
    }

    .delete-icon {
        color: #bfbfbf;
        width: 16px;
        height: 16px;
        margin-top: 10px;
        margin-left: 20px;
    }

    .parent .vue-switcher {
        margin-left: 5px;
    }
</style>