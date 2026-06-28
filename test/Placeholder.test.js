const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Placeholder", function () {
  it("sets and reads value", async function () {
    const Placeholder = await ethers.getContractFactory("Placeholder");
    const placeholder = await Placeholder.deploy();
    await placeholder.waitForDeployment();

    await placeholder.setValue(42);
    expect(await placeholder.value()).to.equal(42);
  });
});
