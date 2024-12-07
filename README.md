## Citrea Atomic Swaps
This projects implements trustless atomic swaps between Bitcoin and Citrea using BitcoinLightClient.

### Flow 
Say, user A on Citrea wants to get BTC on bitcoin.
- User A will generate a Request on Citrea quoting the amount he desires and locking the funds.
- User B who has funds on Bitcoin and has an opposite intent as User A can fulfill the request.
	- Post the above txn User B can claim the funds from the locking contract trustlessly.
	- The contract here will verify using LightClient and release the funds to user

### Flow chart
![image](https://github.com/user-attachments/assets/7496dbd1-bfe8-461f-9dcd-f077d4cf1694)
