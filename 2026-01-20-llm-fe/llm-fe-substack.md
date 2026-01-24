# LLM-FE: A Look at Evolutionary AI for Feature Engineering

*A recent framework combines LLMs with evolutionary search to generate features that exceed manual and traditional automated approaches. Here's why business leaders should care.*

---

Data scientists spend most of their time not on the machine learning work you'd expect, but on the less glamorous task of preparing data. Industry surveys consistently show data preparation consumes a large portion of a data scientist's time, with estimates ranging from 45% to 80%.

Within that time sink, feature engineering (the art of transforming raw data into inputs that help models make better predictions) is especially time-consuming. It requires domain expertise, creativity, and exhaustive trial-and-error. Yet it's also where the biggest wins come from. As the saying goes in ML circles: "More data beats clever algorithms, but better features beat more data."

A recent research paper offers one such solution. LLM-FE, published in March 2025, is part of an emerging wave of approaches that combine Large Language Models with evolutionary optimization to automatically discover high-performing features. (See: Abhyankar et al., "[LLM-FE: Automated Feature Engineering for Tabular Data with LLMs as Evolutionary Optimizers](https://arxiv.org/abs/2503.14434)," arXiv, March 2025.) The results are notable: LLM-FE achieved the lowest mean rank of 1.47 across 19 classification datasets using XGBoost, outperforming traditional methods like OpenFE and AutoFeat, as well as other LLM-based approaches including CAAFE and FeatLLM. On regression tasks, it achieved a mean rank of 1.00 across 10 datasets.

Let me explain why this matters and how it works.

## The Problem: Earlier Approaches Hit a Wall

Until recently, there were two main approaches to automating feature engineering:

**Traditional automated methods** (like Featuretools, OpenFE, and AutoFeat) apply predefined mathematical transformations (ratios, logarithms, polynomial combinations) exhaustively across your data. They're thorough but domain-blind. They don't know that combining `blood_pressure` and `age` might reveal cardiovascular risk any more than combining `shoe_size` and `zipcode`.

**Earlier LLM-based methods** (like CAAFE from 2023) improved on this by using GPT-4 to propose features that make domain sense. The LLM reads your column names and dataset description, then suggests meaningful transformations. This works better, but these approaches have a key limitation: they ask the LLM for feature ideas, test them, keep the good ones, and stop there. They don't learn from what worked. They don't refine promising directions. They don't explore systematically.

## How LLM-FE Works: Evolution Meets Intelligence

LLM-FE treats feature engineering as a *program search problem*. Instead of asking for features once, it runs an iterative evolutionary process where the LLM generates, tests, and refines feature transformation programs over multiple generations.

Here's how it works:

### Step 1: Generate Feature Ideas as Code

The system prompts an LLM with your dataset's structure, column descriptions, and the prediction task. The LLM generates code that transforms your data: creating new columns, combining existing ones, applying domain-appropriate transformations.

For example, if you're predicting customer churn and have columns for `total_orders`, `support_tickets`, and `days_since_last_purchase`, the LLM might propose:

```
# Feature: support_burden_ratio
# Rationale: High tickets relative to orders indicates friction
df['support_burden'] = df['support_tickets'] / (df['total_orders'] + 1)

# Feature: purchase_recency_score
# Rationale: Decaying engagement signal
df['recency_score'] = 1 / (df['days_since_last_purchase'] + 1)
```

### Step 2: Test Against Reality

Each proposed transformation is applied to your training data. A prediction model (XGBoost, MLP, or TabPFN) is trained on the transformed dataset and evaluated on a validation set. This gives a concrete performance score for each feature program.

This is crucial: the LLM's ideas are judged by actual predictive performance, not just whether they sound reasonable.

### Step 3: Evolve Through Multi-Population Memory

Here's where LLM-FE differs from simpler approaches. It keeps multiple "islands" of good solutions evolving in parallel, stored in a memory bank. Each island develops independently, preventing the system from getting stuck on one approach too early. The LLM draws on these stored examples when generating new ideas, combining successful patterns from different islands.

The system keeps iterating: generate new features informed by what's worked before, test them, update the memory, repeat. Over time, features get progressively better.

### Step 4: Output Interpretable Results

Unlike black-box deep learning, LLM-FE produces code that humans can read and audit. Each feature comes with the LLM's explanation for why it might help. This matters in regulated industries like healthcare and finance where you need to justify your model's inputs.

## The Results: Strong Performance Across Benchmarks

The researchers tested LLM-FE against both traditional automated methods (AutoFeat, OpenFE) and other LLM-based approaches (CAAFE, FeatLLM, OCTree) across 29 datasets spanning classification and regression tasks.

**On classification tasks**, LLM-FE achieved the best mean rank across all methods. More importantly, it was consistent: it performed well across datasets rather than excelling on some while struggling on others.

**On regression tasks**, LLM-FE achieved a mean rank of 1.00 across 10 datasets, meaning it ranked first on every regression benchmark tested.

**Across different model architectures**, LLM-FE outperformed other feature engineering methods when tested with XGBoost, TabPFN, and MLP. This suggests it discovers general patterns in the data rather than model-specific artifacts.

LLM-FE also held up well when noise was added to the data, which matters because real-world data is rarely clean.

## Why Evolutionary Search Matters

You might wonder: does the evolutionary part really help, or could you just ask the LLM for more ideas?

The researchers tested this by removing different parts of the system. The finding: evolutionary refinement matters most. When they removed the iterative loop where features evolve based on feedback, performance dropped the most. It's the single most important factor in LLM-FE's success.

This makes intuitive sense. The first feature ideas an LLM proposes are based on general domain knowledge. But as the system learns what actually improves performance on *your specific dataset*, it can refine those ideas in ways that neither pure LLM prompting nor traditional automated search would discover.

## A Concrete Business Example: Healthcare Risk Prediction

Let me walk through how this might work in practice.

**The scenario**: You're building a risk model for a healthcare payer to identify patients likely to have high costs next year. Your data includes:

- **age**: Patient age
- **bmi**: Body mass index
- **chronic_conditions**: Count of diagnosed chronic conditions
- **rx_fills_last_year**: Prescription fills in past 12 months
- **ed_visits_last_year**: Emergency department visits
- **pcp_visits_last_year**: Primary care visits
- **specialist_visits_last_year**: Specialist visits
- **last_hospitalization_days**: Days since last hospital stay (or null)
- **total_cost_last_year**: Medical spend in prior year

**Traditional approach**: A data scientist manually brainstorms features: cost per chronic condition, ED-to-PCP ratio (are they using emergency care instead of primary care?), medication adherence proxies. This takes weeks and depends heavily on that person's clinical intuition.

**LLM-FE approach**: You feed the schema and task description into the system. Over multiple iterations, it might discover:

*Generation 1*: Basic ratios and interactions the LLM knows from medical literature, such as BMI categories and age-adjusted condition counts.

*Generation 5*: Refined features that actually perform well on your data, perhaps a "care fragmentation score" combining ED, PCP, and specialist visits in a way that captures patients bouncing between providers.

*Generation 15*: Non-obvious interactions the LLM wouldn't have proposed initially but discovered through evolutionary refinement, maybe a specific threshold where `rx_fills * chronic_conditions` becomes predictive, or a transformation of `last_hospitalization_days` that captures non-linear risk decay.

Each feature comes with code you can audit and rationale you can explain to clinicians and regulators.

**The business impact**:

- **Speed**: Weeks of manual feature engineering compressed into hours of compute time
- **Coverage**: Systematic exploration of the feature space, not limited to what one data scientist thinks of
- **Consistency**: Reproducible results that don't depend on which expert happens to be available
- **Explainability**: Every feature has traceable code and rationale, critical for healthcare compliance

## Practical Considerations

Before you ask your data team to adopt LLM-FE tomorrow, some honest caveats:

**Where it excels**:
- Tabular data with meaningful column names (not opaque identifiers)
- Small to medium datasets where feature engineering matters more than scale
- Domains the LLM has seen in training (healthcare, finance, e-commerce, marketing)
- Situations requiring interpretable features

**Where it may struggle**:
- Very large datasets (the iterative process has computational overhead)
- Highly specialized domains with no public literature
- Data with cryptic column names that give the LLM no semantic signal
- Real-time applications where you can't wait for evolutionary search

**Implementation status**: The code is available on [GitHub](https://github.com/nikhilsab/LLMFE). It's research-grade software, not a polished enterprise tool yet. Expect this approach to be integrated into mainstream AutoML platforms over the next 12-24 months.

## What This Means for Business Leaders

If you oversee data science or analytics teams, here's the practical takeaway:

**Feature engineering is about to get cheaper.** The combination of LLM domain knowledge and evolutionary optimization represents a meaningful advance. Tasks that required experienced data scientists with domain expertise can increasingly be automated, or at least accelerated.

**The expertise shifts, it doesn't disappear.** Your data scientists will spend less time manually crafting features and more time on problem framing, validation design, and interpreting results. The judgment about whether a feature *should* be used (ethics, business logic, regulatory constraints) remains human work.

**Start experimenting now.** Pick a well-defined prediction problem with clean, labeled data. Run LLM-FE against your team's manual feature engineering. Compare not just performance but time-to-solution. This gives you data for planning, not just hype.

**Watch the tool ecosystem.** LLM-FE is one of several approaches in this space (CAAFE, FeatLLM, OCTree are others). The field is moving fast. Within a year or two, these capabilities will likely be integrated into mainstream AutoML platforms.

The broader pattern matches what we're seeing across AI: LLMs aren't replacing experts, but they're amplifying what experts can do. Feature engineering, long considered one of the most skill-dependent parts of machine learning, is no exception.

---

**Reference**: Abhyankar, Nikhil, Parshin Shojaee, and Chandan K. Reddy. "LLM-FE: Automated Feature Engineering for Tabular Data with LLMs as Evolutionary Optimizers." arXiv:2503.14434, March 2025. [https://arxiv.org/abs/2503.14434](https://arxiv.org/abs/2503.14434). Code available at: [https://github.com/nikhilsab/LLMFE](https://github.com/nikhilsab/LLMFE)

---

*Brewin writes about applied AI/ML, data infrastructure, and the intersection of AI/ML and business. Edited with LLM assistance.*

*The opinions expressed in this article are those of the author.*
