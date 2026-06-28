const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONTRACT_NAME = "EscrowMarketplace";
const DEPLOYMENT_PATH = path.join(
  __dirname,
  "..",
  "deployments",
  "sepolia",
  `${CONTRACT_NAME}.json`
);
const ARTIFACT_PATH = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  `${CONTRACT_NAME}.sol`,
  `${CONTRACT_NAME}.json`
);

function readEnvBigInt(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return defaultValue;
  }
  return BigInt(raw);
}

function readEnvEther(name, defaultEther) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return hre.ethers.parseEther(defaultEther);
  }
  return hre.ethers.parseEther(raw);
}

function getConstructorConfig() {
  return {
    deliveryWindow: readEnvBigInt("DELIVERY_WINDOW", 3600n),
    confirmWindow: readEnvBigInt("CONFIRM_WINDOW", 3600n),
    arbiterStakeAmount: readEnvEther("ARBITER_STAKE_AMOUNT", "0.1"),
    minActiveArbiters: readEnvBigInt("MIN_ACTIVE_ARBITERS", 3n),
    disputeDeposit: readEnvEther("DISPUTE_DEPOSIT", "0.001"),
    disputeDepositWindow: readEnvBigInt("DISPUTE_DEPOSIT_WINDOW", 3600n),
    disputeWindow: readEnvBigInt("DISPUTE_WINDOW", 3600n),
    sellerStakeAmount: readEnvEther("SELLER_STAKE_AMOUNT", "0.001"),
    reportDeposit: readEnvEther("REPORT_DEPOSIT", "0.0005"),
  };
}

function getConstructorArgs(config) {
  return [
    config.deliveryWindow,
    config.confirmWindow,
    config.arbiterStakeAmount,
    config.minActiveArbiters,
    config.disputeDeposit,
    config.disputeDepositWindow,
    config.disputeWindow,
    config.sellerStakeAmount,
    config.reportDeposit,
  ];
}

function serializeConstructorArgs(config) {
  return {
    deliveryWindow: config.deliveryWindow.toString(),
    confirmWindow: config.confirmWindow.toString(),
    arbiterStakeAmount: config.arbiterStakeAmount.toString(),
    minActiveArbiters: config.minActiveArbiters.toString(),
    disputeDeposit: config.disputeDeposit.toString(),
    disputeDepositWindow: config.disputeDepositWindow.toString(),
    disputeWindow: config.disputeWindow.toString(),
    sellerStakeAmount: config.sellerStakeAmount.toString(),
    reportDeposit: config.reportDeposit.toString(),
  };
}

function formatConstructorSummary(config) {
  return {
    deliveryWindow: `${config.deliveryWindow}s`,
    confirmWindow: `${config.confirmWindow}s`,
    arbiterStakeAmount: hre.ethers.formatEther(config.arbiterStakeAmount) + " ETH",
    minActiveArbiters: config.minActiveArbiters.toString(),
    disputeDeposit: hre.ethers.formatEther(config.disputeDeposit) + " ETH",
    disputeDepositWindow: `${config.disputeDepositWindow}s`,
    disputeWindow: `${config.disputeWindow}s`,
    sellerStakeAmount: hre.ethers.formatEther(config.sellerStakeAmount) + " ETH",
    reportDeposit: hre.ethers.formatEther(config.reportDeposit) + " ETH",
  };
}

function assertSepoliaEnv() {
  const networkName = hre.network.name;
  if (networkName !== "sepolia") {
    return;
  }

  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("Missing SEPOLIA_RPC_URL in environment.");
  }

  if (!process.env.PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in environment.");
  }
}

async function main() {
  assertSepoliaEnv();

  const config = getConstructorConfig();
  const constructorArgs = getConstructorArgs(config);
  const serializedConstructorArgs = serializeConstructorArgs(config);
  const constructorSummary = formatConstructorSummary(config);

  const network = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("=== EscrowMarketplace Deployment ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Constructor args:", constructorSummary);

  if (balance === 0n) {
    throw new Error("Deployer balance is zero. Fund the account with Sepolia ETH.");
  }

  const EscrowMarketplace = await hre.ethers.getContractFactory(CONTRACT_NAME);
  const marketplace = await EscrowMarketplace.deploy(...constructorArgs);
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  const deployTx = marketplace.deploymentTransaction();
  const receipt = deployTx ? await deployTx.wait() : null;

  if (!receipt) {
    throw new Error("Deployment transaction receipt not found.");
  }

  const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
  const deployedAt = new Date().toISOString();

  const deploymentRecord = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    contractName: CONTRACT_NAME,
    address,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    deployer: deployer.address,
    deployedAt,
    constructorArgs: serializedConstructorArgs,
    abi: artifact.abi,
  };

  fs.mkdirSync(path.dirname(DEPLOYMENT_PATH), { recursive: true });
  fs.writeFileSync(DEPLOYMENT_PATH, JSON.stringify(deploymentRecord, null, 2));

  console.log("\n=== Deployment Complete ===");
  console.log("Contract address:", address);
  console.log("Transaction hash:", receipt.hash);
  console.log("Block number:", receipt.blockNumber);
  console.log("Deployment artifact:", DEPLOYMENT_PATH);
  console.log("\nCopy-paste summary:");
  console.log(
    JSON.stringify(
      {
        network: deploymentRecord.network,
        chainId: deploymentRecord.chainId,
        contractName: deploymentRecord.contractName,
        address: deploymentRecord.address,
        transactionHash: deploymentRecord.transactionHash,
        deployer: deploymentRecord.deployer,
        deployedAt: deploymentRecord.deployedAt,
        constructorArgs: deploymentRecord.constructorArgs,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
