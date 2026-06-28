# frontend-demo Specification Delta

## ADDED Requirements

### Requirement: Frontend demo derives role from the current demo account

The frontend classroom demo MUST use the current demo wallet address and trade data to derive the active role instead of showing every role action as if one wallet could perform all operations.

The demo MUST provide stable classroom accounts for seller, buyer, three arbiters, and viewer. These accounts are mock public addresses only and MUST NOT include private keys, mnemonics, or private RPC secrets.

#### Scenario: Seller sees seller actions

- **GIVEN** the current demo account matches the trade seller
- **WHEN** the user opens the trade detail page
- **THEN** the primary action panel shows seller operations such as `markDelivered()`, `approveRefund()`, and `releaseAfterTimeout()` when allowed by state
- **AND** buyer and arbiter operations are not presented as primary executable actions
- **AND** unavailable non-seller operations are summarized with clear no-permission reasons

#### Scenario: Buyer sees buyer actions

- **GIVEN** the current demo account matches the trade buyer, or the item is still `Created` and the current account is not the seller
- **WHEN** the user opens the trade detail page
- **THEN** the primary action panel shows buyer operations such as `purchaseItem()`, `confirmReceived()`, `requestRefund()`, and `openDispute()` when allowed by state
- **AND** seller-only operations are summarized with clear no-permission reasons

#### Scenario: Arbiter sees arbitration actions

- **GIVEN** the current demo account is one of the active demo arbiters
- **AND** the account is not the trade seller or buyer
- **WHEN** the user opens a disputed trade or the arbitration page
- **THEN** the arbitration action area is derived from that account's arbiter seat
- **AND** voting is allowed only when the account is staked, has not voted, and the dispute is not finalized

#### Scenario: Viewer is read-only

- **GIVEN** the current demo account is a viewer or unrelated address
- **WHEN** the user opens marketplace, trade detail, or arbitration pages
- **THEN** the user can inspect item state, funds flow, timeline, deployment evidence, and event logs
- **AND** business operations are disabled or hidden with clear read-only reasons

### Requirement: Frontend demo includes a separate classroom control panel

The frontend classroom demo MUST provide a separate demo control panel for account switching and scene setup. This panel exists only to make classroom demonstration stable and MUST NOT be presented as a real contract business function.

#### Scenario: Switch demo account

- **GIVEN** the classroom control panel is visible
- **WHEN** the presenter switches from seller to buyer, arbiter, or viewer
- **THEN** the top status bar updates the visible account and role
- **AND** page action panels update according to address-derived permissions
- **AND** existing transaction status feedback remains usable

#### Scenario: Jump to classroom scene

- **GIVEN** the presenter uses the classroom control panel
- **WHEN** they choose a prepared scene such as item created, buyer paid, seller delivered, refund requested, dispute deposit pending, or arbitration voting
- **THEN** the mock trade state, funds explanation, timeline, and event log update consistently
- **AND** the scene setup controls remain visually separate from seller, buyer, and arbiter business buttons

#### Scenario: Demonstrate two-of-three arbitration

- **GIVEN** the mock dispute is in voting state with three demo arbiters
- **WHEN** two arbiters vote for the same side
- **THEN** the dispute finalizes as a 2/3 majority decision
- **AND** a third arbiter visiting afterward sees that the dispute has finalized and voting is disabled
