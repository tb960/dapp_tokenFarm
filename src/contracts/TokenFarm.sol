pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";

    address public owner;
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
        owner = msg.sender;
    }

    //1. stake tokens (deposit cryptocurrency)
    function stakeTokens(uint _amount) public {
        //what we need to do here is
        //we take the investor DAI token
        //we transfer into out liquidity pool in the tokenfarm
        
        //first we need to make sure when the person staking their token
        //the person staking token more than 0
        require(_amount > 0, 'amount cannot be 0');
        
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
    function unStakeTokens() public {
        //Fetch staking balance
        uint balance = stakingBalance[msg.sender];
        
        //require the amount greater than 0 in the staking balance
        require(balance>0, "staking balance cannot be 0");
        
        //Transfer Mock Dai tokens back to the stakers who want to unstake based on their balance in the toknfarm
        daiToken.transfer(msg.sender, balance);

        //reset staking balance
        stakingBalance[msg.sender] = 0;

        //set their staking balance to false
        isStaking[msg.sender] = false;
    }


    //3. Issuing tokens
    function issueTokens() public {
        //make this issueToken only accessible by the owner of this contract
        require(msg.sender == owner, 'caller must be the owner');
        for(uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            //if they deposit one DAI we give them one DAPP token
            //here come the problem, we already transfer all of the dapp token to the 
            //token farm from the contract deployment,
            //how the hell here we get the dappToken and transfer to the receipient account again?
            //where do we specify the transferring address which is the tokenFarm?
            //ok if you see inside the DappToken code, we actually huse the msg.sender method
            //where whoever that call this function which is the tokenFarm now will be the msg.sender
            //then this msg.sender will be the address use for transferring
            //then the recipient address is only needed
            //we can also use the transferFrom function inside the DappToken
            if(balance > 0){
                dappToken.transfer(recipient,balance);
            }

        }
    }
}