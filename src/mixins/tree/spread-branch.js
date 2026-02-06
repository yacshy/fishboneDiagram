import TreeInit from './init'

import $svg from '@utils/jquery.ts'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'
import { simpleDeepClone } from '@/utils/clone'
import { CalcSpayData, Quadrant } from '@/utils/data-calcs'
import { RAW_DATA } from '@utils/data'

export default class TreeSpreadBranch extends TreeInit {
    constructor(index) {
        super(index)
    }

    /**
     * 主干的伸展
     * @param {number} OLD_TRUNK_HEIGHT 
     */
    #spread_trunk(OLD_TRUNK_HEIGHT) {
        Raf(OLD_TRUNK_HEIGHT, Math.min(this.info.height, this.svgStore.maxHeight), (offset) => {
            const { x, y } = this.trunkRoot
            if (this.upper) {
                $(`#trunk_${this.index}`).attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
                return
            }
            $(`#trunk_${this.index}`).attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y + offset}, ${x + 5} ${y}, ${x} ${y}`)
        })
    }
    /**
     * 平移
     * @param {{x:number, y:number}} start 起点
     * @param {number} index 索引
     */
    #translation(start, index) {
        // 平移more
        const more_height = Math.min(this.info.height, this.svgStore.maxHeight)
        const more_x = this.trunkRoot.x + more_height / Tan(75)
        const more_y = this.trunkRoot.y + (this.upper ? -more_height : more_height)
        $(`#more_${this.index}`).attr({
            transform: `translate(${more_x - 40}, ${this.upper ? more_y - 40 : more_y + 10})`
        })
        const isLeft = Boolean(index % 2 === 0)
        const ballPosi = {
            cx: start.x + (isLeft ? -80 : 80),
            cy: start.y - 24
        }
        $(`#ball_${this.index}_${index}`).css(ballPosi)

        $(`#branch1_${this.index}_${index}`).attr({
            'd': BranchOneD(start, 80, isLeft)
        })
        $(`#title_${this.index}_${index}`).attr({
            x: start.x + (isLeft ? -92 : 92),
            y: start.y - 28,
        })
        $(`#news_title_${this.index}_${index}`).attr({
            x: start.x + (isLeft ? -92 : 92),
            y: start.y - 8,
        })
    }
    /**
     * 展开branch 2
     * @param {{x:number, y:number}} start 
     * @param {number} index 
     * @returns {x:number, y:number}
     */
    #spread_branch_two(start, index) {
        const isLeft = Boolean(index % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        /**长自己的branch2 */
        let myBranch2 = $svg('polygon')
            .attr('id', `branch2_${this.index}_${index}`)
            .css({ fill: this.upper ? 'url(#br-two-t-defs)' : 'url(#br-two-b-defs)' })
            .appendTo(`#group_${this.index}`)
        Raf(0, this.info.data[index].height - 15, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper)).show()
        })
        return b2Start
    }
    /**
     * 展开branch org
     * @param {{x:number,y:number}} b2Start 
     * @param {number} index 
     * @returns {number}
     */
    #spread_branch_org(b2Start, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(this.index, index)
        /**branch-org起点 */
        const orgStart = {
            y: b2Start.y + 26,
            x: b2Start.x + (this.upper ? -26 : 26) / Tan(75)
        }
        /**完全体数据的org列表 */
        const complateOrg = RAW_DATA[this.index].data[index].org
        const offsetForText = 6 * (complateOrg.length.toString().length)
        // 长ball
        const ballPosi = {
            x: orgStart.x + (isLeft ? -71 : (65 - offsetForText)),
            y: orgStart.y + 9
        }
        $svg('rect')
            .attr({ id: `org_ball_${this.index}_${index}` })
            .css({
                ...ballPosi,
                width: 6 + offsetForText,
                height: 12,
                rx: 6,
                fill: '#020C1C',
                strokeWidth: 1,
                stroke: 'rgba(115,188,249,0.6)',
                cursor: 'pointer'
            })
            .on('click', () => {
                this.shrinkOrg(index)
            })
            .appendTo(`#group_${this.index}`)

        // 修改ball里的内容
        $svg('text').attr({
            id: `org_ball_text_${this.index}_${index}`,
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        })
        .css({
            fill: '#73BCF9',
            fontSize: 9,
            fontFamily: 'Source Han Sans CN, Source Han Sans CN',
            fontWeight: 300,
            color:'#73BCF9',
            cursor: 'pointer'
        })
        .on('click', () => {
            this.shrinkOrg(index)
        })
        .text(complateOrg.length).insertAfter(`#org_ball_${this.index}_${index}`)

        /**长自己的branch_org */
        let myBranchOrg = $svg('path')
            .attr('id', `branchorg_${this.index}_${index}`)
            .css({ fill: isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)' })
            .insertBefore(`#org_ball_${this.index}_${index}`)

        Raf(0, 65, (offset) => {
            myBranchOrg.attr('d', BranchOrgD(orgStart, offset, quadrant)).show()
        })
        /**org-trunk起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**org列表 */
        const myOrg = this.info.data[index].org
        /**branch-org-trunk高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**生长 branch_org 的trunk，然后出现 name (即：“组织”) */
        let myBranchOrgTrunk = $svg('polygon')
            .attr('id', `branchorg_${this.index}_${index}_trunk`)
            .css({ fill: this.upper ? 'url(#br-two-t-defs)' : 'url(#br-two-b-defs)' })
            .appendTo(`#group_${this.index}`)
        Raf(0, myBranchOrgTrunkHeight - 15 /**因为这段间隔是空白的 */, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, this.upper)).show()
        }).then(() => {
            // name 文字出现
            let x = orgStart.x + (isLeft ? -75 : 75)
            let y = orgStart.y + 20
            $svg('text')
                .attr({ id: `branchorg_${this.index}_${index}_name`, x, y })
                .addClass('b-title')
                .css({
                    fill: '#A1DDFF',
                    transform: isLeft ? 'translateX(-100%)' : 'none',
                    cursor: 'pointer'
                })
                .text('组织')
                .hover(function () {
                    $(this).css({ fill: '#ec8a69' })
                }, function () {
                    $(this).css({ fill: '#A1DDFF' })
                })
                .on('click', () => {
                    this.navToDetail(index, 'org')
                })
                .appendTo(`#group_${this.index}`)
        })
        // 生长 branch_org 下的附枝
        myOrg.forEach((text, orgIndex) => {
            const myBranch = $svg('path')
                .attr('id', `branchorg_${this.index}_${index}_${orgIndex}`)
                .css({ fill: '#254373' })
                .appendTo(`#group_${this.index}`)

            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            Raf(0, 28, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => {
                $svg('text')
                    .attr({
                        id: `branchorg_${this.index}_${index}_${orgIndex}_text`,
                        x: start.x + (isLeft ? -120 : 120) / Tan(75),
                        y: start.y + 21
                    })
                    .addClass('b-title')
                    .css({
                        fill: '#fff',
                        transform: isLeft ? 'translateX(-100%)' : 'none'
                    })
                    .text(text)
                    .appendTo(`#group_${this.index}`)
            })
        })

        return orgStart
    }
    /**
     * 展开branch  pre
     * @param {{x:number,y:number}} orgStart 
     * @param {number} index 
     */
    #spread_branch_pre(orgStart, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(this.index, index)
        const myBranchOrgTrunkHeight = this.info.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const preStart = {
            y: orgStart.y + myBranchOrgTrunkHeight,
            x: orgStart.x + (this.upper ? -myBranchOrgTrunkHeight : myBranchOrgTrunkHeight) / Tan(75)
        }
        /**完全体数据pre列表 */
        const complatePre = RAW_DATA[this.index].data[index].pre
        const offsetForText = 6 * (complatePre.length.toString().length)
        const ballPosi = {
            x: preStart.x + (isLeft ? -71 : 65 - offsetForText),
            y: preStart.y + 9
        }
        $svg('rect')
            .attr({
                id: `pre_ball_${this.index}_${index}`
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
            .appendTo(`#group_${this.index}`)
        // 修改ball里的内容
        $svg('text').attr({
            id: `pre_ball_text_${this.index}_${index}`,
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        })
        .css({
            fill: '#73BCF9',
            fontSize: 9,
            fontFamily: 'Source Han Sans CN, Source Han Sans CN',
            fontWeight: 300,
            color:'#73BCF9',
            cursor: 'pointer'
        })
        .on('click', () => {
            this.shrinkPre(index)
        })
        .text(complatePre.length).insertAfter(`#pre_ball_${this.index}_${index}`)

        /**长自己的branch_pre，然后出现 name (即：“人员”) */
        let myBranchPre = $svg('path')
            .attr('id', `branchpre_${this.index}_${index}`)
            .css({ fill: isLeft ? 'url(#br-three-lt-defs)' : 'url(#br-three-rt-defs)' })
            .insertBefore(`#pre_ball_${this.index}_${index}`)
        Raf(0, 65, (offset) => {
            myBranchPre.attr('d', BranchOrgD(preStart, offset, quadrant)).show()
        }).then(() => {
            // name 文字出现
            let x = preStart.x + (isLeft ? -75 : 75)
            let y = preStart.y + 20
            $svg('text')
                .attr({ id: `branchpre_${this.index}_${index}_name`, x, y })
                .addClass('b-title')
                .css({
                    fill: '#A1DDFF',
                    transform: isLeft ? 'translateX(-100%)' : 'none',
                    cursor: 'pointer'
                })
                .hover(function () {
                    $(this).css({ fill: '#ec8a69' })
                }, function () {
                    $(this).css({ fill: '#A1DDFF' })
                })
                .text('人员')
                .on('click', () => {
                    this.navToDetail(index, 'pre')
                })
                .appendTo(`#group_${this.index}`)
        })
        /**pre-trunk起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre列表 */
        const myPre = this.info.data[index].pre
        /**pre-trunk高度 */
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**生长 branch_pre 的trunk */
        let myBranchPreTrunk = $svg('polygon')
            .attr('id', `branchpre_${this.index}_${index}_trunk`)
            .css({ fill: this.upper ? 'url(#br-two-t-defs)' : 'url(#br-two-b-defs)' })
            .appendTo(`#group_${this.index}`)
        Raf(0, myBranchPreTrunkHeight - 15, (offset) => {
            myBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, this.upper)).show()
        })
        /**生长 branch_pre 下的人员名称 */
        myPre.forEach((text, preIndex) => {
            const myBranch = $svg('path')
                .attr('id', `branchpre_${this.index}_${index}_${preIndex}`)
                .css({ fill: '#254373' })
                .appendTo(`#group_${this.index}`)

            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            Raf(0, 28, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => {
                $svg('text')
                    .attr({
                        id: `branchpre_${this.index}_${index}_${preIndex}_text`,
                        x: start.x + (isLeft ? -120 : 120) / Tan(75),
                        y: start.y + 21
                    })
                    .addClass('b-title')
                    .css({
                        fill: '#fff',
                        transform: isLeft ? 'translateX(-100%)' : 'none'
                    })
                    .text(text)
                    .appendTo(`#group_${this.index}`)
            })
        })
    }


    /**
     * 收起别人的branch 2
     * @param {{x:number,y:number}} start 
     * @param {Object} OLD_INFO 
     * @param {number} index 
     * @returns {{x:number,y:number}}
     */
    #shrink_branch_two(start, OLD_INFO, index) {
        const otherBranch2 = $(`#branch2_${this.index}_${index}`)
        if (!otherBranch2[0]) return
        const isLeft = Boolean(index % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        // 收起别的枝丫下的branch2
        Raf(OLD_INFO.data[index].height, 0, (offset) => {
            otherBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper))
        }).then(() => otherBranch2.remove())
        return b2Start
    }
    /**
     * 收起branch org
     * @param {{x:number,y:number}} b2Start 
     * @param {Object} OLD_INFO 
     * @param {number} index 
     * @returns 
     */
    #shrink_branch_org(b2Start, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        /**象限 */
        const quadrant = Quadrant(this.index, index)
        /**org 列表 */
        const otherOrg = OLD_INFO.data[index].org
        /**org 起点 */
        const orgStart = {
            y: b2Start.y + 26,
            x: b2Start.x + (this.upper ? -26 : 26) / Tan(75)
        }
        // 收起ball
        $(`#org_ball_${this.index}_${index}`).remove()
        $(`#org_ball_text_${this.index}_${index}`).remove()
        // 收起别人org的name，text（“组织”）
        $(`#branchorg_${this.index}_${index}_name`).remove()
        /**收起别人的branch_org */
        const otherBranchOrg = $(`#branchorg_${this.index}_${index}`)
        Raf(67, 0, (offset) => {
            otherBranchOrg.attr('d', BranchOrgD(orgStart, offset, quadrant))
        }).then(() => otherBranchOrg.remove())
        /**org trunk高度 */
        const otherBranchOrgTrunkHeight = otherOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**org trunk 起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**收起别人的branch_org_trunk */
        const otherBranchOrgTrunk = $(`#branchorg_${this.index}_${index}_trunk`)
        Raf(otherBranchOrgTrunkHeight, 0, (offset) => {
            otherBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, this.upper))
        }).then(() => otherBranchOrgTrunk.remove())
        // 收起别人的branch_org下的附枝
        otherOrg?.forEach((_, orgIndex) => {
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            $(`#branchorg_${this.index}_${index}_${orgIndex}_text`).remove()
            let branch = $(`#branchorg_${this.index}_${index}_${orgIndex}`)
            Raf(28, 0, (offset) => {
                branch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => $(branch).remove())
        })
        return orgStart
    }
    /**
     * 收起branch pre
     * @param {{x:number,y:number}} orgStart 
     * @param {Object} OLD_INFO 
     * @param {number} index 
     */
    #shrink_branch_pre(orgStart, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        /**象限 */
        const quadrant = Quadrant(this.index, index)
        const otherBranchOrgTrunkHeight = OLD_INFO.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const preStart = {
            y: orgStart.y + otherBranchOrgTrunkHeight,
            x: orgStart.x + (this.upper ? -otherBranchOrgTrunkHeight : otherBranchOrgTrunkHeight / Tan(75)) / Tan(75)
        }
        // 收起ball
        $(`#pre_ball_${this.index}_${index}`).remove()
        $(`#pre_ball_text_${this.index}_${index}`).remove()
        // 收起别人pre的name，text（“人员”）
        $(`#branchpre_${this.index}_${index}_name`).remove()
        /** 收起别人的branch_pre */
        let otherBranchPre = $(`#branchpre_${this.index}_${index}`)
        Raf(67, 0, (offset) => {
            otherBranchPre.attr('d', BranchOrgD(preStart, offset, quadrant)).show()
        }).then(() => otherBranchPre.remove())
        /**pre trunk 起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre 列表 */
        const otherPre = OLD_INFO.data[index].pre
        /**branch trunk 高度 */
        const otherBranchPreTrunkHeight = otherPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**收起 branch_pre 的trunk */
        let otherBranchPreTrunk = $(`#branchpre_${this.index}_${index}_trunk`)
        Raf(otherBranchPreTrunkHeight - 15, 0, (offset) => {
            otherBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, this.upper)).show()
        }).then(() => otherBranchPreTrunk.remove())
        // 收起 branch_pre 下的人员名称
        otherPre.forEach((_, preIndex) => {
            const myBranch = $(`#branchpre_${this.index}_${index}_${preIndex}`)
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            $(`#branchpre_${this.index}_${index}_${preIndex}_text`).remove()
            Raf(28, 0, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => myBranch.remove())
        })
    }

    /**
     * 展开自己的枝丫（隐：附带关闭别人的枝丫）
     * @param {number} branchIndex 
     */
    spreadBranch(branchIndex) {
        /*** 记录旧的数据*/
        const OLD_INFO = simpleDeepClone(this.info)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        /*** 刷新数据*/
        const newData = CalcSpayData(this.index, branchIndex, 'get')
        this.dataStore.data.updatePart(this.index, newData)
        // 主干的伸展
        this.#spread_trunk(OLD_TRUNK_HEIGHT)

        // 当前枝丫的伸展与非当前枝丫的收起
        this.info.data.forEach((info, index) => {
            const isLeft = Boolean(index % 2 === 0)
            /** 象限 */
            const quadrant = Quadrant(this.index, index)
            /** 新的起点 branch 1 起点 */
            const start = {
                x: this.trunkRoot.x + info.addup / Tan(75), /** 不论哪个象限都是加 */
                y: this.trunkRoot.y + ([1, 2].includes(quadrant) ? -info.addup : info.addup) /** 1，2象限的y要在中线的基础上减，反之加 */
            }
            // 平移ball、branch1、title、news_title
            this.#translation(start, index)
            // 展开自己的枝丫
            if (branchIndex === index) {
                /**branch  two  起点 */
                const b2Start = this.#spread_branch_two(start, index)
                /**branch org起点 */
                const orgStart = this.#spread_branch_org(b2Start, index)
                this.#spread_branch_pre(orgStart, index)
                // ball的展开样式里的横杠
                const ciPosi = {
                    x: start.x + (isLeft ? -80 : 80) - 3,
                    y: start.y - 24 - 1
                }
                $svg('rect').attr({
                    id: `ball-ci_${this.index}_${index}`, // close icon
                    height: 2,
                    width: 6,
                    rx: 0,
                    fill: '#73BCF9',
                    cursor: 'pointer',
                    ...ciPosi
                }).on('click', () => {
                    this.shrinkBranch(index)
                }).insertAfter(`#ball_${this.index}_${index}`)
            }
            // 收起别人的枝丫
            else {
                // 改变别人的ball
                $(`#ball_${this.index}_${index}`).css({
                    fill: 'url(#ball)',
                    filter: 'url(#ball-shadow)',
                    strokeWidth: 0,
                    strok: 'rgba(115,188,249,0.6)'
                })
                $(`#ball-ci_${this.index}_${index}`).remove()
                /**b2 起点 */
                const b2Start = this.#shrink_branch_two(start, OLD_INFO, index)
                if (!b2Start) return
                const orgStart = this.#shrink_branch_org(b2Start, OLD_INFO, index)
                this.#shrink_branch_pre(orgStart, OLD_INFO, index)
            }
        })
    }
}