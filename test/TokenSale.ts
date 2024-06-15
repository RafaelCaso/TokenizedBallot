import { expect } from "chai";
import { viem } from "hardhat"
import {parseEther} from "viem"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"

const TEST_RATIO = 10n;
const TEST_PRICE = parseEther("2");
const TEST_NAME = "JamToken";
const TEST_NFT = "JamNFT"
const TEST_SYMBOL = "JAM";
const TEST_BUY_TOKENS_VALUE = parseEther("5");


async function deployContract() {

  const publicClient = await viem.getPublicClient();
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const paymentTokenContract = await viem.deployContract("JamToken");
  const nftContract = await viem.deployContract("JamNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [TEST_RATIO, TEST_PRICE, paymentTokenContract.address, nftContract.address])

  const minterRole = await paymentTokenContract.read.MINTER_ROLE();
  const txGrantRole = await paymentTokenContract.write.grantRole([minterRole, tokenSaleContract.address]);

  await publicClient.getTransactionReceipt({ hash: txGrantRole });

  return { publicClient, deployer, acc1, acc2,tokenSaleContract, paymentTokenContract, nftContract };
}
describe("TokenSale", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const {tokenSaleContract} = await loadFixture(deployContract);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.equal(TEST_RATIO);
    })
    it("defines the price as provided in parameters", async () => {
      const {tokenSaleContract} = await loadFixture(deployContract);
      const price = await tokenSaleContract.read.price();
      expect(price).to.equal(TEST_PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const {paymentTokenContract} = await loadFixture(deployContract);
      // const tokenContractAddress = await tokenSaleContract.read.paymentToken();
      // const tokenContract = await viem.getContractAt("JamToken", tokenContractAddress)
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        paymentTokenContract.read.name(),
        paymentTokenContract.read.symbol(),
        paymentTokenContract.read.decimals(),
        paymentTokenContract.read.totalSupply()
      ])
      expect(name).to.equal(TEST_NAME);
      expect(symbol).to.equal(TEST_SYMBOL);
      expect(decimals).to.equal(18);
      expect(totalSupply).to.equal(0n);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      const {nftContract} = await loadFixture(deployContract);
      const [name, symbol] = await Promise.all([
        nftContract.read.name(),
        nftContract.read.symbol()
      ])

      expect(name).to.equal(TEST_NFT);
      expect(symbol).to.equal(TEST_SYMBOL);
    });
  })
  describe("When a user buys an ERC20 from the Token contract", async () => {  
    it("charges the correct amount of ETH", async () => {
      const {publicClient, acc1, paymentTokenContract, tokenSaleContract} = await loadFixture(deployContract)
      const balanceBefore = await publicClient.getBalance({ address: acc1.account.address })
      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS_VALUE,
        account: acc1.account,
      })
      

      await publicClient.waitForTransactionReceipt({ hash: buyTokensTx });

      const balanceAfter = await publicClient.getBalance({ address: acc1.account.address })

      paymentTokenContract.read.balanceOf([acc1.account.address])
      const diff = balanceAfter - balanceBefore
      expect(diff).to.equal(TEST_BUY_TOKENS_VALUE * TEST_RATIO)
    })
    it("gives the correct amount of tokens", async () => {
      const {publicClient, acc1, paymentTokenContract, tokenSaleContract} = await loadFixture(deployContract)
      const balanceBefore = await publicClient.getBalance({ address: acc1.account.address })
      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS_VALUE,
        account: acc1.account,
      })
      

      const buyTokensReceipt = await publicClient.waitForTransactionReceipt({ hash: buyTokensTx });

      const gasUsed = buyTokensReceipt.cumulativeGasUsed ?? 0n;
      const gasPrice = buyTokensReceipt.effectiveGasPrice ?? 0n;
      const gasFees = gasUsed * gasPrice;

      const balanceAfter = await publicClient.getBalance({ address: acc1.account.address })

      paymentTokenContract.read.balanceOf([acc1.account.address])
      const diff = balanceAfter - balanceBefore
      expect(diff).to.equal(TEST_BUY_TOKENS_VALUE + gasFees)
    });
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("burns the correct amount of tokens", async () => {
      const {publicClient, acc1, paymentTokenContract, tokenSaleContract} = await loadFixture(deployContract);

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS_VALUE,
        account: acc1.account,
      })

      await publicClient.getTransactionReceipt({ hash : buyTokensTx});

      const balanceBefore = await paymentTokenContract.read.balanceOf([acc1.account.address]);

      const approveTokensTx = await paymentTokenContract.write.approve([tokenSaleContract.address, TEST_BUY_TOKENS_VALUE / 2n], { account : acc1.account })

      await publicClient.getTransactionReceipt({ hash: approveTokensTx });

      const burnTokensTx = await tokenSaleContract.write.returnTokens([TEST_BUY_TOKENS_VALUE / 2n], { account : acc1.account })

      await publicClient.waitForTransactionReceipt({ hash: burnTokensTx });

      const balanceAfter = await paymentTokenContract.read.balanceOf([acc1.account.address]);

      const diff = balanceBefore - balanceAfter;

      expect(diff).to.equal(balanceBefore / 2n);
    });
  })
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});