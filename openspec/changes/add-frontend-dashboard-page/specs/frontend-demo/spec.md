# frontend-demo Specification

## ADDED Requirements

### Requirement: Dashboard page presents the classroom control overview

The frontend demo MUST provide a Dashboard page that serves as the first-screen classroom control overview instead of a marketing landing page.

The Dashboard implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed mock data.

#### Scenario: Open Dashboard

- **GIVEN** a user opens the frontend demo
- **WHEN** the Dashboard page is displayed
- **THEN** the page shows wallet status, network status, transaction status, current demo trade snapshot, lifecycle timeline, and recent event log
- **AND** the first viewport communicates an operational escrow dashboard

#### Scenario: Simulate transaction status

- **GIVEN** the Dashboard page is using mock data
- **WHEN** the user triggers a demo action
- **THEN** the page shows a visible pending state
- **AND** it can transition to success or failed feedback without requiring real contract integration
