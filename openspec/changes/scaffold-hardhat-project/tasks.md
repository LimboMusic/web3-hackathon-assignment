# 任务清单

- [x] 在 [[开发记录]] 中写入本步骤（初始化 Hardhat 工程）的准备记录。
- [x] 初始化 npm 工程，安装 Hardhat、`@nomicfoundation/hardhat-toolbox`、ethers v6 与 `@openzeppelin/contracts`。
- [x] 配置 `hardhat.config`：设置 Solidity 版本（≥ `0.8.20`）、编译优化与 Sepolia 网络（RPC 与私钥读环境变量）。
- [x] 建立 `contracts/`、`scripts/`、`test/` 目录，放置最小占位合约与占位测试。
- [x] 新增 `.env.example` 约定 `SEPOLIA_RPC_URL`、`PRIVATE_KEY`；配置 `.gitignore` 忽略 `.env` 与 `node_modules/`。
- [x] 验证 `npx hardhat compile` 与 `npx hardhat test` 在空骨架上成功执行。
- [x] 回写 [[开发记录]]，并在 [[技术实现文档]] 总览表中把第 1 步状态更新为完成。
