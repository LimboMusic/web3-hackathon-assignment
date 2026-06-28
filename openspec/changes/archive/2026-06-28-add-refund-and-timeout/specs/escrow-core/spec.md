# 核心担保托管合约规格

## MODIFIED Requirements

### Requirement: 买家付款托管

系统 SHALL 在买家付款成功时记录付款时间，以支持后续交付超时和退款逻辑。

#### Scenario: 付款成功后记录付款时间

- **WHEN** 买家成功购买商品
- **THEN** 系统记录 `paidAt`
- **AND** 商品状态变为 `Locked`
- **AND** 主交易资金留存在合约中

### Requirement: 卖家标记交付

系统 SHALL 将卖家标记交付的时间作为买家确认收货倒计时的起点。

#### Scenario: 卖家交付后开始确认倒计时

- **WHEN** 卖家在 `Locked` 状态成功调用 `markDelivered`
- **THEN** 商品状态变为 `Delivered`
- **AND** 系统记录 `deliveredAt`
- **AND** `confirmWindow` 从 `deliveredAt` 起算

## ADDED Requirements

### Requirement: 买家可发起退款申请

系统 SHALL 允许买家在交易已付款后发起退款申请，但退款完成仍需卖家确认。

#### Scenario: 买家在托管中发起退款

- **WHEN** 商品处于 `Locked` 状态
- **AND** 调用者是商品买家
- **THEN** 系统记录该商品已发起退款申请
- **AND** 系统发出退款申请事件

#### Scenario: 买家在已交付后发起退款

- **WHEN** 商品处于 `Delivered` 状态
- **AND** 调用者是商品买家
- **THEN** 系统记录该商品已发起退款申请
- **AND** 系统发出退款申请事件

#### Scenario: 非买家不能发起退款

- **WHEN** 调用者不是商品买家
- **THEN** 系统拒绝发起退款

#### Scenario: 已有退款申请时不能重复发起

- **WHEN** 商品已经存在待处理退款申请
- **THEN** 系统拒绝重复发起退款

### Requirement: 卖家确认退款后退回买家

系统 SHALL 允许卖家确认退款，并通过 pull payment 把托管资金释放给买家。

#### Scenario: 卖家同意退款

- **WHEN** 商品存在待处理退款申请
- **AND** 调用者是商品卖家
- **THEN** 商品状态变为 `Inactive`
- **AND** 商品资金记入买家的可提现余额
- **AND** 系统清除待处理退款标记
- **AND** 系统发出退款完成事件

#### Scenario: 未发起退款不能直接退款

- **WHEN** 商品不存在待处理退款申请
- **THEN** 系统拒绝执行退款

### Requirement: 卖家交付后可超时放款

系统 SHALL 允许卖家在已交付且买家确认超时后发起放款，但必须以已交付为前提。

#### Scenario: 卖家在确认超时后放款

- **WHEN** 商品处于 `Delivered` 状态
- **AND** 调用者是商品卖家
- **AND** 当前时间已超过 `deliveredAt + confirmWindow`
- **AND** 商品不存在待处理退款申请
- **THEN** 商品状态变为 `Inactive`
- **AND** 商品资金记入卖家的可提现余额
- **AND** 系统发出超时放款事件

#### Scenario: 未交付不能超时放款

- **WHEN** 商品尚未进入 `Delivered` 状态
- **THEN** 系统拒绝超时放款

#### Scenario: 存在退款申请时不能超时放款

- **WHEN** 商品存在待处理退款申请
- **THEN** 系统拒绝超时放款

### Requirement: 交付计时与确认计时串行

系统 SHALL 让 `deliveryWindow` 与 `confirmWindow` 串行运行，而不是并行运行。

#### Scenario: 确认计时以交付时间为起点

- **WHEN** 买家已付款但卖家尚未标记交付
- **THEN** 系统不得依据 `confirmWindow` 触发超时放款

#### Scenario: 卖家不交付时买家可走退款路径

- **WHEN** 买家付款后卖家长期未交付
- **THEN** 买家仍可发起退款申请
- **AND** 后续由卖家确认退款完成结算
