import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"

// 创建单例配置
export const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://mainnet.movementnetwork.xyz/v1',
  faucet: 'https://faucet.testnet.bardock.movementnetwork.xyz/'
})

export const aptos = new Aptos(config)

// 合约地址
export const CONTRACT_ADDRESS = "0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d"

// 定义函数路径类型
type ContractFunction = `${typeof CONTRACT_ADDRESS}::${string}::${string}`

// 合约函数
export const CONTRACT_FUNCTIONS: Record<string, ContractFunction> = {
  // Balance functions
  GET_MOVE_BALANCE: `${CONTRACT_ADDRESS}::faucet::get_move_balance`,
  GET_USDT_BALANCE: `${CONTRACT_ADDRESS}::faucet::get_usdt_balance`,
  GET_WEUSD_BALANCE: `${CONTRACT_ADDRESS}::weusd::balance`,
  GET_PIPI_BALANCE: `${CONTRACT_ADDRESS}::pipi::balance`,
  
  // Operation functions
  MINT_WEUSD: `${CONTRACT_ADDRESS}::weusd_operations::mintWeUSD`,
  REDEEM_WEUSD: `${CONTRACT_ADDRESS}::weusd_operations::redeemWeUSD`,
  
  // Faucet functions
  CLAIM_MOVE: `${CONTRACT_ADDRESS}::faucet::claim_move`,
  CLAIM_USDT: `${CONTRACT_ADDRESS}::faucet::claim_usdt`
} 