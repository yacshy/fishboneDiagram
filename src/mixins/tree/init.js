import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, TailPoints } from '@/utils/branch'
import TreeConstruct from './construct'
import { RAW_DATA } from '@utils/data'

export default class TreeInit extends TreeConstruct {
    constructor(index) {
        super(index)
    }
    /**
     * 初始化数据
     */
    #construct_init() {
        /**
         * 画布尺寸
         */
        const { width, height } = this.svgStore.size
        /**
         * 左邻右舍的空间
         */
        const space = (width - 4 * 336/**种子尾巴长度 */) / 2
        this.seedRoot.y = height / 2
        this.trunkRoot.y = this.upper ? this.seedRoot.y - 52 : this.seedRoot.y + 52
        /**
         * c位、左邻右舍的判断
         */
        switch (true) {
            /**
             * 在 c 位列表 */
            case this.include.is:
                this.seedRoot.x = space + (this.include.distence + 1) * 336
                this.trunkRoot.x = this.seedRoot.x - 163
                break
            /**
             * 左邻 */
            case this.lastNeighbor.is:
                this.seedRoot.x = (4.5 - this.lastNeighbor.distence) * 12
                break
            /**
             * 右舍 */
            case this.nextNeighbor.is:
                this.seedRoot.x = this.svgStore.size.width - (7.5 - this.nextNeighbor.distence) * 12
                break
            /**左远亲 */
            case this.lastLongNeighbor:
                this.seedRoot.x = -20
                break
            /**右远亲 */
            case this.nextLongNeighbor:
                this.seedRoot.x = this.svgStore.size.width + 20
                break
        }
    }
    /**
     * 初始化seed
     */
    #seed_init() {
        const that = this
        const seed = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
            .attr({ id: `seed_${this.index}`, r: 6 })
            .css({
                cx: this.svgStore.size.width + 20,
                cy: this.seedRoot.y,
                fill: '#fff',
                transition: 'cx 0.6s ease-out',
                cursor: 'pointer'
            })
            .appendTo('#screen')
            .animate({ cx: this.seedRoot.x })
            .on('click', function () {
                (that.nextNeighbor.is || that.lastNeighbor.is) && that.dataStore.current.update(that.index)
            })
            .on('transitionend', function () {
                if (!that.include.is) return
                that.#ripple_init()
                that.#tail_init()
            })
    }
    /**
     * 初始化ripple
     */
    #ripple_init() {
        if (!this.include.is) return
        for (let i = 0; i < 4; i++) {
            $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
                .attr({
                    id: `ripple_${this.index}_${i}`,
                    cx: this.seedRoot.x,
                    cy: this.seedRoot.y
                })
                .addClass('ripple-animte')
                .css({
                    'animation-delay': `${i * 0.6}s`
                })
                .insertBefore(`#seed_${this.index}`)
        }
    }
    /**
     * 初始化尾巴
     */
    #tail_init() {
        const tail = $(document.createElementNS('http://www.w3.org/2000/svg', 'polygon'))
            .attr({
                id: `tail_${this.index}`,
                fill: 'url(#tail-defs)'
            })
            .insertBefore(`#seed_${this.index}`)
        let firstTime = true
        Raf(0, 336, (offset) => {
            tail.attr('points', TailPoints(this.seedRoot, offset))
            if (firstTime && offset >= 168) {
                firstTime = false
                this.#bubble_init()
            }
        })
    }
    /**
     * 初始化泡泡
     */
    #bubble_init() {
        // 长泡泡
        let { x, y } = this.seedRoot
        x -= 245
        y += (this.upper ? -42 : 10)
        /**
         * 泡泡矩形背景
         */
        const warper = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
            .css({
                width: 155,
                height: 32,
                fill: '#3E507E',
                rx: 8
            })
        /**
         * 泡泡上的文字
         */
        const text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
            .attr({ x: 77, y: 18 })
            .addClass('bubble-text')
            .text(`${this.info.time}(${this.info.ty})`)
        /**
         * 泡泡容器
         */
        $(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
            .attr({
                id: `bubble_${this.index}`,
                transform: `translate(${x}, ${y})`
            })
            .append(warper)
            .append(text)
            .appendTo('#screen')
        // 初始化树容器，<g> 用于包裹树
        this.#tree_group_init()
        // 树干 ===>>> 树干会在长到合适的时候叫branch one生长
        this.#trunk_init()
    }
    /**
     * 初始化树容器
     */
    #tree_group_init() {
        $(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
            .attr('id', `group_${this.index}`)
            .appendTo('#screen')
    }
    /**
     * 初始化树干
     */
    #trunk_init() {
        const trunk = $svg('polygon')
            .attr({ id: `trunk_${this.index}` })
            .css({ fill: 'url(#trunk-t-defs)' })
            .appendTo(`#group_${this.index}`)
        Raf(0, Math.min(this.info.height, this.svgStore.maxHeight), (offset) => {
            const { x, y } = this.trunkRoot
            if (this.upper) {
                trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
                this.#branch_one_init(offset)
                return
            }
            trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y + offset}, ${x + 5} ${y}, ${x} ${y}`)
            this.#branch_one_init(offset)
        }).then(() => {
            this.#branchOneCollection.clear()
            this.#more_button_init()
            // if (this.info.data.length < RAW_DATA[this.index].data.length) {}
        })
        this.#ball_init()
    }
    /**
     * 初始化 ball
     */
    #ball_init() {
        const that = this
        this.info.data.forEach((event, index) => {
            let start = { x: this.trunkRoot.x + event.addup / Tan(75) }
            start.y = this.trunkRoot.y + (this.upper ? -event.addup : event.addup)
            const isLeft = Boolean(index % 2 === 0)
            const cx = start.x + (isLeft ? -80 : 80)
            const cy = start.y - 24
            $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
                .attr({
                    id: `ball_${this.index}_${index}`
                })
                .css({
                    cx,
                    cy,
                    r: 6,
                    fill: 'url(#ball)',
                    filter: 'url(#ball-shadow)',
                    cursor: 'pointer'
                })
                .appendTo(`#group_${this.index}`)
                .on('click', function () {
                    // 收缩
                    if ($(`#branch2_${that.index}_${index}`)[0]) {
                        that.shrinkBranch(index)
                        $(this).css({
                            fill: 'url(#ball)',
                            filter: 'url(#ball-shadow)',
                            strokeWidth: 0,
                            strok: 'rgba(115,188,249,0.6)'
                        })
                    }
                    // 伸展
                    else {
                        that.spreadBranch(index)
                        $(this).css({
                            fill: '#020C1C',
                            filter: 'none',
                            strokeWidth: 1,
                            stroke: 'rgba(115,188,249,0.6)',
                        })
                    }
                })
        })
    }
    /**
     * branch collection
     */
    #branchOneCollection = new Map()
    /**
     * 初始化branch 1
     */
    #branch_one_init(offset) {
        this.info.data.forEach((event, index) => {
            if (this.#branchOneCollection.has(index) || offset <= event.addup) return
            this.#branchOneCollection.set(index, true)
            let start = { x: this.trunkRoot.x + event.addup / Tan(75) }
            start.y = this.trunkRoot.y + (this.upper ? -event.addup : event.addup)

            const isLeft = Boolean(index % 2 === 0)

            const branch = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
                .attr('id', `branch1_${this.index}_${index}`/**第 this.index 棵树的第 index 个分支 */)
                .css({ fill: isLeft ? 'url(#br-one-lt-defs)' : 'url(#br-one-lrt-defs)' })
                .insertBefore(`#ball_${this.index}_${index}`)

            Raf(0, 80, (offset) => {
                branch.attr('d', BranchOneD(start, offset, isLeft))
            }, 5).then(() => {
                this.#branch_title_init(start, event, index)
            })
        })
    }
    /**
     * 初始化 title
     * @param {{ y: number, x: number }} start branch one起点坐标
     * @param {{ title: string, news_title: string }} info branch 信息
     * @param {number} index 第index个branch one的title
     */
    #branch_title_init(start, info, index) {
        const isLeft = Boolean(index % 2 === 0)
        $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
            .attr({
                id: `title_${this.index}_${index}`,
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 28,
            })
            .css({
                fill: '#C4F8FF',
                strokeWidth: 1,
                transformBox: 'fill-box',
                transformOrigin: '0% 0%',
                transform: isLeft ? 'translateX(-100%)' : 'none',
                font: 'normal normal 500 14px / 14px Source Han Sans CN-Medium, Source Han Sans CN'
            })
            .text(info.title)
            .appendTo(`#group_${this.index}`)
        $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
            .attr({
                id: `news_title_${this.index}_${index}`,
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 8,
            })
            .css({
                fill: '#fff',
                strokeWidth: 1,
                transformBox: 'fill-box',
                transformOrigin: '0% 0%',
                transform: isLeft ? 'translateX(-100%)' : 'none',
                font: 'normal normal 500 14px / 14px Source Han Sans CN-Medium, Source Han Sans CN'
            })
            .text(info.news_title)
            .appendTo(`#group_${this.index}`)
    }


    /**
     * 初始化 “更多”按钮
     */
    #more_button_init() {
        let { x, y } = this.trunkRoot
        const myHeight = Math.min(this.info.height, this.svgStore.maxHeight)
        x += myHeight / Tan(75)
        y = y + (this.upper ? -myHeight : myHeight)
        const warp = $svg('g')
            .attr({
                id: `more_${this.index}`,
                transform: `translate(${x - 40}, ${this.upper ? y - 40 : y + 10})`
            })
            .css({ cursor: 'pointer' })
            .on('click', () => {
                this.displayDetail()
            })
        const rect = $svg('rect').attr({ height: 32, width: 80, rx: 20, fill: '#28438b' })
        const icon = $svg('image')
            .attr({
                x: 14,
                y: 8.5,
                preserveAspectRatio: 'none',
                href: new URL('@/assets/image/ico-two-right-arrow.svg', import.meta.url)
            })
        const text = $svg('text').attr({ fill: '#fff', x: 50, y: 22 }).addClass('more-text').text('更多')
        warp.append(rect).append(icon).append(text).appendTo(`#group_${this.index}`)
    }

    /**
     * 初始化
     */
    init() {
        // 初始化数据
        this.#construct_init()
        /**
         * seed的现身
         *  seed入场动画完结后在#seed_init会自动调用ripple入场
         *  ripple入场后tail现身
         *  tail出现到一半，bubble出现
         */
        this.#seed_init()
    }

    reform() {
        const that = this
        this.#construct_init()
        for (let i = 0; i < 4; i++) {
            $(`#ripple_${this.index}_${i}`).remove()
        }
        $(`#tail_${this.index}`).remove()
        $(`#bubble_${this.index}`).remove()
        $(`#group_${this.index}`).remove()
        $(`#seed_${this.index}`).animate({ cx: this.seedRoot.x })
    }
}