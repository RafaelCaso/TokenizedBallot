// async function deployFunction() {
//   const publicClient = await viem.getPublicClient();
//   const [deployer, acc1, acc2] = await viem.getWalletClients();
//   const tokenContract = await viem.deployContract("MyToken");
//   const nftContract = await viem.deployContract("MyNFT");
//   const tokenSaleContract = await viem.deployContract("TokenSale", [
//   TEST_RATIO,
//   TEST_PRICE,
//   tokenContract.address,
//   nftContract.address,
//   ]);
  
//   const minterRole =
//   "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
//   const txGrantRole = await tokenContract.write.grantRole([
//   minterRole,
//   tokenSaleContract.address,
//   ]);
  
//   await publicClient.getTransactionReceipt({ hash: txGrantRole });
  
//   return {
//   publicClient,
//   deployer,
//   acc1,
//   acc2,
//   tokenContract,
//   nftContract,
//   tok

// it("charges the correct amount of ETH", async () => {
//   const { publicClient, acc1, tokenSaleContract } = await loadFixture(
//   deployFunction
//   );
//   const balanceBefore = await publicClient.getBalance({
//   address: acc1.account.address,
//   });
//   const buyTokensTx = await tokenSaleContract.write.buyTokens({
//   value: TEST_BUY_TOKENS_VALUE,
//   account: acc1.account,
//   });
//   const buyTokensTxReceipt = await publicClient.getTransactionReceipt({
//   hash: buyTokensTx,
//   });
//   const gasUsed = buyTokensTxReceipt.cumulativeGasUsed ?? 0n;
//   const gasPrice = buyTokensTxReceipt.effectiveGasPrice ?? 0n;
//   const gasFees = gasUsed * gasPrice;
  
//   const balanceAfter = await publicClient.getBalance({
//   address: acc1.account.address,
//   });
  
//   const diff = balanceBefore - balanceAfter;
  
//   expect(diff).to.eq(TEST_BUY_TOKENS_VALUE + gasFees);
//   });

// it("burns the correct amount of tokens", async () => {
//   const { publicClient, acc1, tokenContract, tokenSaleContract } =
//   await loadFixture(deployFunction);
//   const buyTokensTx = await tokenSaleContract.write.buyTokens({
//   value: TEST_BUY_TOKENS_VALUE,
//   account: acc1.account,
//   });
//   await publicClient.getTransactionReceipt({ hash: buyTokensTx });
  
//   const balanceBeforeBurn = await tokenContract.read.balanceOf([
//   acc1.account.address,
//   ]);
  
//   const approveTokensTx = await tokenContract.write.approve(
//   [tokenSaleContract.address, balanceBeforeBurn / 2n],
//   {
//   account: acc1.account,
//   }
//   );
//   await publicClient.getTransactionReceipt({ hash: approveTokensTx });
  
//   const burnTokensTx = await tokenSaleContract.write.returnTokens(
//   [balanceBeforeBurn / 2n],
//   {
//   account: acc1.account,
//   }
//   );
//   await publicClient.getTransactionReceipt({ hash: burnTokensTx });
  
//   const balanceAfterBurn = await tokenContract.read.balanceOf([
//   acc1.account.address,
//   ]);
  
//   const diff = balanceBeforeBurn - balanceAfterBurn;
  
//   expect(diff).to.eq(balanceBeforeBurn / 2n);
//   });