pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    //this is the function that only run once when the smart contract is deployed on the blockchain network
    //pass in the dapp token address and dai token address into the function
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }

    //1. stake tokens (deposit cryptocurrency)
    function stakeTokens(uint _amount) public {
        //what we need to do here is
        //we take the investor DAI token
        //we transfer into out liquidity pool in the tokenfarm
        
        //transfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //add user to the stakers array "only" if they haven't stake already
        //why don't we just run a check on the mapping/array? 
        //for loop on the stakingBalance mapping is slow
        //for loop on the stakers array is slow? because solidity do not have the contains method
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
    //2. unstaking tokens (withdraw cryptocurrency)
    //3. Issuing tokens
    function issueTokan() public {
        for(uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            //if they deposit one DAI we give them one DAPP token
            if(balance)
            dappToken.transfer(receipient,balance);

        }
    }
}