# frontend-demo Specification

## ADDED Requirements

### Requirement: Trade Detail page demonstrates a single escrow trade lifecycle

The frontend demo MUST provide a Trade Detail page that demonstrates one escrow trade lifecycle with role-specific actions and state-dependent controls.

The Trade Detail implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed trade state.

Trade Detail animations MUST use GSAP. If a GSAP skill is available in the Codex environment, the implementation MUST load it before writing animation code.

#### Scenario: Display trade lifecycle

- **GIVEN** the user opens a trade detail page
- **WHEN** mock trade data is displayed
- **THEN** the page shows trade summary, escrow funds, role panels, lifecycle timeline, and event log
- **AND** the state names match the smart contract state model

#### Scenario: State controls disable invalid actions

- **GIVEN** the mock trade is in a specific state
- **WHEN** an action is not valid for that state or role
- **THEN** the relevant button is disabled or explains why the action is unavailable

#### Scenario: Demonstrate refund and dispute entry

- **GIVEN** the mock trade is locked or delivered
- **WHEN** the user simulates refund or dispute actions
- **THEN** the page updates the status, funds explanation, and event log without requiring real contract calls

#### Scenario: Animate lifecycle transitions with GSAP

- **GIVEN** the mock trade lifecycle state changes
- **WHEN** timeline, funds, or event log UI updates
- **THEN** GSAP animations highlight the changed state
- **AND** primary role actions remain readable and clickable
