# 核心担保托管合约规格

## ADDED Requirements

### Requirement: 纠纷发起与纠纷押金

系统 SHALL 允许买家或卖家在交易托管期间发起纠纷，并要求发起方支付固定纠纷押金和提交证据哈希。

#### Scenario: 买家发起纠纷

- **WHEN** 商品处于 `Locked` 或 `Delivered` 状态
- **AND** 调用者是该商品买家
- **AND** 调用者支付金额等于 `disputeDeposit`
- **AND** 调用者提交非空 `evidenceHash`
- **AND** 有效仲裁员数量不少于 `minActiveArbiters`
- **THEN** 系统记录买家为纠纷发起方
- **AND** 系统记录发起方诉求为支持买家退款
- **AND** 系统记录买家纠纷押金和证据哈希
- **AND** 商品状态变为 `DisputeDepositPending`
- **AND** 系统发出纠纷发起事件

#### Scenario: 卖家发起纠纷

- **WHEN** 商品处于 `Locked` 或 `Delivered` 状态
- **AND** 调用者是该商品卖家
- **AND** 调用者支付金额等于 `disputeDeposit`
- **AND** 调用者提交非空 `evidenceHash`
- **AND** 有效仲裁员数量不少于 `minActiveArbiters`
- **THEN** 系统记录卖家为纠纷发起方
- **AND** 系统记录发起方诉求为支持卖家放款
- **AND** 系统记录卖家纠纷押金和证据哈希
- **AND** 商品状态变为 `DisputeDepositPending`
- **AND** 系统发出纠纷发起事件

#### Scenario: 非当事人不能发起纠纷

- **WHEN** 调用者既不是商品买家也不是商品卖家
- **THEN** 系统拒绝发起纠纷

#### Scenario: 纠纷押金金额错误被拒绝

- **WHEN** 调用者发起纠纷
- **AND** 支付金额不等于 `disputeDeposit`
- **THEN** 系统拒绝发起纠纷

#### Scenario: 有效仲裁员数量不足时不能发起纠纷

- **WHEN** 有效仲裁员数量少于 `minActiveArbiters`
- **THEN** 系统拒绝发起纠纷

### Requirement: 纠纷响应与状态进入仲裁

系统 SHALL 要求另一方在押金补交期限内补交同额纠纷押金，双方押金到位后才进入仲裁投票状态。

#### Scenario: 响应方按时补交纠纷押金

- **WHEN** 商品处于 `DisputeDepositPending` 状态
- **AND** 调用者是未发起纠纷的一方
- **AND** 当前时间未超过 `disputeDepositStartedAt + disputeDepositWindow`
- **AND** 调用者支付金额等于 `disputeDeposit`
- **THEN** 系统记录响应方纠纷押金
- **AND** 商品状态变为 `Disputed`
- **AND** 系统记录 `disputeStartedAt`
- **AND** 系统发出纠纷响应事件

#### Scenario: 非响应方不能补交纠纷押金

- **WHEN** 商品处于 `DisputeDepositPending` 状态
- **AND** 调用者不是未发起纠纷的一方
- **THEN** 系统拒绝响应纠纷

#### Scenario: 押金补交超时后不能响应

- **WHEN** 当前时间已经超过 `disputeDepositStartedAt + disputeDepositWindow`
- **THEN** 系统拒绝响应纠纷

### Requirement: 证据哈希提交

系统 SHALL 允许买卖双方在纠纷期间提交各自证据哈希，用于固定链下证据。

#### Scenario: 买家提交证据哈希

- **WHEN** 商品处于 `DisputeDepositPending` 或 `Disputed` 状态
- **AND** 调用者是该商品买家
- **AND** `evidenceHash` 非空
- **THEN** 系统记录买家证据哈希
- **AND** 系统发出证据提交事件

#### Scenario: 卖家提交证据哈希

- **WHEN** 商品处于 `DisputeDepositPending` 或 `Disputed` 状态
- **AND** 调用者是该商品卖家
- **AND** `evidenceHash` 非空
- **THEN** 系统记录卖家证据哈希
- **AND** 系统发出证据提交事件

#### Scenario: 非当事人不能提交证据哈希

- **WHEN** 调用者既不是商品买家也不是商品卖家
- **THEN** 系统拒绝提交证据哈希

### Requirement: 仲裁员投票与 2/3 多数裁决

系统 SHALL 允许合格仲裁员对纠纷投票，并在任一方向达到 2/3 多数时自动执行裁决。

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

#### Scenario: 支持买家达到 2/3 多数后退款

- **WHEN** 支持买家的票数达到 2/3 多数
- **THEN** 系统把主交易资金记入买家的可提现余额
- **AND** 系统退回胜诉方纠纷押金
- **AND** 系统将败诉方纠纷押金平均记入投多数票仲裁员的可提现余额
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 支持卖家达到 2/3 多数后放款

- **WHEN** 支持卖家的票数达到 2/3 多数
- **THEN** 系统把主交易资金记入卖家的可提现余额
- **AND** 系统退回胜诉方纠纷押金
- **AND** 系统将败诉方纠纷押金平均记入投多数票仲裁员的可提现余额
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

### Requirement: 纠纷押金补交超时兜底

系统 SHALL 在响应方未按时补交纠纷押金时允许发起方自动胜诉，并避免发放评审奖励。

#### Scenario: 响应方未补交押金且超时

- **WHEN** 商品处于 `DisputeDepositPending` 状态
- **AND** 当前时间已经超过 `disputeDepositStartedAt + disputeDepositWindow`
- **AND** 响应方未补交纠纷押金
- **THEN** 系统按发起方诉求结算主交易资金
- **AND** 系统把发起方纠纷押金记入发起方可提现余额
- **AND** 系统不发放仲裁员奖励
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 押金补交期限未到不能执行超时兜底

- **WHEN** 商品处于 `DisputeDepositPending` 状态
- **AND** 当前时间未超过 `disputeDepositStartedAt + disputeDepositWindow`
- **THEN** 系统拒绝执行押金补交超时兜底

### Requirement: 仲裁投票超时兜底

系统 SHALL 在双方已交押金但仲裁超时未达多数票时按卖家是否交付结算主交易资金，并退回双方纠纷押金。

#### Scenario: 仲裁超时且卖家未交付

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间已经超过 `disputeStartedAt + disputeWindow`
- **AND** 投票未达成 2/3 多数
- **AND** 卖家未声明交付
- **THEN** 系统把主交易资金记入买家的可提现余额
- **AND** 系统把双方纠纷押金分别记入各自可提现余额
- **AND** 系统不发放仲裁员奖励
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 仲裁超时且卖家已交付

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间已经超过 `disputeStartedAt + disputeWindow`
- **AND** 投票未达成 2/3 多数
- **AND** 卖家已声明交付
- **THEN** 系统把主交易资金记入卖家的可提现余额
- **AND** 系统把双方纠纷押金分别记入各自可提现余额
- **AND** 系统不发放仲裁员奖励
- **AND** 商品状态变为 `Inactive`
- **AND** 系统发出纠纷解决事件

#### Scenario: 仲裁期限未到不能执行超时兜底

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间未超过 `disputeStartedAt + disputeWindow`
- **THEN** 系统拒绝执行仲裁投票超时兜底

### Requirement: 纠纷配置有效性

系统 SHALL 在部署时拒绝无效的纠纷押金和纠纷时间窗口配置。

#### Scenario: 纠纷押金为零

- **WHEN** 部署合约时 `disputeDeposit` 为 `0`
- **THEN** 系统拒绝部署

#### Scenario: 纠纷押金补交窗口为零

- **WHEN** 部署合约时 `disputeDepositWindow` 为 `0`
- **THEN** 系统拒绝部署

#### Scenario: 仲裁投票窗口为零

- **WHEN** 部署合约时 `disputeWindow` 为 `0`
- **THEN** 系统拒绝部署
