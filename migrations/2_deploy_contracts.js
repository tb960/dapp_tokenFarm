const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    await deployer.deploy(TokenFarm, daiToken.address, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();
    //because we want to make an application that can reward user some Dapp token when
    //they put their currency inside our application, we need to first transfer all our
    //dapp token into the liquidity pool which is the token farm
    //but before doing this transfer, we need to make sure our dappToken have some gas to do the transfer
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    //then we want the investor to be able to deposit some Dai token into our app
    //we want them to have some dai token to commit to our application
    //so we just give the investor some dai
    await daiToken.transfer(accounts[1], '1000000000000000000000000');
};

