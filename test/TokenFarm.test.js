//we use mocha and chai testing library in javascript

//const { assert } = require('console');

//mocha and chai is javascript testing library
const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm;

    before(async () =>{
        //load contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        //transfer all DappToken to token farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));
        // console.log(tokens('1000000'));

        //transfer some tokens to investors
        //what is investor and owner here?
        await daiToken.transfer(investor, tokens('100'), { from: owner });
    })

    //write tests here...
    describe('Mock DAI deployment', async () => {
        //this is 'it' not 'if'
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token')
        });
    })

    describe('Dapp Token deployment', async () => {
        //this is 'it' not 'if'
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token')
        });
    })

    describe('Token Farm deployment', async () => {
        it('has a name',  async () =>{
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm');
        });

        it('contracts has tokens', async () =>{
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'));
        });
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let resultBefore;
            let resultAfter;
            let resultStakingBalance;
            let isStaking;

            let result;
            //check investor balance before staking
            resultBefore = await daiToken.balanceOf(investor);
            assert.equal(resultBefore.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking');

            //stake the Mock DAI token
            //we cannot directly spend the investor token using the token farm
            //if we want to call another contract to spend token for us
            //we need to first approve the tokenfarm to spend the token for use firt
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor });
            await tokenFarm.stakeTokens(tokens('100'), { from: investor });

            //check the result after staking
            resultAfter = await daiToken.balanceOf(investor);
            assert.equal(resultAfter.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

            //make sure staking balance is correct based on the address in the token farm
            resultStakingBalance = await tokenFarm.stakingBalance(investor);
            assert.equal(resultStakingBalance.toString(), tokens('100'), 'investor staking balance correct after staking');

            //check investor is staking
            isStaking = await tokenFarm.isStaking(investor);
            assert.equal(isStaking.toString(), 'true', 'investor is staking');

            //Issue Tokens
            await tokenFarm.issueTokens({ from : owner });

            //check balances after issuance
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor DApp token wallet balance correct after issuance');

            //ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            //unstake tokens
            await tokenFarm.unStakeTokens({ from: investor });

            //check result after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after unstaking');
 
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI wallet balance correct after unstaking');
 
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking');
 
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor staking status correct after unstaking');
 

        })
    })
})
