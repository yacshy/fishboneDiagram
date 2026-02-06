import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'
import { simpleDeepClone } from '@/utils/clone'
import { Quadrant, CalcSpayOrgData } from '@/utils/data-calcs'
import { RAW_DATA } from '@utils/data'

import TreeSpreadPre from './spread-pre'

export default class TreeShrinkPre extends TreeSpreadPre {
    constructor(index) {
        super(index)
    }
    /**
     * 收起 branch 2的 trunk
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
     * @param {{x:number,y:number}}} start 
     * @param {Object} OLD_INFO 
     * @param {number} branchIndex 
     * @returns 
     */
    #shrink_branch_two(start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        /**branch2的起点 */
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        // 收缩branch2
        const myBranch2 = $(`#branch2_${this.index}_${branchIndex}`)
        Raf(OLD_INFO.data[branchIndex].height - 15, this.info.data[branchIndex].height - 15, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper))
        })
        return b2Start
    }
    /**
     * 平移 org
     * @param {{x:number,y:number}} b2Start 
     * @param {number} OLD_INFO 
     * @param {number} branchIndex 
     * @returns 
     */
    #translate_branch_org(b2Start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        /**branch org的起点 */
        const orgStart = {
            y: b2Start.y + 26,
            x: b2Start.x + (this.upper ? -26 : 26) / Tan(75)
        }
        // 平移ball
        /**完全体数据的org列表 */
        const complateOrg = RAW_DATA[this.index].data[branchIndex].org
        const offsetForText = 6 * (complateOrg.length.toString().length)
        /**ball的坐标 */
        const ballPosi = {
            x: orgStart.x + (isLeft ? -71 : (65 - offsetForText)),
            y: orgStart.y + 9
        }
        $(`#org_ball_${this.index}_${branchIndex}`).css(ballPosi)
        // 平移ball里的内容
        $(`#org_ball_text_${this.index}_${branchIndex}`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        })
        // 平移branch-org
        $(`#branchorg_${this.index}_${branchIndex}`).attr('d', BranchOrgD(orgStart, 65, quadrant))
        /**org name 起点 */
        const orgNameStart = {
            y: orgStart.y + 20,
            x: orgStart.x + (isLeft ? -75 : 75)
        }
        // 平移 name "组织"
        $(`#branchorg_${this.index}_${branchIndex}_name`).attr(orgNameStart)
        // 收起branch org trunk
        const myOrg = OLD_INFO.data[branchIndex].org
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        $(`#branchorg_${this.index}_${branchIndex}_trunk`).attr('points', BranchOrgTrunkPoints(orgTrunkStart, myBranchOrgTrunkHeight - 15, this.upper))
        // 平移branch_org下的附枝
        myOrg?.forEach((_, orgIndex) => {
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}_text`).attr({
                x: start.x + (isLeft ? -120 : 120) / Tan(75),
                y: start.y + 21
            })
            $(`#branchorg_${this.index}_${branchIndex}_${orgIndex}`).attr('d', BranchsOfOrgD(start, 28, quadrant))
        })

        return orgStart
    }
    /**
     * 收起 pre 
     * @param {{x:number,y:number}} orgStart 
     * @param {number} OLD_INFO 
     * @param {number} branchIndex 
     */
    #shrink_branch_pre(orgStart, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const quadrant = Quadrant(this.index, branchIndex)
        const myBranchOrgTrunkHeight = OLD_INFO.data[branchIndex].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**branch_pre的起点 */
        const preStart = {
            y: orgStart.y + myBranchOrgTrunkHeight,
            x: orgStart.x + (this.upper ? -myBranchOrgTrunkHeight : myBranchOrgTrunkHeight) / Tan(75)
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
        // 修改ball里的内容
        $(`#pre_ball_text_${this.index}_${branchIndex}`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        }).off()
            .on('click', () => {
            this.spreadPre(branchIndex)
        })
        // 平移branch-pre
        $(`#branchpre_${this.index}_${branchIndex}`).attr('d', BranchOrgD(preStart, 65, quadrant))
        /**branch pre name ("人员") 的起点 */
        const preNameStart = {}
        switch (quadrant) {
            case 1:
            case 4:
                preNameStart.x = preStart.x + 75
                preNameStart.y = preStart.y + 20
                break
            case 2:
            case 3:
                preNameStart.x = preStart.x - 75
                preNameStart.y = preStart.y + 20
        }
        // 平移 name "人员"
        $(`#branchpre_${this.index}_${branchIndex}_name`).attr(preNameStart)
        /**收起 branch_pre 的trunk */
        let myBranchPreTrunk = $(`#branchpre_${this.index}_${branchIndex}_trunk`)
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        const myPre = OLD_INFO.data[branchIndex].pre
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        Raf(myBranchPreTrunkHeight - 15, 12, (offset) => {
            myBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, this.upper))
        })
        /**收起 branch_pre 下的附枝 */
        myPre.forEach((_, preIndex) => {
            $(`#branchpre_${this.index}_${branchIndex}_${preIndex}_text`).remove()
            const myBranch = $(`#branchpre_${this.index}_${branchIndex}_${preIndex}`)
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            Raf(28, 0, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => myBranch.remove())
        })
    }

    /**
     * 收起人员
     * @param {number} branchIndex 
     */
    shrinkPre(branchIndex) {
        $(`#pre_ball_${this.index}_${branchIndex}`).off().on('click', () => {
            this.spreadPre(branchIndex)
        })
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.info)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        /**刷新数据 */
        const newData = CalcSpayOrgData(this.index, branchIndex, 'pre', 'delete')
        this.dataStore.data.updatePart(this.index, newData)
        // 主干的收缩
        this.#shrink_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        /**象限 */
        const quadrant = Quadrant(this.index, branchIndex)
        const ADDUP = this.info.data[branchIndex].addup
        /**新的起点 */
        const start = {
            x: this.trunkRoot.x + ADDUP / Tan(75),
            y: this.trunkRoot.y + (this.upper ? -ADDUP : ADDUP) /** 1，2象限的y要在中线的基础上减，反之加 */
        }
        /**b2起点 */
        const b2Start = this.#shrink_branch_two(start, OLD_INFO, branchIndex)
        const orgStart = this.#translate_branch_org(b2Start, OLD_INFO, branchIndex)
        this.#shrink_branch_pre(orgStart, OLD_INFO, branchIndex)
    }
}