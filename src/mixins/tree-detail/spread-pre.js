import ShrinkOrg from './shrink-org'
import { Quadrant } from '@utils/data-calcs'
import { simpleDeepClone } from '@utils/clone'
import $svg from '@utils/jquery'
import $ from 'jquery'
import { Raf } from '@/utils/raf'
import { Tan } from '@/utils/math'
import { BranchOneD, BranchTwoPoints, BranchOrgD, BranchOrgTrunkPoints, BranchsOfOrgD } from '@/utils/branch'

export default class SpreadPre extends ShrinkOrg {
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
            // trunk
            const trunkPosi = {
                x: start.x + (isLeft ? -45 : 45),
                y: start.y - 25
            }
            const trunkHeight = info.height - 15
            $(`[mark="trunk_${index}"]`).attr('points', BranchTwoPoints(trunkPosi, trunkHeight, true))
            // org
            if (!info.org) return
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
            // 如果要展开的是当前枝丫，需要特殊处理，不是简单平移
            if (index === current) return
            // pre
            if (!info.pre) return
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

    #spread_branch_two(start, index, OLD_DATA) {
        const OLD_HEIGHT = OLD_DATA.data[index].height - 15
        const NEW_HEIGHT = this.currentData.data[index].height - 15
        const isLeft = Boolean(index % 2 === 0)
        const trunk = $(`[mark="trunk_${index}"]`)
        let preFlag = true
        let { x, y } = start
        x = x + (isLeft ? -45 : 45)
        y -= 25
        Raf(OLD_HEIGHT, NEW_HEIGHT, (offset) => {
            trunk.attr('points', BranchTwoPoints({ x, y }, offset, true))
            if (offset >= OLD_HEIGHT + 26 && preFlag) {
                preFlag = false
                this.#spread_pre({ x, y }, index)
            }
        })
    }

    #spread_pre(start, index) {
        const isLeft = Boolean(index % 2 === 0)
        const quadrant = Quadrant(0, index)
        const myBranchOrgTrunkHeight = this.currentData.data[index].org.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */ + 15 /**org与pre主枝间隔 */
        const distence = myBranchOrgTrunkHeight + 26
        /**branch-pre起点 */
        const preStart = {
            y: start.y + distence,
            x: start.x - distence / Tan(75)
        }
        /**完全体数据pre列表 */
        const complatePre = this.template.data[index].pre
        const offsetForText = 6 * (complatePre.length.toString().length)
        const ballPosi = {
            x: preStart.x + (isLeft ? -71 : 65 - offsetForText),
            y: preStart.y + 9
        }
        // 修改ball里的内容
        $(`[mark="pre_ball_${index}"]`).css(ballPosi)
        $(`[mark="pre_ball_${index}_text"]`).attr({
            x: ballPosi.x + 3.5,
            y: ballPosi.y + 9.5
        })
        $(`[mark="pre_${index}_branch"`).attr('d', BranchOrgD(preStart, 65, quadrant))
        /**pre-trunk起点 */
        const preTrunkStart = {
            y: preStart.y + 16,
            x: preStart.x + (isLeft ? -36 : 36)
        }
        /**org列表 */
        const myPre = this.currentData.data[index].pre
        /**branch-org-trunk高度 */
        const TrunkHeight = myPre.length * 32 /**每个组织和人员占位 */ + 12/** 超出 */
        /**生长 branch_org 的trunk，然后出现 name (即：“组织”) */
        const trunk = $(`[mark="pre_${index}_trunk"]`)
        Raf(0, TrunkHeight, (offset) => {
            trunk.attr('points', BranchOrgTrunkPoints(preTrunkStart, offset, true))
        })
        $(`[mark="pre_${index}"]`).attr({ 
            x: preStart.x + (isLeft ? -75 : 75), 
            y: preStart.y + 20
         })
        // 生长 branch_pre 下的附枝
        myPre?.forEach((text, preIndex) => {
            const myBranch = $svg('path')
                .attr('mark', `pre_${index}_${preIndex}_branch`)
                .css({
                    fill: '#254373'
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

    spreadPre(index) {
        this.templateShadw.data[index].pre = simpleDeepClone(this.template.data[index].pre)
        const OLD_DATA = simpleDeepClone(this.currentData)
        const data = this.updateCurrentData()
        $(`[mark="pre_ball_${index}"]`).off().on('click', () => {
            this.shrinkPre(index)
        })
        $(`[mark="pre_ball_${index}_text"]`).off().on('click', () => {
            this.shrinkPre(index)
        })
        const { x, y } = this.root
        const trunk = $('[mark="trunk"]')
        Raf(OLD_DATA.height, data.height, (offset) => {
            trunk.attr('points', /**左 中 右 回到左 */`${x - 5} ${y},  ${x + offset / Tan(75)} ${y - offset}, ${x + 5} ${y}, ${x} ${y}`)
        })
        const start = { 
            x: this.root.x + data.data[index].addup / Tan(75),
            y: this.root.y - data.data[index].addup 
        }
        this.#spread_branch_two(start, index, OLD_DATA)
        this.#translation(index)
    }
}