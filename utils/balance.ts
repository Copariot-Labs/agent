import { Aptos } from "@aptos-labs/ts-sdk";

const CONTRACT_ADDRESS = "0x7b6a82f3999a6adf16476a601d678ea549880d786b055c600b5f81794130c89d";

export interface BalanceResult {
  move: number;
  usdt: number;
  weusd: number;
  pipi: number;
}

export async function getBalances(address: string, aptosClient: Aptos): Promise<BalanceResult> {
  try {
    // Get MOVE balance
    const moveResponse = await aptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::faucet::get_move_balance`,
        functionArguments: [address]
      }
    });

    // Get USDT balance
    const usdtResponse = await aptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::faucet::get_usdt_balance`,
        functionArguments: [address]
      }
    });

    // Get WeUSD balance
    const weusdResponse = await aptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::weusd::balance`,
        functionArguments: [address]
      }
    });

    // Get PIPI balance
    const pipiResponse = await aptosClient.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::pipi::balance`,
        functionArguments: [address]
      }
    });

    return {
      move: moveResponse?.[0] ? Number(moveResponse[0]) / 1e8 : 0,
      usdt: usdtResponse?.[0] ? Number(usdtResponse[0]) / 1e6 : 0,
      weusd: weusdResponse?.[0] ? Number(weusdResponse[0]) / 1e6 : 0,
      pipi: pipiResponse?.[0] ? Number(pipiResponse[0]) / 1e6 : 0
    };
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
} 