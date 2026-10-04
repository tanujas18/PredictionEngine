# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.




The AI prediction works in two layers:
1. Statistical Model (server/predict.js) - The core prediction engine:
- Uses team ratings, recent form (last 5 matches), home advantage (+4 rating points), defensive records, and head-to-head history
- Calculates win/draw/loss probabilities via logistic function on rating difference
- Derives expected goals and most likely scoreline from the rating edge
- Generates factors with weights explaining the prediction
- Creates a template rationale paragraph
2. AI Rationale Layer (server/ai.js) - Optional enhancement:
- Takes the statistical model's output (probabilities, scoreline, factors)
- Sends to OpenRouter LLM to rewrite the rationale in more natural language
- Does NOT make new predictions - only rephrases the model's rationale
- Falls back to template if API fails/unavailable
The statistical model uses synthetic data from server/data/matches.js and server/data/teams.js - not real historical match data. The teams have fixed ratings, form arrays, and last season stats.