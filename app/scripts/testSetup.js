import chrome from 'sinon-chrome';
import 'jest-localstorage-mock'

global.chrome = chrome;

var store = {};
store.testing = true;

localStorage.setItem("vuex", JSON.stringify(store));

