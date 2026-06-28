# 任务清单

## 0. 前置文档与数据

- [x] 阅读 `ObsidianVault/02-方案设计/UI设计稿/deployment.html`，记录部署状态卡片、构造参数、演示账户、时间线和说明布局。
- [x] 阅读 `deployments/sepolia/EscrowMarketplace.json`，确认可展示字段：`network`、`chainId`、`address`、`transactionHash`、`deployer`、`deployedAt`、`constructorArgs`。
- [x] 阅读 `ObsidianVault/04-开发记录/部署记录.md`，核对合约地址、部署账户和交易哈希。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中记录开始实现 Deployment 页面骨架。

## 1. 页面结构

- [x] 在 `frontend/src/pages/Deployment.tsx` 新增部署演示页面。
- [x] 为部署信息、构造参数和演示账户定义 TypeScript 类型或接口。
- [x] 页面标题使用“Sepolia 部署与课堂演示”语义。
- [x] 展示部署状态卡片，至少包含网络、chainId、合约名称、合约地址、部署账户、交易哈希和部署时间。
- [x] 合约地址和交易哈希必须提供 Sepolia Etherscan 外链。
- [x] 展示构造参数表，至少包含仲裁员保证金、卖家保证金、举报押金、交付窗口、确认窗口、纠纷响应窗口、仲裁投票窗口。
- [x] 展示演示账户表，至少包含 Seller、Buyer、Arbiter 1、Arbiter 2、Arbiter 3、Owner 或等价角色。
- [x] 展示课堂演示步骤时间线，覆盖连接钱包、创建商品、购买托管、交付确认、退款/纠纷、仲裁裁决、提款。

## 2. 部署产物读取

- [x] 优先从 `deployments/sepolia/EscrowMarketplace.json` 导入公开部署信息，避免手写地址漂移。
- [x] 若前端工程不能直接跨目录导入部署产物，应在 `frontend/src/data/deployment.*` 中建立清晰的复制数据文件，并在注释中标明来源路径。
- [x] 页面不应展示或引用 `.env`、私钥、助记词或私密 RPC URL。
- [x] ABI 只展示摘要，例如函数数量或 artifact 来源，不在页面大段铺开完整 ABI。

## 3. 演示反馈

- [x] “复制地址”“打开 Etherscan”“开始演示”按钮必须有可见反馈。
- [x] 开始演示按钮可以模拟把顶部广播状态从 Idle 切到 Pending，再切到 Success。
- [x] 部署状态必须清晰区分已部署、未连接钱包、网络错误三类展示位置；本步可用 mock 状态。

## 4. GSAP 动画约束

- [x] 在实现动画前检查当前 Codex 环境是否提供 GSAP skill；若提供，必须先加载并遵守该 skill。
- [x] 前端依赖中加入 `gsap`，部署演示页面动画通过 GSAP 实现。
- [x] 部署状态卡、构造参数表和演示步骤时间线入场使用 GSAP 编排。
- [x] 复制地址、打开 Etherscan、开始演示等反馈使用 GSAP 做短促状态高亮。
- [x] 长地址和交易哈希动画不得改变文本截断策略或撑破卡片。
- [x] 动画尊重 `prefers-reduced-motion`，不得影响地址复制和外链点击。

## 5. 验证

- [x] 运行 `rtk npm run build`。
- [x] 手工检查地址、交易哈希、构造参数与 `deployments/sepolia/EscrowMarketplace.json` 或部署记录一致。
- [x] 手工点击 Etherscan 外链，确认 URL 指向 Sepolia。
- [x] 检查长地址和交易哈希在桌面与窄屏下不会撑破卡片。
- [x] 手工检查 GSAP 动画不会造成部署参数表闪烁、长哈希溢出或复制反馈延迟。
- [x] 运行 `rtk npx openspec validate add-frontend-deployment-page --strict`。

## 6. 本 change 明确不做

- [x] 不重新运行 `rtk npm run deploy:sepolia`。
- [x] 不做 Etherscan 源码验证。
- [x] 不接入真实钱包网络切换。
- [x] 不展示或提交任何敏感配置。
- [x] 不修改合约、测试、部署脚本或部署产物。
