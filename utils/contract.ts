import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"

// 创建单例配置
export const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
  faucet: 'https://fund.testnet.porto.movementlabs.xyz/'
})

export const aptos = new Aptos(config)

// 合约地址
export const CONTRACT_ADDRESS = "0x7b6a82f3999a6adf16476a601d678ea549880d786b055c600b5f81794130c89d"

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