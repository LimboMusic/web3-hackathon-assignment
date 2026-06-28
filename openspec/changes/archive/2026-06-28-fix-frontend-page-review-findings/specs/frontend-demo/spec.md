# frontend-demo Specification

## MODIFIED Requirements

### Requirement: Frontend demo is multi-page

The frontend demo MUST be organized as a multi-page classroom demo application with Dashboard, Marketplace, Trade Detail, Arbitration, and Deployment views.

Each view MUST implement its OpenSpec page requirements using mock data and GSAP animations before contract integration.

#### Scenario: Open Marketplace

- **GIVEN** a user opens Marketplace
- **WHEN** mock items are displayed
- **THEN** the page supports search, filter, create-item simulation, and purchase simulation with visible feedback
- **AND** newly created items use the connected mock wallet as seller so self-purchase is blocked with a visible guard
- **AND** at least one other-seller Created item remains available for Created→Locked purchase demo

#### Scenario: Marketplace self-purchase guard

- **GIVEN** the mock wallet is connected
- **WHEN** the user creates a new item or views an item they published
- **THEN** the purchase action is disabled with a self-purchase guard message
- **AND** address comparison uses exact full-address or standard short-address matching only

#### Scenario: Open Trade Detail

- **GIVEN** a user opens a trade detail route
- **WHEN** mock trade data is shown
- **THEN** the page demonstrates lifecycle states, role actions, funds flow, and event log without real contract calls
- **AND** seller refund approval and dispute deposit response buttons use contract ABI names `approveRefund()` and `respondDispute()`

#### Scenario: Open Arbitration

- **GIVEN** a user opens Arbitration
- **WHEN** a mock dispute is shown
- **THEN** the page demonstrates staked arbiter voting, 2/3 threshold, and finalized dispute state
