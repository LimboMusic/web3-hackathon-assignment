# Tasks

## 1. Demo 账号与角色推导

- [x] 新增或重构 `frontend/src/data/demoAccounts.ts`：
  - 定义 `seller`、`buyer`、`arbiter1`、`arbiter2`、`arbiter3`、`viewer` 六个 Demo 账号。
  - 每个账号包含 `id`、`label`、`roleLabel`、`address`、`shortAddress`、`description`。
  - 地址必须是稳定 mock 地址，不使用真实私钥、助记词或真实钱包敏感信息。
- [x] 新增或重构 `frontend/src/types/roles.ts`：
  - 定义 `DemoAccount`、`TradeRole`、`RoleAvailability` 等类型。
  - `TradeRole` 至少包含 `guest`、`seller`、`buyer`、`arbitrator`、`viewer`。
- [x] 新增 `frontend/src/utils/deriveTradeRole.ts`：
  - 实现 `deriveTradeRole(account, trade, arbiters)` 或等价函数。
  - 地址比较必须复用或扩展 `frontend/src/utils/walletMatch.ts`，只允许完整地址或标准短地址精确匹配。
  - 买卖双方不能被推导为本单仲裁员。
  - 商品尚未被购买时，非卖家已连接账号应能看到买家购买入口。

## 2. 钱包上下文与演示控制台

- [x] 修改 `frontend/src/context/DemoUIContext.tsx` 和 `frontend/src/context/useDemoUI.ts`：
  - 用当前 Demo 账号替代固定 `DEMO_BUYER_*` 钱包。
  - 暴露 `currentAccount`、`setDemoAccount(accountId)`、`walletAddress`、`walletAddressFull`。
  - 保留 pending / success / failed toast 与现有动画反馈。
  - 未连接状态仍要可表达，连接后默认切到买家或上次选择的 Demo 账号。
- [x] 新增组件 `frontend/src/components/DemoControlPanel.tsx` 或放在现有布局合适位置：
  - 账号切换：卖家、买家、仲裁员 A/B/C、访客。
  - 场景切换：重置、商品已创建、买家已付款、卖家已交付、买家申请退款、纠纷待押金、仲裁投票中。
  - 控制台文案必须明确是“课堂演示控制台”，不能伪装成链上业务按钮。
- [x] 修改 `frontend/src/components/layout/TopStatusBar.tsx`：
  - 显示当前 Demo 账号、短地址、推导角色或只读状态。
  - 保持网络与交易状态展示，不造成顶部栏换行重叠。

## 3. Marketplace 页面角色化

- [x] 修改 `frontend/src/pages/Marketplace.tsx`：
  - 创建商品时 seller 使用当前 Demo 账号。
  - 自购拦截按当前 Demo 账号判断，不再假设固定买家地址。
  - 访客/未连接时创建和购买动作给出清晰禁用原因。
- [x] 修改 `frontend/src/components/CreateItemForm.tsx` 和 `frontend/src/components/MarketplaceItemCard.tsx`：
  - 展示当前账号作为卖家时的上下文。
  - 按当前角色和商品状态展示购买按钮、禁用状态和原因。

## 4. Trade Detail 页面角色化

- [x] 修改 `frontend/src/pages/TradeDetail.tsx`：
  - 移除固定 `BUYER` 常量，购买后 buyer 应写入当前 Demo 账号。
  - 用 `deriveTradeRole` 推导当前角色。
  - 主操作面板只渲染当前角色可操作动作：
    - 卖家：`markDelivered()`、`approveRefund()`、`releaseAfterTimeout()`、必要的纠纷响应动作。
    - 买家：`purchaseItem()`、`confirmReceived()`、`requestRefund()`、`openDispute()`。
    - 仲裁员：跳转或嵌入仲裁投票入口，说明当前交易进入 `Disputed` 后才可投票。
    - 访客/无关账号：只读状态和事件日志。
  - 其他角色操作折叠为只读说明或禁用原因，不再平铺所有灰色按钮。
  - 保留资金流向、状态时间线、事件日志、证据哈希输入和 GSAP 反馈。
- [x] 若需要共享交易状态，新增 `frontend/src/context/DemoTradeContext.tsx` 或等价轻量状态容器：
  - 支持演示控制台切换交易状态。
  - 避免 Marketplace、Trade Detail、Arbitration 三页状态互相矛盾。

## 5. Arbitration 页面角色化

- [x] 修改 `frontend/src/pages/Arbitration.tsx`：
  - 移除或降级“选择仲裁员席位”作为主业务身份的交互。
  - 当前 Demo 账号为仲裁员 A/B/C 时，自动定位该仲裁员席位。
  - 当前账号未质押时，只显示质押入口和不能投票原因。
  - 当前账号已经投票、裁决完成、不是仲裁员、或是买卖双方时，显示准确禁用原因。
  - 3 个仲裁员演示 2/3 多数：两个同向投票后 finalized，第三个账号继续访问时应看到裁决已完成不能投票。
- [x] 修改 `frontend/src/data/mockArbitration.ts`：
  - 仲裁员地址与 `demoAccounts.ts` 保持一致。
  - 保留至少一个未质押或可切换质押状态，用于演示质押门槛。

## 6. 样式、可访问性与动画

- [x] 修改 `frontend/src/styles/layout.css`：
  - 为 Demo 控制台、角色徽章、当前角色操作面板、折叠禁用说明补充样式。
  - 移动端和 880px 窄屏下不得出现文字重叠、按钮溢出或卡片嵌套卡片。
  - 不新增大面积营销 hero，不把课堂控制台做成主业务卡片。
- [x] GSAP 动画继续遵守现有 reduced-motion 逻辑：
  - 账号切换、场景切换、状态节点高亮可使用短反馈动画。
  - 动画不能遮挡交易状态、资金流、事件日志或主要按钮。

## 7. 验证

- [x] 运行 `rtk npm --prefix frontend run build`。
- [x] 运行 `rtk npm --prefix frontend run lint`。
- [x] 运行 `rtk npx openspec validate improve-frontend-role-demo --strict`。
- [x] 运行 `rtk npx openspec validate frontend-demo --strict`。
- [x] 人工检查以下课堂剧本：
  - 卖家账号创建商品后不能购买自己的商品。
  - 买家账号购买后进入 `Locked`，页面切成买家视角。
  - 卖家账号只能执行卖家交付/同意退款/超时放款相关动作。
  - 买家账号申请退款后，卖家超时放款不可用且原因清楚。
  - 纠纷投票中，仲裁员 A/B 投同一方向后达到 2/3，仲裁员 C 不能继续投票。
  - 访客账号只能查看状态、资金流和事件日志。

## Out of Scope

- [x] 不修改 `contracts/EscrowMarketplace.sol`。
- [x] 不修改 `scripts/deploy.js` 或 `deployments/sepolia/EscrowMarketplace.json`。
- [x] 不接入真实 MetaMask / Ethers.js 写交易。
- [x] 不提交 `.env`、私钥、助记词或私密 RPC URL。
