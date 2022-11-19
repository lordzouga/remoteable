import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { createLocalVue, shallow, config, mount } from '@vue/test-utils';
import Filters from './filters.vue';
import FilterItem from './filteritem.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe("test filters component", () => {
    let getters;
    let actions;
    let store;
    let state;
    let wrapper;
    let mutations;
    let filters;

    beforeEach (() => {
        filters = [
            {
                title: "Mobile Development",
                tags: ["android", "ios", "ios dev", "react native", "phonegap", "ionic", "ionic framework"],
                checked: false
            },
            {
                title: "Web Development",
                tags: ["python", "ruby", "ruby on rails", "go", "golang", "nodejs", "node", "php", "mysql", "sql"],
                checked: false
            },
            {
                title: "Front-end",
                tags: ["vuejs", "vue", "react", "angularjs", "angular", "ember", "emberjs", "polymer"],
                checked: false
            }
        ]

        getters = {
            getFirstLaunch: () => true
        }

        state = {
            filters: [],
            filterCheckedStates: []
        }

        actions = {
            addFilterAction: (state, filter) => {
                state.commit("addFilter", filter)
            },
            setFirstLaunchAction: (val) => jest.fn()
        }

        mutations = {
            applyToAllFilters: (state, value) => {
                for (var i in state.filters){
                    state.filterCheckedStates.push(value);
                }
            },
            addFilter: (state, filter) => {
                state.filters.push(filter);
            }
        }

        store = new Store({
            state,
            getters,
            actions,
            mutations
        })

        wrapper = shallow(Filters, { 
            data: {
                filters: filters
            },
            store, localVue });
    });

    function getCheckedStatesFromWrapper(wrapper){
        let temp = []
        for(var i = 0; i < wrapper.length; i++){
            temp.push(wrapper.at(i).checked);
        }

        return temp;
    }

    test("Test that clicking EnableAll activates all filters", () => {
        var enableButton = wrapper.find(".enable-all");
        enableButton.trigger('click');

        expect(state.filterCheckedStates).toEqual([true, true, true]);
    })
})
