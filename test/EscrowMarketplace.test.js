const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowMarketplace", function () {
  const State = {
    Created: 0,
    Locked: 1,
    Delivered: 2,
    DisputeDepositPending: 3,
    Disputed: 4,
    Inactive: 5,
  };

  const METADATA = "QmExampleHash123";
  const UPDATED_METADATA = "QmUpdatedHash456";
  const PRICE = ethers.parseEther("1");
  const DELIVERY_WINDOW = 3600n;
  const CONFIRM_WINDOW = 3600n;
  const ARBITER_STAKE_AMOUNT = ethers.parseEther("0.1");
  const MIN_ACTIVE_ARBITERS = 3n;
  const DISPUTE_DEPOSIT = ethers.parseEther("0.001");
  const DISPUTE_DEPOSIT_WINDOW = 3600n;
  const DISPUTE_WINDOW = 3600n;
  const SELLER_STAKE_AMOUNT = ethers.parseEther("0.001");
  const REPORT_DEPOSIT = ethers.parseEther("0.0005");
  const BUYER_EVIDENCE = ethers.keccak256(ethers.toUtf8Bytes("buyer-evidence"));
  const SELLER_EVIDENCE = ethers.keccak256(ethers.toUtf8Bytes("seller-evidence"));
  const MISCONDUCT_EVIDENCE = ethers.keccak256(
    ethers.toUtf8Bytes("misconduct-evidence")
  );

  const DEPLOY_ARGS = [
    DELIVERY_WINDOW,
    CONFIRM_WINDOW,
    ARBITER_STAKE_AMOUNT,
    MIN_ACTIVE_ARBITERS,
    DISPUTE_DEPOSIT,
    DISPUTE_DEPOSIT_WINDOW,
    DISPUTE_WINDOW,
    SELLER_STAKE_AMOUNT,
    REPORT_DEPOSIT,
  ];

  let marketplace;
  let owner;
  let seller;
  let buyer;
  let other;
  let arbiter1;
  let arbiter2;
  let arbiter3;

  beforeEach(async function () {
    [owner, seller, buyer, other, arbiter1, arbiter2, arbiter3] =
      await ethers.getSigners();
    const EscrowMarketplace = await ethers.getContractFactory(
      "EscrowMarketplace"
    );
    marketplace = await EscrowMarketplace.deploy(...DEPLOY_ARGS);
    await marketplace.waitForDeployment();
  });

  async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [Number(seconds)]);
    await ethers.provider.send("evm_mine", []);
  }

  async function createItem(signer = seller, price = PRICE, metadata = METADATA) {
    return marketplace.connect(signer).createItem(price, metadata, {
      value: SELLER_STAKE_AMOUNT,
    });
  }

  async function getItem(itemId) {
    const item = await marketplace.items(itemId);
    return {
      id: item[0],
      seller: item[1],
      buyer: item[2],
      price: item[3],
      metadataHash: item[4],
      state: Number(item[5]),
      createdAt: item[6],
      paidAt: item[7],
      deliveredAt: item[8],
      delisted: item[9],
      refundRequested: item[10],
      refundRequestedAt: item[11],
      sellerStake: item[12],
      sellerStakeSettled: item[13],
      sellerStakeSlashed: item[14],
    };
  }

  async function requestRefund(itemId, signer = buyer) {
    return marketplace.connect(signer).requestRefund(itemId);
  }

  async function approveRefund(itemId, signer = seller) {
    return marketplace.connect(signer).approveRefund(itemId);
  }

  async function releaseAfterTimeout(itemId, signer = seller) {
    return marketplace.connect(signer).releaseAfterTimeout(itemId);
  }

  async function purchaseItem(itemId, signer = buyer, value = PRICE) {
    return marketplace.connect(signer).purchaseItem(itemId, { value });
  }

  async function markDelivered(itemId, signer = seller) {
    return marketplace.connect(signer).markDelivered(itemId);
  }

  async function confirmReceived(itemId, signer = buyer) {
    return marketplace.connect(signer).confirmReceived(itemId);
  }

  async function stakeAsArbiter(signer = other, value = ARBITER_STAKE_AMOUNT) {
    return marketplace.connect(signer).stakeAsArbiter({ value });
  }

  async function withdrawArbiterStake(signer = other) {
    return marketplace.connect(signer).withdrawArbiterStake();
  }

  async function setupArbiters() {
    await stakeAsArbiter(arbiter1);
    await stakeAsArbiter(arbiter2);
    await stakeAsArbiter(arbiter3);
  }

  async function openDispute(
    itemId,
    signer,
    evidenceHash = BUYER_EVIDENCE,
    value = DISPUTE_DEPOSIT
  ) {
    return marketplace.connect(signer).openDispute(itemId, evidenceHash, {
      value,
    });
  }

  async function respondDispute(itemId, signer, value = DISPUTE_DEPOSIT) {
    return marketplace.connect(signer).respondDispute(itemId, { value });
  }

  async function submitEvidence(itemId, signer, evidenceHash) {
    return marketplace.connect(signer).submitEvidence(itemId, evidenceHash);
  }

  async function voteDispute(itemId, signer, supportBuyer) {
    return marketplace.connect(signer).voteDispute(itemId, supportBuyer);
  }

  async function openAndRespondDispute(
    itemId,
    initiator,
    initiatorEvidence = BUYER_EVIDENCE
  ) {
    await openDispute(itemId, initiator, initiatorEvidence);
    const responder =
      initiator.address === seller.address ? buyer : seller;
    await respondDispute(itemId, responder);
  }

  describe("createItem", function () {
    it("creates item with valid price and metadata", async function () {
      const tx = await createItem();
      const receipt = await tx.wait();
      const itemId = 1n;

      const item = await getItem(itemId);
      expect(item.seller).to.equal(seller.address);
      expect(item.price).to.equal(PRICE);
      expect(item.metadataHash).to.equal(METADATA);
      expect(item.state).to.equal(State.Created);
      expect(item.buyer).to.equal(ethers.ZeroAddress);
      expect(item.delisted).to.equal(false);
      expect(item.createdAt).to.be.gt(0);
      expect(item.paidAt).to.equal(0n);
      expect(item.refundRequested).to.equal(false);
      expect(item.refundRequestedAt).to.equal(0n);

      await expect(tx)
        .to.emit(marketplace, "ItemCreated")
        .withArgs(itemId, seller.address, PRICE, METADATA);

      expect(await marketplace.nextItemId()).to.equal(2n);
    });

    it("reverts when price is zero", async function () {
      await expect(createItem(seller, 0n, METADATA)).to.be.revertedWithCustomError(
        marketplace,
        "ZeroPrice"
      );
    });

    it("reverts when metadata is empty", async function () {
      await expect(createItem(seller, PRICE, "")).to.be.revertedWithCustomError(
        marketplace,
        "EmptyMetadata"
      );
    });
  });

  describe("updatePrice", function () {
    const NEW_PRICE = ethers.parseEther("2");

    beforeEach(async function () {
      await createItem();
    });

    it("allows seller to update price in Created state", async function () {
      const tx = await marketplace
        .connect(seller)
        .updatePrice(1, NEW_PRICE);

      const item = await getItem(1);
      expect(item.price).to.equal(NEW_PRICE);

      await expect(tx)
        .to.emit(marketplace, "ItemPriceUpdated")
        .withArgs(1, PRICE, NEW_PRICE);
    });

    it("reverts when caller is not seller", async function () {
      await expect(
        marketplace.connect(buyer).updatePrice(1, NEW_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("reverts when item is Locked", async function () {
      await purchaseItem(1);
      await expect(
        marketplace.connect(seller).updatePrice(1, NEW_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts when new price is zero", async function () {
      await expect(
        marketplace.connect(seller).updatePrice(1, 0n)
      ).to.be.revertedWithCustomError(marketplace, "ZeroPrice");
    });
  });

  describe("updateMetadata", function () {
    beforeEach(async function () {
      await createItem();
    });

    it("allows seller to update metadata in Created state", async function () {
      const tx = await marketplace
        .connect(seller)
        .updateMetadata(1, UPDATED_METADATA);

      const item = await getItem(1);
      expect(item.metadataHash).to.equal(UPDATED_METADATA);

      await expect(tx)
        .to.emit(marketplace, "ItemMetadataUpdated")
        .withArgs(1, METADATA, UPDATED_METADATA);
    });

    it("reverts when caller is not seller", async function () {
      await expect(
        marketplace.connect(buyer).updateMetadata(1, UPDATED_METADATA)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("reverts when item is Locked", async function () {
      await purchaseItem(1);
      await expect(
        marketplace.connect(seller).updateMetadata(1, UPDATED_METADATA)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts when new metadata is empty", async function () {
      await expect(
        marketplace.connect(seller).updateMetadata(1, "")
      ).to.be.revertedWithCustomError(marketplace, "EmptyMetadata");
    });
  });

  describe("delistItem", function () {
    beforeEach(async function () {
      await createItem();
    });

    it("allows seller to delist before purchase", async function () {
      const tx = await marketplace.connect(seller).delistItem(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(item.delisted).to.equal(true);

      await expect(tx)
        .to.emit(marketplace, "ItemDelisted")
        .withArgs(1, seller.address);
    });

    it("prevents purchase after delist", async function () {
      await marketplace.connect(seller).delistItem(1);
      await expect(purchaseItem(1)).to.be.revertedWithCustomError(
        marketplace,
        "ItemNotAvailable"
      );
    });

    it("reverts when caller is not seller", async function () {
      await expect(
        marketplace.connect(buyer).delistItem(1)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("reverts when item is already purchased", async function () {
      await purchaseItem(1);
      await expect(
        marketplace.connect(seller).delistItem(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });
  });

  describe("purchaseItem", function () {
    beforeEach(async function () {
      await createItem();
    });

    it("locks item and records buyer on correct payment", async function () {
      const tx = await purchaseItem(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Locked);
      expect(item.buyer).to.equal(buyer.address);
      expect(item.paidAt).to.be.gt(0);

      const contractBalance = await ethers.provider.getBalance(
        await marketplace.getAddress()
      );
      expect(contractBalance).to.equal(PRICE + SELLER_STAKE_AMOUNT);

      await expect(tx)
        .to.emit(marketplace, "ItemPurchased")
        .withArgs(1, buyer.address, PRICE);
    });

    it("reverts on underpayment", async function () {
      await expect(
        purchaseItem(1, buyer, PRICE - 1n)
      ).to.be.revertedWithCustomError(marketplace, "IncorrectPayment");
    });

    it("reverts on overpayment", async function () {
      await expect(
        purchaseItem(1, buyer, PRICE + 1n)
      ).to.be.revertedWithCustomError(marketplace, "IncorrectPayment");
    });

    it("reverts when seller buys own item", async function () {
      await expect(
        purchaseItem(1, seller, PRICE)
      ).to.be.revertedWithCustomError(
        marketplace,
        "SellerCannotBuyOwnItem"
      );
    });

    it("reverts on duplicate purchase", async function () {
      await purchaseItem(1);
      await expect(purchaseItem(1)).to.be.revertedWithCustomError(
        marketplace,
        "ItemNotAvailable"
      );
    });
  });

  describe("markDelivered", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
    });

    it("marks item as delivered", async function () {
      const tx = await markDelivered(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Delivered);
      expect(item.deliveredAt).to.be.gt(0);

      await expect(tx)
        .to.emit(marketplace, "ItemDelivered")
        .withArgs(1, seller.address);
    });

    it("reverts when caller is not seller", async function () {
      await expect(
        marketplace.connect(buyer).markDelivered(1)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("reverts when item is not Locked", async function () {
      await expect(
        markDelivered(1, seller).then(() =>
          marketplace.connect(seller).markDelivered(1)
        )
      ).to.be.reverted;
    });

    it("reverts when item was never purchased", async function () {
      await createItem();
      await expect(
        marketplace.connect(seller).markDelivered(2)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("allows markDelivered within deliveryWindow", async function () {
      await increaseTime(DELIVERY_WINDOW - 1n);
      await expect(markDelivered(1)).to.not.be.reverted;

      const item = await getItem(1);
      expect(item.state).to.equal(State.Delivered);
    });

    it("reverts when deliveryWindow has elapsed", async function () {
      await increaseTime(DELIVERY_WINDOW + 1n);
      await expect(markDelivered(1)).to.be.revertedWithCustomError(
        marketplace,
        "DeliveryTimeoutExceeded"
      );
    });
  });

  describe("confirmReceived", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
    });

    it("completes transaction and credits seller withdrawal balance", async function () {
      const tx = await confirmReceived(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        PRICE + SELLER_STAKE_AMOUNT
      );
      await expect(
        marketplace.connect(other).confirmReceived(1)
      ).to.be.revertedWithCustomError(marketplace, "NotBuyer");
    });

    it("reverts when item is not Delivered", async function () {
      await createItem();
      await purchaseItem(2);
      await expect(
        marketplace.connect(buyer).confirmReceived(2)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts on duplicate confirm", async function () {
      await confirmReceived(1);
      await expect(confirmReceived(1)).to.be.revertedWithCustomError(
        marketplace,
        "InvalidState"
      );
    });

    it("reverts when buyer has a pending refund request", async function () {
      await requestRefund(1);
      await expect(confirmReceived(1)).to.be.revertedWithCustomError(
        marketplace,
        "PendingRefundBlocksConfirm"
      );
    });

    it("succeeds when no refund is pending", async function () {
      const tx = await confirmReceived(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(item.refundRequested).to.equal(false);

      await expect(tx)
        .to.emit(marketplace, "ItemReceived")
        .withArgs(1, buyer.address);
    });
  });

  describe("withdrawProceeds", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await confirmReceived(1);
    });

    it("transfers pending balance to seller", async function () {
      await expect(
        marketplace.connect(seller).withdrawProceeds()
      ).to.changeEtherBalances(
        [marketplace, seller],
        [-(PRICE + SELLER_STAKE_AMOUNT), PRICE + SELLER_STAKE_AMOUNT]
      );

      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(0n);
    });

    it("emits Withdrawal event", async function () {
      await expect(marketplace.connect(seller).withdrawProceeds())
        .to.emit(marketplace, "Withdrawal")
        .withArgs(seller.address, PRICE + SELLER_STAKE_AMOUNT);
    });

    it("reverts when nothing to withdraw", async function () {
      await marketplace.connect(seller).withdrawProceeds();
      await expect(
        marketplace.connect(seller).withdrawProceeds()
      ).to.be.revertedWithCustomError(marketplace, "NothingToWithdraw");
    });

    it("reverts when account has no pending balance", async function () {
      await expect(
        marketplace.connect(other).withdrawProceeds()
      ).to.be.revertedWithCustomError(marketplace, "NothingToWithdraw");
    });
  });

  describe("time window configuration", function () {
    it("exposes deliveryWindow, confirmWindow, arbiter and dispute config from constructor", async function () {
      expect(await marketplace.deliveryWindow()).to.equal(DELIVERY_WINDOW);
      expect(await marketplace.confirmWindow()).to.equal(CONFIRM_WINDOW);
      expect(await marketplace.arbiterStakeAmount()).to.equal(
        ARBITER_STAKE_AMOUNT
      );
      expect(await marketplace.minActiveArbiters()).to.equal(
        MIN_ACTIVE_ARBITERS
      );
      expect(await marketplace.disputeDeposit()).to.equal(DISPUTE_DEPOSIT);
      expect(await marketplace.disputeDepositWindow()).to.equal(
        DISPUTE_DEPOSIT_WINDOW
      );
      expect(await marketplace.disputeWindow()).to.equal(DISPUTE_WINDOW);
      expect(await marketplace.sellerStakeAmount()).to.equal(
        SELLER_STAKE_AMOUNT
      );
      expect(await marketplace.reportDeposit()).to.equal(REPORT_DEPOSIT);
    });
  });

  describe("constructor validation", function () {
    it("reverts when arbiterStakeAmount is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          0n,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidArbiterStakeAmount"
      );
    });

    it("reverts when minActiveArbiters is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          0n,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidMinActiveArbiters"
      );
    });

    it("reverts when deliveryWindow is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          0n,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidDeliveryWindow"
      );
    });

    it("reverts when confirmWindow is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          0n,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidConfirmWindow"
      );
    });

    it("reverts when disputeDeposit is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          0n,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidDisputeDeposit"
      );
    });

    it("reverts when disputeDepositWindow is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          0n,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidDisputeDepositWindow"
      );
    });

    it("reverts when disputeWindow is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          0n,
          SELLER_STAKE_AMOUNT,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidDisputeWindow"
      );
    });
  });

  describe("stakeAsArbiter", function () {
    it("marks address as active arbiter with correct stake and count", async function () {
      const tx = await stakeAsArbiter(other);

      expect(await marketplace.activeArbiters(other.address)).to.equal(true);
      expect(await marketplace.arbiterStakes(other.address)).to.equal(
        ARBITER_STAKE_AMOUNT
      );
      expect(await marketplace.activeArbiterCount()).to.equal(1n);

      await expect(tx)
        .to.emit(marketplace, "ArbiterStaked")
        .withArgs(other.address, ARBITER_STAKE_AMOUNT);
    });

    it("reverts on incorrect stake amount", async function () {
      await expect(
        stakeAsArbiter(other, ARBITER_STAKE_AMOUNT - 1n)
      ).to.be.revertedWithCustomError(
        marketplace,
        "IncorrectArbiterStakeAmount"
      );
    });

    it("reverts on duplicate stake", async function () {
      await stakeAsArbiter(other);
      await expect(stakeAsArbiter(other)).to.be.revertedWithCustomError(
        marketplace,
        "AlreadyActiveArbiter"
      );
    });
  });

  describe("withdrawArbiterStake", function () {
    beforeEach(async function () {
      await stakeAsArbiter(other);
    });

    it("returns stake and clears active arbiter state", async function () {
      const tx = await withdrawArbiterStake(other);

      expect(await marketplace.activeArbiters(other.address)).to.equal(false);
      expect(await marketplace.arbiterStakes(other.address)).to.equal(0n);
      expect(await marketplace.activeArbiterCount()).to.equal(0n);

      await expect(tx)
        .to.emit(marketplace, "ArbiterWithdrawn")
        .withArgs(other.address, ARBITER_STAKE_AMOUNT);

      await expect(tx).to.changeEtherBalances(
        [marketplace, other],
        [-ARBITER_STAKE_AMOUNT, ARBITER_STAKE_AMOUNT]
      );
    });

    it("reverts when caller is not an active arbiter", async function () {
      await expect(
        withdrawArbiterStake(buyer)
      ).to.be.revertedWithCustomError(marketplace, "NotActiveArbiter");
    });

    it("reverts when arbiter is locked in an active dispute", async function () {
      const EscrowMarketplaceHarness = await ethers.getContractFactory(
        "EscrowMarketplaceHarness"
      );
      const harness = await EscrowMarketplaceHarness.deploy(...DEPLOY_ARGS);
      await harness.waitForDeployment();

      await harness.connect(other).stakeAsArbiter({ value: ARBITER_STAKE_AMOUNT });
      await harness.exposeLockArbiterForDispute(other.address);

      await expect(
        harness.connect(other).withdrawArbiterStake()
      ).to.be.revertedWithCustomError(harness, "ArbiterLockedInDispute");
    });
  });

  describe("EscrowMarketplaceHarness", function () {
    it("reverts when locking an unstaked address", async function () {
      const EscrowMarketplaceHarness = await ethers.getContractFactory(
        "EscrowMarketplaceHarness"
      );
      const harness = await EscrowMarketplaceHarness.deploy(...DEPLOY_ARGS);
      await harness.waitForDeployment();

      await expect(
        harness.exposeLockArbiterForDispute(other.address)
      ).to.be.revertedWithCustomError(harness, "NotActiveArbiter");
    });

    it("locks staked arbiter and blocks withdraw until unlocked", async function () {
      const EscrowMarketplaceHarness = await ethers.getContractFactory(
        "EscrowMarketplaceHarness"
      );
      const harness = await EscrowMarketplaceHarness.deploy(...DEPLOY_ARGS);
      await harness.waitForDeployment();

      await harness.connect(other).stakeAsArbiter({ value: ARBITER_STAKE_AMOUNT });
      await harness.exposeLockArbiterForDispute(other.address);

      await expect(
        harness.connect(other).withdrawArbiterStake()
      ).to.be.revertedWithCustomError(harness, "ArbiterLockedInDispute");

      await harness.exposeUnlockArbiterForDispute(other.address);
      await expect(harness.connect(other).withdrawArbiterStake()).to.not.be
        .reverted;
    });
  });

  describe("isEligibleArbiter", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
    });

    it("returns false for unstaked address", async function () {
      expect(await marketplace.isEligibleArbiter(1, other.address)).to.equal(
        false
      );
    });

    it("returns true for staked third party", async function () {
      await stakeAsArbiter(other);
      expect(await marketplace.isEligibleArbiter(1, other.address)).to.equal(
        true
      );
    });

    it("returns false for staked seller", async function () {
      await stakeAsArbiter(seller);
      expect(await marketplace.isEligibleArbiter(1, seller.address)).to.equal(
        false
      );
    });

    it("returns false for staked buyer", async function () {
      await stakeAsArbiter(buyer);
      expect(await marketplace.isEligibleArbiter(1, buyer.address)).to.equal(
        false
      );
    });

    it("reverts for nonexistent item", async function () {
      await expect(
        marketplace.isEligibleArbiter(999, other.address)
      ).to.be.revertedWithCustomError(marketplace, "ItemNotFound");
    });
  });

  describe("requestRefund", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
    });

    it("allows buyer to request refund in Locked state", async function () {
      const tx = await requestRefund(1);

      const item = await getItem(1);
      expect(item.refundRequested).to.equal(true);
      expect(item.refundRequestedAt).to.be.gt(0);
      expect(item.state).to.equal(State.Locked);

      await expect(tx)
        .to.emit(marketplace, "RefundRequested")
        .withArgs(1, buyer.address);
    });

    it("allows buyer to request refund in Delivered state", async function () {
      await markDelivered(1);
      const tx = await requestRefund(1);

      const item = await getItem(1);
      expect(item.refundRequested).to.equal(true);
      expect(item.state).to.equal(State.Delivered);

      await expect(tx)
        .to.emit(marketplace, "RefundRequested")
        .withArgs(1, buyer.address);
    });

    it("reverts when caller is not buyer", async function () {
      await expect(
        requestRefund(1, other)
      ).to.be.revertedWithCustomError(marketplace, "NotBuyer");
    });

    it("reverts in Created state", async function () {
      await createItem();
      await expect(
        requestRefund(2)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts in Inactive state", async function () {
      await markDelivered(1);
      await confirmReceived(1);
      await expect(
        requestRefund(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts on duplicate refund request", async function () {
      await requestRefund(1);
      await expect(
        requestRefund(1)
      ).to.be.revertedWithCustomError(marketplace, "RefundAlreadyRequested");
    });
  });

  describe("approveRefund", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
      await requestRefund(1);
    });

    it("completes refund and credits buyer withdrawal balance", async function () {
      const tx = await approveRefund(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(item.refundRequested).to.equal(false);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE
      );

      await expect(tx)
        .to.emit(marketplace, "RefundApproved")
        .withArgs(1, seller.address, buyer.address, PRICE);
    });

    it("allows buyer to withdraw refunded funds", async function () {
      await approveRefund(1);
      await expect(
        marketplace.connect(buyer).withdrawProceeds()
      ).to.changeEtherBalances([marketplace, buyer], [-PRICE, PRICE]);
    });

    it("reverts when caller is not seller", async function () {
      await expect(
        approveRefund(1, buyer)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("reverts when refund was not requested", async function () {
      await createItem();
      await purchaseItem(2);
      await expect(
        approveRefund(2)
      ).to.be.revertedWithCustomError(marketplace, "RefundNotRequested");
    });

    it("reverts on duplicate approve after refund completed", async function () {
      await approveRefund(1);
      await expect(
        approveRefund(1)
      ).to.be.revertedWithCustomError(marketplace, "RefundNotRequested");
    });
  });

  describe("releaseAfterTimeout", function () {
    beforeEach(async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
    });

    it("releases funds to seller after confirmWindow expires", async function () {
      await increaseTime(CONFIRM_WINDOW);
      const tx = await releaseAfterTimeout(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        PRICE + SELLER_STAKE_AMOUNT
      );

      await expect(tx)
        .to.emit(marketplace, "TimeoutReleased")
        .withArgs(1, seller.address, PRICE);
    });

    it("reverts before confirmWindow expires", async function () {
      await expect(
        releaseAfterTimeout(1)
      ).to.be.revertedWithCustomError(marketplace, "TimeoutNotReached");
    });

    it("reverts when item is still Locked", async function () {
      await createItem();
      await purchaseItem(2);
      await increaseTime(CONFIRM_WINDOW + 1n);
      await expect(
        releaseAfterTimeout(2)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts when refund is pending", async function () {
      await requestRefund(1);
      await increaseTime(CONFIRM_WINDOW);
      await expect(
        releaseAfterTimeout(1)
      ).to.be.revertedWithCustomError(
        marketplace,
        "PendingRefundBlocksRelease"
      );
    });
  });

  describe("timer serial behavior", function () {
    it("cannot release after timeout before markDelivered even if paidAt window expired", async function () {
      await createItem();
      await purchaseItem(1);
      await increaseTime(CONFIRM_WINDOW + DELIVERY_WINDOW + 1n);

      await expect(
        releaseAfterTimeout(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("confirmWindow starts from deliveredAt not paidAt", async function () {
      await createItem();
      await purchaseItem(1);
      await increaseTime(DELIVERY_WINDOW - 10n);
      await markDelivered(1);

      await increaseTime(20n);
      await expect(
        releaseAfterTimeout(1)
      ).to.be.revertedWithCustomError(marketplace, "TimeoutNotReached");

      await increaseTime(CONFIRM_WINDOW);
      await releaseAfterTimeout(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
    });
  });

  describe("refund and timeout mutual exclusion", function () {
    it("blocks timeout release after buyer requests refund", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await requestRefund(1);
      await increaseTime(CONFIRM_WINDOW);

      await expect(
        releaseAfterTimeout(1)
      ).to.be.revertedWithCustomError(
        marketplace,
        "PendingRefundBlocksRelease"
      );
    });

    it("blocks confirmReceived after buyer requests refund in Delivered state", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await requestRefund(1);

      await expect(confirmReceived(1)).to.be.revertedWithCustomError(
        marketplace,
        "PendingRefundBlocksConfirm"
      );
    });

    it("completes refund flow after seller approves pending refund", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await requestRefund(1);

      await approveRefund(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(item.refundRequested).to.equal(false);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE
      );

      await expect(
        marketplace.connect(buyer).withdrawProceeds()
      ).to.changeEtherBalances([marketplace, buyer], [-PRICE, PRICE]);
    });

    it("blocks refund request after seller timeout release", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await increaseTime(CONFIRM_WINDOW);
      await releaseAfterTimeout(1);

      await expect(
        requestRefund(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });
  });

  describe("openDispute", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
    });

    it("allows buyer to open dispute in Locked state", async function () {
      const tx = await openDispute(1, buyer, BUYER_EVIDENCE);

      const item = await getItem(1);
      expect(item.state).to.equal(State.DisputeDepositPending);

      const dispute = await marketplace.disputes(1);
      expect(dispute.disputeInitiator).to.equal(buyer.address);
      expect(dispute.initiatorSupportsBuyer).to.equal(true);
      expect(dispute.buyerDepositPaid).to.equal(true);
      expect(dispute.buyerEvidenceHash).to.equal(BUYER_EVIDENCE);

      await expect(tx)
        .to.emit(marketplace, "DisputeOpened")
        .withArgs(1, buyer.address, true, BUYER_EVIDENCE);
    });

    it("allows seller to open dispute in Delivered state", async function () {
      await markDelivered(1);
      const tx = await openDispute(1, seller, SELLER_EVIDENCE);

      const item = await getItem(1);
      expect(item.state).to.equal(State.DisputeDepositPending);

      const dispute = await marketplace.disputes(1);
      expect(dispute.disputeInitiator).to.equal(seller.address);
      expect(dispute.initiatorSupportsBuyer).to.equal(false);
      expect(dispute.sellerDepositPaid).to.equal(true);

      await expect(tx)
        .to.emit(marketplace, "DisputeOpened")
        .withArgs(1, seller.address, false, SELLER_EVIDENCE);
    });

    it("reverts when caller is not buyer or seller", async function () {
      await expect(
        openDispute(1, other, BUYER_EVIDENCE)
      ).to.be.revertedWithCustomError(marketplace, "NotPartyToDispute");
    });

    it("reverts on incorrect dispute deposit", async function () {
      await expect(
        marketplace
          .connect(buyer)
          .openDispute(1, BUYER_EVIDENCE, { value: DISPUTE_DEPOSIT - 1n })
      ).to.be.revertedWithCustomError(marketplace, "IncorrectDisputeDeposit");
    });

    it("reverts on empty evidence hash", async function () {
      await expect(
        openDispute(1, buyer, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(marketplace, "EmptyEvidenceHash");
    });

    it("reverts when insufficient active arbiters", async function () {
      await marketplace.connect(arbiter1).withdrawArbiterStake();
      await marketplace.connect(arbiter2).withdrawArbiterStake();
      await marketplace.connect(arbiter3).withdrawArbiterStake();

      await expect(
        openDispute(1, buyer, BUYER_EVIDENCE)
      ).to.be.revertedWithCustomError(
        marketplace,
        "InsufficientActiveArbiters"
      );
    });

    it("reverts in Created state", async function () {
      await createItem();
      await expect(
        openDispute(2, seller, SELLER_EVIDENCE)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("reverts in Inactive state", async function () {
      await markDelivered(1);
      await confirmReceived(1);
      await expect(
        openDispute(1, buyer, BUYER_EVIDENCE)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });
  });

  describe("respondDispute", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("enters Disputed when responder pays deposit in time", async function () {
      const tx = await respondDispute(1, seller);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Disputed);

      const dispute = await marketplace.disputes(1);
      expect(dispute.sellerDepositPaid).to.equal(true);
      expect(dispute.disputeStartedAt).to.be.gt(0);
      expect(dispute.arbiterCountSnapshot).to.equal(3n);
      expect(dispute.voteThresholdSnapshot).to.equal(2n);

      await expect(tx)
        .to.emit(marketplace, "DisputeResponded")
        .withArgs(1, seller.address);
    });

    it("reverts when caller is not the responder", async function () {
      await expect(
        respondDispute(1, buyer)
      ).to.be.revertedWithCustomError(marketplace, "NotDisputeResponder");
    });

    it("reverts on incorrect deposit amount", async function () {
      await expect(
        marketplace.connect(seller).respondDispute(1, {
          value: DISPUTE_DEPOSIT - 1n,
        })
      ).to.be.revertedWithCustomError(marketplace, "IncorrectDisputeDeposit");
    });

    it("reverts after disputeDepositWindow expires", async function () {
      await increaseTime(DISPUTE_DEPOSIT_WINDOW + 1n);
      await expect(
        respondDispute(1, seller)
      ).to.be.revertedWithCustomError(
        marketplace,
        "DisputeDepositWindowExpired"
      );
    });

    it("reverts when active arbiters dropped below minimum before respond", async function () {
      await marketplace.connect(arbiter1).withdrawArbiterStake();
      await marketplace.connect(arbiter2).withdrawArbiterStake();
      await marketplace.connect(arbiter3).withdrawArbiterStake();

      await expect(
        respondDispute(1, seller)
      ).to.be.revertedWithCustomError(
        marketplace,
        "InsufficientActiveArbiters"
      );
    });
  });

  describe("submitEvidence", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("allows buyer to submit evidence", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("updated-buyer"));
      const tx = await submitEvidence(1, buyer, hash);

      const dispute = await marketplace.disputes(1);
      expect(dispute.buyerEvidenceHash).to.equal(hash);

      await expect(tx)
        .to.emit(marketplace, "EvidenceSubmitted")
        .withArgs(1, buyer.address, hash);
    });

    it("allows seller to submit evidence", async function () {
      const tx = await submitEvidence(1, seller, SELLER_EVIDENCE);

      const dispute = await marketplace.disputes(1);
      expect(dispute.sellerEvidenceHash).to.equal(SELLER_EVIDENCE);

      await expect(tx)
        .to.emit(marketplace, "EvidenceSubmitted")
        .withArgs(1, seller.address, SELLER_EVIDENCE);
    });

    it("reverts when caller is not a party", async function () {
      await expect(
        submitEvidence(1, other, BUYER_EVIDENCE)
      ).to.be.revertedWithCustomError(marketplace, "NotPartyToDispute");
    });

    it("reverts on empty evidence hash", async function () {
      await expect(
        submitEvidence(1, buyer, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(marketplace, "EmptyEvidenceHash");
    });

    it("reverts when item is not in dispute", async function () {
      await createItem();
      await purchaseItem(2);
      await expect(
        submitEvidence(2, buyer, BUYER_EVIDENCE)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });
  });

  describe("voteDispute", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("records vote and increments buyer vote count", async function () {
      const tx = await voteDispute(1, arbiter1, true);

      const dispute = await marketplace.disputes(1);
      expect(dispute.buyerVotes).to.equal(1n);
      expect(await marketplace.arbiterHasVoted(1, arbiter1.address)).to.equal(
        true
      );

      await expect(tx)
        .to.emit(marketplace, "ArbiterVoted")
        .withArgs(1, arbiter1.address, true);
    });

    it("reverts for unstaked address", async function () {
      await expect(
        voteDispute(1, other, true)
      ).to.be.revertedWithCustomError(marketplace, "NotEligibleToVote");
    });

    it("reverts when buyer tries to vote on own trade", async function () {
      await stakeAsArbiter(buyer);
      await expect(
        voteDispute(1, buyer, true)
      ).to.be.revertedWithCustomError(marketplace, "NotEligibleToVote");
    });

    it("reverts when seller tries to vote on own trade", async function () {
      await stakeAsArbiter(seller);
      await expect(
        voteDispute(1, seller, false)
      ).to.be.revertedWithCustomError(marketplace, "NotEligibleToVote");
    });

    it("reverts on duplicate vote", async function () {
      await voteDispute(1, arbiter1, true);
      await expect(
        voteDispute(1, arbiter1, true)
      ).to.be.revertedWithCustomError(marketplace, "AlreadyVoted");
    });

    it("reverts when item is not Disputed", async function () {
      await createItem();
      await purchaseItem(2);
      await expect(
        voteDispute(2, arbiter1, true)
      ).to.be.revertedWithCustomError(marketplace, "NotInDisputedState");
    });
  });

  describe("2/3 majority resolution", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("refunds buyer when two arbiters support buyer", async function () {
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );
    });

    it("releases to seller when two arbiters support seller", async function () {
      await voteDispute(1, arbiter1, false);
      await voteDispute(1, arbiter2, false);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT + SELLER_STAKE_AMOUNT
      );
    });

    it("splits loser deposit among majority voters", async function () {
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);

      const rewardEach = DISPUTE_DEPOSIT / 2n;
      expect(
        await marketplace.pendingWithdrawals(arbiter1.address)
      ).to.equal(rewardEach);
      expect(
        await marketplace.pendingWithdrawals(arbiter2.address)
      ).to.equal(rewardEach);
      expect(
        await marketplace.pendingWithdrawals(arbiter3.address)
      ).to.equal(0n);
    });

    it("does not reward minority voter", async function () {
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, false);
      await voteDispute(1, arbiter3, true);

      expect(
        await marketplace.pendingWithdrawals(arbiter2.address)
      ).to.equal(0n);
    });

    it("blocks further voting after resolution", async function () {
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);

      await expect(
        voteDispute(1, arbiter3, true)
      ).to.be.revertedWithCustomError(marketplace, "NotInDisputedState");
    });
  });

  describe("vote threshold snapshot", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("does not lower threshold when non-voting arbiters withdraw", async function () {
      const disputeBefore = await marketplace.disputes(1);
      expect(disputeBefore.arbiterCountSnapshot).to.equal(3n);
      expect(disputeBefore.voteThresholdSnapshot).to.equal(2n);

      await withdrawArbiterStake(arbiter2);
      await withdrawArbiterStake(arbiter3);
      expect(await marketplace.activeArbiterCount()).to.equal(1n);

      await voteDispute(1, arbiter1, true);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Disputed);

      const disputeAfter = await marketplace.disputes(1);
      expect(disputeAfter.buyerVotes).to.equal(1n);
      expect(disputeAfter.voteThresholdSnapshot).to.equal(2n);
    });

    it("resolves only after votes reach snapshotted threshold", async function () {
      await withdrawArbiterStake(arbiter2);
      await withdrawArbiterStake(arbiter3);

      await voteDispute(1, arbiter1, true);

      await stakeAsArbiter(other);
      await voteDispute(1, other, true);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );
    });
  });

  describe("resolveDisputeDepositTimeout", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("grants initiator win when responder does not pay", async function () {
      await increaseTime(DISPUTE_DEPOSIT_WINDOW + 1n);
      const tx = await marketplace.resolveDisputeDepositTimeout(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );

      await expect(tx)
        .to.emit(marketplace, "DisputeResolved")
        .withArgs(1, true, "deposit_timeout");
    });

    it("does not reward arbiters on deposit timeout", async function () {
      await increaseTime(DISPUTE_DEPOSIT_WINDOW + 1n);
      await marketplace.resolveDisputeDepositTimeout(1);

      expect(
        await marketplace.pendingWithdrawals(arbiter1.address)
      ).to.equal(0n);
    });

    it("reverts before deposit window expires", async function () {
      await expect(
        marketplace.resolveDisputeDepositTimeout(1)
      ).to.be.revertedWithCustomError(
        marketplace,
        "DisputeDepositWindowNotExpired"
      );
    });
  });

  describe("resolveDisputeTimeout", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
    });

    it("refunds buyer when seller has not delivered", async function () {
      await increaseTime(DISPUTE_WINDOW + 1n);
      const tx = await marketplace.resolveDisputeTimeout(1);

      const item = await getItem(1);
      expect(item.state).to.equal(State.Inactive);
      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );

      await expect(tx)
        .to.emit(marketplace, "DisputeResolved")
        .withArgs(1, true, "arbitration_timeout");
    });

    it("releases to seller when seller has delivered", async function () {
      await createItem();
      await purchaseItem(2);
      await markDelivered(2);
      await openAndRespondDispute(2, buyer, BUYER_EVIDENCE);

      await increaseTime(DISPUTE_WINDOW + 1n);
      await marketplace.resolveDisputeTimeout(2);

      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT + SELLER_STAKE_AMOUNT
      );
    });

    it("returns both dispute deposits without arbiter rewards", async function () {
      await increaseTime(DISPUTE_WINDOW + 1n);
      await marketplace.resolveDisputeTimeout(1);

      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );
      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        DISPUTE_DEPOSIT
      );
      expect(
        await marketplace.pendingWithdrawals(arbiter1.address)
      ).to.equal(0n);
    });

    it("reverts before dispute window expires", async function () {
      await expect(
        marketplace.resolveDisputeTimeout(1)
      ).to.be.revertedWithCustomError(marketplace, "DisputeNotTimedOut");
    });
  });

  describe("seller stake configuration", function () {
    it("reverts when sellerStakeAmount is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          0n,
          REPORT_DEPOSIT
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidSellerStakeAmount"
      );
    });

    it("reverts when reportDeposit is zero", async function () {
      const EscrowMarketplace = await ethers.getContractFactory(
        "EscrowMarketplace"
      );
      await expect(
        EscrowMarketplace.deploy(
          DELIVERY_WINDOW,
          CONFIRM_WINDOW,
          ARBITER_STAKE_AMOUNT,
          MIN_ACTIVE_ARBITERS,
          DISPUTE_DEPOSIT,
          DISPUTE_DEPOSIT_WINDOW,
          DISPUTE_WINDOW,
          SELLER_STAKE_AMOUNT,
          0n
        )
      ).to.be.revertedWithCustomError(
        EscrowMarketplace,
        "InvalidReportDeposit"
      );
    });
  });

  describe("seller stake flows", function () {
    it("requires seller stake when creating item", async function () {
      const tx = await createItem();

      await expect(tx)
        .to.emit(marketplace, "SellerStakeLocked")
        .withArgs(1, seller.address, SELLER_STAKE_AMOUNT);

      const item = await getItem(1);
      expect(item.sellerStake).to.equal(SELLER_STAKE_AMOUNT);
      expect(item.sellerStakeSettled).to.equal(false);
    });

    it("reverts when seller stake amount is incorrect", async function () {
      await expect(
        marketplace.connect(seller).createItem(PRICE, METADATA, {
          value: SELLER_STAKE_AMOUNT - 1n,
        })
      ).to.be.revertedWithCustomError(
        marketplace,
        "IncorrectSellerStakeAmount"
      );
    });

    it("returns seller stake on delist", async function () {
      await createItem();
      await marketplace.connect(seller).delistItem(1);

      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        SELLER_STAKE_AMOUNT
      );

      const item = await getItem(1);
      expect(item.sellerStakeSettled).to.equal(true);

      await expect(
        marketplace.connect(seller).delistItem(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });

    it("returns seller stake on negotiated refund", async function () {
      await createItem();
      await purchaseItem(1);
      await requestRefund(1);
      await approveRefund(1);

      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE
      );
      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(
        SELLER_STAKE_AMOUNT
      );
    });

    it("slashes seller stake when buyer wins dispute", async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);

      expect(await marketplace.pendingWithdrawals(buyer.address)).to.equal(
        PRICE + DISPUTE_DEPOSIT
      );
      expect(await marketplace.pendingWithdrawals(owner.address)).to.equal(
        SELLER_STAKE_AMOUNT
      );
      expect(
        await marketplace.sellerStakeSlashedCount(seller.address)
      ).to.equal(1n);

      const item = await getItem(1);
      expect(item.sellerStakeSlashed).to.equal(true);
    });

    it("cannot settle seller stake twice", async function () {
      await createItem();
      await marketplace.connect(seller).delistItem(1);

      await expect(
        marketplace.connect(seller).delistItem(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidState");
    });
  });

  describe("reputation counters", function () {
    it("increments completed trade counts on confirmReceived", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await confirmReceived(1);

      expect(await marketplace.completedTradeCount(buyer.address)).to.equal(1n);
      expect(await marketplace.completedTradeCount(seller.address)).to.equal(
        1n
      );
    });

    it("increments completed trade counts on timeout release", async function () {
      await createItem();
      await purchaseItem(1);
      await markDelivered(1);
      await increaseTime(CONFIRM_WINDOW);
      await releaseAfterTimeout(1);

      expect(await marketplace.completedTradeCount(buyer.address)).to.equal(1n);
      expect(await marketplace.completedTradeCount(seller.address)).to.equal(
        1n
      );
    });

    it("updates dispute and win counts on buyer-win resolution", async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);

      expect(await marketplace.disputeCount(buyer.address)).to.equal(1n);
      expect(await marketplace.disputeCount(seller.address)).to.equal(1n);
      expect(await marketplace.buyerWinCount(buyer.address)).to.equal(1n);
      expect(await marketplace.sellerWinCount(seller.address)).to.equal(0n);
    });

    it("updates dispute and win counts on seller-win resolution", async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
      await voteDispute(1, arbiter1, false);
      await voteDispute(1, arbiter2, false);

      expect(await marketplace.disputeCount(buyer.address)).to.equal(1n);
      expect(await marketplace.disputeCount(seller.address)).to.equal(1n);
      expect(await marketplace.buyerWinCount(buyer.address)).to.equal(0n);
      expect(await marketplace.sellerWinCount(seller.address)).to.equal(1n);
    });
  });

  describe("reportNoVote", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);
    });

    it("upholds report and refunds deposit when arbiter did not vote", async function () {
      const tx = await marketplace
        .connect(other)
        .reportNoVote(1, arbiter3.address, { value: REPORT_DEPOSIT });

      expect(await marketplace.pendingWithdrawals(other.address)).to.equal(
        REPORT_DEPOSIT
      );

      await expect(tx)
        .to.emit(marketplace, "ReportResolved")
        .withArgs(1, true);
    });

    it("rejects report and compensates arbiter when arbiter voted", async function () {
      const rewardEach = DISPUTE_DEPOSIT / 2n;
      await marketplace
        .connect(other)
        .reportNoVote(1, arbiter1.address, { value: REPORT_DEPOSIT });

      expect(
        await marketplace.pendingWithdrawals(arbiter1.address)
      ).to.equal(REPORT_DEPOSIT + rewardEach);
    });

    it("reverts on incorrect report deposit", async function () {
      await expect(
        marketplace
          .connect(other)
          .reportNoVote(1, arbiter3.address, { value: REPORT_DEPOSIT - 1n })
      ).to.be.revertedWithCustomError(marketplace, "IncorrectReportDeposit");
    });
  });

  describe("reportMisconduct and resolveReport", function () {
    beforeEach(async function () {
      await setupArbiters();
      await createItem();
      await purchaseItem(1);
      await openAndRespondDispute(1, buyer, BUYER_EVIDENCE);
      await voteDispute(1, arbiter1, true);
      await voteDispute(1, arbiter2, true);
    });

    it("creates pending misconduct report with evidence hash", async function () {
      const tx = await marketplace
        .connect(other)
        .reportMisconduct(1, arbiter3.address, MISCONDUCT_EVIDENCE, {
          value: REPORT_DEPOSIT,
        });

      const report = await marketplace.reports(1);
      expect(report.itemId).to.equal(1n);
      expect(report.reporter).to.equal(other.address);
      expect(report.reported).to.equal(arbiter3.address);
      expect(Number(report.reportType)).to.equal(1);
      expect(Number(report.status)).to.equal(0);
      expect(report.evidenceHash).to.equal(MISCONDUCT_EVIDENCE);
      expect(report.deposit).to.equal(REPORT_DEPOSIT);

      await expect(tx)
        .to.emit(marketplace, "ReportCreated")
        .withArgs(
          1,
          1,
          other.address,
          arbiter3.address,
          1,
          MISCONDUCT_EVIDENCE
        );
    });

    it("reverts when evidence hash is empty", async function () {
      await expect(
        marketplace
          .connect(other)
          .reportMisconduct(1, arbiter3.address, ethers.ZeroHash, {
            value: REPORT_DEPOSIT,
          })
      ).to.be.revertedWithCustomError(marketplace, "EmptyEvidenceHash");
    });

    it("reverts when non-owner tries to resolve", async function () {
      await marketplace
        .connect(other)
        .reportMisconduct(1, arbiter3.address, MISCONDUCT_EVIDENCE, {
          value: REPORT_DEPOSIT,
        });

      await expect(
        marketplace.connect(other).resolveReport(1, true)
      ).to.be.revertedWithCustomError(
        marketplace,
        "OwnableUnauthorizedAccount"
      );
    });

    it("returns deposit to reporter when owner upholds report", async function () {
      await marketplace
        .connect(other)
        .reportMisconduct(1, arbiter3.address, MISCONDUCT_EVIDENCE, {
          value: REPORT_DEPOSIT,
        });

      await marketplace.connect(owner).resolveReport(1, true);

      expect(await marketplace.pendingWithdrawals(other.address)).to.equal(
        REPORT_DEPOSIT
      );
    });

    it("compensates reported arbiter when owner rejects report", async function () {
      await marketplace
        .connect(other)
        .reportMisconduct(1, arbiter3.address, MISCONDUCT_EVIDENCE, {
          value: REPORT_DEPOSIT,
        });

      await marketplace.connect(owner).resolveReport(1, false);

      expect(
        await marketplace.pendingWithdrawals(arbiter3.address)
      ).to.equal(REPORT_DEPOSIT);
    });
  });
});
