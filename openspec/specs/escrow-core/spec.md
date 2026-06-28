# 核心担保托管合约规格

## Purpose

定义去中心化二手交易担保托管平台的核心合约行为，覆盖商品托管、交付确认、退款协商、超时放款、纠纷发起与响应、仲裁投票与仲裁员资格机制。

## Requirements

### Requirement: 商品创建

系统 SHALL 允许卖家创建一个待交易商品，并为每个商品分配唯一递增的 `itemId`。

#### Scenario: 卖家成功创建商品

- **WHEN** 卖家提交有效价格和元数据哈希创建商品
- **THEN** 系统记录卖家地址、价格、元数据哈希和初始状态
- **AND** 商品状态为 `Created`
- **AND** 系统发出商品创建事件

#### Scenario: 无效商品输入被拒绝

- **WHEN** 卖家使用 `0` 价格或空元数据哈希创建商品
- **THEN** 系统拒绝创建商品

### Requirement: 未付款前商品可维护

系统 SHALL 允许卖家在商品进入托管前修改价格、更新元数据哈希或下架商品。

#### Scenario: 卖家在付款前修改商品

- **WHEN** 商品处于 `Created` 状态
- **AND** 调用者是商品卖家
- **THEN** 卖家可以修改价格或元数据哈希
- **AND** 系统发出对应更新事件

#### Scenario: 进入托管后核心信息冻结

- **WHEN** 商品状态不再是 `Created`
- **THEN** 系统拒绝修改价格、元数据哈希或下架商品

#### Scenario: 非卖家不能维护商品

- **WHEN** 调用者不是商品卖家
- **THEN** 系统拒绝其修改价格、更新元数据哈希或下架商品

### Requirement: 买家付款托管

系统 SHALL 允许买家按商品价格付款，并将资金锁定在合约中；付款成功时 SHALL 记录付款时间，以支持后续交付超时和退款逻辑。

#### Scenario: 买家成功付款

- **WHEN** 商品处于 `Created` 状态
- **AND** 调用者不是商品卖家
- **AND** `msg.value` 等于商品价格
- **THEN** 系统记录买家地址
- **AND** 商品状态变为 `Locked`
- **AND** 主交易资金留存在合约中
- **AND** 系统发出付款托管事件

#### Scenario: 付款成功后记录付款时间

- **WHEN** 买家成功购买商品
- **THEN** 系统记录 `paidAt`
- **AND** 商品状态变为 `Locked`
- **AND** 主交易资金留存在合约中

#### Scenario: 付款金额错误

- **WHEN** 买家付款金额不等于商品价格
- **THEN** 系统拒绝付款

#### Scenario: 卖家自购被拒绝

- **WHEN** 商品卖家尝试购买自己的商品
- **THEN** 系统拒绝付款

#### Scenario: 不可购买商品被拒绝

- **WHEN** 商品已下架、已被购买或已结束
- **THEN** 系统拒绝新的付款

### Requirement: 卖家标记交付

系统 SHALL 允许卖家在买家付款后标记商品已交付，并将卖家标记交付的时间作为买家确认收货倒计时的起点。

#### Scenario: 卖家成功标记交付

- **WHEN** 商品处于 `Locked` 状态
- **AND** 调用者是商品卖家
- **THEN** 商品状态变为 `Delivered`
- **AND** 系统记录交付时间
- **AND** 系统发出交付事件

#### Scenario: 卖家交付后开始确认倒计时

- **WHEN** 卖家在 `Locked` 状态成功调用 `markDelivered`
- **THEN** 商品状态变为 `Delivered`
- **AND** 系统记录 `deliveredAt`
- **AND** `confirmWindow` 从 `deliveredAt` 起算

#### Scenario: 非卖家不能标记交付

- **WHEN** 调用者不是商品卖家
- **THEN** 系统拒绝标记交付

#### Scenario: 非托管状态不能标记交付

- **WHEN** 商品不处于 `Locked` 状态
- **THEN** 系统拒绝标记交付

### Requirement: 买家确认收货

系统 SHALL 允许买家在卖家标记交付后确认收货，并结束主交易。

#### Scenario: 买家成功确认收货

- **WHEN** 商品处于 `Delivered` 状态
- **AND** 调用者是商品买家
- **THEN** 商品状态变为 `Inactive`
- **AND** 商品资金记入卖家的可提现余额
- **AND** 系统发出确认收货事件

#### Scenario: 非买家不能确认收货

- **WHEN** 调用者不是商品买家
- **THEN** 系统拒绝确认收货

#### Scenario: 未交付不能确认收货

- **WHEN** 商品尚未进入 `Delivered` 状态
- **THEN** 系统拒绝确认收货

#### Scenario: 已结束交易不能重复确认

- **WHEN** 商品已处于 `Inactive` 状态
- **THEN** 系统拒绝重复确认收货

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

### Requirement: 交付计时与确认计时串行

系统 SHALL 让 `deliveryWindow` 与 `confirmWindow` 串行运行，而不是并行运行。

#### Scenario: 确认计时以交付时间为起点

- **WHEN** 买家已付款但卖家尚未标记交付
- **THEN** 系统不得依据 `confirmWindow` 触发超时放款

#### Scenario: 卖家不交付时买家可走退款路径

- **WHEN** 买家付款后卖家长期未交付
- **THEN** 买家仍可发起退款申请
- **AND** 后续由卖家确认退款完成结算

### Requirement: 卖家 pull 提款

系统 SHALL 使用 pull payment 释放卖家资金，避免在确认收货函数中直接向卖家转账。

#### Scenario: 卖家成功提款

- **WHEN** 卖家存在可提现余额
- **THEN** 系统先将该卖家的可提现余额清零
- **AND** 再向卖家地址转账
- **AND** 系统发出提款事件

#### Scenario: 无余额提款被拒绝

- **WHEN** 卖家没有可提现余额
- **THEN** 系统拒绝提款

### Requirement: 仲裁员保证金质押

系统 SHALL 允许地址按固定保证金金额质押成为有效仲裁员，并维护有效仲裁员数量。

#### Scenario: 地址成功质押成为仲裁员

- **WHEN** 地址调用仲裁员质押函数
- **AND** 支付金额等于 `arbiterStakeAmount`
- **AND** 该地址当前不是有效仲裁员
- **THEN** 系统记录该地址的仲裁员保证金
- **AND** 标记该地址为有效仲裁员
- **AND** `activeArbiterCount` 增加
- **AND** 系统发出仲裁员质押事件

#### Scenario: 质押金额错误被拒绝

- **WHEN** 地址调用仲裁员质押函数
- **AND** 支付金额不等于 `arbiterStakeAmount`
- **THEN** 系统拒绝质押

#### Scenario: 有效仲裁员不能重复质押

- **WHEN** 地址已经是有效仲裁员
- **THEN** 系统拒绝该地址重复质押

### Requirement: 仲裁员退出与保证金退回

系统 SHALL 允许未被未结束纠纷锁定的有效仲裁员退出，并在先更新状态后退回保证金。

#### Scenario: 仲裁员成功退出

- **WHEN** 调用者是有效仲裁员
- **AND** 该仲裁员没有被未结束纠纷锁定
- **THEN** 系统先清除该地址的有效仲裁员状态
- **AND** 系统清零该地址的保证金记录
- **AND** `activeArbiterCount` 减少
- **AND** 系统再向该地址退回保证金
- **AND** 系统发出仲裁员退出事件

#### Scenario: 未质押地址不能退出

- **WHEN** 调用者不是有效仲裁员
- **THEN** 系统拒绝退出

#### Scenario: 被纠纷锁定的仲裁员不能退出

- **WHEN** 调用者是有效仲裁员
- **AND** 该仲裁员仍被一个或多个未结束纠纷锁定
- **THEN** 系统拒绝退出

### Requirement: 仲裁员当事人回避

系统 SHALL 提供按商品判断仲裁员资格的能力，并排除该商品的买卖双方。

#### Scenario: 有效第三方仲裁员具备资格

- **WHEN** 商品存在
- **AND** 待判断地址是有效仲裁员
- **AND** 待判断地址不是该商品卖家
- **AND** 待判断地址不是该商品买家
- **THEN** 系统判定该地址具备该商品的仲裁员资格

#### Scenario: 未质押地址不具备资格

- **WHEN** 待判断地址不是有效仲裁员
- **THEN** 系统判定该地址不具备该商品的仲裁员资格

#### Scenario: 卖家不能仲裁自己的商品

- **WHEN** 待判断地址是该商品卖家
- **THEN** 系统判定该地址不具备该商品的仲裁员资格

#### Scenario: 买家不能仲裁自己的交易

- **WHEN** 待判断地址是该商品买家
- **THEN** 系统判定该地址不具备该商品的仲裁员资格

### Requirement: 仲裁员配置有效性

系统 SHALL 在部署时拒绝无效的仲裁员保证金和最低有效仲裁员数量配置。

#### Scenario: 仲裁员保证金为零

- **WHEN** 部署合约时 `arbiterStakeAmount` 为 `0`
- **THEN** 系统拒绝部署

#### Scenario: 最低有效仲裁员数量为零

- **WHEN** 部署合约时 `minActiveArbiters` 为 `0`
- **THEN** 系统拒绝部署

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

#### Scenario: 仲裁期限未到不能执行超时兜底

- **WHEN** 商品处于 `Disputed` 状态
- **AND** 当前时间未超过 `disputeStartedAt + disputeWindow`
- **THEN** 系统拒绝执行仲裁投票超时兜底

### Requirement: 基础安全与事件

系统 SHALL 对核心外部函数实施权限、状态、金额和重入保护，并为前端和报告提供可追踪事件。

#### Scenario: 状态和权限检查先于状态变化

- **WHEN** 任意核心操作被调用
- **THEN** 系统先验证调用者角色、商品状态和输入金额
- **AND** 校验失败时不改变商品或余额状态

#### Scenario: 外部转账前完成状态更新

- **WHEN** 系统需要向卖家转账
- **THEN** 系统先更新内部余额状态
- **AND** 再执行外部转账

#### Scenario: 商品级关键动作可被事件追踪

- **WHEN** 商品创建、改价、更新元数据、下架、付款托管、标记交付或确认收货成功
- **THEN** 系统发出包含 `itemId` 和关键参与方的事件

#### Scenario: 账户级聚合提款事件

- **WHEN** 账户成功提取可提现余额
- **THEN** 系统发出 `Withdrawal(address indexed account, uint256 amount)` 事件
- **AND** 该事件记录提现账户和金额，不要求包含 `itemId`

#### Scenario: 商品资金入账与提款关联

- **WHEN** 需要追踪某笔商品资金何时实际转出链上
- **THEN** 应通过 `ItemReceived(itemId, buyer)` 等商品级资金入账事件与后续 `Withdrawal(account, amount)` 组合分析
- **AND** 因为 pull payment 允许一次提款包含多个商品的可提现余额，不在 `Withdrawal` 中强行绑定单一 `itemId`
