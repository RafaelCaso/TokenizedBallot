import { viem } from "hardhat";
import { parseEther, hexToString } from "viem";

async function main() {
  const publicClient = await viem.getPublicClient();
  const [deployer, account1, account2] = await viem.getWalletClients();
  const tokenContract = await viem.deployContract("JamToken");
  console.log(`Contract deployed at ${tokenContract.address}`);
  const totalSupply = await tokenContract.read.totalSupply();
  console.log({ totalSupply });

  // Fetching the role code
  const code = await tokenContract.read.MINTER_ROLE();
  // Giving role
  const roleTx = await tokenContract.write.grantRole([
    code,
    account2.account.address,
  ]);
await publicClient.waitForTransactionReceipt({ hash: roleTx });
  const mintTx = await tokenContract.write.mint(
    [deployer.account.address, parseEther("10")],
    { account: account2.account }
);
  await publicClient.waitForTransactionReceipt({ hash: mintTx });

const totalSupply2 = await tokenContract.read.totalSupply();
console.log({ totalSupply2 });

}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});