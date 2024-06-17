
import {viem} from "hardhat";
import {formatEther} from "viem";

const MINT_VALUE = 1000n;

async function deployContract(){

  // deploy contract
  const publicClient= await viem.getPublicClient();
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const contract = await viem.deployContract("JamToken")
  console.log(`Token deployed at address: ${contract.address}\n` )

  // Mint Tokens
  const mintTx = await contract.write.mint([acc1.account.address, MINT_VALUE])
  await publicClient.waitForTransactionReceipt({hash : mintTx});
  console.log(
    `Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.account.address}\n`
  )
  const balanceBN = await contract.read.balanceOf([acc1.account.address]);
  console.log(`Account ${acc1.account.address} has ${balanceBN.toString()} decimal units of Jam Token\n`)



  // check voting power
  const votes = await contract.read.getVotes([acc1.account.address])
  console.log(
    `Account: ${acc1.account.address} has ${votes.toString()} units of voting power before self delegating\n`
  )

  // delegating
  // votes need to be delegated before they will be accessible to user
  const delegateTx = await contract.write.delegate([acc1.account.address], {account : acc1.account})
  await publicClient.getTransactionReceipt({hash : delegateTx});
  const votesAfter = await contract.read.getVotes([acc1.account.address]);
  console.log(`Account ${acc1.account.address} has ${votesAfter.toString()} units of voting power after self delegating\n`)

  // transfer
  const transferTx = await contract.write.transfer([acc2.account.address, MINT_VALUE / 2n],
    {account : acc1.account}
  )

  await publicClient.waitForTransactionReceipt({hash : transferTx});

  const votes1AfterTransfer = await contract.read.getVotes([acc1.account.address]);

  console.log(
    `Account: ${acc1.account.address} has ${votes1AfterTransfer.toString()} units of voting power after transfer\n`
  )
  const votes2AfterTransfer = await contract.read.getVotes([
    acc2.account.address,
  ]);
  console.log(
    `Account ${
      acc2.account.address
    } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
  );

  // delegating to acc2
  const delegate2Tx = await contract.write.delegate([acc2.account.address], {account : acc2.account})
  await publicClient.getTransactionReceipt({hash : delegate2Tx});
  const votes2AfterDelegate = await contract.read.getVotes([acc2.account.address]);

  console.log(`Account ${acc2.account.address} has ${votes2AfterDelegate.toString()} units of voting power after delegating\n`)

  const lastBlockNumber = await publicClient.getBlockNumber();
for (let index = lastBlockNumber - 1n; index > 0n; index--) {
const pastVotes = await contract.read.getPastVotes([
acc1.account.address,
index,
]);
console.log(
`Account ${
acc1.account.address
} had ${pastVotes.toString()} units of voting power at block ${index}\n`
);
}

}



async function main() {
  await deployContract();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
