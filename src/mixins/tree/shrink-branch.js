import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'
import { simpleDeepClone } from '@/utils/clone'
import { CalcSpayData, Quadrant } from '@/utils/data-calcs'
import { RAW_DATA } from '@utils/data'

import TreeSpreadBranch from './spread-branch'

export default class TreeShrinkBranch extends TreeSpreadBranch {
    constructor(index) {
        super(index)
    }
    /**
     * 收缩主干
     * @param {number} OLD_TRUNK_HEIGHT 
     */
    #shrink_trunk(OLD_TRUNK_HEIGHT) {
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
     */
    #translation() {
        // 平移more
        const more_height = Math.min(this.info.height, this.svgStore.maxHeight)
        const more_x = this.trunkRoot.x + more_height / Tan(75)
        const more_y = this.trunkRoot.y + (this.upper ? -more_height : more_height)
        $(`#more_${this.index}`).attr({
            transform: `translate(${more_x - 40}, ${this.upper ? more_y - 40 : more_y + 10})`
        })
        this.info.data.forEach((info, index) => {
            const isLeft = Boolean(index % 2 === 0)
            /**象限 */
            const quadrant = Quadrant(this.index, index)
            /**新的起点 branch 1 的起点 */
            const start = { x: this.trunkRoot.x + info.addup / Tan(75) }
            switch (quadrant) {
                case 1:
                case 2:
                    start.y = this.trunkRoot.y - info.addup
                    break
                case 3:
                case 4:
                    start.y = this.trunkRoot.y + info.addup
            }
            $(`#ball_${this.index}_${index}`).css({
                cx: start.x + (isLeft ? -80 : 80),
                cy: start.y - 24,
            })
            $(`#branch1_${this.index}_${index}`).attr('d', BranchOneD(start, 80, isLeft))
            $(`#title_${this.index}_${index}`).attr({
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 28,
            })
            $(`#news_title_${this.index}_${index}`).attr({
                x: start.x + (isLeft ? -92 : 92),
                y: start.y - 8,
            })
        })
    }
    #shrink_branch_two(start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        /**
         * 收起branch2
         */
        const myBranch2 = $(`#branch2_${this.index}_${branchIndex}`)
        Raf(OLD_INFO.data[branchIndex].height - 15, 0, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper))
        }).then(() => myBranch2.remove())
        return b2Start
    }
    #shrink_branch_org(b2Start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        const orgStart = {
            y: b2Start.y + 26,
            x: b2Start.x + (this.upper ? -26 : 26) / Tan(75)
        }
        // 收起ball
        $(`#org_ball_${this.index}_${branchIndex}`).remove()
        $(`#org_ball_text_${this.index}_${branchIndex}`).remove()
        /**收起branch org */
        const myBranchOrg = $(`#branchorg_${this.index}_${branchIndex}`)
        Raf(65, 0, (offset) => {
            myBranchOrg.attr('d', BranchOrgD(orgStart, offset, quadrant))
        }).then(() => myBranchOrg.remove())

        /**org  列表 */
        const myOrg = OLD_INFO.data[branchIndex].org
        /**org trunk  高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        // 移除org的name（“组织”）
        $(`#branchorg_${this.index}_${branchIndex}_name`).remove()
        /**org trunk 起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**收起branch org trunk */
        const myBranchOrgTrunk = $(`#branchorg_${this.index}_${branchIndex}_trunk`)
        Raf(myBranchOrgTrunkHeight, 0, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, this.upper))
        }).then(() => myBranchOrgTrunk.remove())
        /**收起branch_org下的附枝 */
        myOrg?.forEach((_, orgIndex) => {
            $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}_text`).remove()
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            let branch = $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}`)
            Raf(28, 0, (offset) => {
                branch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => $(branch).remove())
        })

        return orgStart
    }
    #shrink_branch_pre(orgStart, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        const myBranchOrgTrunkHeight = OLD_INFO.data[branchIndex].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**pre 起点 */
        const preStart = {
            y: orgStart.y + myBranchOrgTrunkHeight,
            x: orgStart.x + (this.upper ? -myBranchOrgTrunkHeight : myBranchOrgTrunkHeight) / Tan(75)
        }
        // 收起ball
        $(`#pre_ball_${this.index}_${branchIndex}`).remove()
        $(`#pre_ball_text_${this.index}_${branchIndex}`).remove()
        // 移除pre的name（“人员”）
        $(`#branchpre_${this.index}_${branchIndex}_name`).remove()
        /**收起branch_pre */
        let myBranchPre = $(`#branchpre_${this.index}_${branchIndex}`)
        Raf(65, 0, (offset) => {
            myBranchPre.attr('d', BranchOrgD(preStart, offset, quadrant)).show()
        }).then(() => myBranchPre.remove())
        /**pre trunk起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre 列表 */
        const myPre = OLD_INFO.data[branchIndex].pre
        /**pre trunk高度 */
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**收起 branch_pre 的trunk */
        let myBranchPreTrunk = $(`#branchpre_${this.index}_${branchIndex}_trunk`)
        Raf(myBranchPreTrunkHeight - 15, 0, (offset) => {
            myBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, this.upper)).show()
        }).then(() => myBranchPreTrunk.remove())
        // 收起 branch_pre 下的人员名称
        myPre.forEach((_, preIndex) => {
            $(`#branchpre_${this.index}_${branchIndex}_${preIndex}_text`).remove()
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            const myBranch = $(`#branchpre_${this.index}_${branchIndex}_${preIndex}`)
            Raf(28, 0, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => myBranch.remove())
        })
    }

    /**
     * 收起自己的枝丫
     * @param {number} branchIndex 
     */
    shrinkBranch(branchIndex) {
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.info)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        /**刷新数据 */
        const newData = CalcSpayData(this.index, branchIndex, 'delete')
        this.dataStore.data.updatePart(this.index, newData)
        // 主干的收缩
        this.#shrink_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        /**象限 */
        const quadrant = Quadrant(this.index, branchIndex)
        /**整体高度 */
        const ADDUP = this.info.data[branchIndex].addup
        /**新的起点 */
        const start = {
            x: this.trunkRoot.x + ADDUP / Tan(75),
            y: this.trunkRoot.y + ([1, 2].includes(quadrant) ? -ADDUP : ADDUP) /** 1，2象限的y要在中线的基础上减，反之加 */
        }
        // 去除ball里的横杠
        $(`#ball-ci_${this.index}_${branchIndex}`).remove()
        $(`#ball_${this.index}_${branchIndex}`).css({
            fill: 'url(#ball)',
            filter: 'url(#ball-shadow)',
            strokeWidth: 0,
            strok: 'rgba(115,188,249,0.6)'
        })
        /**branch2的起点 */
        const b2Start = this.#shrink_branch_two(start, OLD_INFO, branchIndex)
        /**branch org的起点 */
        const orgStart = this.#shrink_branch_org(b2Start, OLD_INFO, branchIndex)
        this.#shrink_branch_pre(orgStart, OLD_INFO, branchIndex)
    }
}