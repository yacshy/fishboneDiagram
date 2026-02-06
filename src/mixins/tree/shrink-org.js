import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'
import { simpleDeepClone } from '@/utils/clone'
import { Quadrant, CalcSpayOrgData } from '@/utils/data-calcs'
import { RAW_DATA } from '@utils/data'

import TreeSpreadOrg from './spread-org'

export default class TreeShrinkOrg extends TreeSpreadOrg {
    constructor(index) {
        super(index)
    }
    /**
     * 收起主干
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
            const start = {
                x: this.trunkRoot.x + info.addup / Tan(75),
                y: this.trunkRoot.y + (this.upper ? -info.addup : info.addup)
            }
            const ballPosi = {
                cx: start.x + (isLeft ? -80 : 80),
                cy: start.y - 24
            }
            $(`#ball_${this.index}_${index}`).css(ballPosi)
            $(`#ball-ci_${this.index}_${index}`).attr({
                x: ballPosi.cx - 3,
                y: ballPosi.cy - 1
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
    /**
     * 收起branch 2
     * @param {{x:number,y:number}} start 
     * @param {Object} OLD_INFO 
     * @param {number} branchIndex 
     * @returns 
     */
    #shrink_branch_two(start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        /**branch2的起点 */
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        /**收缩branch2 */
        const myBranch2 = $(`#branch2_${this.index}_${branchIndex}`)
        Raf(OLD_INFO.data[branchIndex].height - 15, this.info.data[branchIndex].height - 15, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper))
        })
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
        /**完全体数据的org列表 */
        const complateOrg = RAW_DATA[this.index].data[branchIndex].org
        const offsetForText = 6 * (complateOrg.length.toString().length)
        /**ball的坐标 */
        const ballPosi = {
            x: orgStart.x + (isLeft ? -71 : (65 - offsetForText)),
            y: orgStart.y + 9
        }
        $(`#org_ball_${this.index}_${branchIndex}`).css(ballPosi)
        // 修改ball里的内容
        $(`#org_ball_text_${this.index}_${branchIndex}`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        }).off()
            .on('click', () => {
                this.spreadOrg(branchIndex)
            })
        /**平移branch-org */
        $(`#branchorg_${this.index}_${branchIndex}`).attr('d', BranchOrgD(orgStart, 67, quadrant))
        /**org name 起点 ("组织") */
        const orgNameStart = {
            x: orgStart.x + (isLeft ? -75 : 75),
            y: orgStart.y + 20
        }
        // 平移 "组织"
        $(`#branchorg_${this.index}_${branchIndex}_name`).attr(orgNameStart)
        /**旧的org列表 */
        const myOrg = OLD_INFO.data[branchIndex].org
        /**旧的 org trunk高度 */
        const oldMyBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**新的 org trunk高度 */
        const currMyBranchOrgTrunkHeight = this.info.data[branchIndex].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**org trunk起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**收起 branch -rog- trunk */
        let myBranchOrgTrunk = $(`#branchorg_${this.index}_${branchIndex}_trunk`)
        Raf(oldMyBranchOrgTrunkHeight - 15, currMyBranchOrgTrunkHeight - 15, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, this.upper))
        })
        // 收起branch_org下的附枝
        myOrg?.forEach((_, orgIndex) => {
            $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}_text`).remove()
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            let myBranch = $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}`)
            myBranch.attr('d', BranchsOfOrgD(start, 28, quadrant))
            Raf(28, 0, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => myBranch.remove())
        })

        return orgStart
    }

    #translate_branch_pre(orgStart, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        /**branch_pre 的起点 */
        const preStart = {
            y: orgStart.y + 27 /**12的曲度 + 15间隙 */,
            x: orgStart.x + (this.upper ? -27 : 27) / Tan(75)
        }
        // 平移ball
        /**完全体数据的org列表 */
        const complateOrg = RAW_DATA[this.index].data[branchIndex].org
        const offsetForText = 6 * (complateOrg.length.toString().length)
        /**ball的坐标 */
        const ballPosi = {
            x: preStart.x + (isLeft ? -71 : (65 - offsetForText)),
            y: preStart.y + 9
        }
        $(`#pre_ball_${this.index}_${branchIndex}`).css(ballPosi)
        // 平移ball里的内容
        $(`#pre_ball_text_${this.index}_${branchIndex}`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        })
        // 平移branch-pre
        $(`#branchpre_${this.index}_${branchIndex}`).attr('d', BranchOrgD(preStart, 67, quadrant))
        /**pre name 的起点 */
        const preNameStart = {
            x: preStart.x + (isLeft ? -75 : 75),
            y: preStart.y + 20
        }
        /**平移 "人员" */
        $(`#branchpre_${this.index}_${branchIndex}_name`).attr(preNameStart)
        /**pre trunk的起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        const myPre = this.info.data[branchIndex].pre
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        // 平移 branch_pre 的trunk
        $(`#branchpre_${this.index}_${branchIndex}_trunk`).attr('points', BranchOrgTrunkPoints(preTrunkStart, myBranchPreTrunkHeight - 15, this.upper))
        // 平移 branch_pre 下的人员名称
        myPre.forEach((_, preIndex) => {
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            $(`#branchpre_${this.index}_${branchIndex}_${preIndex}_text`).attr({
                x: start.x + (isLeft ? -120 : 120) / Tan(75),
                y: start.y + 21
            })
            $(`#branchpre_${this.index}_${branchIndex}_${preIndex}`).attr('d', BranchsOfOrgD(start, 28, quadrant))
        })
    }

    /**
     * 收起组织
     * @param {number} branchIndex 
     */
    shrinkOrg(branchIndex) {
        $(`#org_ball_${this.index}_${branchIndex}`).off().on('click', () => {
            this.spreadOrg(branchIndex)
        })
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.info)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        /**刷新数据 */
        const newData = CalcSpayOrgData(this.index, branchIndex, 'org', 'delete')
        this.dataStore.data.updatePart(this.index, newData)
        // 主干的收缩
        this.#shrink_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        /**新的起点 */
        const ADDUP = this.info.data[branchIndex].addup
        const start = {
            x: this.trunkRoot.x + ADDUP / Tan(75),
            y: this.trunkRoot.y + (this.upper ? -ADDUP : ADDUP) /** 1，2象限的y要在中线的基础上减，反之加 */
        }
        /**b2的起点 */
        const b2Start = this.#shrink_branch_two(start, OLD_INFO, branchIndex)
        /**org的起点 */
        const orgStart = this.#shrink_branch_org(b2Start, OLD_INFO, branchIndex)
        this.#translate_branch_pre(orgStart, branchIndex)
    }
}