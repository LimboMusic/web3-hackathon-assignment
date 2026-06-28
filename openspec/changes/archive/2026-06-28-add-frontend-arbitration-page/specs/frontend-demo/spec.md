# frontend-demo Specification

## ADDED Requirements

### Requirement: Arbitration page demonstrates staked arbiter voting

The frontend demo MUST provide an Arbitration page that demonstrates staked arbiter voting, 2/3 threshold progress, and final dispute resolution using mock data.

The Arbitration implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed arbiter/vote data.

Arbitration animations MUST use GSAP. If a GSAP skill is available in the Codex environment, the implementation MUST load it before writing animation code.

#### Scenario: Display arbitration case

- **GIVEN** the user opens Arbitration
- **WHEN** a mock dispute is displayed
- **THEN** the page shows evidence summary, deposit status, vote counts, threshold, arbiter seats, and arbitration logs

#### Scenario: Simulate arbiter vote

- **GIVEN** an eligible mock arbiter has not voted
- **WHEN** the user submits a mock buyer-supporting or seller-supporting vote
- **THEN** the vote count updates
- **AND** the arbiter is marked as voted

#### Scenario: Reach final threshold

- **GIVEN** mock votes reach the 2/3 threshold
- **WHEN** the page computes the result
- **THEN** the dispute is marked finalized
- **AND** further voting is disabled

#### Scenario: Animate vote progress with GSAP

- **GIVEN** a mock arbiter vote changes the tally
- **WHEN** vote counts or threshold status update
- **THEN** GSAP animations highlight the changed tally, arbiter row, and final verdict when applicable
- **AND** the animation does not obscure the evidence summary or arbitration logs
