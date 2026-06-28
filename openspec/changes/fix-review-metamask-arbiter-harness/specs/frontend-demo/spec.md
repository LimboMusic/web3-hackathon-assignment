## ADDED Requirements

### Requirement: Frontend connects MetaMask with Ethers read layer

The frontend SHALL integrate `ethers` and `window.ethereum` for wallet connection and SHALL read the Sepolia deployment from `deployments/sepolia/EscrowMarketplace.json` for contract address and ABI.

#### Scenario: Connect live wallet

- **GIVEN** `window.ethereum` is available
- **WHEN** the user clicks connect wallet
- **THEN** the app requests accounts via `eth_requestAccounts`
- **AND** displays the connected address and chainId from the provider
- **AND** sets `walletMode` to `live`

#### Scenario: Read contract basics on Sepolia

- **GIVEN** the wallet is connected on Sepolia (`chainId` 11155111)
- **WHEN** the read layer initializes
- **THEN** the app reads `deliveryWindow`, `confirmWindow`, `nextItemId`, and `activeArbiterCount` from the deployed contract
- **AND** surfaces read errors without breaking mock demo flows

#### Scenario: Mock fallback when injector unavailable

- **GIVEN** `window.ethereum` is unavailable or the user uses the demo control panel account switcher
- **WHEN** the wallet connects in mock mode
- **THEN** the app preserves existing classroom mock account behavior
- **AND** `walletMode` is `mock`
- **AND** the UI clearly labels mock mode versus live wallet mode

#### Scenario: Top status bar shows wallet mode

- **GIVEN** any wallet connection state
- **WHEN** the top status bar renders
- **THEN** it shows either a live-wallet badge or a classroom-mock badge
- **AND** live mode shows network name or chainId and warns on wrong network
