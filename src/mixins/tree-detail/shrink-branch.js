
import SpreadBranch from './spread-branch'
import { Quadrant } from '@utils/data-calcs'
import { simpleDeepClone } from '@utils/clone'
import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'

export default class ShrinkBranch extends SpreadBranch {
    constructor(index, tmplate) {
        super(index, tmplate)
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
            // 如果当前枝丫是被折叠的那课，下面的就不需要平移
            if (!info.pre || !info.org) return
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
    #shrink_branch_two(start, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        const b2Start = {
            y: start.y - 25,
            x: start.x + (isLeft ? -45 : 45)
        }
        // 收起branch2
        const myBranch2 = $(`[mark="trunk_${index}"]`)
        Raf(OLD_INFO.data[index].height - 15, 0, (offset) => {
            myBranch2.attr('points', BranchTwoPoints(b2Start, offset, true))
        }).then(() => myBranch2.remove())
        return b2Start
    }
    #shrink_branch_org(b2Start, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(0, index)
        const orgStart = {
            y: b2Start.y + 26,
            x: b2Start.x - 26 / Tan(75)
        }
        // 收起ball
        $(`[mark="org_ball_${index}"]`).remove()
        $(`[mark="org_ball_${index}_text"]`).remove()
        /**收起branch org */
        const myBranchOrg = $(`[mark="org_${index}_branch"]`)
        Raf(65, 0, (offset) => {
            myBranchOrg.attr('d', BranchOrgD(orgStart, offset, quadrant))
        }).then(() => myBranchOrg.remove())

        /**org  列表 */
        const myOrg = OLD_INFO.data[index].org
        /**org trunk  高度 */
        const myBranchOrgTrunkHeight = myOrg.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        // 移除org的name（“组织”）
        $(`[mark="org_${index}"]`).remove()
        /**org trunk 起点 */
        const orgTrunkStart = {
            y: orgStart.y + 16,
            x: orgStart.x + (isLeft ? -36 : 36)
        }
        /**收起branch org trunk */
        const myBranchOrgTrunk = $(`[mark="org_${index}_trunk"]`)
        Raf(myBranchOrgTrunkHeight, 0, (offset) => {
            myBranchOrgTrunk.attr('points', BranchOrgTrunkPoints(orgTrunkStart, offset, true))
        }).then(() => myBranchOrgTrunk.remove())
        /**收起别branch_org下的附枝 */
        myOrg?.forEach((_, orgIndex) => {
            $(`[mark="org_${index}_${orgIndex}"]`).remove()
            const offset = (orgIndex + 0.5) * 32
            const start = {
                y: orgTrunkStart.y + offset,
                x: orgTrunkStart.x - offset / Tan(75)
            }
            let branch = $(`[mark="org_${index}_${orgIndex}_branch"]`)
            Raf(28, 0, (offset) => {
                branch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => $(branch).remove())
        })

        return orgStart
    }
    #shrink_branch_pre(orgStart, OLD_INFO, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(0, index)
        const myBranchOrgTrunkHeight = OLD_INFO.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**pre 起点 */
        const preStart = {
            y: orgStart.y + myBranchOrgTrunkHeight,
            x: orgStart.x - myBranchOrgTrunkHeight / Tan(75)
        }
        // 收起ball
        $(`[mark="pre_ball_${index}"]`).remove()
        $(`[mark="pre_ball_${index}_text"]`).remove()
        // 移除pre的name（“人员”）
        $(`[mark="pre_${index}"]`).remove()
        /**收起branch_pre */
        let myBranchPre = $(`[mark="pre_${index}_branch"]`)
        Raf(65, 0, (offset) => {
            myBranchPre.attr('d', BranchOrgD(preStart, offset, quadrant)).show()
        }).then(() => myBranchPre.remove())
        /**pre trunk起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**pre 列表 */
        const myPre = OLD_INFO.data[index].pre
        /**pre trunk高度 */
        const myBranchPreTrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        /**收起 branch_pre 的trunk */
        let myBranchPreTrunk = $(`[mark="pre_${index}_trunk"]`)
        Raf(myBranchPreTrunkHeight - 15, 0, (offset) => {
            myBranchPreTrunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, true)).show()
        }).then(() => myBranchPreTrunk.remove())
        // 收起 branch_pre 下的人员名称
        myPre.forEach((_, preIndex) => {
            $(`[mark="pre_${index}_${preIndex}"]`).remove()
            const offset = (preIndex + 0.5) * 32
            const start = {
                y: preTrunkStart.y + offset,
                x: preTrunkStart.x - offset / Tan(75)
            }
            const myBranch = $(`[mark="pre_${index}_${preIndex}_branch"]`)
            Raf(28, 0, (offset) => {
                myBranch.attr('d', BranchsOfOrgD(start, offset, quadrant))
            }).then(() => myBranch.remove())
        })
    }

    shrinkBranch(index) {
        const that = this
        /**记录旧的数据 */
        const OLD_INFO = simpleDeepClone(this.currentData)
        const OLD_TRUNK_HEIGHT = OLD_INFO.height
        // 更新数据
        delete this.templateShadw.data[index].org
        delete this.templateShadw.data[index].pre
        this.updateCurrentData()
        // 主干的收缩
        this.#shrink_trunk(OLD_TRUNK_HEIGHT)
        // 平移
        this.#translation()
        /**象限 */
        const quadrant = Quadrant(0, index)
        /**整体高度 */
        const ADDUP = this.currentData.data[index].addup
        /**新的起点 */
        const start = {
            x: this.root.x + ADDUP / Tan(75),
            y: this.root.y + ([1, 2].includes(quadrant) ? -ADDUP : ADDUP) /** 1，2象限的y要在中线的基础上减，反之加 */
        }
        // 去除ball里的横杠
        $(`[mark="ball-ci_${index}"]`).off().remove()
        $(`[mark="ball_${index}"]`).css({
            fill: 'url(#ball)',
            filter: 'url(#ball-shadow)',
            strokeWidth: 0,
            strok: 'rgba(115,188,249,0.6)'
        }).off().on('click', function () {
            that.spreadBranch(index)
        })
        /**branch2的起点 */
        const b2Start = this.#shrink_branch_two(start, OLD_INFO, index)
        /**branch org的起点 */
        const orgStart = this.#shrink_branch_org(b2Start, OLD_INFO, index)
        this.#shrink_branch_pre(orgStart, OLD_INFO, index)
    }
}