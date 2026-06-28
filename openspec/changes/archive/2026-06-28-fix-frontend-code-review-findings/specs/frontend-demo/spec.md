## MODIFIED Requirements

### Requirement: Frontend demo uses React TypeScript Vite

The frontend demo MUST be implemented with React + TypeScript + Vite.

The frontend routing MUST work when the built assets are served as static files without server-side fallback rewrites.

#### Scenario: Refresh nested demo route on static hosting

- **GIVEN** the frontend demo is built and deployed as static files
- **WHEN** a user refreshes a nested route such as `/marketplace` or `/trade/1`
- **THEN** the application still loads the correct page
- **AND** the five-page navigation continues to work
