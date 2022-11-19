import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { storeConfig } from './index'
import { cloneDeep } from 'lodash'


describe("Test store functions", function(){
    let store;

    beforeEach(() => {
        const localVue = createLocalVue();

        storeConfig.plugins = []; // disable the persistence plugin since we don't need that
        localVue.use(Vuex)
        store = new Vuex.Store(cloneDeep(storeConfig));

        var filters = [
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
            ];

            expect(store.state.filters.length).toBe(0);

            for(var i = 0; i < filters.length; i++){
                store.commit("addFilter", filters[i]);
            }
    })

    test("Test that addToViewedJobs works", () => {
        expect(new Set(store.state.viewedJobIDs).has("754e1379-8ad5-4231-970d-42b43cb4bdc4")).toBe(false);

        store.commit("addToViewedJobs", "754e1379-8ad5-4231-970d-42b43cb4bdc4");

        expect(new Set(store.state.viewedJobIDs).has("754e1379-8ad5-4231-970d-42b43cb4bdc4")).toBe(true);
    });

    test("testing applyToAllFilters", () => {
            store.dispatch("applyToAllFiltersAction", true);

            var checkedValues = store.state.filters.map(function(d){
                return d.checked;
            });

            expect(checkedValues).toEqual([true, true, true]);
        })

    test("Test delete filter", () => {
        expect(store.state.filters.length).toBe(3);

        store.commit("deleteFilter", 2); // delete filter at index 2

        expect(store.state.filters.length).toBe(2);
    })
})
