import {defineStore} from "pinia";

export const globalShellCommand = defineStore("GShellCommand", {
  state: () => {
    return {
      uuidHex: [],
      command: ""
    }
  },
  getters: {
    getCommand: (state) => state.command
  },
  actions: {
    updateMsg(uuidHex, command) {
      this.uuidHex = uuidHex
      this.command = command
    }
  }
})

export const useCounterStore = defineStore("counter", {
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
  },
});
