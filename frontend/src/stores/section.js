import { reactive } from 'vue'

export const sectionStore = reactive({
  current: localStorage.getItem('activeSection') || 'vehicle',

  setSection(s) {
    this.current = s
    localStorage.setItem('activeSection', s)
  }
})
