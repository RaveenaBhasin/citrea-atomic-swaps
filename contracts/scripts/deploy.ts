import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { abi as contractABI, bytecode } from '../out/AtomicSwap.sol/AtomicSwap.json'
import { config } from 'dotenv'
import { mainnet} from 'viem/chains'

config();

const private_key = process.env.PRIVATE_KEY as string;
if (!private_key) {
  throw new Error('PRIVATE_KEY is not set')
}
const contractBytecode = `0x${bytecode.object}` as const

async function deployContract() {

  const deployer_account = privateKeyToAccount(private_key as `0x${string}`)

  const chain = {
    id: 5115,
    name: 'Citrea Testnet',
    network: 'citrea-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Citrea Bitcoin',
      symbol: 'cBTC',
    },
    rpcUrls: {
      default: { http: ['https://rpc.testnet.citrea.xyz'] },
      public: { http: ['https://rpc.testnet.citrea.xyz'] },
    },
  }

  const public_client = createPublicClient({
    chain,
    transport: http("https://rpc.testnet.citrea.xyz")
  })

  const wallet_client = createWalletClient({
    account: deployer_account,
    chain,
    transport: http("https://rpc.testnet.citrea.xyz")
  })

  console.log("Here")

  try {
    const hash = await wallet_client.deployContract({
      abi: contractABI,
      bytecode: contractBytecode,
      args: [],
    })

    console.log('Transaction hash:', hash)

    const transaction = await public_client.waitForTransactionReceipt({
      hash
    })

    console.log('Contract deployed at address:', transaction.contractAddress)

  } catch (error) {
    console.error('Deployment failed:', error)
  }
}

deployContract()

