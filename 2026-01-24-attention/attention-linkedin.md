Most prompting advice is cargo cult. "Be specific." "Use chain-of-thought." "Don't use negative instructions." These tips work, but without understanding *why*, you're just following rituals.

The attention mechanism explains everything.

When you send text to an LLM, each token creates three representations: a Query ("what am I looking for?"), a Key ("what do I contain?"), and a Value ("what information do I carry?"). Attention scores measure how relevant each token is to every other token. The output is a weighted blend of all tokens based on those scores.

Once you understand this, prompting techniques make sense-

1. **Specific prompts work** because more tokens create more Query/Key matches
2. **Chain-of-thought works** because intermediate tokens become new Key/Value pairs for later tokens to reference
3. **Examples work** because they create attention templates the model can pattern-match against
4. **Position matters** because attention weights favor the beginning and end (the "lost in the middle" effect)
5. **Negative instructions fail** because "don't mention X" still puts X into the attention space

You're not coaxing a mysterious intelligence. You're providing inputs to a computational process. Understanding that process is the difference between guessing and engineering.

Full article with interactive visualizer: [link]
