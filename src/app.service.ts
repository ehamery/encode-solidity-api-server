/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
// import ethers from 'ethers'; // does not work
import * as tokenJson from './assets/MyTokenVotes.json';
// import tokenJson from './assets/MyTokenVotes.json';
import { ConfigService } from '@nestjs/config';
import { MintTokenDto } from './dtos/MintTokenDto.dto';

@Injectable()
export class AppService {
  private configService: ConfigService;
  contract: ethers.Contract;
  provider: ethers.Provider;
  wallet: ethers.Wallet;

  // constructor() {
  // constructor(private configService: ConfigService) {}
  // constructor(private configService: ConfigService) {
  constructor(configService: ConfigService) {
    this.configService = configService;

    this.provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('RPC_ENDPOINT_URL'),
    );
    this.wallet = new ethers.Wallet(
      this.configService.get<string>('PRIVATE_KEY'),
      this.provider,
    );
    this.contract = new ethers.Contract(
      this.configService.get<string>('TOKEN_ADDRESS'),
      tokenJson.abi,
      this.wallet,
    );
  }

  /*
  getHello(): string {
    return 'Hello World!';
  }

  getSomethingElse(): string {
    return 'Something else!';
  }
  */

  getContractAddress1(): string {
    return '0xfec09E5b686707D8B4409D72C2383c99E528942D';
  }
  async getContractAddress2(): Promise<string> {
    return this.configService.get<string>('TOKEN_ADDRESS');
  }
  async getContractAddress(): Promise<string> {
    const address = await this.contract.getAddress();
    return address;
  }

  async getTokenName1(): Promise<string> {
    const provider = ethers.getDefaultProvider('sepolia');
    const contract = new ethers.Contract(
      '0xfec09E5b686707D8B4409D72C2383c99E528942D',
      tokenJson.abi,
      provider,
    );
    const name = await contract.name();
    return name;
  }
  async getTokenName2(): Promise<string> {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL);
    const contract = new ethers.Contract(
      process.env.TOKEN_ADDRESS,
      tokenJson.abi,
      provider,
    );
    const name = await contract.name();
    return name;
  }
  async getTokenName3(): Promise<string> {
    const provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('RPC_ENDPOINT_URL'),
    );
    const contract = new ethers.Contract(
      this.configService.get<string>('TOKEN_ADDRESS'),
      tokenJson.abi,
      provider,
    );
    const name = await contract.name();
    return name;
  }

  async getTokenName(): Promise<string> {
    const name = await this.contract.name();
    return name;
  }

  async getTotalSupply(): Promise<string> {
    const totalSupply = await this.contract.totalSupply();
    return ethers.formatUnits(totalSupply);
  }

  async getTokenBalance(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address);
    return ethers.formatUnits(balance);
  }

  async getTransactionReceipt(
    hash: string,
  ): Promise<ethers.TransactionResponse> {
    const transactionReceipt = await this.provider.getTransaction(hash);
    return transactionReceipt;
  }

  getServerWalletAddress(): string {
    return this.wallet.address;
  }

  /*
    // what was that???
    const { contract } = this;
    const addrFinal = addr || this.wallet.getAddress();
    const { keccak256, toUtf8Bytes } = ethers;
    const roleUtf8 = toUtf8Bytes('MINTER_ROLE');
    const roleHash = keccak256(roleUtf8);
    const minterRole = roleHash; // '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
    const hasRole = await contract.hasRole(minterRole, addrFinal);
    return hasRole;
  */
  // TODO we should always catch exception and return an error
  async checkMinterRole(address: string) {
    // const minterRole = await this.contract.MINTER_ROLE();
    // '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
    const minterRole = getRolefromString('MINTER_ROLE');
    console.log(`minterRole: ${minterRole}`);
    // hasRole in definded in the IAccessControl interce:
    // https://docs.openzeppelin.com/contracts/4.x/api/access#IAccessControl
    // there not all contract have that function and we will get an exception
    // if it does not.
    let hasRole = false;
    try {
      hasRole = await this.contract.hasRole(minterRole, address);
    } catch (error) {
      console.error('error', error);
    }
    return hasRole;
  }

  // async mintTokens(address: string, passord: string): Promise<boolean> {
  // eslint-disable-next-line prettier/prettier
  async mintTokens({ recipientAddress, amount, password }: MintTokenDto): Promise<boolean> {
    // TODO nestjs must a authentication modules better than just a passport
    if (password !== this.configService.get<string>('MINT_PASSWORD')) {
      console.error('you are not allowed to mint');
      return false;
    }

    if (!ethers.isAddress(recipientAddress)) {
      console.error(`'${recipientAddress}' is not a valid address`);
      return false;
    }

    let success = false;
    try {
      const tokensBigInt = ethers.parseUnits(amount);

      console.log(`minting ${amount} MTKV to account '${recipientAddress}'...`);
      // eslint-disable-next-line prettier/prettier
      const mintTransaction = await this.contract.mint(recipientAddress, tokensBigInt);
      const mintReceipt = await mintTransaction.wait();
      console.log(`...tokens minted`);
      success = true;
    } catch (error) {
      console.error('error:', error);
    }
    return true;
  }
}

/**
 * @param role
 * @returns hash
 */
// function getRolefromString(role: string): string {
function getRolefromString(role: string): string {
  const roleUtf8 = ethers.toUtf8Bytes(role);
  const roleHash = ethers.keccak256(roleUtf8);
  return roleHash;
}
