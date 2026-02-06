import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useSvgStore = defineStore('svg', () => {
    const size = reactive({
        width: 0,
        height: 0
    })

    const maxHeight = computed(() => size.height / 2 - 100)

    const updateSize = ({ width, height }) => {
        size.width = width
        size.height = height
    }

    return {
        size,
        maxHeight,
        updateSize
    }
})