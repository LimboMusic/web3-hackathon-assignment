## ADDED Requirements

### Requirement: Test harness excluded from default compile

The default Hardhat compile path SHALL NOT include `test/contracts/EscrowMarketplaceHarness.sol`. Harness compilation SHALL occur only through the test-specific Hardhat configuration.

#### Scenario: Production compile excludes harness

- **WHEN** a developer runs `npm run compile`
- **THEN** Hardhat compiles only production contracts under `contracts/`
- **AND** artifacts for `EscrowMarketplaceHarness` are not produced

#### Scenario: Test run compiles harness

- **WHEN** a developer runs `npm test`
- **THEN** Hardhat uses the test configuration that includes `EscrowMarketplaceHarness.sol`
- **AND** existing harness-based tests continue to pass
