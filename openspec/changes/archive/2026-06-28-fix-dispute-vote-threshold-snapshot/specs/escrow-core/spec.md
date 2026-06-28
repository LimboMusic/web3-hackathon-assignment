## MODIFIED Requirements

### Requirement: 仲裁员投票与 2/3 多数裁决

系统 SHALL 允许合格仲裁员对纠纷投票，并在任一方向达到 2/3 多数时自动执行裁决。投票门槛 SHALL 在纠纷正式进入 `Disputed` 状态时快照，后续不得因仲裁员退出而降低。

#### Scenario: 合格仲裁员投票支持买家

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 调用者是该商品的合格仲裁员
- **AND** 调用者此前未对该商品投票
- **THEN** 系统记录该仲裁员支持买家
- **AND** 支持买家的票数增加
- **AND** 系统发出仲裁员投票事件

#### Scenario: 合格仲裁员投票支持卖家

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 调用者是该商品的合格仲裁员
- **AND** 调用者此前未对该商品投票
- **THEN** 系统记录该仲裁员支持卖家
- **AND** 支持卖家的票数增加
- **AND** 系统发出仲裁员投票事件

#### Scenario: 仲裁员不能重复投票

- **WHEN** 仲裁员已经对该商品投过票
- **THEN** 系统拒绝该仲裁员再次投票

#### Scenario: 进入 Disputed 时快照投票门槛

- **WHEN** 响应方在期限内补交纠纷押金
- **AND** 当前 `activeArbiterCount >= minActiveArbiters`
- **THEN** 系统记录 `arbiterCountSnapshot` 为当时的 `activeArbiterCount`
- **AND** 系统记录 `voteThresholdSnapshot` 为 `(arbiterCountSnapshot * 2 + 2) / 3`
- **AND** 商品状态变为 `Disputed`

#### Scenario: 响应纠纷时仲裁员不足被拒绝

- **WHEN** 商品处于 `DisputeDepositPending` 状态
- **AND** 当前 `activeArbiterCount < minActiveArbiters`
- **THEN** 系统拒绝响应方补交押金并进入 `Disputed`

#### Scenario: 支持买家达到 2/3 多数后退款

- **WHEN** 支持买家的票数达到该纠纷的 `voteThresholdSnapshot`
- **THEN** 系统把主交易资金记入买家的可提现余额
- **AND** 系统退回胜诉方纠纷押金
- **AND** 系统将败诉方纠纷押金平均记入投多数票仲裁员的可提现余额
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 支持卖家达到 2/3 多数后放款

- **WHEN** 支持卖家的票数达到该纠纷的 `voteThresholdSnapshot`
- **THEN** 系统把主交易资金记入卖家的可提现余额
- **AND** 系统退回胜诉方纠纷押金
- **AND** 系统将败诉方纠纷押金平均记入投多数票仲裁员的可提现余额
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 仲裁员退出不得降低已快照的投票门槛

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 该纠纷已记录 `voteThresholdSnapshot`
- **AND** 未投票仲裁员退出导致实时 `activeArbiterCount` 下降
- **AND** 当前任一方向的票数仍低于 `voteThresholdSnapshot`
- **THEN** 系统不得因实时 `activeArbiterCount` 下降而提前执行裁决

### Requirement: 仲裁投票超时兜底

系统 SHALL 在双方已交押金但仲裁超时未达多数票时按卖家是否交付结算主交易资金，并退回双方纠纷押金。是否达成多数 SHALL 以该纠纷的 `voteThresholdSnapshot` 为准。

#### Scenario: 仲裁超时且卖家未交付

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间已经超过 `disputeStartedAt + disputeWindow`
- **AND** 支持买家与支持卖家的票数均未达到 `voteThresholdSnapshot`
- **AND** 卖家未声明交付
- **THEN** 系统把主交易资金记入买家的可提现余额
- **AND** 系统把双方纠纷押金分别记入各自可提现余额
- **AND** 系统不发放仲裁员奖励
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 仲裁超时且卖家已交付

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间已经超过 `disputeStartedAt + disputeWindow`
- **AND** 支持买家与支持卖家的票数均未达到 `voteThresholdSnapshot`
- **AND** 卖家已声明交付
- **THEN** 系统把主交易资金记入卖家的可提现余额
- **AND** 系统把双方纠纷押金分别记入各自可提现余额
- **AND** 系统不发放仲裁员奖励
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件
