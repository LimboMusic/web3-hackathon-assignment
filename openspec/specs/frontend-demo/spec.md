# frontend-demo Specification

## Purpose

定义课堂演示前端 Demo 的实现约束，要求使用 React + TypeScript + Vite，以 Obsidian UI 设计稿为视觉与信息架构基准，并以多页面结构组织 Dashboard、交易市场、交易详情、仲裁中心与部署演示视图。

## Requirements

### Requirement: Frontend implementation follows UI design drafts

Before implementing the frontend demo skeleton or contract integration, the implementation MUST read and follow the HTML design drafts under `ObsidianVault/02-方案设计/UI设计稿/`.

#### Scenario: Build frontend skeleton

- **GIVEN** an agent starts `add-frontend-demo`
- **WHEN** it prepares the React + TypeScript + Vite frontend structure
- **THEN** it first reads the existing HTML drafts in `ObsidianVault/02-方案设计/UI设计稿/`
- **AND** it uses those drafts as the baseline for navigation, layout, visual style, state labels, cards, logs, and responsive behavior

#### Scenario: Integrate frontend with contract

- **GIVEN** an agent starts `integrate-frontend-contract`
- **WHEN** it wires Ethers.js, MetaMask, ABI, addresses, events, and role checks
- **THEN** it maps those behaviors into the pages defined by the UI design drafts
- **AND** it preserves pending, success, failed, disabled, and error states required for classroom demonstration

### Requirement: Frontend demo is multi-page

The frontend demo MUST be organized as a multi-page classroom demo application with Dashboard, Marketplace, Trade Detail, Arbitration, and Deployment views.

Each view MUST implement its OpenSpec page requirements using mock data and GSAP animations before contract integration.

#### Scenario: Missing design draft page

- **GIVEN** one of the target views does not yet have a corresponding HTML draft
- **WHEN** the frontend skeleton is implemented
- **THEN** the missing view is still created
- **AND** it reuses the same sidebar, top status bar, card system, button styling, status labels, event log treatment, and spacing rules from the existing drafts

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

### Requirement: Frontend demo uses React TypeScript Vite

The frontend demo MUST be implemented with React + TypeScript + Vite.

The frontend routing MUST work when the built assets are served as static files without server-side fallback rewrites.

#### Scenario: Scaffold frontend project

- **GIVEN** an agent creates or updates the `frontend/` project
- **WHEN** it chooses the framework and template
- **THEN** it uses React + TypeScript + Vite
- **AND** page and component files use `.tsx` where they contain JSX
- **AND** shared demo data types are represented with TypeScript types or interfaces

#### Scenario: Refresh nested demo route on static hosting

- **GIVEN** the frontend demo is built and deployed as static files
- **WHEN** a user refreshes a nested route such as `/marketplace` or `/trade/1`
- **THEN** the application still loads the correct page
- **AND** the five-page navigation continues to work

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

#### Scenario: Block self-purchase on own listings

- **GIVEN** the mock wallet is connected and the user views or creates their own listing
- **WHEN** the item is in `Created` state
- **THEN** the purchase action is disabled with a self-purchase guard message
- **AND** address comparison uses exact full-address or standard short-address matching only

#### Scenario: Animate marketplace updates with GSAP

- **GIVEN** mock items are loaded, filtered, created, or purchased
- **WHEN** the visible item list or status labels change
- **THEN** GSAP animations provide short visual feedback
- **AND** the animations do not interrupt search, form input, or purchase actions

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

### Requirement: Deployment page presents Sepolia deployment evidence

The frontend demo MUST provide a Deployment page that presents Sepolia deployment evidence, constructor parameters, and classroom demo account roles.

The Deployment implementation MUST use React + TypeScript + Vite conventions, including `.tsx` components and typed deployment data.

Deployment animations MUST use GSAP. If a GSAP skill is available in the Codex environment, the implementation MUST load it before writing animation code.

#### Scenario: Display deployment details

- **GIVEN** the Deployment page is opened
- **WHEN** Sepolia deployment data is available
- **THEN** the page shows contract address, deployer, transaction hash, deployed time, network, chainId, and constructor parameters
- **AND** the address and transaction hash link to Sepolia Etherscan

#### Scenario: Protect sensitive data

- **GIVEN** the Deployment page displays deployment information
- **WHEN** the user reviews the page
- **THEN** no private key, mnemonic, private RPC URL, or `.env` secret is shown

#### Scenario: Display classroom demo sequence

- **GIVEN** the user prepares for a classroom demo
- **WHEN** the Deployment page is displayed
- **THEN** the page shows demo roles and an end-to-end demonstration sequence

#### Scenario: Animate deployment feedback with GSAP

- **GIVEN** the user views deployment data or triggers copy/demo feedback
- **WHEN** deployment cards, parameter rows, or demo sequence states change
- **THEN** GSAP animations provide short visual feedback
- **AND** long addresses and transaction hashes remain readable and contained

