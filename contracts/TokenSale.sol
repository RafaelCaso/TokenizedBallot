// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import {JamToken} from "./JamToken.sol";
import {JamNFT} from "./JamNFT.sol";

contract TokenSale {
  uint256 public ratio;
  uint256 public price;
  JamToken public paymentToken;
  JamNFT public nftContract; 

  constructor(
    uint _ratio,
    uint _price, 
    JamToken _paymentToken,
    JamNFT _nftContract
    ) {
    ratio = _ratio;
    price = _price;
    paymentToken = _paymentToken;
    nftContract = _nftContract;
  }

  function buyTokens() external payable {
    paymentToken.mint(msg.sender, msg.value * ratio);
  }

  function returnTokens(uint256 amount) external {
    // burning tokens - transfer from person calling to address(0) (this is called burning)
    paymentToken.burnFrom(msg.sender, amount);
    payable(msg.sender).transfer(amount / ratio);
  }
}
