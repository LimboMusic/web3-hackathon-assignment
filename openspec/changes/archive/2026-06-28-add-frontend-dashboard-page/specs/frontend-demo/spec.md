# frontend-demo Specification

## ADDED Requirements

### Requirement: Dashboard page presents the classroom control overview

The frontend demo MUST provide a Dashboard page that serves as the first-screen classroom control overview instead of a marketing landing page.

The Dashboard implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed mock data.

Dashboard animations MUST use GSAP. If a GSAP skill is available in the Codex environment, the implementation MUST load it before writing animation code.

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

#### Scenario: Animate dashboard elements with GSAP

- **GIVEN** the Dashboard page is rendered
- **WHEN** entry or transaction feedback animations run
- **THEN** the animations are implemented through `gsap`
- **AND** they do not cause text overlap, layout shift, or delayed access to primary controls
- **AND** reduced-motion preferences are respected
