import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi, bytecode } from "../artifacts/contracts/JamToken.sol/JamToken.json";

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const interactingWallet = process.env.PRIVATE_KEY || "";
const JAMTOKEN_ADDRESS = "0x112cf1066d951795548b147712fae0859080affa";
const TOKENIZED_BALLOT_ADDRESS = "0xf4b8d17bde27a99e1602ecbb42c39bfd544168fc";
const ADRIAN_ADDRESS = "0xd1B41bE30F980315b8A6b754754aAa299C7abea2";
const ANDREW_ADDRESS = "0x0C78fFc44616f624015366E06cbD707D4D7625a0";

async function mintTo(recipient: string, amount: number) {
  const account = privateKeyToAccount(`0x${interactingWallet}`);
  const interactor = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const mintTx = await interactor.writeContract({
    address: JAMTOKEN_ADDRESS,
    abi,
    functionName: "mint",
    args: [recipient, BigInt(amount)],
  })

  console.log("Transaction hash:", mintTx);
}

async function delegate() {

  const account = privateKeyToAccount(`0x${interactingWallet}`);
  const interactor = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const mintTx = await interactor.writeContract({
    address: JAMTOKEN_ADDRESS,
    abi,
    functionName: "delegate",
    args: [interactor.account.address],
  })

  console.log("Transaction hash:", mintTx);
}
//1. Mint tokens to self
//2. Mint tokens to Adrian
//3. Give minting rights to Adrian

//4. Adrian mints token to Andrew
//5. Check Voting power of each
//6. Andrew votes
//7. Adrian votes
//8. Check winner

const AMOUNT_TO_SEND = 20000;

// mintTo(ADRIAN_ADDRESS, AMOUNT_TO_SEND).catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

delegate()