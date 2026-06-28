# frontend-demo Specification

## ADDED Requirements

### Requirement: Marketplace page supports mock listing and purchase flows

The frontend demo MUST provide a Marketplace page that presents tradable item cards, filtering, and a create-item form using mock data before contract integration.

The Marketplace implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed item data.

Marketplace animations MUST use GSAP. If a GSAP skill is available in the Codex environment, the implementation MUST load it before writing animation code.

#### Scenario: Browse items

- **GIVEN** the user opens Marketplace
- **WHEN** mock items are loaded
- **THEN** the page displays item cards with item ID, title, price, seller summary, state label, and action button
- **AND** the user can filter or search the visible mock items

#### Scenario: Simulate creating an item

- **GIVEN** the user fills the create-item form with valid mock data
- **WHEN** the form is submitted
- **THEN** the page shows pending and success feedback
- **AND** an `ItemCreated`-style event is added to the page feedback

#### Scenario: Simulate purchasing an item

- **GIVEN** a mock item is in `Created` state
- **WHEN** the user clicks purchase
- **THEN** the page shows that funds entered escrow
- **AND** the mock item state changes to `Locked`

#### Scenario: Animate marketplace updates with GSAP

- **GIVEN** mock items are loaded, filtered, created, or purchased
- **WHEN** the visible item list or status labels change
- **THEN** GSAP animations provide short visual feedback
- **AND** the animations do not interrupt search, form input, or purchase actions
