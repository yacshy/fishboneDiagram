import SpreadPre from './spread-pre'
import { Quadrant } from '@utils/data-calcs'
import { simpleDeepClone } from '@utils/clone'
import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'

export default class ShrinkPre extends SpreadPre {
    constructor(index, template) {
        super(index, template)
    }

    #shrink_trunk(OLD_TRUNK_HEIGHT) {
        const trunk = $('[mark="trunk"]')
        const { x, y } = this.root
        Raf(OLD_TRUNK_HEIGHT, this.currentData.height, (offset) => {
            trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
        })
    }

    #translation() {
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
            // 如果当前枝丫是被折叠的那棵，下面的就不需要平移
            if (!info.pre) return
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

    #shrink_branch_two(start, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        // 收起branch2
        const OldHeight = OLD_INFO.data[index].height - 15
        const NewHeight = this.currentData.data[index].height - 15
        const trunk = $(`[mark="trunk_${index}"]`)
        Raf(OldHeight, NewHeight, (offset) => {
            trunk.attr('points', BranchTwoPoints(b2Start, offset, true))
        })
        return b2Start
    }

    #shrink_branch_pre(orgStart, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(0, index)
        const ORG_TRUNK_HEIGHT = OLD_INFO.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/**超出 */ + 15 /**org与pre的间隔 */
        const ORG_HEIGHT = ORG_TRUNK_HEIGHT + 26
        /**branch_pre的起点 */
        const preStart = {
            y: orgStart.y + ORG_HEIGHT,
            x: orgStart.x - ORG_HEIGHT / Tan(75)
        }
        const trunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        const OLE_PRE = OLD_INFO.data[index].pre
        const OLD_TRUNK_HEIGHT = OLE_PRE.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */
        const trunk = $(`[mark="pre_${index}_trunk"]`)
        Raf(OLD_TRUNK_HEIGHT, 12, (offset) => {
            trunk.attr('points', BranchOrgTrunkPoints(trunkStart, offset, true))
        })
        /**收起 branch_pre 下的附枝 */
        OLE_PRE?.forEach((_, preIndex) => {
            $(`[mark="pre_${index}_${preIndex}"]`).remove()
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: trunkStart.y + offset,
                x: trunkStart.x - offset / Tan(75)
            }
            const branch = $(`[mark="pre_${index}_${preIndex}_branch"]`)
            Raf(28, 0, (offset) => {
                branch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => branch.remove())
        })
    }

    shrinkPre(index) {
        const that = this
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.currentData)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        this.templateShadw.data[index].pre = []
        this.updateCurrentData()
        $(`[mark="pre_ball_${index}"]`).off().on('click', () => {
            this.spreadPre(index)
        })
        $(`[mark="pre_ball_${index}_text"]`).off().on('click', () => {
            this.spreadPre(index)
        })
        // 主干的收缩
        this.#shrink_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        /**整体高度 */
        const ADDUP = this.currentData.data[index].addup
        /**新的起点 */
        const start = {
            x: this.root.x + ADDUP / Tan(75),
            y: this.root.y - ADDUP
        }
        /**branch2的起点 */
        const b2Start = this.#shrink_branch_two(start, OLD_INFO, index)
        /**branch org的起点 */
        this.#shrink_branch_pre(b2Start, OLD_INFO, index)
    }
}