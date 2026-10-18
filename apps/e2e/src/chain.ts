import { custom, type Transport } from 'viem'

const hex = (n: number | bigint) => `0x${n.toString(16)}`

/**
 * A fake RPC node, so the tests never depend on a public endpoint: every read the panel makes
 * (balance, block, gas) gets a fixed answer.
 */
export function fakeChain(chainId: number): Transport {
  const block = {
    number: hex(100),
    hash: `0x${'ab'.repeat(32)}`,
    parentHash: `0x${'cd'.repeat(32)}`,
    timestamp: hex(1_760_000_000),
    baseFeePerGas: hex(1_000_000_000),
    gasLimit: hex(30_000_000),
    gasUsed: hex(1_000_000),
    miner: `0x${'00'.repeat(20)}`,
    transactions: [],
  }
  return custom({
    async request({ method }: { method: string }) {
      switch (method) {
        case 'eth_chainId':
          return hex(chainId)
        case 'eth_blockNumber':
          return block.number
        case 'eth_getBlockByNumber':
          return block
        case 'eth_getBalance':
          return hex(1_250_000_000_000_000_000n) // 1.25
        case 'eth_gasPrice':
        case 'eth_maxPriorityFeePerGas':
          return hex(1_000_000_000)
        case 'eth_feeHistory':
          return { oldestBlock: block.number, baseFeePerGas: [block.baseFeePerGas, block.baseFeePerGas], gasUsedRatio: [0.5], reward: [[hex(1_000_000_000)]] }
        default:
          return null
      }
    },
  })
}
