## ADDED Requirements

### Requirement: Dispute eligible arbiter snapshot for reporting

When a dispute enters `Disputed`, the system SHALL snapshot eligible active arbiters and SHALL use that snapshot for post-resolution reporting eligibility.

#### Scenario: Snapshot arbiters at respondDispute

- **WHEN** the responder pays the dispute deposit and the item enters `Disputed`
- **THEN** the system records all currently active arbiters who are not the buyer or seller into `eligibleArbitersSnapshot`
- **AND** locks each snapshotted arbiter from withdrawing stake until the dispute ends

#### Scenario: Snapshot arbiter cannot withdraw during dispute

- **GIVEN** an arbiter is in `eligibleArbitersSnapshot` for an unresolved dispute
- **AND** the arbiter has not voted
- **WHEN** the arbiter calls `withdrawArbiterStake`
- **THEN** the call reverts with `ArbiterLockedInDispute`

#### Scenario: reportNoVote accepts withdrawn snapshot arbiter after dispute ends

- **GIVEN** a dispute has resolved and the item is `Inactive`
- **AND** a snapshotted arbiter did not vote
- **AND** the arbiter later withdraws stake
- **WHEN** a reporter calls `reportNoVote` for that arbiter
- **THEN** the report is upheld based on vote history
- **AND** the reporter receives the report deposit

### Requirement: reportMisconduct requires resolved dispute

`reportMisconduct` SHALL only accept reports for items with a created and resolved dispute, and the reported address SHALL be in the dispute snapshot or have voted in that dispute.

#### Scenario: Reject misconduct report without dispute

- **GIVEN** an item never entered dispute
- **WHEN** a caller attempts `reportMisconduct` against an arbiter
- **THEN** the call reverts

#### Scenario: Accept misconduct report for snapshot or voter arbiter

- **GIVEN** a dispute was created and resolved
- **AND** the item is `Inactive`
- **WHEN** the reported arbiter is in `eligibleArbitersSnapshot` or voted in that dispute
- **THEN** the system creates a pending misconduct report
