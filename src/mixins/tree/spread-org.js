import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'
import { simpleDeepClone } from '@/utils/clone'
import { Quadrant, CalcSpayOrgData } from '@/utils/data-calcs'
import TreeShrinkBranch from './shrink-branch'
import { RAW_DATA } from '@utils/data'


export default class TreeSpreadOrg extends TreeShrinkBranch {
    constructor(index) {
        super(index)
    }

    #spread_trunk(OLD_TRUNK_HEIGHT) {
        const myBranchTrunk = $(`#trunk_${this.index}`)
        Raf(OLD_TRUNK_HEIGHT, Math.min(this.info.height, this.svgStore.maxHeight), (offset) => {
            const { x, y } = this.trunkRoot
            if (this.upper) {
                myBranchTrunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
                return
            }
            myBranchTrunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y + offset}, ${x + 5} ${y}, ${x} ${y}`)
        })
    }

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

    #spread_branch_two(start, OLD_INFO, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        /**生长branch2 */
        const myBranch2 = $(`#branch2_${this.index}_${branchIndex}`)
        Raf(OLD_INFO.data[branchIndex].height - 15, this.info.data[branchIndex].height - 15, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, this.upper))
        })
        return b2Start
    }

    #spread_branch_org(b2Start, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        /**象限 */
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
        // 修改ball内容的位置
        const textPosi = {
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        }
        $(`#org_ball_text_${this.index}_${branchIndex}`).attr(textPosi).off().on('click', () => {
            this.shrinkOrg(branchIndex)
        })
        // 平移branch-org
        $(`#branchorg_${this.index}_${branchIndex}`).attr('d', BranchOrgD(orgStart, 67, quadrant))
        /**org name 起点 */
        const orgNameStart = {
            y: orgStart.y + 20,
            x: orgStart.x + (isLeft ? -75 : 75)
        }
        /**平移 org name "组织" */
        $(`#branchorg_${this.index}_${branchIndex}_name`).attr(orgNameStart)
        /**org列表 */
        const myOrg = this.info.data[branchIndex].org
        /**org高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**org trunk 起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**展开 org-trunk */
        let myBranchOrgTrunk = $(`#branchorg_${this.index}_${branchIndex}_trunk`)
        Raf(12, myBranchOrgTrunkHeight - 15, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, this.upper))
        })
        // 生长branch_org下的附枝
        myOrg?.forEach((text, orgIndex) => {
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x + (this.upper ? -offset : offset) / Tan(75)
            }
            const myBranch = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
                .attr('id', `branchorg_${this.index}_${branchIndex}_${orgIndex}`)
                .css({ fill: '#254373' })
                .appendTo(`#group_${this.index}`)
            Raf(0, 28, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => {
                $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
                    .attr({
                        id: `branchorg_${this.index}_${branchIndex}_${orgIndex}_text`,
                        x: start.x + (isLeft ? -120 : 120) / Tan(75),
                        y: start.y + 21
                    })
                    .css({
                        fontSize: 14,
                        fill: '#fff',
                        strokeWidth: 1,
                        transformBox: 'fill-box',
                        transformOrigin: '0% 0%',
                        transform: isLeft ? 'translateX(-100%)' : 'none',
                        font: 'normal normal 500 14px / 14px Source Han Sans CN - Medium, Source Han Sans CN'
                    })
                    .text(text)
                    .appendTo(`#group_${this.index}`)
            })
        })

        return orgStart
    }

    #translate_branch_pre(orgStart, branchIndex) {
        const isLeft = Boolean(branchIndex % 2 === 0)
        /**象限 */
        const quadrant = Quadrant(this.index, branchIndex)
        /**org列表 */
        const myOrg = this.info.data[branchIndex].org
        /**org高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**branch_pre的起点 */
        const preStart = {
            y: orgStart.y + myBranchOrgTrunkHeight,
            x: orgStart.x + (this.upper ? -myBranchOrgTrunkHeight : myBranchOrgTrunkHeight) / Tan(75)
        }
        /**pre name 的起点 “人员” */
        const preNameStart = {
            x: preStart.x + (isLeft ? -75 : 75),
            y: preStart.y + 20
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
        // 平移ball里的东西
        $(`#pre_ball_text_${this.index}_${branchIndex}`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9
        })
        $(`#pre_ball-ci_${this.index}_${branchIndex}`).attr({
            x: preStart.x + (isLeft ? -65 : 65) - 3,
            y: preStart.y + 16 - 1
        })
        // 平移branch pre
        $(`#branchpre_${this.index}_${branchIndex}`).attr('d', BranchOrgD(preStart, 67, quadrant))
        // 平移 "人员"
        $(`#branchpre_${this.index}_${branchIndex}_name`).attr(preNameStart)
        /**branch_pre-trunk 的起点  */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre 列表 */
        const myPre = this.info.data[branchIndex].pre
        /**pre trunk高度 */
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        // 平移 branch-trunk
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
     * 伸展组织
     * @param {number} branchIndex 
     */
    spreadOrg(branchIndex) {
        $(`#org_ball_${this.index}_${branchIndex}`).off().on('click', () => {
            this.shrinkOrg(branchIndex)
        })
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.info)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        /**刷新数据 */
        const newData = CalcSpayOrgData(this.index, branchIndex, 'org', 'get')
        this.dataStore.data.updatePart(this.index, newData)
        // 主干的伸张
        this.#spread_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        const isLeft = Boolean(branchIndex % 2 === 0)
        /**象限 */
        const quadrant = Quadrant(this.index, branchIndex)
        /**整体高度 */
        const ADDUP = this.info.data[branchIndex].addup
        /**新的起点 */
        const start = {
            x: this.trunkRoot.x + ADDUP / Tan(75),
            y: this.trunkRoot.y + (this.upper ? -ADDUP : ADDUP) /** 1，2象限的y要在中线的基础上减，反之加 */
        }
        /**branch2的起点 */
        const b2Start = this.#spread_branch_two(start, OLD_INFO, branchIndex)
        // 伸展 org
        const orgStart = this.#spread_branch_org(b2Start, branchIndex)
        this.#translate_branch_pre(orgStart, branchIndex)
    }
}