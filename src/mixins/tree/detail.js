import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import TreeShrinkPre from './shrink-pre'
import _TreeDetail from '@/mixins/tree-detail/index'
import { RAW_DATA } from '@utils/data'

export default class TreeDetail extends TreeShrinkPre {
    constructor(index) {
        super(index)
        this.detail = new _TreeDetail(index, RAW_DATA[this.index])
    }

    displayDetail() {
        this.detail.displayDetail()
    }

    navToDetail(index, name) {
        this.detail.navToDetail(index, name)
    }
}