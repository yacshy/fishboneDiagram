import Construct from './construct'
import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { Quadrant } from '@utils/data-calcs'
import panzoom from 'panzoom'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchsOfOrgD, BranchOrgTrunkPoints } from '@utils/branch'
import { simpleDeepClone } from '@utils/clone'
import { ElMessage } from 'element-plus'

export default class Init extends Construct {
    constructor(index, template) {
        super(index, template)
    }

    #addHighLight(index, name) {
        $(`[mark="${name}_${index}_branch"]`).css({ fill: '#5bd9ff' })
        $(`[mark="${name}_${index}"]`).css({ fill: '#ec8a69' })
        $(`[mark="${name}_${index}_trunk"]`).css({ fill: '#5bd9ff' })
        this.currentData.data[index][name]?.forEach((_, secIdx) => {
            $(`[mark="${name}_${index}_${secIdx}_branch"]`).css({ fill: '#5bd9ff' })
        })
    }

    #clearHighLight() {
        this.currentData.data.forEach((item, index) => {
            const isLeft = Boolean(index % 2 === 0)
            $(`[mark="pre_${index}_branch"]`).css({ fill: isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)' })
            $(`[mark="org_${index}_branch"]`).css({ fill: isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)' })
            $(`[mark="pre_${index}"]`).css({ fill: '#A1DDFF' })
            $(`[mark="org_${index}"]`).css({ fill: '#A1DDFF' })
            $(`[mark="pre_${index}_trunk"]`).css({ fill: 'url(#br-two-t-defs)' })
            $(`[mark="org_${index}_trunk"]`).css({ fill: 'url(#br-two-t-defs)' })
            const { org, pre } = item
            org?.forEach((_, oIndex) => {
                $(`[mark="org_${index}_${oIndex}_branch"]`).css({ fill: '#254373' })
            })
            pre?.forEach((_, pIndex) => {
                $(`[mark="pre_${index}_${pIndex}_branch"]`).css({ fill: '#254373' })
            })
        })
    }

    #branch_one_init(offset, neighbor) {
        this.currentData.data.forEach((event, index) => {
            if (this.branchOneCollection.has(index) || offset <= event.addup) return
            this.branchOneCollection.set(index, true)
            let start = { x: this.root.x + event.addup / Tan(75) }
            start.y = this.root.y - event.addup

            const isLeft = Boolean(index % 2 === 0)

            const branch = $svg('path')
                .attr('mark', `branch1_${index}`)
                .css({ fill: isLeft ? 'url(#br-one-lt-defs)' : 'url(#br-one-lrt-defs)' })
                .insertAfter(neighbor)
            let branch2Flag = true
            Raf(0, 80, (offset) => {
                branch.attr('d', BranchOneD(start, offset, isLeft))
                if (offset >= 45 && branch2Flag) {
                    branch2Flag = false
                    this.#spread_branch_two(start, index)
                }
            }, 5).then(() => {
                this.#branch_title_init(start, event, index)
            })
        })
    }

    #ball_init() {
        const that = this
        this.currentData.data.forEach((event, index) => {
            let start = { x: this.root.x + event.addup / Tan(75) }
            start.y = this.root.y - event.addup
            const isLeft = Boolean(index % 2 === 0)
            const cx = start.x + (isLeft ? -80 : 80)
            const cy = start.y - 24
            $svg('rect').attr({
                mark: `ball-ci_${index}`, // close icon
                x: cx - 3,
                y: cy - 1,
                height: 2,
                width: 6,
                rx: 0,
            }).css({
                fill: '#73BCF9',
                cursor: 'pointer',
            }).on('click', function () {
                that.shrinkBranch(index)
            }).insertAfter(

                $svg('circle')
                    .attr({ mark: `ball_${index}`, })
                    .css({
                        cx, cy, r: 6,
                        filter: 'none',
                        fill: '#020C1C',
                        strokeWidth: 1,
                        stroke: '#73BCF9',
                        cursor: 'pointer'
                        // fill: 'url(#ball)', filter: 'url(#ball-shadow)', cursor: 'pointer'
                    }).on('click', function () {
                        that.shrinkBranch(index)
                    }).appendTo(this.mount)

            )
        })
    }

    #branch_title_init(start, info, index) {
        const isLeft = Boolean(index % 2 === 0)
        $svg('text')
            .attr({
                mark: `title_${index}`,
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 28
            })
            .addClass('b-title')
            .css({
                fill: '#C4F8FF',
                transform: isLeft ? 'translateX(-100%)' : 'none',
                cursor: 'pointer'
            })
            .text(info.title)
            .hover(function() {
                $(this).css({ fill: '#ec8a69' })
            }, function() {
                $(this).css({ fill: '#C4F8FF' })
            })
            .on('click', () => {
                this.showDetailDialog(index)
            })
            .appendTo(this.mount)
        $svg('text')
            .attr({
                mark: `news_title_${index}`,
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 8,
            })
            .addClass('b-title')
            .css({
                fill: '#fff',
                transform: isLeft ? 'translateX(-100%)' : 'none',
                cursor: 'pointer'
            })
            .text(info.news_title)
            .hover(function() {
                $(this).css({ fill: '#ec8a69' })
            }, function() {
                $(this).css({ fill: '#fff' })
            })
            .on('click', () => {
                this.showDetailDialog(index)
            })
            .appendTo(this.mount)
    }

    #spread_branch_two(start, index) {
        const orgHeight = this.currentData.data[index].org.length * 32 /**每个组织和人员占位 */ + 26/**主枝与第一个附枝间隔 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const isLeft = Boolean(index % 2 === 0)
        const trunk = $svg('polygon')
            .attr({ mark: `trunk_${index}` })
            .css({ fill: 'url(#br-two-t-defs)' }).appendTo(this.mount)
        let preFlag = true, orgFlag = true
        let { x, y } = start
        x = x + (isLeft ? -45 : 45)
        y -= 25
        Raf(0, this.currentData.data[index].height - 15, (offset) => {
            trunk.attr('points', BranchTwoPoints({ x, y }, offset, true))
            if (offset >= 26 && orgFlag) {
                orgFlag = false
                this.#spread_org({ x, y }, index)
            }
            if (offset >= orgHeight && preFlag) {
                preFlag = false
                this.#spread_pre({ x, y }, index)
            }
        })
    }

    #spread_org(start, index) {
        const quadrant = Quadrant(0, index)
        const isLeft = Boolean(index % 2 === 0)
        /**branch-org起点 */
        const orgStart = {
            y: start.y + 26,
            x: start.x - 26 / Tan(75)
        }
        let isMe = false
        if (this.markNavAim.index === index && this.markNavAim.name === 'org') {
            isMe = true
            const initialX = this.center.x - orgStart.x + (isLeft ? 70 : -70)
            const initialY = this.center.y - orgStart.y
            this.panzoom.smoothMoveTo(initialX, initialY)
            this.markNavAim.init()
        }
        /**完全体数据pre列表 */
        const complateOrg = this.template.data[index].org
        const offsetForText = 6 * (complateOrg.length.toString().length)
        const ballPosi = {
            x: orgStart.x + (isLeft ? -71 : 65 - offsetForText),
            y: orgStart.y + 9
        }
        // 修改ball里的内容
        const rect = $svg('rect')
            .attr({
                mark: `org_ball_${index}`
            })
            .css({
                ...ballPosi,
                rx: 6,
                width: 6 + offsetForText,
                height: 12,
                fill: '#020C1C',
                strokeWidth: 1,
                stroke: 'rgba(115,188,249,0.6)',
                cursor: 'pointer'
            })
            .on('click', () => {
                this.shrinkOrg(index)
            })
            .appendTo(this.mount)
        const text = $svg('text').attr({
            mark: `org_ball_${index}_text`,
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9.5
        })
            .css({
                fill: '#73BCF9',
                fontSize: 9,
                fontFamily: 'Source Han Sans CN, Source Han Sans CN',
                fontWeight: 300,
                color: '#73BCF9',
                cursor: 'pointer'
            })
            .on('click', () => {
                this.shrinkOrg(index)
            })
            .text(complateOrg.length).appendTo(this.mount)
        /**长自己的branch_org */
        let myBranchOrg = $svg('path')
            .attr('mark', `org_${index}_branch`)
            .css({
                fill: isMe
                    ? '#5bd9ff'
                    : isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)'
            }).insertBefore(rect)

        Raf(0, 65, (offset) => {
            myBranchOrg.attr('d', BranchOrgD(orgStart, offset, quadrant))
        })
        /**org-trunk起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**org列表 */
        const myOrg = this.currentData.data[index].org
        /**branch-org-trunk高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**生长 branch_org 的trunk，然后出现 name (即：“组织”) */
        let myBranchOrgTrunk = $svg('polygon')
            .attr('mark', `org_${index}_trunk`)
            .css({
                fill: isMe ? '#5bd9ff' : 'url(#br-two-t-defs)'
            }).appendTo(this.mount)

        Raf(0, myBranchOrgTrunkHeight - 15 /**因为这段间隔是空白的 */, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, true))
        }).then(() => {
            // name 文字出现
            let x = orgStart.x + (isLeft ? -75 : 75)
            let y = orgStart.y + 20
            $svg('text')
                .attr({ x, y, mark: `org_${index}` })
                .addClass('b-title')
                .css({
                    fill: isMe ? '#ec8a69' : '#A1DDFF',
                    transform: isLeft ? 'translateX(-100%)' : 'none'
                })
                .text('组织')
                .appendTo(this.mount)
        })
        // 生长 branch_org 下的附枝
        myOrg.forEach((text, orgIndex) => {
            const myBranch = $svg('path')
                .attr('mark', `org_${index}_${orgIndex}_branch`)
                .css({
                    fill: isMe ? '#5bd9ff' : '#254373'
                }).appendTo(this.mount)

            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x - offset / Tan(75)
            }
            Raf(0, 28, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => {
                $svg('text')
                    .attr({
                        mark: `org_${index}_${orgIndex}`,
                        x: start.x + (isLeft ? -120 : 120) / Tan(75),
                        y: start.y + 21
                    })
                    .addClass('b-title')
                    .css({
                        fill: '#fff',
                        transform: isLeft ? 'translateX(-100%)' : 'none'
                    })
                    .text(text)
                    .appendTo(this.mount)
            })
        })
    }

    #spread_pre(start, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(0, index)
        const myBranchOrgTrunkHeight = this.currentData.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const distence = myBranchOrgTrunkHeight + 26
        const preStart = {
            y: start.y + distence,
            x: start.x - distence / Tan(75)
        }
        let isMe = false
        if (this.markNavAim.index === index && this.markNavAim.name === 'pre') {
            isMe = true
            const initialX = this.center.x - preStart.x + (isLeft ? 70 : -70)
            const initialY = this.center.y - preStart.y
            this.panzoom.smoothMoveTo(initialX, initialY)
            this.markNavAim.init()
        }
        /**完全体数据pre列表 */
        const complatePre = this.template.data[index].pre
        const offsetForText = 6 * (complatePre.length.toString().length)
        const ballPosi = {
            x: preStart.x + (isLeft ? -71 : 65 - offsetForText),
            y: preStart.y + 9
        }
        // 修改ball里的内容
        const rect = $svg('rect')
            .attr({
                mark: `pre_ball_${index}`
            })
            .css({
                ...ballPosi,
                rx: 6,
                width: 6 + offsetForText,
                height: 12,
                fill: '#020C1C',
                strokeWidth: 1,
                stroke: 'rgba(115,188,249,0.6)',
                cursor: 'pointer'
            })
            .on('click', () => {
                this.shrinkPre(index)
            })
            .appendTo(this.mount)
        const text = $svg('text').attr({
            mark: `pre_ball_${index}_text`,
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9.5
        })
            .css({
                fill: '#73BCF9',
                fontSize: 9,
                fontFamily: 'Source Han Sans CN, Source Han Sans CN',
                fontWeight: 300,
                color: '#73BCF9',
                cursor: 'pointer'
            })
            .on('click', () => {
                this.shrinkPre(index)
            })
            .text(complatePre.length)
            .appendTo(this.mount)
        /**长自己的branch_pre，然后出现 name (即：“人员”) */
        let myBranchPre = $svg('path')
            .attr('mark', `pre_${index}_branch`)
            .css({
                fill: isMe
                    ? '#5bd9ff'
                    : isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)'
            })
            .insertBefore(rect)
        Raf(0, 65, (offset) => {
            myBranchPre.attr('d', BranchOrgD(preStart, offset, quadrant))
        }).then(() => {
            // name 文字出现
            let x = preStart.x + (isLeft ? -75 : 75)
            let y = preStart.y + 20
            $svg('text')
                .attr({ x, y, mark: `pre_${index}` })
                .addClass('b-title')
                .css({
                    fill: isMe ? '#ec8a69' : '#A1DDFF',
                    transform: isLeft ? 'translateX(-100%)' : 'none',
                })
                .text('人员')
                .appendTo(this.mount)
        })
        /**pre-trunk起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre列表 */
        const myPre = this.currentData.data[index].pre
        /**pre-trunk高度 */
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**生长 branch_pre 的trunk */
        let myBranchPreTrunk = $svg('polygon')
            .attr('mark', `pre_${index}_trunk`)
            .css({
                fill: isMe ? '#5bd9ff' : 'url(#br-two-t-defs)'
            }).appendTo(this.mount)

        Raf(0, myBranchPreTrunkHeight - 15, (offset) => {
            myBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, true))
        })
        /**生长 branch_pre 下的人员名称 */
        myPre.forEach((text, preIndex) => {
            const myBranch = $svg('path')
                .attr('mark', `pre_${index}_${preIndex}_branch`)
                .css({
                    fill: isMe ? '#5bd9ff' : '#254373'
                }).appendTo(this.mount)

            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x - offset / Tan(75)
            }
            Raf(0, 28, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => {
                $svg('text')
                    .attr({
                        mark: `pre_${index}_${preIndex}`,
                        x: start.x + (isLeft ? -120 : 120) / Tan(75),
                        y: start.y + 21
                    })
                    .addClass('b-title')
                    .css({
                        fill: '#fff',
                        transform: isLeft ? 'translateX(-100%)' : 'none',
                    })
                    .text(text)
                    .appendTo(this.mount)
            })
        })
    }

    displayDetail() {
        if (this.mount) {
            ElMessage({
                type: 'info',
                message: '正在展示详情'
            })
            return
        }
        $('#complate-tree-warp').find(".close")[0]?.click()
        this.mount?.remove()
        this.mount = null
        const data = this.updateCurrentData()
        const that = this
        const detailPanel = $('<div class="complate-warp" id="complate-tree-warp">')
            .append(
                $('<header class="header">')
                    .append(
                        $(`<span class="text">${this.currentData.time}(${this.currentData.ty})</span>`)
                    )
                    .append(
                        $('<i class="close">').on('click', () => {
                            detailPanel.fadeOut('slow', function () {
                                that.mount?.remove()
                                that.mount = null
                                that.markNavAim.init()
                                $(this).remove()
                                that.templateShadw = simpleDeepClone(that.template)
                                that.updateCurrentData()
                            })
                        })
                    )
            )
            .append(
                $('<div class="split-line">')
            )
            .append(
                $(`<div class="tree-warp" id="detail_warp_${this.index}">`).on('click', () => this.#clearHighLight())
            )
            .hide()
            .appendTo('#app')
            .fadeIn()

        const container = $(`#detail_warp_${this.index}`)

        this.root = {
            x: container.width() / 2,
            y: container.height() - 150
        }
        this.center = {
            x: container.width() / 2,
            y: container.height() / 2
        }

        const svg = $svg('svg').addClass('complate-svg')
        const g = $svg('g').addClass('complate-svg-g')
        this.mount = g
        // trunk
        const trunk = $svg('polygon').attr('mark', 'trunk').css({ fill: 'url(#trunk-t-defs)' }).appendTo(g)
        // ball
        this.#ball_init()

        Raf(0, data.height, (offset) => {
            const { x, y } = this.root
            trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
            this.#branch_one_init(offset, trunk)
        }).then(() => {
            this.branchOneCollection.clear()
        })

        svg.append(g).appendTo(`#detail_warp_${this.index}`)

        this.panzoom = panzoom(g[0])
    }





    /**
     * 跳转到指定枝丫展示详情
     * @param {number} index 
     * @param {'pre'|'org'} name 
     */
    navToDetail(index, name) {
        this.markNavAim.update({
            index,
            name
        })
        if (this.mount) {
            const aim = $(`[mark="${name}_${index}"]`)
            const [x, y] = [aim.attr('x'), aim.attr('y')]
            const [offsetx, offsety] = [this.center.x - x, this.center.y - y]
            this.panzoom.smoothMoveTo(offsetx, offsety)
            this.#clearHighLight()
            this.#addHighLight(index, name)
            return
        }
        this.displayDetail()
    }
}