# 核心担保托管合约规格

## ADDED Requirements

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

系统 SHALL 允许买家按商品价格付款，并将资金锁定在合约中。

#### Scenario: 买家成功付款

- **WHEN** 商品处于 `Created` 状态
- **AND** 调用者不是商品卖家
- **AND** `msg.value` 等于商品价格
- **THEN** 系统记录买家地址
- **AND** 商品状态变为 `Locked`
- **AND** 主交易资金留存在合约中
- **AND** 系统发出付款托管事件

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

系统 SHALL 允许卖家在买家付款后标记商品已交付。

#### Scenario: 卖家成功标记交付

- **WHEN** 商品处于 `Locked` 状态
- **AND** 调用者是商品卖家
- **THEN** 商品状态变为 `Delivered`
- **AND** 系统记录交付时间
- **AND** 系统发出交付事件

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
