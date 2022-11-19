import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { shallow, createLocalVue, mount, config } from '@vue/test-utils'
import JobListItem from './joblistitem.vue';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

describe('Test JobListItem', () => {
    let getters;
    let actions;
    let store;
    let state;
    let jobMock;
    let options;
    let wrapper;
    let mutations;
  
    beforeEach(() => {
        jobMock = JSON.parse('{"@rid":"#36:353","@version":1,"@class":"jobs","timeposted":1518034303,"title":"Python Android Developer","url":"http://www.netloop.io/jobs","tags":["noob","full stack","npm","android","vue js"],"siteurl":"http://www.netloop.io","description":"we need someone who is not a noob at writing code","company":"netloop","logo":"","id":"754e1379-8ad5-4231-970d-42b43cb4bdc4","_creation_date":"2018-02-07T21:11:43.655+0100","_author":"aggregator"}')
        
        actions = {
            saveJobAction: jest.fn(),
            saveScrollPos: jest.fn(),
            jobViewedAction: (state, hash) => {
                state.commit("addToViewedJobs", hash);
            }
        }

        getters = {
            getJob: (index) => jobMock,
            getSavedJob: (index) => jobMock,
            getFilteredJob: (index) => {return index => jobMock},
            getSearchedJob: (index) => jobMock,
            isJobSaved: (job) => {return (job) => false},
            getIsJobViewed: (hash) => {return (hash) => new Set(state.viewedJobIDs).has(hash)}
        }

        state = {
            scrollPos: 2003,
            viewedJobIDs: []
        }

        mutations = {
            addToViewedJobs: (state, hash) => {
                state.viewedJobIDs.push(hash);
            }
        }

        store = new Vuex.Store({
            state,
            actions,
            getters,
            mutations
        });

        options = {
            propsData: {
                jobIndex: 0,
                source: 2
            },
            methods: {
                showJob: function(){
                    store.dispatch("jobViewedAction", jobMock.id);
                }
            },
            store,
            localVue
        }

        wrapper = shallow(JobListItem, options);
    })
  
    test('Test that job Star is called', () => {
        const star = wrapper.find(".not-saved");
        star.trigger('click');

        expect(actions.saveJobAction).toHaveBeenCalled();
    });

    test("Test name displays", () => {
        const company = wrapper.find(".company-name");
        expect(company.text()).toBe(jobMock.company);

        const title = wrapper.find(".title");
        expect(title.text()).toBe(jobMock.title);

    });

    test("Test that viewed jobs are added", () => {
        const body = wrapper.find(".job-item");

        expect(state.viewedJobIDs.length).toBe(0);
        body.trigger('click');

        expect(state.viewedJobIDs.length).toBe(1);
        
        const title = wrapper.find(".title");
        expect(new Set(title.classes()).has("viewed")).toBe(true);

        const jobDescription = wrapper.find(".job-description");
        expect(new Set(jobDescription.classes()).has("viewed")).toBe(true);

        //expect(options.methods.showJob.mock.calls[0][0]).toBe(jobMock);
    });
})
