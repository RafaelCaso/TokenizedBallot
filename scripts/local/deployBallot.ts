import {viem} from "hardhat";
import {toHex, hexToString} from "viem";

const PROP_NAMES = ["proposition 1" , "proposition 2", "proposition 3"];


async function main() {
  const publicClient = await viem.getPublicClient();
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const token = await viem.deployContract("JamToken");
  const contract = await viem.deployContract("TokenizedBallot", [PROP_NAMES.map((prop) => toHex(prop, { size: 32 })), token.address, 0]);

  const mintToAcc1Tx = await token.write.mint([acc1.account.address, 1500n])
  const mint1Receipt = await publicClient.waitForTransactionReceipt({ hash: mintToAcc1Tx });

  const mintToAcc2Tx = await token.write.mint([acc2.account.address, 2000n])

  const mint2Receipt = await publicClient.waitForTransactionReceipt({hash : mintToAcc2Tx})

  const acc1DelegateTx = await token.write.delegate([acc1.account.address], { account: acc1.account })

  const acc2DelegateTx = await token.write.delegate([acc2.account.address], {account : acc2.account})

  const acc1Balance = await token.read.getVotes([acc1.account.address])

  const acc2Balance = await token.read.getVotes([acc2.account.address])

  const votesCast = await contract.read.votesCast([acc1.account.address])
 
  console.log(votesCast)
  console.log(acc1Balance.toString())

  const acc1Vote = await contract.write.vote([0, acc1Balance], { account: acc1.account })

  const acc2Vote = await contract.write.vote([1, acc2Balance], {account : acc2.account})


  const acc2VotesCast = await contract.read.votesCast([acc2.account.address])

  console.log(acc2VotesCast.toString())

  const votesCast2 = await contract.read.votesCast([acc1.account.address])
  console.log(votesCast2.toString())

  // making sure voting twice doesn't add additional votes
  const acc1Vote2 = await contract.write.vote([0, acc1Balance], { account: acc1.account })
  const votesCast3 = await contract.read.votesCast([acc1.account.address])
  console.log(votesCast3.toString())

  //check results
  const check1 = await contract.read.winnerName();
  console.log(hexToString(check1))

  const lastBlockNumber = await publicClient.getBlockNumber();
  for (let index = lastBlockNumber - 1n; index > 0n; index--) {
  const pastVotes = await token.read.getPastVotes([
  acc2.account.address,
  index,
  ]);
  console.log(
  `Account ${
  acc1.account.address
  } had ${pastVotes.toString()} units of voting power at block ${index}\n`
  );
  }
  
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});