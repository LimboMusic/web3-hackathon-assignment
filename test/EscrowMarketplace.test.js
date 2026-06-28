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

  let marketplace;
  let seller;
  let buyer;
  let other;

  beforeEach(async function () {
    [seller, buyer, other] = await ethers.getSigners();
    const EscrowMarketplace = await ethers.getContractFactory(
      "EscrowMarketplace"
    );
    marketplace = await EscrowMarketplace.deploy();
    await marketplace.waitForDeployment();
  });

  async function createItem(signer = seller, price = PRICE, metadata = METADATA) {
    return marketplace.connect(signer).createItem(price, metadata);
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
      deliveredAt: item[7],
      delisted: item[8],
    };
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

      const contractBalance = await ethers.provider.getBalance(
        await marketplace.getAddress()
      );
      expect(contractBalance).to.equal(PRICE);

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
        PRICE
      );

      await expect(tx)
        .to.emit(marketplace, "ItemReceived")
        .withArgs(1, buyer.address);
    });

    it("reverts when caller is not buyer", async function () {
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
      ).to.changeEtherBalances([marketplace, seller], [-PRICE, PRICE]);

      expect(await marketplace.pendingWithdrawals(seller.address)).to.equal(0n);
    });

    it("emits Withdrawal event", async function () {
      await expect(marketplace.connect(seller).withdrawProceeds())
        .to.emit(marketplace, "Withdrawal")
        .withArgs(seller.address, PRICE);
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
});
