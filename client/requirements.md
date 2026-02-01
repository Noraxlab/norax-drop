## Packages
framer-motion | Complex animations for the multi-step flow and page transitions
firebase | Firebase SDK for future auth/database integration
react-circular-progressbar | For the countdown timer visualization

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}

Integration assumptions:
- API endpoints are served relative to origin (/api/...)
- Firebase auth is initialized but might be mocked for the local admin login in this specific iteration if credentials aren't provided.
- SEO content sections are static for this version.
