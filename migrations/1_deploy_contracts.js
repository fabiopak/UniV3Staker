const { BN } = require('@openzeppelin/test-helpers');

var WETH9 = artifacts.require("WETH9");
var TestERC20 = artifacts.require("TestERC20");
var Token1 = artifacts.require("Token1");
var Token2 = artifacts.require("Token2");

var UniV3Staker = artifacts.require("UniswapV3Staker");
var UniV3Factory = artifacts.require("UniswapV3Factory");
var UniV3NFPosManager = artifacts.require("NonfungiblePositionManager");
var UniV3NFTDescriptor= artifacts.require("NFTDescriptor"); //lib
var UniV3NFTPosDescr= artifacts.require("NonfungibleTokenPositionDescriptor");

var my_amount_to_mint = new BN('1000000000000000000000000'); // 1000000 * 1e18

module.exports = async (deployer, network, accounts) => {

  await deployer.deploy(WETH9);
  const wethInst = await WETH9.deployed();

  await deployer.deploy(TestERC20, my_amount_to_mint);
  await deployer.deploy(Token1, my_amount_to_mint);
  await deployer.deploy(Token2, my_amount_to_mint);

  await deployer.deploy(UniV3Factory);
  const uniV3FactoryInst = await UniV3Factory.deployed();

  await deployer.deploy(UniV3NFTDescriptor);
  // const uniV3NFTDescrLibInst = await UniV3NFTDescriptor.deployed();
  await deployer.link(UniV3NFTDescriptor, UniV3NFTPosDescr);
  await deployer.deploy(UniV3NFTPosDescr, wethInst.address);
  const uniV3NFTDescrInst = await UniV3NFTPosDescr.deployed();

  await deployer.deploy(UniV3NFPosManager, uniV3FactoryInst.address, wethInst.address, uniV3NFTDescrInst.address);
  const uniV3NFPosManInst = await UniV3NFPosManager.deployed();
  // const uniV3Factory = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  // const uniV3NFPosManager = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

  const _maxIncentiveStartLeadTime = 10;
  const _maxIncentiveDuration = 86400;

  await deployer.deploy(UniV3Staker, uniV3FactoryInst.address, uniV3NFPosManInst.address, _maxIncentiveStartLeadTime, _maxIncentiveDuration);
};
