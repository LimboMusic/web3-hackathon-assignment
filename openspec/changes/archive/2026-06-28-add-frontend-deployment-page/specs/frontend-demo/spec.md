# frontend-demo Specification

## ADDED Requirements

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
