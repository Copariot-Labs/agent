import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"

// Create a singleton configuration
export const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://mainnet.movementnetwork.xyz/v1',
  faucet: 'https://faucet.testnet.bardock.movementnetwork.xyz/'
})

export const aptos = new Aptos(config)

// Contract address
export const CONTRACT_ADDRESS = "0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d"

// Define the type of contract function path
type ContractFunction = `${typeof CONTRACT_ADDRESS}::${string}::${string}`

// Contract functions
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