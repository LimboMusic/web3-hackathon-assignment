# frontend-demo Specification

## MODIFIED Requirements

### Requirement: Frontend demo is multi-page

The frontend demo MUST be organized as a multi-page classroom demo application with Dashboard, Marketplace, Trade Detail, Arbitration, and Deployment views.

Each view MUST implement its OpenSpec page requirements using mock data and GSAP animations before contract integration.

#### Scenario: Open Trade Detail

- **GIVEN** a user opens a trade detail route for a marketplace item id
- **WHEN** mock trade data is shown
- **THEN** the page demonstrates lifecycle states, role actions, funds flow, and event log without real contract calls
- **AND** seller refund approval and dispute deposit response buttons use contract ABI names `approveRefund()` and `respondDispute()`
- **AND** title, price, seller, state, and metadataHash match the corresponding Marketplace item for that id

#### Scenario: Marketplace purchase syncs to Trade Detail

- **GIVEN** a user purchases a Created marketplace item on Marketplace
- **WHEN** the user navigates to `/trade/:id` for that item
- **THEN** the trade detail initial state is Locked
- **AND** the initial event log includes ItemPurchased

#### Scenario: Newly created item trade detail

- **GIVEN** a user creates a new marketplace item while connected
- **WHEN** the user opens the trade detail route for that item id
- **THEN** the detail page shows the newly created item fields instead of a default placeholder order

#### Scenario: Disputed seed events are consistent

- **GIVEN** a seed item is in Disputed state on Marketplace
- **WHEN** the user opens its trade detail route
- **THEN** the initial event log does not include DisputeResolved
- **AND** DisputeResolved appears only when the trade state is Inactive after arbitration resolution
