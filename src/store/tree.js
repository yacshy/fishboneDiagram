import { defineStore } from 'pinia'

export const useTreeStore = defineStore('tree', () => {
    let collection = ref(new Map())

    return {
        collection
    }
})