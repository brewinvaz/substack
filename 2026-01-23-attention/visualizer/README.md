# Attention Mechanism Visualizer

An interactive visualization of how transformer attention works, step by step.

## View Online

Visit [brewinvaz.github.io/attention-visualizer](https://brewinvaz.github.io/attention-visualizer/)

## Run Locally

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve

# Option 3: PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## What It Shows

1. **Tokenization**: Input text split into tokens
2. **Embeddings**: Tokens converted to vectors
3. **Q/K/V Projections**: Three representations for each token
4. **Attention Scores**: Dot product of queries and keys
5. **Softmax**: Scores normalized to probabilities
6. **Weighted Combination**: Values blended by attention weights
7. **Contextual Outputs**: Final token representations

## Controls

- **Play/Pause**: Auto-advance through steps
- **Back/Forward**: Manual step navigation
- **Reset**: Return to step 1
- **Speed**: Adjust animation speed

## Technical Notes

- Uses vanilla JavaScript (no dependencies)
- Values are illustrative, not from a real model
- Demonstrates the mechanism, not exact computations

## Part Of

This visualizer accompanies the article ["Inside the Black Box: How Attention Works and Why It Makes You Better at Prompting"](../attention-focused-article.md).
