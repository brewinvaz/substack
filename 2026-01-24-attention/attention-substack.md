# Inside the Black Box: How Attention Works and Why It Makes You Better at Prompting

*Understanding the mechanism behind LLMs transforms prompting from guesswork into engineering.*

> **Note**: This article simplifies details for clarity. Real transformer implementations include additional components and optimizations not covered here. The core attention mechanism described is accurate, but production models are more complex.

---

The internet is full of prompting advice. "Be specific." "Use chain-of-thought." "Put important instructions at the beginning." These tips work, but rarely does anyone explain *why*. The result is cargo cult prompting: rituals that produce results without understanding.

I'll explain how the attention mechanism actually works, then show why that knowledge makes popular prompting techniques make sense. Once you understand the machinery, you stop guessing and start engineering.

> **Interactive Companion**: As you read, you can explore an [interactive attention visualizer](https://brewinvaz.github.io/substack/2026-01-24-attention/visualizer/) that demonstrates each step with animated examples.

## What Attention Actually Does

Every modern LLM is built on the transformer architecture, and the transformer's key innovation is the attention mechanism. Here's what happens when you send a prompt to an LLM.

### Step 1: Tokens and Embeddings

**What this step does**: Convert your text into numerical representations that capture meaning.

Your text gets split into tokens, which are roughly word-sized chunks. "The cat sat on the mat" becomes something like ["The", "cat", "sat", "on", "the", "mat"].

Each token gets converted into a vector, a list of numbers representing that token's meaning. For a simplified 4-dimensional example:

```
"The" → [0.2, 0.8, 0.1, 0.5]    (article)
"cat" → [0.9, 0.3, 0.7, 0.2]    (noun, animate)
"sat" → [0.4, 0.6, 0.8, 0.3]    (verb)
"on"  → [0.1, 0.4, 0.2, 0.9]    (preposition)
"the" → [0.2, 0.8, 0.1, 0.5]    (same as "The")
"mat" → [0.8, 0.2, 0.6, 0.4]    (noun, inanimate)
```

Modern LLMS often use 512 to 4096 dimensions - enough axes to capture fine distinctions like "walk" vs "stroll" vs "march." Semantically similar words are close together in the embedding space. The model learns these during training: words appearing in similar contexts ("The ___ sat on the mat" fits cat, dog, child) get pushed toward similar vectors because this lets the model reuse what it learned about one word for another. The result: "cat" and "dog" point in nearly the same direction, while "cat" and "algorithm" point very differently.

> **Try it**: The [Embedding Space Explorer](https://brewinvaz.github.io/substack/2026-01-24-attention/visualizer/embeddings) lets you click any two words and see their similarity score. Notice how "walk," "stroll," and "march" cluster together, while "algorithm" sits far away.

The model also adds positional encodings so it knows word order. Without this, "dog bites man" and "man bites dog" would look identical. These positional encodings affect attention patterns in ways we'll revisit later.

**Outcome**: Each word is now a list of numbers encoding its meaning plus its position. The model can do math on words.

### Step 2: Query, Key, and Value Projections

**What this step does**: Give each word three roles - a search query, a searchable label, and content to retrieve.

Here's where attention begins. Each token's embedding gets transformed into three different representations through learned weight matrices:

- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain that others might want?"
- **Value (V)**: "What information do I carry?"

Mathematically:

$$Q = E \cdot W_Q$$
$$K = E \cdot W_K$$
$$V = E \cdot W_V$$

Where $W_Q$, $W_K$, and $W_V$ are weight matrices learned during training. Each token now has three vectors instead of one, letting it play different roles in the attention process.

Think of it like a search engine. The Query is your search term. Keys are the index entries. Values are the actual content you retrieve.

**Outcome**: Each word can now "search" for relevant words (Query), "be found" by other words (Key), and "provide information" (Value).

### Step 3: Computing Attention Scores

**What this step does**: Compare every word's search query against every other word's label to find which words should pay attention to each other.

Now the model figures out how much each token should "pay attention to" every other token. It does this by comparing each Query against all Keys using dot products:

$$\text{Scores} = \frac{Q \cdot K^T}{\sqrt{d_k}}$$

This produces an $n \times n$ matrix where $n$ is the number of tokens. Each cell (i,j) represents how much token i should attend to token j:

```
              The   cat   sat   on    the   mat
       The  [ 1.5  -0.3  -0.8  -1.0   1.5  -1.2 ]
       cat  [ 1.2   0.2   1.4  -0.9  -0.8   0.1 ]
       sat  [-1.2   1.8   0.2  -0.5  -1.5   1.4 ]
        on  [-0.9   0.1   1.2   0.2  -1.0   1.6 ]
       the  [ 0.8  -0.6  -0.7   0.3   0.4   1.5 ]
       mat  [-1.0   0.2   0.9   0.7   1.2   0.1 ]
```

*(These values are illustrative, not from an actual model. Real attention patterns emerge from learned weights and vary by context.)*

Higher scores mean stronger attention. Notice "sat" has high scores for "cat" (1.8, the subject) and "mat" (1.4, the location), but low scores for "The" (-1.2) and "the" (-1.5).

The division by $\sqrt{d_k}$ (where $d_k$ is the dimension of the key vectors) prevents the dot products from getting too large, which would cause problems in the next step.

**Outcome**: A grid showing how relevant each word is to every other word. "sat" scores high for "cat" (subject) and "mat" (location).

### Step 4: Softmax Normalization

**What this step does**: Convert raw scores into percentages that sum to 100%, so each word knows exactly how much attention to give others.

The raw attention scores get passed through a softmax function, which converts them into probabilities that sum to 1:

$$\text{Attention\_weights} = \text{softmax}(\text{Scores})$$

$$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}$$

Applied row-by-row, this transforms each row of scores into a probability distribution:

```
For "sat" row:  Scores  [-1.2, 1.8, 0.2, -0.5, -1.5, 1.4]
                   ↓ softmax
               Weights  [0.02, 0.49, 0.10, 0.05, 0.02, 0.33]  (sums to 1.0)
                         The   cat   sat   on    the   mat
```

Now "sat" attends strongly to "cat" with weight 0.49 (49%) and "mat" with 0.33 (33%), while nearly ignoring "The" and "the" (2% each). This makes sense: to understand the verb "sat," the model needs to know the subject and location.

**Outcome**: Each word has an "attention budget" of 100% distributed across all words based on relevance. This is the attention pattern.

### Step 5: Weighted Combination of Values

**What this step does**: Blend information from all words according to the attention percentages. If "sat" gives 49% attention to "cat," it absorbs 49% of "cat"'s information.

Finally, each token's output is computed by taking a weighted combination of all Value vectors:

$$\text{Output} = \text{Attention\_weights} \cdot V$$

For "sat" with weights [0.02, 0.49, 0.10, 0.05, 0.02, 0.33]:

```
Output("sat") = 0.02×V("The") + 0.49×V("cat") + 0.10×V("sat")
              + 0.05×V("on") + 0.02×V("the") + 0.33×V("mat")
```

The output for "sat" is now dominated by information from "cat" (49%) and "mat" (33%). The model has learned that to understand a verb, it needs to know WHO did it and WHERE.

**The complete attention formula** (single head):

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q \cdot K^T}{\sqrt{d_k}}\right) \cdot V$$

This single equation is the heart of the transformer. A token's output is no longer just its own information. It's a blend of information from all tokens, weighted by relevance.

**Outcome**: Each word now contains information from relevant words. "sat" carries info about WHO sat (cat) and WHERE (mat). Words are enriched with context.

### Multi-Head Attention

**What this step does**: Run attention multiple times in parallel, with each "head" learning different relationship types (grammar, meaning, etc.).

The model doesn't run this process once. It runs it multiple times in parallel with different learned projections, called "heads." Each head has its own $W_Q$, $W_K$, and $W_V$ matrices:

$$\text{MultiHead} = \text{Concat}(\text{head}_1, \text{head}_2, \ldots, \text{head}_h) \cdot W_O$$

$$\text{head}_i = \text{Attention}(X \cdot W_{Q_i}, X \cdot W_{K_i}, X \cdot W_{V_i})$$

With 8 heads (typical for smaller models), each head can learn to capture different relationships:
- Head 1 might track subject-verb relationships
- Head 2 might handle coreference ("it" → "cat")
- Head 3 might capture syntactic structure
- Head 4 might focus on adjacent words
- And so on...

The outputs from all heads get concatenated and projected back by $W_O$. This gives the model multiple ways to relate tokens to each other simultaneously.

**Outcome**: The model captures many relationship types at once - grammar, meaning, and context - giving it a rich understanding of how all words relate to each other.

**Note on Feed-Forward Networks**: After attention mixes information *between* tokens, each token passes through a feed-forward network that processes it *individually*. This is where much of the model's factual "knowledge" is stored. The combination of attention (mixing) and feed-forward (processing) repeats across many layers.

### Step 6: Projecting to Vocabulary (The Prediction Head)

**What this step does**: Project the enriched hidden state to get a score for every possible next word.

After attention layers process the input, the model must actually generate output. The final hidden state at the last position gets projected from the model dimension (512) to vocabulary size (50,000+):

```
┌─────────────────────────────────────────────────┐
│ [The] [cat] [sat] [on] [the] → Attention        │
│                          │                      │
│                          ▼                      │
│                    hidden state                 │
│                       (512)                     │
│                          │                      │
│                          │ × W_vocab (512×50K)  │
│                          ▼                      │
│                    logits (50,000)              │
│                    one score per                │
│                    vocabulary token             │
└─────────────────────────────────────────────────┘
```

**Outcome**: Each word in the vocabulary now has a score (logit). High scores mean "more likely," low scores mean "less likely."

### Step 7: Probability Distribution (Softmax Over Vocabulary)

**What this step does**: Convert raw scores into probabilities that sum to 100%.

The same softmax function converts these scores into a probability distribution:

$$P(\text{next\_token}) = \text{softmax}\left(\frac{\text{logits}}{\text{temperature}}\right)$$

For "The cat sat on the," the distribution looks like:

```
"mat"       0.15  ████████████████
"floor"     0.12  █████████████
"couch"     0.08  █████████
"ground"    0.07  ████████
  ...
"algorithm" ≈0    (near zero)
```

Semantically appropriate completions get high probabilities; nonsensical ones get near-zero.

**Temperature** controls the "peakiness" of the distribution. Critically, temperature scaling happens *before* softmax: `softmax(logits / temperature)`.

Dividing by a small temperature (like 0.3) multiplies all scores by ~3, exaggerating the differences between them before softmax normalizes. The already-higher score becomes relatively much higher.

```
Temperature = 0.3:   mat(72%) floor(21%) couch(5%)  → almost always "mat"
Temperature = 1.0:   mat(15%) floor(12%) couch(8%)  → balanced sampling
Temperature = 2.0:   mat(10%) floor(9%)  couch(7%)  → might pick "ottoman"
```

**Outcome**: A probability distribution over all possible next words. Temperature controls how peaked or flat this distribution is.

### Step 8: Token Selection (Sampling Strategies)

**What this step does**: Choose which word to generate based on the probabilities.

- **Greedy (temp=0)**: Always pick highest probability - deterministic, consistent
- **Sampling (temp=1)**: Random sample weighted by probabilities - varied outputs
- **Top-k**: Only consider the k highest-probability tokens, then sample
- **Top-p (nucleus)**: Include tokens until cumulative probability reaches p, then sample

This is why the same prompt can give different outputs: sampling introduces randomness, and temperature controls how much.

**Outcome**: One token is selected as the next word. The selection method determines whether the model is predictable or creative.

### Step 9: The Generation Loop (Autoregressive Generation)

**What this step does**: Add the selected word to context and repeat the entire process.

Once selected, the token appends to the context and attention runs again:

```
Step 1: [The] [cat] [sat] [on] [the] → Attn → Predict → "mat"
                                                          │
Step 2: [The] [cat] [sat] [on] [the] [mat] → Attn → Predict → "."
                                                          │
Step 3: [The] [cat] [sat] [on] [the] [mat] [.] → Attn → Predict → ...
```

Each new token can attend to all previous tokens, including just-generated ones. Critically, tokens can only look backward (causal masking) - they can't see future tokens.

**Why Chain-of-Thought Works**

When the model generates "Let me break this down. 17 × 20 = 340...", those intermediate tokens become new Keys and Values in the context. When computing the final answer, attention can reference the partial results:

```
Generate "408": Attention can see "340" and "68" and "+"
                → The numbers needed for addition are IN the context
```

Without chain-of-thought, the model must jump from question to answer with no intermediate storage. With it, reasoning tokens serve as working memory that attention reads from.

**Outcome**: Text generated one token at a time, each becoming context for the next prediction. The autoregressive structure is why chain-of-thought works - intermediate tokens become working memory for attention.

## See It In Action

To make this concrete, I've built interactive visualizations that walk through the attention mechanism, embedding space, and next token prediction step by step.

**[View the Embedding Space Explorer](https://brewinvaz.github.io/substack/2026-01-24-attention/visualizer/embeddings)** - Click any two words to see their cosine similarity. Explore how semantically similar words cluster together.

**[View the Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-24-attention/visualizer/)** - Watch tokens get embedded, split into Q/K/V, compute attention scores, and produce outputs.

**[View the Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-24-attention/visualizer/prediction)** - See how temperature, softmax, and sampling strategies turn attention outputs into generated text.

## From Theory to Practice: Why Prompting Techniques Work

Now that you understand the mechanism, let's look at common prompting advice and see why it works.

### Be Specific and Detailed

**The advice**: Instead of "Write about dogs," say "Write a 500-word blog post about golden retrievers as family pets, covering their temperament, exercise needs, and grooming requirements."

**Why it works**: More specific tokens create more Query/Key combinations that can match relevant parts of the model's knowledge. "Golden retrievers" activates different attention patterns than generic "dogs." Each token you provide becomes part of the context that later tokens can attend to.

### Chain-of-Thought Prompting

**The advice**: Ask the model to "think step by step" or show its reasoning before giving a final answer.

**Why it works**: When the model generates intermediate reasoning tokens, those tokens become new Key/Value pairs that future tokens can attend to. It's like giving yourself scratch paper. The intermediate tokens serve as external working memory that attention can read from.

### Few-Shot Examples

**The advice**: Show examples of input-output pairs before your actual request.

**Why it works**: Examples create attention templates. The example inputs become Keys, and the example outputs become Values associated with those Keys. When your real input arrives, its Query can match against the example input Keys, activating the associated output patterns.

### Structured Output Requests

**The advice**: Ask for specific formats: JSON, bullet points, numbered lists, tables.

**Why it works**: Format markers become anchors for attention. When you request JSON output, tokens like `{` and `}` become strong attractors that subsequent generation attends to for structural consistency.

### Role and Persona Assignment

**The advice**: "You are a senior Python developer" or "Act as a medical professional."

**Why it works**: Role descriptions bias attention toward relevant parts of the model's knowledge. "Python developer" primes attention to weight programming-related Keys higher. The model doesn't actually become that persona, but attention weights shift toward token relationships more common in that context.

### Instruction Positioning

**The advice**: Put critical instructions at the beginning and end of your prompt, not buried in the middle.

**Why it works**: This is called the "lost in the middle" phenomenon, and it has two distinct causes:

1. **Attention dilution**: In long contexts, attention weights must be distributed across many tokens. Tokens at the start get attended to during initial processing. Tokens at the end are closest during generation. Middle tokens compete with more neighbors for attention weight.

2. **Training data bias**: Models learn during training that important content typically appears at document boundaries. Introductions and conclusions carry key information; middles contain supporting detail. This learned bias reinforces the attention effect.

### Avoiding Negative Instructions

**The advice**: Say "Respond formally" instead of "Don't be casual."

**Why it works**: When you write "Don't mention competitors," the tokens "mention" and "competitors" still enter the context. Attention doesn't understand negation the way humans do. Those tokens create Keys that later generation might match against. You've put the unwanted concept into the attention space.

## Context Windows and Their Limits

Every model has a maximum context length: 8K, 32K, 128K, or more tokens. This isn't arbitrary.

### Why Limits Exist

Attention computes relationships between every pair of tokens. For $n$ tokens, that's $n^2$ comparisons. Double your context length and you quadruple the computation. This $O(n^2)$ scaling puts hard limits on practical context sizes.

### What Happens at the Limit

As you approach the context limit:

- **Attention dilution**: With more tokens competing for attention weight, each individual token's influence decreases.
- **Lost in the middle intensifies**: The middle-position disadvantage grows with context length.
- **Coherence degrades**: The model has more to track, and contradictions become more likely.

### Strategies for Long Content

- **Chunking**: Split long documents into sections, process separately, combine results.
- **Summarization**: Condense earlier content into summaries that attention can reference efficiently.
- **RAG (Retrieval-Augmented Generation)**: Retrieve only relevant chunks based on the current query instead of putting everything in context.

## Common Failure Modes

Understanding attention also explains why LLMs fail in predictable ways:

- **Attention dilution**: Too much "just in case" context dilutes attention across irrelevant tokens.
- **Competing instructions**: Contradictory guidance causes attention to pull from both inconsistently.
- **Lost in the middle**: Critical information buried in long prompts may be underweighted.
- **Negation blindness**: "Don't do X" activates X in attention space.
- **Hallucination from weak attention**: When Queries don't strongly match any Keys, the model generates plausible-sounding but incorrect content.

## Cost and Latency Considerations

Most API pricing is per-token. Attention must process every input token and generate every output token.

**Practical tips**:

- Use prompt caching when making multiple calls with the same system prompt
- Be concise; every unnecessary token costs computation
- Limit output length if you only need a brief answer
- Consider RAG vs. long context based on what information needs simultaneous attention

## Quick Reference: Mechanism to Technique

| How Attention Works | Prompting Technique |
|---------------------|---------------------|
| Q/K dot products find matches | Be specific and detailed |
| Autoregressive generation | Chain-of-thought |
| Pattern matching from context | Few-shot examples |
| Position-dependent weights | Instruction positioning |
| Tokens activate as Keys | Avoid negation |

## Conclusion

The attention mechanism is not magic. It's matrix multiplication, softmax, and weighted sums. Every token computes relevance to every other token, and the output is a blend of information based on those relevance scores.

Once you internalize this, prompting transforms from folklore into engineering:

- **Specific prompts work** because they create more matchable Keys.
- **Chain-of-thought works** because intermediate tokens become new Key/Value pairs.
- **Examples work** because they create attention templates.
- **Position matters** because attention weights vary by position.
- **Negation fails** because it activates what you're trying to avoid.

You're not coaxing a mysterious intelligence. You're providing inputs to a well-defined computational process. Understanding that process lets you reason about what will work and why.

---

**Further Reading**
- Vaswani et al., "[Attention Is All You Need](https://arxiv.org/abs/1706.03762)" (2017), the original transformer paper
- Jay Alammar's "[The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)" for excellent visual explanations

---

*Brewin writes about applied AI/ML, data infrastructure, and the intersection of AI/ML and business. Opinions are the author's own.*

