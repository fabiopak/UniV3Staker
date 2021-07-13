const {
  BN,
  constants,
  ether,
  time,
  balance,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');
const {
  expect
} = require('chai');

const timeMachine = require('ganache-time-traveler');

const Web3 = require('web3');
// Ganache UI on 8545
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var WETH9 = artifacts.require("WETH9");
var TestERC20 = artifacts.require("TestERC20");
var Token1 = artifacts.require("Token1");
var Token2 = artifacts.require("Token2");

var UniV3Staker = artifacts.require("UniswapV3Staker");
var UniV3Factory = artifacts.require("UniswapV3Factory");
var UniV3NFPosManager = artifacts.require("NonfungiblePositionManager");
var UniV3NFTDescriptor= artifacts.require("NFTDescriptor"); //Lib
var UniV3NFTPosDescr= artifacts.require("NonfungibleTokenPositionDescriptor");
var UniV3Pool = artifacts.require("UniswapV3Pool");

function MintParams(token0, token1, fee, tickLower, tickUpper, recipient, 
      amount0Desired, amount1Desired, amount0Min, amount1Min, deadline) {
  this.token0 = token0;
  this.token1 = token1;
  this.fee = fee;
  this.tickLower = tickLower;
  this.tickUpper = tickUpper;
  this.recipient = recipient;
  this.amount0Desired = amount0Desired;
  this.amount1Desired = amount1Desired;
  this.amount0Min = amount0Min;
  this.amount1Min = amount1Min;
  this.deadline = deadline;
}

function MintParams2(token0, token1, fee, tickLower, tickUpper, recipient, 
  amount0Desired, amount1Desired, amount0Min, amount1Min, deadline) {
this.token0 = token0;
this.token1 = token1;
this.fee = fee;
this.tickLower = tickLower;
this.tickUpper = tickUpper;
this.recipient = recipient;
this.amount0Desired = amount0Desired;
this.amount1Desired = amount1Desired;
this.amount0Min = amount0Min;
this.amount1Min = amount1Min;
this.deadline = deadline;
}

let uniV3StakerContract, testERC20Contract, t1Contract, t2Contract, uniV3FactoryContract, uniV3NFPosManContract, uniV3NFTPosDescrContract;
let poolContract;

contract("UniV3Staker Test", accounts => {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const tokenOwner = accounts[0]
  const recipients = [accounts[3], accounts[4], accounts[5], accounts[6], accounts[7], accounts[8], accounts[9]]
  
  it('settings', async () => {
    testERC20Contract = await TestERC20.deployed();
    expect(testERC20Contract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(testERC20Contract.address).to.match(/0x[0-9a-fA-F]{40}/);

    t1Contract = await Token1.deployed();
    expect(t1Contract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(t1Contract.address).to.match(/0x[0-9a-fA-F]{40}/);
    t2Contract = await Token2.deployed();
    expect(t2Contract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(t2Contract.address).to.match(/0x[0-9a-fA-F]{40}/);

    uniV3FactoryContract = await UniV3Factory.deployed();
    expect(uniV3FactoryContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(uniV3FactoryContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(uniV3FactoryContract.address)

    uniV3NFPosManContract = await UniV3NFPosManager.deployed();
    expect(uniV3NFPosManContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(uniV3NFPosManContract.address).to.match(/0x[0-9a-fA-F]{40}/);

    uniV3NFTPosDescrContract = await UniV3NFTPosDescr.deployed();
    expect(uniV3NFTPosDescrContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(uniV3NFTPosDescrContract.address).to.match(/0x[0-9a-fA-F]{40}/);

    uniV3StakerContract = await UniV3Staker.deployed();
    expect(uniV3StakerContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(uniV3StakerContract.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("add a pool", async () => {
    // fee: 3000 = 0.3%, max 1000000 = 100%
    res = await uniV3FactoryContract.createPool(t1Contract.address, t2Contract.address, 3000)
    // console.log(res.receipt)
    console.log(res.receipt.logs[0])
    console.log(res.receipt.logs[0].address) // factory
    console.log((res.receipt.logs[0].args.fee).toString())
    console.log((res.receipt.logs[0].args.tickSpacing).toString())
    console.log((res.receipt.logs[0].args.pool).toString()) // pool
    poolAddress = (res.receipt.logs[0].args.pool).toString()
    poolContract = await UniV3Pool.at(poolAddress)
    expect(poolContract.address).to.be.equal(poolAddress)
  });

  it("add liquidity to a pool", async () => {
    // export const MIN_SQRT_RATIO = BigNumber.from('4295128739')
    // export const MAX_SQRT_RATIO = BigNumber.from('1461446703485210103287273052203988822378723970342')
    await poolContract.initialize(new BN('100000000000000000000000000001'));
    res = await poolContract.mint(tokenOwner, 4657, 4658, new BN('100'), "0x7072696d6f");
    console.log(res[0].toString(), res[1].toString());

    //mint from NonfungiblePositionManager when create liquidity
    /* example:
    Function: mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))
    #	Name	Type	Data
    0	params.token0	address	0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
    0	params.token1	address	0xdAC17F958D2ee523a2206206994597C13D831ec7
    0	params.amount0Desired	uint256	999999
    0	params.amount1Desired	uint256	999999
    0	params.amount0Min	uint256	998999
    0	params.amount1Min	uint256	998999
    0	params.recipient	address	0xb7430de9B4D8e5cDB951019d7651cD5fda630498
    0	params.deadline	uint256	1620240160

    Function: mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))
    #	Name	Type	Data
    0	params.token0	address	0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    0	params.token1	address	0xd0A1E359811322d97991E03f863a0C30C2cF029C
    0	params.amount0Desired	uint256	6999999999999999876
    0	params.amount1Desired	uint256	24197552422917931
    0	params.amount0Min	uint256	3159911061172648723
    0	params.amount1Min	uint256	16035864026581399
    0	params.recipient	address	0xc81f5980EA3ABFfe06A3cedB3A68db07469B9390
    0	params.deadline	uint256	1625324516
    */
   /*
    mintParams: {
      token0: string
      token1: string
      fee: FeeAmount
      tickLower: number
      tickUpper: number
      recipient: string
      amount0Desired: any
      amount1Desired: any
      amount0Min: number
      amount1Min: number
      deadline: number
    }*/
    // token0, token1, fee, tickLower, tickUpper, recipient, 
    // amount0Desired, amount1Desired, amount0Min, amount1Min, deadline
    var myMintParams = new MintParams(t1Contract.address, 
      t2Contract.address,
      new BN(3000),
      new BN(4657),
      new BN(4657),
      poolContract.address,
      new BN(999999),
      new BN(999999),
      new BN(998999),
      new BN(998999),
      web3.eth.getBlock("latest").timestamp + 10)
    
    token0 = (t1Contract.address); //.toString();
    token1 = (t2Contract.address); //.toString();
    feeAmount = new BN("3000");
    tick = new BN("4657");
    amountDes = new BN("999999");
    amounMin = new BN("998999");

    let block = await web3.eth.getBlockNumber();
    // console.log((await web3.eth.getBlock(block)).timestamp)
    timeMint = ((await web3.eth.getBlock(block)).timestamp) + 10;

    console.log(token0, token1, feeAmount, tick, amountDes, amounMin, timeMint)

    await uniV3NFPosManContract.mint(
        {
          token0: token0,
          token1: token1,
          fee: feeAmount,
          tickLower: tick,
          tickUpper: tick,
          recipient: tokenOwner,
          amount0Desired: amountDes,
          amount1Desired: amountDes,
          amount0Min: amounMin,
          amount1Min: amounMin,
          deadline: timeMint
        }
    )
    //increaseLiquidity from NonfungiblePositionManager when change liquidity
  });

});