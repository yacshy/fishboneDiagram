import ShrinkPre from './shrink-pre'

export default class TreeDetail extends ShrinkPre {
    constructor(index, template) {
        super(index, template)
    }

    showDetailDialog(index) {
        const detail = this.template.data[index]
        this.dataStore.detailpanel.show({ ...detail })
    }
}