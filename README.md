# Web3 Hackathon Assignment

去中心化二手交易担保托管平台。项目场景是校园二手交易，核心目标是用智能合约托管买家资金，避免卖家提前收款、买家单方面退款，并通过多签仲裁和仲裁员保证金处理纠纷。

## 项目方向

本项目不是完整复刻闲鱼或转转，而是实现一个可课堂演示的链上担保支付 Demo。

核心流程：

1. 卖家创建商品。
2. 买家通过 MetaMask 付款，资金进入智能合约托管。
3. 卖家线下交付商品。
4. 买家确认收货后，合约放款给卖家。
5. 买家可以申请退款，但不能单方面退款。
6. 卖家同意退款时，合约退还买家资金。
7. 出现纠纷时，由已质押保证金的仲裁员投票裁决。

## 技术栈

- Solidity 智能合约
- Hardhat / Remix IDE
- React / Vite 前端
- Ethers.js
- MetaMask
- Sepolia 测试网
- Obsidian 文档库
- OpenSpec 变更规格

## 目录结构

```text
ObsidianVault/   # 项目讨论、设计、报告、PPT 和开发记录
openspec/        # OpenSpec 项目说明、规格和变更
contracts/       # Solidity 合约
scripts/         # 部署脚本
test/            # Hardhat 测试
frontend/        # React/Vite 前端
```

当前仓库优先维护 `ObsidianVault/` 和 `openspec/`，后续再逐步加入合约、测试和前端代码。

## 开发流程

后续所有重要工作必须按以下顺序进行：

```text
Obsidian 记录 -> 新建 OpenSpec change -> 开发实现 -> 回写 Obsidian 结果
```

### 1. 先写 Obsidian

开发前先阅读并更新相关 Obsidian 文档：

- `ObsidianVault/00-首页/项目首页.md`
- `ObsidianVault/02-方案设计/项目讨论结果-去中心化二手交易担保托管.md`
- `ObsidianVault/02-方案设计/OpenSpec 工作流.md`
- `ObsidianVault/04-开发记录/开发记录.md`

如果需求、业务规则、状态机、退款机制、仲裁机制、前端交互或部署信息发生变化，必须先记录到 Obsidian。

### 2. 再创建 OpenSpec change

每次重要变更都在 `openspec/changes/` 下创建一个新的 change：

```text
openspec/changes/<change-name>/
├── proposal.md
├── tasks.md
└── specs/<capability>/spec.md
```

change 名称使用短横线，例如：

```text
add-escrow-contract
add-refund-flow
add-arbitration-voting
add-frontend-demo
deploy-sepolia
```

创建后建议运行：

```bash
openspec validate <change-name> --strict
```

### 3. 最后开发实现

OpenSpec change 创建完成后，再进入代码或文档实现：

- 合约实现放在 `contracts/`
- 部署脚本放在 `scripts/`
- 测试放在 `test/`
- 前端放在 `frontend/`
- 报告和 PPT 大纲放在 `ObsidianVault/03-报告与展示/`

完成测试、部署或重要实现后，把结果追加到：

```text
ObsidianVault/04-开发记录/开发记录.md
```

Sepolia 部署信息记录到：

```text
ObsidianVault/04-开发记录/部署记录.md
```

## 核心交付物

- 智能合约源码
- Hardhat 测试
- React/Vite 前端 Demo
- Sepolia 测试网部署记录
- 项目报告
- 课堂展示 PPT

## 安全注意事项

不要提交以下内容：

- 私钥
- 助记词
- 真实 `.env` 文件
- Alchemy / Infura 等私密 API Key

如果需要环境变量，请提交 `.env.example`，不要提交真实配置。
