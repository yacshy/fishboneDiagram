import Init from './init'
import { Quadrant } from '@utils/data-calcs'
import { simpleDeepClone } from '@utils/clone'
import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'


export default class SpreadBranch extends Init {
    constructor(index, template) {
        super(index, template)
    }

    #translation(current) {
        const that = this
        this.currentData.data.forEach((info, index) => {
            const isLeft = Boolean(index % 2 === 0)
            /**象限 */
            const quadrant = Quadrant(0, index)
            /**新的起点 branch 1 的起点 */
            const start = { 
                x: this.root.x + info.addup / Tan(75),
                y: this.root.y - info.addup
            }
            const ballPosi = {
                cx: start.x + (isLeft ? -80 : 80),
                cy: start.y - 24,
            }
            $(`[mark="ball_${index}"]`).css(ballPosi)
            $(`[mark="ball-ci_${index}"]`).attr({
                x: ballPosi.cx - 3,
                y: ballPosi.cy - 1
            })
            $(`[mark="branch1_${index}"]`).attr('d', BranchOneD(start, 80, isLeft))
            $(`[mark="title_${index}"]`).attr({
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 28,
            })
            $(`[mark="news_title_${index}"]`).attr({
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 8,
            })
            // 如果要展开的是当前枝丫，需要特殊处理，不是简单平移
            if (index === current) {
                $svg('rect').attr({
                    mark: `ball-ci_${index}`, // close icon
                    x: ballPosi.cx - 3,
                    y: ballPosi.cy - 1,
                    height: 2, width: 6, rx: 0,
                }).css({
                    fill: '#73BCF9',
                    cursor: 'pointer'
                }).on('click', function () {
                    that.shrinkBranch(index)
                }).insertAfter(
                    $(`[mark="ball_${index}"]`).css({
                        filter: 'none',
                        fill: '#020C1C',
                        strokeWidth: 1,
                        stroke: '#73BCF9'
                    }).off().on('click', function () {
                        that.shrinkBranch(index)
                    })
                )
                this.#spread_branch_two(start, current)
                return
            }
            if (!(info.org && info.pre)) return
            // trunk
            const trunkPosi = {
                x: start.x + (isLeft ? -45 : 45),
                y: start.y - 25
            }
            const trunkHeight = info.height - 15
            $(`[mark="trunk_${index}"]`).attr('points', BranchTwoPoints(trunkPosi, trunkHeight, true))
            // org
            const orgStart = {
                y: trunkPosi.y + 26,
                x: trunkPosi.x - 26 / Tan(75)
            }
            const offsetForText_org = 6 * (info.org.length.toString().length)
            const orgBallPosi = {
                x: orgStart.x + (isLeft ? -71 : 65 - offsetForText_org),
                y: orgStart.y + 9
            }
            $(`[mark="org_${index}"]`).attr({ // 组织
                x: orgStart.x + (isLeft ? -75 : 75),
                y: orgStart.y + 20
            })
            $(`[mark="org_ball_${index}"]`).css(orgBallPosi)
            $(`[mark="org_ball_${index}_text"]`).attr({
                x: orgBallPosi.x + 3.5,
                y: orgBallPosi.y + 9.5
            })
            $(`[mark="org_${index}_branch"]`).attr('d', BranchOrgD(orgStart, 65, quadrant))
            const orgTrunkStart = {
                y: orgStart.y + 16,
                x: orgStart.x + (isLeft ? -36 : 36)
            }
            const orgTrunkHeight = info.org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */
            $(`[mark="org_${index}_trunk"]`).attr('points', BranchOrgTrunkPoints(orgTrunkStart, orgTrunkHeight, true))
            info.org.forEach((_, orgIndex) => {
                const offset = (orgIndex + 0.5) * 32
                const start = {
                    y: orgTrunkStart.y + offset,
                    x: orgTrunkStart.x - offset / Tan(75)
                }
                $(`[mark="org_${index}_${orgIndex}_branch"]`).attr('d', BranchsOfOrgD(start, 28, quadrant))
                $(`[mark="org_${index}_${orgIndex}"]`).attr({
                    x: start.x + (isLeft ? -120 : 120) / Tan(75),
                    y: start.y + 21
                })
            })
            // pre
            const distence = orgTrunkHeight + 15 + 26
            const preStart = {
                y: trunkPosi.y + distence,
                x: trunkPosi.x - distence / Tan(75)
            }
            $(`[mark="pre_${index}"]`).attr({ // 组织
                x: preStart.x + (isLeft ? -75 : 75),
                y: preStart.y + 20
            })
            const offsetForText_pre = 6 * (info.pre.length.toString().length)
            const preBallPosi = {
                x: preStart.x + (isLeft ? -71 : 65 - offsetForText_pre),
                y: preStart.y + 9
            }
            $(`[mark="pre_ball_${index}"]`).css(preBallPosi)
            $(`[mark="pre_ball_${index}_text"]`).attr({
                x: preBallPosi.x + 3.5,
                y: preBallPosi.y + 9.5
            })
            $(`[mark="pre_${index}_branch"]`).attr('d', BranchOrgD(preStart, 65, quadrant))
            const preTrunkStart = {
                y: preStart.y + 16,
                x: preStart.x + (isLeft ? -36 : 36)
            }
            const preTrunkHeight = info.pre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */
            $(`[mark="pre_${index}_trunk"]`).attr('points', BranchOrgTrunkPoints(preTrunkStart, preTrunkHeight, true))
            info.pre.forEach((_, preIndex) => {
                const offset = (preIndex + 0.5) * 32
                const start = {
                    y: preTrunkStart.y + offset,
                    x: preTrunkStart.x - offset / Tan(75)
                }
                $(`[mark="pre_${index}_${preIndex}_branch"]`).attr('d', BranchsOfOrgD(start, 28, quadrant))
                $(`[mark="pre_${index}_${preIndex}"]`).attr({
                    x: start.x + (isLeft ? -120 : 120) / Tan(75),
                    y: start.y + 21
                })
            })
        })
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
                    fontWeight: 'bolder',
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
        myPre?.forEach((text, preIndex) => {
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

    spreadBranch(index) {
        this.templateShadw.data[index] = simpleDeepClone(this.template.data[index])
        const OLD_DATA = simpleDeepClone(this.currentData)
        const data = this.updateCurrentData()
        const { x, y } = this.root
        const trunk = $('[mark="trunk"]')
        Raf(OLD_DATA.height, data.height, (offset) => {
            trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
        })
        this.#translation(index)
    }
}