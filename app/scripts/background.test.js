import { loadFiltered, applyNewData, joinFilters, requestFromBackend, handleNotification } from './background';

/* beforeEach(()=>{
    console.log("setup done");
    global.chrome = chrome;
});*/

test("Test applyNewData()", function(){
    var oldData = [5, 6, 7, 8, 9, 10, 12, 4, 50, 53]
    var newData = [13, 14, 80]

    var result = [80, 14, 13, 5, 6, 7, 8, 9, 10, 12, 4, 50, 53]

    applyNewData(newData, oldData);
    expect(oldData).toEqual(result);
});

test("Test applyNewData() with limit", function(){
    var store = JSON.parse(localStorage.getItem('vuex'));
    store.jobLimit = 8;

    localStorage.setItem("vuex", JSON.stringify(store));

    var oldData = [5, 6, 7, 8, 9, 10, 12, 4, 50, 53]
    var newData = [13, 14, 80]

    var result = [80, 14, 13, 5, 6, 7, 8, 9]

    applyNewData(newData, oldData);
    expect(oldData).toEqual(result);
});

describe("Test filter data functions", function(){
    let store;

    beforeEach(()=>{
        store = JSON.parse(localStorage.getItem('vuex'));
        let filters = [
                {
                    title: "Mobile Development",
                    tags: ["android", "ios", "ios dev", "react native"],
                    checked: true
                },
                {
                    title: "Web Development",
                    tags: ["python", "ruby", "ruby on rails", "go", "golang"],
                    checked: false
                },
                {
                    title: "Front-end",
                    tags: ["vuejs", "vue", "react", "angularjs", "angular"],
                    checked: true
                }
            ]
            
        store.filters = filters;
        localStorage.setItem('vuex', JSON.stringify(store));
    });

    test("Test Filter Join", function(){
        var result = ["'android' in tags", "'ios' in tags", "'ios dev' in tags",
         "'react native' in tags", "'vuejs' in tags", "'vue' in tags", "'react' in tags",
          "'angularjs' in tags", "'angular' in tags"]

        expect(joinFilters()).toEqual(result);
    });

    test("Test no filter enabled", function(){
        store = JSON.parse(localStorage.getItem('vuex'));
        for(var i = 0; i < store.filters.length; i++){
            store.filters[i].checked = false;
        }
        localStorage.setItem('vuex', JSON.stringify(store));

        expect(joinFilters()).toEqual([]);
    });

    test("Fetch filtered Data from backend", function(done){
        var whereParam = "(" + joinFilters().join(" or ") + ') and timeposted > ' + Math.floor(Date.now() / 1000);

        function success(response){
            expect(response.data.data.length).toBe(0);
            done();
        }

        function failure(error){
            console.log(error);
        }

        requestFromBackend(success, failure, whereParam);
    });

    test("Test handle notification", () => {

        let jobMock = JSON.parse('{"@rid":"#36:353","@version":1,"@class":"jobs","timeposted":1518034303,"title":"Python Android Developer","url":"http://www.netloop.io/jobs","tags":["noob","full stack","npm","android","vue js"],"siteurl":"http://www.netloop.io","description":"we need someone who is not a noob at writing code","company":"netloop","logo":"","id":"754e1379-8ad5-4231-970d-42b43cb4bdc4","_creation_date":"2018-02-07T21:11:43.655+0100","_author":"aggregator"}')
        expect(store.enableNotifications).toBe(true);

        handleNotification([jobMock, jobMock]);

        //expect(chrome.notifications.create.calledOnce).toBe(true);

        // expect(chrome.browserAction.getBadgeText.calledOnce).toBe(true);
    })
})

