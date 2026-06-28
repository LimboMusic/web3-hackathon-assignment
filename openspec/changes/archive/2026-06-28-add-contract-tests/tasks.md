# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 7 步测试目标、范围和验收重点。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤准备记录。

## 1. 测试结构整理：`test/EscrowMarketplace.test.js`

- [x] 阅读现有测试 helper、部署参数、角色命名和时间推进工具，保留已有可读结构。
- [x] 将新增测试按以下主题组织，避免把所有断言堆进单个 describe：
  - `demo flows`
  - `fund accounting`
  - `permission and state guards`
  - `arbitration edge cases`
  - `reporting edge cases`
- [x] 复用已有 `deploy` / `createItem` / `purchase` / `stakeArbiters` 等 helper；若 helper 不足，新增小而清晰的辅助函数。
- [x] 不删除已有测试，除非发现重复测试名称或明显等价断言；如需合并，保持覆盖语义不减少。

## 2. 四条演示路径测试：`test/EscrowMarketplace.test.js`

- [x] 正常交易完整路径：
  - `createItem` 支付 `sellerStakeAmount`；
  - `purchaseItem` 支付准确商品价格；
  - `markDelivered` 记录交付；
  - `confirmReceived` 结束交易；
  - `pendingWithdrawals[seller]` 包含商品价格和卖家保证金；
  - `withdraw` 后余额清零。
- [x] 协商退款完整路径：
  - 买家付款后 `requestRefund`；
  - 卖家 `approveRefund`；
  - 主交易资金进入买家可提现余额；
  - 卖家保证金退回卖家；
  - 状态为 `Inactive`，不能再次退款或确认收货。
- [x] 恶意退款仲裁路径：
  - 买家或卖家 `openDispute` 并提交非空 `evidenceHash`；
  - 响应方 `respondDispute` 补交纠纷押金；
  - 质押仲裁员 `voteDispute` 达到快照 2/3 门槛；
  - 支持买家时退款并罚没卖家保证金；
  - 支持卖家时放款并退回卖家保证金；
  - 败诉方纠纷押金奖励给多数票仲裁员。
- [x] 超时兜底路径：
  - 卖家未在 `deliveryWindow` 内交付时不能 `markDelivered`；
  - 已交付且买家未确认时卖家可 `releaseAfterTimeout`；
  - 纠纷押金未响应时 `resolveDisputeDepositTimeout` 按发起方诉求结算；
  - 仲裁投票超时未达多数时 `resolveDisputeTimeout` 按是否交付结算。

## 3. 资金安全与重复操作断言

- [x] 为以下资金池或余额增加可读断言：
  - 合约实际余额；
  - `pendingWithdrawals[buyer]`；
  - `pendingWithdrawals[seller]`；
  - `pendingWithdrawals[owner]`；
  - 多数票仲裁员奖励余额。
- [x] 覆盖重复操作：
  - 重复购买同一商品应失败；
  - 重复确认收货应失败；
  - 重复发起退款应失败；
  - 已结束纠纷不能重复裁决；
  - 已提款账户不能重复提款；
  - 卖家保证金不能重复退还或罚没。
- [x] 对所有结算路径检查状态最终为 `Inactive`，且后续不能再进入资金结算函数。

## 4. 权限、状态和输入边界

- [x] 非卖家不能维护商品、标记交付、同意退款或超时放款。
- [x] 非买家不能确认收货、申请退款或冒充买家提交证据。
- [x] 非当事人不能发起纠纷、响应纠纷或提交证据。
- [x] 未质押地址、交易买家、交易卖家不能作为该商品仲裁员投票。
- [x] 仲裁员不能重复投票，且投票门槛使用 `voteThresholdSnapshot`，不被后续退出降低。
- [x] `bytes32(0)` 元数据哈希、证据哈希、错误商品价格、错误保证金、错误纠纷押金、错误举报押金均应 revert。
- [x] 非 owner 不能 `resolveReport`，owner 不能重复复核已处理举报。

## 5. Harness 与覆盖率配置

- [x] 如需要特殊内部状态，维护 `test/contracts/EscrowMarketplaceHarness.sol`，并确认它仍只通过 `hardhat.config.js` 测试编译配置纳入，不放入 `contracts/` 正式部署目录。
- [x] 本 change 未引入 solidity-coverage 插件；采用「路径覆盖 + 边界回归」作为覆盖口径。
- [x] 覆盖率配置不得影响现有 `npm run compile`、`npm test` 和 Sepolia 部署配置。

## 6. 文档与验证

- [x] 运行 `rtk npx hardhat compile`。
- [x] 运行 `rtk npx hardhat test`。
- [x] 未配置覆盖率工具，不运行 `npm run coverage`；覆盖口径见第 5 节。
- [x] 运行 `rtk npx openspec validate add-contract-tests --strict`。
- [x] 将测试结果追加到 `ObsidianVault/04-开发记录/开发记录.md`。
- [x] 如测试用例名称可直接支撑报告或 PPT，在开发记录中记录关键测试分组和通过数量。

## 7. 本 change 明确不做

- [x] 不新增或修改合约业务规则。
- [x] 不创建 React/Vite 前端。
- [x] 不部署 Sepolia，不写真实 `.env`。
- [x] 不实现形式化验证、模糊测试或 100% 覆盖率目标。
- [x] 不归档其他 active change，不处理无关工作区修改。
