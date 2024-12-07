curl -sSL "https://mempool.space/testnet4/api/tx/7466680a018b0e81d736788858b819ef204e72287b238eda04257cc33352ed3b" | jq >getTransaction.json
curl -sSL "https://mempool.space/testnet4/api/tx/7466680a018b0e81d736788858b819ef204e72287b238eda04257cc33352ed3b/raw" >getRawTransaction.txt
curl -sSL "https://mempool.space/testnet4/api/tx/7466680a018b0e81d736788858b819ef204e72287b238eda04257cc33352ed3b/hex" >getRawTransaction_InHex.txt
curl -sSL "https://mempool.space/testnet4/api/block/000000000e307b0c67b2fbdec927d4ea8afb288b5099ad5a6d107c123deb7c1f/txids" | jq >allTransation.json
curl -sSL "https://mempool.space/testnet4/api/tx/7466680a018b0e81d736788858b819ef204e72287b238eda04257cc33352ed3b/merkleblock-proof" >merkleproof.txt

# https://learnmeabitcoin.com/technical/transaction/witness/
