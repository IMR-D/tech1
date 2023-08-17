import Vuex from 'vuex';
import Vue from "vue";
import {v4 as uuidv4} from "uuid";
import {debounce} from "@/common/debounce";

Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        prevValues: {},
        inputsChangeTime: {
            price: null,
            quantity: null,
            amount: null
        },
        price: null,
        quantity: null,
        amount: null,
        delayInput: 300,
        delayRequest: 1000,
        debouncedHandler: {},
        logs: [],
        nonce: 0,
        storeData: ''
    },
    mutations: {
        RECALCULATED_INPUT(state, input) {
            switch (input) {
                case 'price':
                    state.price = Math.floor(state.amount / state.quantity);
                    break;
                case 'quantity':
                    state.quantity = Math.floor(state.amount / state.price);
                    break;
                case 'amount':
                    state.amount = Math.floor(state.price * state.quantity)
                    break;
            }
        },
        SET_LOG(state, log) {
            state.logs.push(log);
        },
        SET_INPUT(state, {id, value}) {
            state[id] = value;
        },
        SET_INPUT_CHANGE_TIME(state, {id, time}) {
            state.inputsChangeTime[id] = time;
        },
        SET_PREV_VALUES(state, {id, value}) {
            state.prevValues[id] = value;
        },
        RESPONSE(state, payload) {
            localStorage.setItem('payload', JSON.stringify(payload));
            state.storeData = localStorage.getItem('payload');
        },
        REJECT(state) {
            state.storeData = localStorage.getItem('payload');
        },
        INCREMENT_NONCE(state) {
            state.nonce++;
        }
    },
    actions: {
        incrementNonce({ commit }){
          commit('INCREMENT_NONCE');
        },
        updatePrevValues({commit}, {id, value}) {
            commit('SET_PREV_VALUES', {id, value});
        },
        updateInput({commit}, {id, value}) {
            commit('SET_INPUT', {id, value});
        },
        response({commit,state, dispatch}, payload) {
            debounce(() => {
                commit('RESPONSE', payload)
                dispatch('logMessage', {name: 'POST', description:`PAYLOAD - ${JSON.stringify(payload)}`});
                dispatch('logMessage', {name: 'LOCALSTORAGE', description:`RESPONSE ${localStorage.getItem('payload')}`
                });
                dispatch('logMessage', {name: 'POST', description: `200 - saving to localstorage successful`});
                state.storeData = localStorage.getItem('payload');
            }, state.delayRequest)();
        },
        reject({commit,state, dispatch}, payload) {
            debounce(() => {
                commit('REJECT')
                dispatch('logMessage', {name: 'POST', description:`PAYLOAD - ${JSON.stringify(payload)}`
            });
                dispatch('logMessage', {name: 'LOCALSTORAGE', description:`REJECT ${localStorage.getItem('payload')}`
                });
                dispatch('logMessage', {name:'POST', description: `500 - saving to localstorage unsuccessful`});
            }, state.delayRequest)();
        },
        recalculatedInput({commit, dispatch}, {earliestField, emptyFieldsCount}) {
            if (earliestField !== null && emptyFieldsCount < 2) {
                commit('RECALCULATED_INPUT', earliestField)
                dispatch('logMessage', {name: 'update input', description:`Самое ранее заполняемое поле - ${earliestField}`
            });
            } else {
                dispatch('logMessage', {name:'error input',  description:`Несколько полей не заполнены, ошибка пересчета`});
            }
        },
        logMessage({commit}, {name, description}) {
            commit('SET_LOG', {
                id: uuidv4(),
                name: name,
                description: description
            });
        },
    },
    getters: {
        reversedLogs(state) {
            return state.logs.slice().reverse();
        },
    },
});

export default store;