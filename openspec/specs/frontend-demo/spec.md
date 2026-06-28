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

#### Scenario: Missing design draft page

- **GIVEN** one of the target views does not yet have a corresponding HTML draft
- **WHEN** the frontend skeleton is implemented
- **THEN** the missing view is still created
- **AND** it reuses the same sidebar, top status bar, card system, button styling, status labels, event log treatment, and spacing rules from the existing drafts

### Requirement: Frontend demo uses React TypeScript Vite

The frontend demo MUST be implemented with React + TypeScript + Vite.

#### Scenario: Scaffold frontend project

- **GIVEN** an agent creates or updates the `frontend/` project
- **WHEN** it chooses the framework and template
- **THEN** it uses React + TypeScript + Vite
- **AND** page and component files use `.tsx` where they contain JSX
- **AND** shared demo data types are represented with TypeScript types or interfaces
