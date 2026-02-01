# Inside the Black Box: How Attention Works and Why It Makes You Better at Prompting

*Understanding the mechanism behind LLMs transforms prompting from guesswork into engineering.*

> **Note**: This article simplifies details for clarity. Real transformer implementations include additional components and optimizations not covered here. The core attention mechanism described is accurate, but production models are more complex. All numerical examples are illustrative and simplified; real model values and attention patterns differ.

---

The internet is full of prompting advice. "Be specific." "Use chain-of-thought." "Put important instructions at the beginning." These tips work, but rarely does anyone explain *why*. The result is cargo cult prompting: rituals that produce results without understanding.

I'll explain how the attention mechanism actually works, then show why that knowledge makes popular prompting techniques make sense. Once you understand the machinery, you stop guessing and start building better prompts.

> **Note on Model Type**: This article focuses on decoder-only models which use causal attention - each token can only attend to previous tokens, not future ones. Encoder models like BERT use bidirectional attention where tokens can attend to all positions.

> **TL;DR for the non-technical audience**: Attention is how language models decide which words in your prompt matter when generating each word of output. Understanding this mechanism explains why prompting techniques like "be specific" and "chain-of-thought" actually work and helps you write better prompts.

> **Interactive Companion**: As you read, you can explore an [interactive attention visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html) that demonstrates each step with animated examples.

## What Attention Actually Does

Every modern LLM is built on the transformer architecture, and the transformer's key innovation is the attention mechanism. Here's what happens when you send a prompt to an LLM.

### Step 1: Tokens and Embeddings

This step converts your text into numerical representations that capture meaning.

Your text gets split into tokens, which are roughly word-sized chunks. "What is the capital of France?" becomes something like ["What", "is", "the", "capital", "of", "France", "?"]. The tokenization process can be reviewed separately, if there's enough interest.

Each token gets converted into a vector, a list of numbers representing that token's meaning. For a simplified 4-dimensional example:

```
"What"    → [0.8, 0.2, 0.6, 0.3]    (question word)
"is"      → [0.7, 0.3, 0.5, 0.4]    (copula)
"the"     → [0.2, 0.8, 0.1, 0.5]    (article)
"capital" → [0.5, 0.6, 0.9, 0.7]    (content word)
"of"      → [0.1, 0.4, 0.2, 0.9]    (preposition)
"France"  → [0.9, 0.4, 0.8, 0.6]    (proper noun, entity)
"?"       → [0.6, 0.1, 0.4, 0.2]    (punctuation)
```

Modern LLMs often use 512 to 4096 dimensions, enough axes to capture fine distinctions like "Paris" vs "France" vs "capital." Semantically similar words are close together in the embedding space. The model learns these during training. Words appearing in similar contexts ("The capital of ___ is Paris" fits France, the country, the nation) get pushed toward similar vectors because this lets the model reuse what it learned about one word for another. The result: "Paris" and "France" point in nearly the same direction, while "France" and "algorithm" point very differently.

> **Try it**: The [Embedding Space Explorer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/embeddings.html) lets you click any two words and see their similarity score. Notice how "Paris," "France," and "capital" cluster together, while "algorithm" sits far away.

The model also adds positional encodings so it knows word order. Without this, "dog bites man" and "man bites dog" would look identical. The original transformer paper used fixed sinusoidal functions to encode position, but most modern models learn position embeddings during training, which allows them to discover whatever positional patterns work best. These positional encodings affect attention patterns, as we'll see when computing attention scores in Step 3.

After this step, each word is a list of numbers encoding its meaning plus its position. The model can do "math" on words.

### Step 2: Query, Key, and Value Projections

Here each word gets three roles, acting as a search query, a searchable label, and content to retrieve.

Here's where attention begins. Each token's embedding gets transformed into three different representations through learned weight matrices (during model training).

- **Query (Q)** answers "What am I looking for?"
- **Key (K)** answers "What do I contain that others might want?"
- **Value (V)** answers "What information do I carry?"

Mathematically:

For our 7-token sentence with 512-dimensional embeddings, here's what happens:

- $E$ (embeddings): A table with 7 rows (one per token) and 512 columns (one per dimension)
- $W_Q$ (query weights): A table with 512 rows and 64 columns - this "compresses" each token's 512 numbers into 64 numbers that represent "what am I looking for?"
- Multiply $E \times W_Q \rightarrow Q$: A table with 7 rows and 64 columns - each token now has a 64-number Query vector

The same process creates K (Keys) and V (Values), each also 7 × 64.

$$Q = E \cdot W_Q$$
$$K = E \cdot W_K$$
$$V = E \cdot W_V$$

Where:
- $E$ has shape $(n \times d_{model})$ - one row per token
- $W_Q$, $W_K$, $W_V$ have shape $(d_{model} \times d_k)$ - learned projections
- $Q$, $K$, $V$ each have shape $(n \times d_k)$ - the projected representations

Each token now has three vectors instead of one, letting it play different roles in the attention process.

Imagine asking a question at a panel of experts. Your question is the Query. Each expert's area of expertise (on their name badge) is their Key. When your question about "market strategy" naturally resonates more with the business strategist than the technologist, you weigh their answers differently. What each expert tells you is their Value. You don't ignore anyone completely, but you listen more carefully to the relevant voices.

After this step, each word can "search" for relevant words (Query), "be found" by other words (Key), and "provide information" (Value).

### Step 3: Computing Attention Scores

Now the model compares every word's search query against every other word's label to find which words should pay attention to each other. It does this by comparing each Query against all Keys using dot products (a measure of how aligned two vectors are):

$$\text{Scores} = \frac{Q \cdot K^T}{\sqrt{d_k}}$$

The dot product measures alignment between vectors. Through training, the model learns to give tokens Query vectors that align with the Key vectors of relevant tokens. High dot product = "what I'm looking for matches what you have."

This produces an $n \times n$ matrix where $n$ is the number of tokens. Each cell (i,j) represents how relevant token j is to token i:

```
                What   is    the   capital   of   France    ?
       What  [  1.86  1.98  2.16    3.13   2.09   2.85   1.23 ]
         is  [  1.90  2.00  2.10    3.11   2.05   2.87   1.27 ]
        the  [  1.68  1.69  1.45    2.41   1.48   2.40   1.15 ]
    capital  [  2.87  2.98  2.96    4.55   2.93   4.27   1.92 ]
         of  [  1.85  1.87  1.66    2.79   1.70   2.68   1.25 ]
     France  [  2.74  2.89  3.02    4.49   2.95   4.14   1.83 ]
          ?  [  1.26  1.35  1.49    2.14   1.44   1.94   0.83 ]
```

*(These values are computed from the embeddings and projection matrices shown in the [Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html). Real model values differ.)*

Higher scores mean stronger relevance. Notice "France" has high scores for "capital" (4.49) and for itself (4.14). Similarly, "capital" attends strongly to "France" (4.27). However, in decoder-only models, **causal masking** will be applied before softmax to prevent attending to future tokens.

The division by $\sqrt{d_k}$ (where $d_k$ is the dimension of the key vectors) prevents the dot products from getting too large, which would cause problems in the next step.

The result is a grid showing relevance scores between all word pairs. Causal masking will be applied in the next step to prevent attending to future tokens.

**How Position Affects These Scores**

Remember the positional encodings from Step 1? They're embedded in Q and K before this dot product, so attention scores reflect both meaning and position. Tokens often attend more strongly to nearby tokens because their positional components are similar. The model also learns position-dependent patterns - for instance, that words following "the" are typically nouns. This positional influence is why where you place instructions in a prompt matters: it directly affects these attention scores.

> **Try it**: Watch the attention scores computed in real-time in the [Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html) (Step 4).

### Step 4: Softmax Normalization

This step applies causal masking, then converts scores into percentages that sum to 100%.

Before applying softmax, decoder-only models apply **causal masking**: positions where j > i (future tokens) are set to $-\infty$ (negative infinity). This ensures each token can only attend to itself and previous tokens.

$$A = \text{softmax}(\text{MaskedScores})$$

Where $A$ is the attention weights matrix.

$$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}$$

Since $e^{-\infty} = 0$, masked positions contribute nothing to the sum and receive 0% attention. Applied row-by-row:

```
For "France" row:

Token   │ Raw Score │ After Mask │ Weight
────────┼───────────┼────────────┼───────
What    │    2.74   │    2.74    │   5%
is      │    2.89   │    2.89    │   5%
the     │    3.02   │    3.02    │  10%
capital │    4.49   │    4.49    │  35%
of      │    2.95   │    2.95    │  25%
France  │    4.14   │    4.14    │  20%
?       │    1.83   │     -∞     │   0%
```

*(Note: The weights shown are simplified for illustration. The [Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html) uses designed weights that highlight the key semantic relationships.)*

Now "France" attends strongly to "capital" with weight 0.35 (35%), moderately to "of" (25%), and to itself (20%). The future token "?" receives 0% attention due to causal masking. This makes sense: to predict what comes after "France," the model can only use information from words it has already seen.

Each word now has an "attention budget" of 100% distributed across visible words (past and present) based on relevance. This is the attention pattern.

> **Try it**: See how softmax transforms raw scores into the attention pattern in the [Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html) (Step 5).

### Step 5: Weighted Combination of Values

In this step, information from visible words gets blended according to the attention percentages. If "France" gives 35% attention to "capital", it absorbs 35% of "capital"'s information.

Using the attention weights from Step 4, each token blends information from all Value vectors:

$$\text{Output} = A \cdot V$$

For "France," the output blends Value vectors from visible tokens only (masked positions contribute nothing):

```
Output("France") = weighted sum of visible Values

Token   │ Weight │ Contribution
────────┼────────┼─────────────────────────
What    │   5%   │ █
is      │   5%   │ █
the     │  10%   │ ██
capital │  35%   │ ███████████████████ (key concept)
of      │  25%   │ █████████
France  │  20%   │ ██████ (self)
```

The output for "France" is dominated by information from "capital" (35%). The model learned that to understand what is being asked about France, it needs the concept word "capital." The future token "?" is masked and doesn't contribute.

What does "absorbing 35% of capital's information" actually mean? After this step, the representation of "France" is no longer just about the country in the abstract. It now carries semantic information about capitals: the word "France" has become "France-as-country-with-capital." This enriched representation helps the model predict "Paris" as the answer.

**The complete attention formula** (single head):

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q \cdot K^T}{\sqrt{d_k}}\right) \cdot V$$

This single equation is the heart of the transformer. A token's output is no longer just its own information. It's a blend of information from all tokens, weighted by relevance.

Each word now contains information from visible words. "France" carries info about WHAT is being asked (capital) from the context seen so far. Words are enriched with past context.

**What is the attention output, exactly?** The output is a vector with the *same dimensions* as the input embedding. For "France," the vector might shift like this:

```
Input embedding:  [0.9, 0.4, 0.8, 0.6]  (just "France" - the country)
After attention:  [0.7, 0.5, 0.85, 0.65] (France + "capital" context blended in)
```

This enriched vector passes through more transformer layers, accumulating context at each stage, until it becomes the final hidden state used for prediction. The hidden state is no longer "France" in isolation - it's "France in the context of a question about capitals."

### Multi-Head Attention

The model doesn't run attention just once. It runs multiple attention operations in parallel, with each "head" learning different relationship types (grammar, meaning, etc.).

Each head has its own $W_Q$, $W_K$, and $W_V$ matrices, so each head learns to look for different relationships.

With 8 heads (typical for smaller models), each head can specialize:
- Head 1 might track question-answer relationships ("What" connects to answer)
- Head 2 might handle entity recognition ("France" links to "capital")
- Head 3 might capture syntactic structure (prepositional phrases)
- Head 4 might focus on adjacent word patterns ("capital of", "of France")
- And so on...

Each head computes attention independently using its own learned weights:

$$\text{head}_i = \text{Attention}(X \cdot W_{Q_i}, X \cdot W_{K_i}, X \cdot W_{V_i})$$

Then all head outputs are concatenated and projected through $W_O$:

$$\text{MultiHead} = \text{Concat}(\text{head}_1, \text{head}_2, \ldots, \text{head}_h) \cdot W_O$$

The output projection $W_O$ is a learned weight matrix that combines the concatenated results back into a single representation. It lets the model mix insights from all heads: "Head 1 found the question structure, Head 2 linked France to capital, now blend them together to predict Paris."

The model captures many relationship types at once (grammar, meaning, and context), giving it a rich understanding of how all words relate to each other.

> **Try it**: The [Multi-Head Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/multihead.html) shows how different heads learn different patterns and how their outputs combine through the $W_O$ projection.

### The Complete Transformer Block

Feel free to skip this section

A transformer layer includes more than just attention. Each layer follows a pattern.

1. **Attention** mixes information *between* tokens (the mechanism we just covered).
2. **Residual connection** adds the original input back to the attention output. Think of it like keeping a copy of your original notes while adding new annotations. This prevents information from getting lost as it passes through layers.
3. **Layer normalization** stabilizes values to prevent them from exploding or vanishing. It keeps all numbers in a reasonable range, like adjusting volume to stay within comfortable levels.
4. **Feed-forward network** processes each token *individually* through two dense layers. This simple neural network transforms each token's representation, and it's where much of the model's "knowledge" is stored.
5. **Another residual connection** adds the input to the feed-forward output.
6. **Another layer normalization** stabilizes again.

Why do residual connections matter? Without them, information tends to fade as it passes through many layers, like a message getting garbled in a game of telephone. Residual connections keep the original signal intact.

This pattern of attention (mixing between tokens) and feed-forward (processing each token) repeats across many layers. Each layer refines the representation a little more, building understanding incrementally.

After passing through all these layers, each token position holds a **hidden state**: a vector that started as a simple word embedding but now encodes rich contextual information. The hidden state at position 6 ("?" in "What is the capital of France?") doesn't just represent a question mark anymore; it contains blended information about capitals, France, and the question structure. These hidden states are what the model uses to predict what comes next.

> **Continuing in the Prediction Visualizer**: The following steps (6-9) show how attention outputs become generated text. Explore these in the [Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/prediction.html).

### Step 6: Projecting to Vocabulary (The Prediction Head)

This step projects the final hidden state to get a score for every possible next word.

To see prediction in action, let's continue with our example: imagine you've typed "What is the capital of France?" and are watching the model generate the answer. What happens inside?

After all transformer layers process the input, the model must generate output. But why only use the *last* position? In autoregressive language models, each position can only see tokens before it (due to masking). The last position is the only one that has "seen" the entire input sequence. Its hidden state is a 512-dimensional summary of everything the model knows about "What is the capital of France?"

To predict the next word, we need to score every word in the vocabulary. The model learns a **projection matrix** $W$ (512 × 50,000) where each column represents a word. Multiplying the hidden state by this matrix produces 50,000 scores - one for each word:

$$\text{logits} = h \cdot W$$

where $h$ is the hidden state vector (1 × 512) and $W$ is the projection matrix (512 × 50,000). The score for each word $i$ is the dot product between the hidden state and that word's column vector:

$$\text{score}_i = \sum_{j=1}^{512} h_j \cdot W_{j,i}$$

High scores indicate words that fit the context; low scores indicate poor fits.

Think of it like this: the hidden state is a point in 512-dimensional space, and each vocabulary word is also a point in that space. The projection computes how well aligned the hidden state is with each word's direction. "Paris" might point in a similar direction to the hidden state (high score), while "refrigerator" points elsewhere (low score).

Here's a simplified example with 4 dimensions instead of 512:

```
Hidden state for "What is the capital of France?": [0.9, 0.4, 0.8, 0.6]

Vocabulary word vectors (learned during training):
  "Paris":        [0.85, 0.35, 0.75, 0.55]
  "London":       [0.6, 0.3, 0.5, 0.4]
  "refrigerator": [-0.2, 0.1, 0.8, -0.4]

Score = dot product (multiply corresponding elements, sum them):
  "Paris":        (0.9×0.85) + (0.4×0.35) + (0.8×0.75) + (0.6×0.55) = 1.83
  "London":       (0.9×0.6) + (0.4×0.3) + (0.8×0.5) + (0.6×0.4) = 1.30
  "refrigerator": (0.9×-0.2) + (0.4×0.1) + (0.8×0.8) + (0.6×-0.4) = 0.22
```

The hidden state and "Paris" point in similar directions, producing a high score (1.83). "Refrigerator" points in a different direction, producing a low score (0.22). The model repeats this calculation for all 50,000+ words simultaneously.

**Why does "Paris" get the highest score?**

During training on billions of text examples, the model saw patterns like:
- "The capital of France is Paris"
- "Paris is the capital of France"
- "France's capital, Paris, is known for..."

The model learned to adjust its projection matrix so that hidden states encoding "capital of France" point toward "Paris." Each column of the projection matrix represents a word, and training adjusts these columns so that relevant contexts align with the right words.

This is the model's **learned knowledge** - stored not as facts in a database, but as vector directions. When the hidden state asks "what word follows a question about France's capital?", the "Paris" direction in the projection matrix happens to point the same way. The dot product measures this alignment, and high alignment means high probability.

> **Try it**: The [Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/prediction.html) shows vocabulary vectors alongside the hidden state, demonstrating how alignment produces scores (Step 2).

Each word in the vocabulary now has a score (logit). High scores mean "more likely," low scores mean "less likely."

### Step 7: Probability Distribution (Softmax Over Vocabulary)

The same softmax function converts these scores into a probability distribution.

Mathematically:

$$P(\text{next\_token}) = \text{softmax}\left(\frac{\text{logits}}{\text{temperature}}\right)$$

**Temperature** controls the "peakiness" of the distribution. Temperature scaling happens *before* softmax. Dividing by a small temperature (like 0.3) multiplies all scores by ~3, exaggerating the differences between them before softmax normalizes. The already-higher score becomes relatively much higher.

```
Temperature = 0.3:   Paris(78%) London(15%) Berlin(5%)  → almost always "Paris"
Temperature = 1.0:   Paris(25%) London(15%) Berlin(12%) → balanced sampling
Temperature = 2.0:   Paris(18%) London(14%) Berlin(11%) → might pick "London"
```

For "What is the capital of France?" at temperature 1.0, the distribution looks like this.

```
"Paris"     0.25  ████████████████████
"London"    0.15  █████████████
"Berlin"    0.12  ██████████
"Rome"      0.10  █████████
  ...
"algorithm" ≈0    (near zero)
```

Semantically appropriate completions get high probabilities; nonsensical ones get near-zero.

The result is a probability distribution over all possible next words. Temperature controls how peaked or flat this distribution is.

### Step 8: Token Selection (Sampling Strategies)

Now the model must choose which word to generate based on the probabilities.

- **Greedy (temp=0)** always picks the highest probability token, producing deterministic, consistent output.
- **Sampling (temp=1)** takes a random sample weighted by probabilities, producing varied outputs.
- **Top-k** only considers the k most likely tokens (e.g., the top 50), then samples from those.
- **Top-p (nucleus sampling)** includes tokens until their probabilities sum to p (e.g., 0.9), then samples from that set.

This is why the same prompt can give different outputs: sampling introduces randomness, and temperature controls how much.

One token is selected as the next word. The selection method determines whether the model is predictable or creative.

### Step 9: The Generation Loop (Autoregressive Generation)

Once a token is selected, it gets added to the context and the full pipeline (Steps 1-8) runs again.

Here's how that looks:

```
Iteration 1: [What][is][the][capital][of][France][?]               → Steps 1-8 → "Paris"
                                                                                     ↓ append
Iteration 2: [What][is][the][capital][of][France][?] + [Paris]     → Steps 1-8 → "."
                                                                                     ↓ append
Iteration 3: [What][is][the][capital][of][France][?][Paris] + [.]  → Steps 1-8 → ...
```

> **Try it**: The [Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/prediction.html) lets you generate tokens one at a time and watch the context grow.

Each new token can attend to all previous tokens, including just-generated ones. Critically, tokens can only look backward (causal masking, which prevents each token from seeing tokens that come after it) - they can't see future tokens.

**KV Caching, the Practical Optimization**

In theory, each new token requires rerunning Steps 1-8 for the entire sequence. In practice, models use **KV caching** to avoid redundant computation. Here's the insight: when generating token 7, the Keys and Values for tokens 1-6 haven't changed - only token 7 is new.

The model caches the K and V vectors from previous tokens. For each new token, it computes Q, K, V only for the new token, retrieves cached K and V for all previous tokens, runs attention using the new Q against all K and V (new + cached), and caches the new token's K and V for future iterations.

This reduces generation from O(n²) to O(n) per token - a massive speedup for long sequences. When you see "context window" limits (4K, 8K, 128K tokens etc.), KV cache memory is often the bottleneck.

**Why Chain-of-Thought Works**

Chain-of-thought prompting asks the model to "show its work." Consider asking "What is 17 × 24?":

Without CoT, the model must jump directly from question to answer - there's no working memory between tokens. But with CoT, the model generates intermediate steps:

```
"17 × 24 = 17 × 20 + 17 × 4 = 340 + 68 = 408"
```

Each intermediate token ("340", "+", "68") becomes a Key and Value in the context. When generating the final "408", attention can look back at these partial results - the numbers needed for addition are literally in the context window.

Without chain-of-thought, the model must compute everything in its hidden state. With it, reasoning tokens serve as external working memory that attention reads from.

Text is generated one token at a time, with each becoming context for the next prediction. The autoregressive structure is why chain-of-thought works, since intermediate tokens become working memory for attention.

## See It In Action

You've seen the "Try it" links throughout - here's the complete picture. This diagram shows how all the pieces connect, and below you'll find quick links to each visualizer for easy reference.

**The Full Pipeline at a Glance:**

```
Input Text
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ TOKENIZATION: ["What", "is", "the", "capital"]                  │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ EMBEDDINGS: Each token → 512-dim vector                         │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ATTENTION: Q·K^T → Scores → Softmax → Weighted V combination    │
│ (repeated across multiple heads and layers)                     │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ PROJECTION: Hidden state → Vocabulary logits → Softmax → Probs  │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ SAMPLING: Select next token, append to context, repeat          │
└─────────────────────────────────────────────────────────────────┘
    ↓
Output Text
```

**[View the Embedding Space Explorer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/embeddings.html)** - Click any two words to see their cosine similarity. Explore how semantically similar words cluster together.

**[View the Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/index.html)** - Watch tokens get embedded, split into Q/K/V, compute attention scores, and produce outputs.

**[View the Multi-Head Attention Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/multihead.html)** - See how multiple heads learn different relationship types and combine through the output projection.

**[View the Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/prediction.html)** - See how temperature, softmax, and sampling strategies turn attention outputs into generated text.

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

1. **Attention dilution**: In long contexts, attention weights must be distributed across many tokens. Tokens at the start get attended to during initial processing. Tokens at the end are closest during generation. Middle tokens compete with more neighbours for attention weight.

2. **Training data bias**: Models learn during training that important content typically appears at document boundaries. Introductions and conclusions carry key information; middles contain supporting detail. This learned bias reinforces the attention effect.

### Avoiding Negative Instructions

**The advice**: Say "Respond formally" instead of "Don't be casual."

**Why it works**: When you write "Don't mention competitors," the tokens "mention" and "competitors" still enter the context. Attention doesn't understand negation the way humans do. Those tokens create Keys that later generation might match against. You've put the unwanted concept into the attention space.

### Delimiters and Formatting

**The advice**: Use XML tags, triple backticks, or markdown headers to separate prompt sections.

**Why it works**: Delimiter tokens create structural boundaries. When attention computes relevance, these markers help segment the context. Instructions inside `<system>` tags get grouped together; code inside backticks stays distinct from prose. The delimiters become Keys that help Queries find the right section.

### Output Priming

**The advice**: Start the model's response for it: "Here is the JSON: {"

**Why it works**: Primed tokens immediately become part of the context. The opening `{` creates a Key that subsequent generation attends to, biasing output toward valid JSON. You're seeding the attention space with the structure you want.

### Temperature and Sampling

**The advice**: Use lower temperature (0.0-0.3) for factual tasks, higher (0.7-1.0) for creative ones.

**Why it works**: Attention produces logits for every possible next token. Temperature controls how sharply the probability distribution peaks. Low temperature makes the highest-probability token dominate; high temperature flattens the distribution, allowing more variety. This happens after attention, during the sampling step. Try the [Prediction Visualizer](https://brewinvaz.github.io/substack/2026-01-attention/visualizer/prediction.html) to see this in action.

## Context Windows and Their Limits

Every model has a maximum context length: 8K, 32K, 128K, or more tokens. This isn't arbitrary.

### Why Limits Exist

Attention computes relationships between every pair of tokens. For $n$ tokens, that's $n^2$ comparisons: each of the $n$ Query vectors must compute a dot product with all $n$ Key vectors. Double your context length and you quadruple the computation. This quadratic ($O(n^2)$) scaling puts hard limits on practical context sizes.

### What Happens at the Limit

As you approach the context limit, several things happen.

- **Attention dilution** means more tokens compete for attention weight, so each individual token's influence decreases.
- **Lost in the middle intensifies** as the middle-position disadvantage grows with context length.
- **Coherence degrades** because the model has more to track, and contradictions become more likely.

### Strategies for Long Content

- **Chunking** splits long documents into sections, processes them separately, and combines results.
- **Summarization** condenses earlier content into summaries that attention can reference efficiently.
- **RAG (Retrieval-Augmented Generation)** retrieves only relevant chunks based on the current query instead of putting everything in context.

## Common Failure Modes

Understanding attention also explains why LLMs fail in predictable ways.

- **Attention dilution** happens when too much "just in case" context dilutes attention across irrelevant tokens.
- **Competing instructions** occur when contradictory guidance causes attention to pull from both inconsistently.
- **Lost in the middle** means critical information buried in long prompts may be underweighted.
- **Negation blindness** results from "Don't do X" activating X in attention space.
- **Hallucination from weak attention** emerges when Queries don't strongly match any Keys, leading the model to generate plausible-sounding but incorrect content.

## Cost and Latency Considerations

Most API pricing is per-token. Attention must process every input token and generate every output token.

**Practical tips**

- Use prompt caching when making multiple calls with the same system prompt.
- Be concise, since every unnecessary token costs computation.
- Limit output length if you only need a brief answer.
- Consider RAG vs. long context based on what information needs simultaneous attention.

## Quick Reference: Mechanism to Technique

| How Attention Works | Prompting Technique |
|---------------------|---------------------|
| Q/K dot products find matches | Be specific and detailed |
| Autoregressive generation | Chain-of-thought |
| Pattern matching from context | Few-shot examples |
| Format tokens as anchors | Structured output |
| Priming attention weights | Role and persona |
| Position-dependent weights | Instruction positioning |
| Tokens activate as Keys | Avoid negation |
| Delimiter tokens segment context | Use formatting/delimiters |
| Primed tokens seed attention | Output priming |
| Post-attention sampling | Temperature control |

## Conclusion

The attention mechanism is not magic. It's matrix multiplication, softmax, weighted sums etc. Every token computes relevance to every other token, and the output is a blend of information based on those relevance scores.

Once you internalize this, prompting transforms from folklore into engineering:

- **Specific prompts work** because they create more matchable Keys.
- **Chain-of-thought works** because intermediate tokens become new Key/Value pairs.
- **Examples work** because they create attention templates.
- **Position matters** because attention weights vary by position.
- **Negation fails** because it activates what you're trying to avoid.

You're not coaxing a mysterious intelligence. You're providing inputs to a well-defined computational process. Understanding that process lets you reason about what will work and why.

---

**A note on multi-modal models**: The attention mechanism described here powers vision and video models too. Images are split into patches that become tokens; the Q/K/V mathematics stays identical. Cross-attention lets text tokens attend to image regions. If there's interest, a follow-up article can explore how transformers see.

---

**Further Reading**
- Vaswani et al., "[Attention Is All You Need](https://arxiv.org/abs/1706.03762)" (2017), the original transformer paper
- Wei et al., "[Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)" (2022), the paper that introduced chain-of-thought prompting
- Jay Alammar's "[The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)" for excellent visual explanations

---

*Brewin writes about applied AI/ML, data infrastructure, and the intersection of AI/ML and business. Opinions are the author's own.*

