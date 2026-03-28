# Of Nations and Neurons: What Ricardo Knew About Your AI Strategy

*The economics of specialization have guided trade for centuries. They apply to your AI roadmap too.*

---

Picture this. Your senior developer fires up Cursor on a Friday afternoon. By Monday morning, she's built a working CRM with pipeline tracking, email integration, and a slick dashboard. Leadership sees the demo. Eyes light up. Someone pulls up the Salesforce invoice. "$85,000 a year for something Sarah built in a weekend?"

The pitch writes itself. Why are we paying vendors for software our team can now build in days? AI coding agents like Cursor, Claude Code, and GitHub Copilot have made software development shockingly fast. A developer who once needed weeks to scaffold a basic internal tool can now have a working prototype before lunch. The gap between "idea" and "demo" has collapsed.

And so the temptation spreads. Custom ticketing system instead of Zendesk. Internal analytics dashboard instead of Looker. A homegrown HR portal instead of Workday. The logic feels airtight. We have smart engineers. We have AI coding tools. We can build exactly what we need, with no vendor lock-in, no per-seat pricing, no features we'll never use.

This conversation is happening right now in companies across every industry. Retool's 2026 survey of 817 teams found that 35% have already replaced at least one SaaS tool with a custom build. Gartner predicts that by 2028, 40% of new enterprise production software will be created with "vibe coding" techniques and tools.

The instinct isn't crazy. But it isn't new, either.

Two hundred years ago, nations faced the same question about what to produce domestically. A British economist named David Ricardo watched countries debate whether to make everything themselves or trade with their neighbors. The instinct then was identical to yours now. "We have the resources. We have the talent. Why buy what we can make?" Ricardo's answer was counterintuitive, and it reshaped how the world thinks about economic strategy.

## What Ricardo Actually Said

In 1817, David Ricardo published *On the Principles of Political Economy and Taxation* and laid out the theory of comparative advantage. His example involved England and Portugal producing cloth and wine.

Portugal was better at making both products. It took Portugal 90 men to produce a unit of cloth and 80 men to produce a unit of wine. England needed 100 men for cloth and 120 for wine. By any absolute measure, Portugal was the superior producer across the board.

And yet, Ricardo argued, both countries would be better off if they specialized. Portugal's advantage was greatest in wine production, so it should focus there. England's disadvantage was smallest in cloth, so that's where England should concentrate. When each country specialized in what it was *relatively* best at and traded for the rest, total output went up and both nations benefited.

The key insight trips people up to this day. You don't need to be bad at something to stop doing it. You just need to be *relatively* better at something else.

Now apply that to your engineering team. AI coding agents have given nearly every development team something like an absolute advantage in building software. Your engineers genuinely can build a custom ticketing system, a reporting dashboard, an internal workflow tool. They have the skills, and now they have the AI horsepower to do it fast. But those same engineers might be the only people in your company who can build the product features that generate revenue, the integrations that close enterprise deals, the performance improvements that reduce churn. That product work is where your comparative advantage lives. The ticketing system is Zendesk's comparative advantage, not yours.

The question isn't whether your team can build it. With AI coding agents, of course they can. The question is what they're *relatively* best at.

## The Opportunity Cost Paradox

Economists call it opportunity cost. Every resource committed to one task is a resource unavailable for another. In the abstract, that's obvious. In practice, it gets buried under the excitement of a working prototype.

Here's the paradox of AI coding agents. They make the initial build dramatically cheaper. But they don't make the ongoing costs cheaper at all. And in software, the initial build is the small part.

Research on software lifecycle costs has been remarkably consistent for decades. Maintenance consumes somewhere between 60% and 80% of total software lifecycle costs, with some studies putting the figure as high as 90%. The 60/60 rule, one of the few established "laws" of software maintenance, tells us that 60% of lifecycle costs go to maintenance and 60% of that maintenance work goes to user-requested enhancements rather than bug fixes. Your custom-built CRM won't just need bug fixes. It will need feature after feature after feature, because users always want more.

AI coding agents accelerate the 20% to 40% of costs that come from initial development. They do little to reduce the 60% to 80% that comes from everything afterward. Security patches, dependency updates, infrastructure monitoring, on-call rotations, documentation, onboarding new team members, accessibility compliance, data migration. None of that gets cheaper because an AI helped write the first version.

A software engineer in the US commands $150,000 to $250,000 or more in fully loaded costs. Every engineer maintaining a custom internal tool is an engineer not shipping the product features that differentiate your company. That is the opportunity cost. And it compounds every quarter the custom tool stays in production.

The Standish Group's CHAOS reports have tracked custom software project outcomes for three decades. Their data consistently shows that only about 31% of custom software projects succeed on time, on budget, and with full scope. Large projects perform dramatically worse, with success rates below 10%. AI coding agents may improve the initial development phase, but they don't solve the coordination, scope creep, and requirements ambiguity that cause most projects to go sideways.

## Where the Firm Ends and the Market Begins

There's another economist worth listening to here. In 1937, Ronald Coase asked a question so fundamental it's almost embarrassing nobody had asked it before. If markets are efficient, why do firms exist at all? Why doesn't everyone just contract with everyone else for every task?

His answer, which eventually won him the Nobel Prize in 1991, was transaction costs. Using the market has friction. You have to search for providers, negotiate terms, write contracts, enforce agreements, protect intellectual property. When those costs are high enough, it makes sense to bring work inside the firm. When they're low, it makes sense to buy from the market.

Coase essentially defined the boundary of the firm as the point where the cost of internal coordination equals the cost of external transaction.

Here's the irony of the current moment. AI coding agents have lowered the cost of *building* software. But SaaS has lowered the cost of *buying* software even more. Self-service signups. Standard REST APIs. Transparent per-seat pricing. Free trials. One-click integrations. OAuth flows that take minutes to configure. The search costs, bargaining costs, and switching costs that Coase identified have all dropped through the floor.

In 2010, adopting enterprise software meant six-month procurement cycles, expensive consultants, and painful data migrations. The transaction costs were genuinely high, and building internally often made sense. By 2026, you can have a Zendesk instance running in an afternoon. An Airtable workspace by lunch. A Linear project board before your coffee gets cold.

When external transaction costs drop that sharply, Coase's framework tells you the boundary of the firm should contract for commodity business software. Not because your team can't build it, but because the economic logic has shifted beneath your feet. AI coding agents have moved the "build" cost curve down, but SaaS has moved the "buy" cost curve down further and faster for most standard business applications.

## The TCO Iceberg

When someone says "let's build this ourselves with Cursor," they're usually looking at the tip of the iceberg. The visible costs. The prototype. The demo. Below the waterline sits everything else.

**The prototype trap.** AI coding agents produce impressive prototypes fast. But prototypes aren't products. The gap between a working demo and a production-ready application is enormous. Error handling, edge cases, input validation, logging, monitoring, authentication, authorization, rate limiting, data backup, disaster recovery. A study by Jasper Cooper documented this gap in detail, noting that a "weekend prototype" with AI agents typically requires 18 months of additional work to reach production quality. The demo that wowed leadership on Monday isn't the same thing as software you can rely on in production.

**Maintenance burden.** Security updates, dependency management, infrastructure costs, monitoring and alerting, performance tuning. These are ongoing costs that never stop. Gartner's research shows maintenance costs follow a predictable escalation pattern; 10% to 25% of development costs annually in years one and two, climbing to 20% to 40% annually by year six and beyond.

**Feature parity.** Salesforce has thousands of engineers who have spent two decades handling edge cases, building integrations, testing accessibility, and responding to customer feedback. Your weekend prototype has none of that. Every feature your users request is a feature you now have to build and maintain yourself.

**Knowledge concentration risk.** The developer who built the custom tool with AI agents leaves. Now what? An interesting finding from Amplifying AI's research on Claude Code's behavior is relevant here. When given open-ended prompts, Claude Code chose to build custom solutions from scratch in 12 of 20 tool categories, writing JWT auth instead of using Auth0, building custom caching instead of reaching for Redis. The AI agent optimizes for fewer dependencies, but the result is bespoke code that may be harder for the next developer to understand and maintain.

**Compliance and security.** SOC 2. GDPR. HIPAA. WCAG accessibility standards. Vendors have dedicated teams for this. Your custom-built tool has whatever your developers remembered to include before the sprint ended.

**Opportunity cost.** Every hour spent on internal tools is an hour not spent on the product your customers pay for.

To see how these hidden costs compare to the visible ones, explore the [interactive TCO iceberg visualization](tco-iceberg.html).

## What Actually Happened

Theory is useful, but outcomes are convincing. Let's look at what happens when organizations make these decisions in the real world.

### HealthCare.gov and the Custom Build Disaster

The most expensive custom software failure in recent American history might be HealthCare.gov. When the federal government launched the site in October 2013, it was the product of a massive custom build involving multiple contractors. On launch day, four million users visited the portal. Six successfully registered. Six.

The original contract-based cost estimate was $93.7 million. The actual cost swelled to $1.7 billion according to the Office of Inspector General. The consumer-facing frontend, built by one contractor, couldn't communicate with the backend, built by a different contractor. Federal officials received 18 written warnings that the project was off course and chose to press ahead anyway.

The site was eventually rescued, but the lesson endures. Custom-building complex software is not just a technical challenge. It's a coordination, management, and integration challenge. And those challenges don't get easier just because AI wrote the code faster.

### The Build-Then-Buy Pattern

The "not invented here" syndrome is well documented in enterprise software. As BMC Software and others have chronicled, the pattern repeats with striking regularity. An internal team builds a custom CRM or ERP system. That system becomes a manifestation of the team's identity and competence. Introducing a superior external product feels like an invalidation of their past work, so the organization resists switching. Eventually, the maintenance burden becomes unsustainable, and the company purchases the vendor solution it should have adopted in the first place, having spent years of engineering time on a solution that was never their comparative advantage.

This pattern is so common that Retool's research specifically calls it out. The SaaS tool the team didn't buy keeps getting better quarter after quarter, while the internal build falls behind because nobody has time to invest in a tool that isn't the core product.

### Spotify's Backstage and the Exception That Proves the Rule

Spotify built an internal developer portal during a period of rapid growth. As they moved to the cloud and adopted microservices, they ended up with tens of thousands of software components and a sprawl that made it difficult to onboard new developers. Their custom-built portal, Backstage, became so valuable that they open-sourced it in 2020.

But look at *why* Backstage worked. Spotify is a software company. Developer experience is directly tied to their ability to ship product. And the problem Backstage solved, managing a sprawling microservices architecture with thousands of components, was genuinely unique to organizations operating at Spotify's scale. No adequate vendor solution existed. This isn't a counterargument to comparative advantage. It's a perfect illustration of it. Spotify built where they had a genuine competitive need that no vendor could serve.

### Boeing and Apple, Revisited

Boeing's 787 Dreamliner program illustrates the danger of outsourcing too much. Boeing outsourced roughly 70% of the design, engineering, and manufacturing. The original $5.5 billion budget ballooned past $32 billion, and the plane arrived 40 months late. Boeing outsourced its own comparative advantage, systems integration, and paid dearly for it.

Apple went the opposite direction with its M-series chips. After years of using Intel processors, Apple invested in designing custom silicon. The M1 chip delivered industry-leading performance per watt, and Mac revenue jumped $2.1 billion in subsequent quarters. Apple had a genuine comparative advantage. They controlled the full hardware-software stack across hundreds of millions of devices and had performance requirements that Intel wasn't prioritizing.

The pattern across these cases is consistent. Build where you have a genuine, defensible advantage that no external provider can match. Buy everything else.

### The Market Is Already Deciding

Menlo Ventures' 2025 State of Generative AI survey found that 76% of enterprise AI use cases are now purchased rather than built, a dramatic shift from the prior year when the split was roughly even. Andreessen Horowitz's survey of 100 enterprise CIOs confirmed the trend; off-the-shelf solutions are eclipsing custom builds, with enterprises increasingly favoring AI-native third-party applications over internal development for non-core capabilities. The market is collectively arriving at Ricardo's conclusion, even if most executives wouldn't frame it that way.

## When Building Does Make Sense

It would be intellectually dishonest to suggest that buying is always better than building. Ricardo's framework doesn't say "never produce." It says "produce where your comparative advantage lies." Sometimes building custom software is exactly where that advantage sits.

**Your core product is software.** If you're a software company building features that directly generate revenue and differentiate you from competitors, that's building your product, not building internal tools. Your engineering time goes directly to your comparative advantage.

**Deep integration requirements that no vendor can satisfy.** Sometimes the workflow you need to support is so tightly coupled to your core systems that no off-the-shelf product can integrate deeply enough. But be honest about how often this is truly the case versus how often it's an excuse.

**Regulatory or security requirements preclude external vendors.** In healthcare, defense, and certain financial applications, you may need complete control over data handling, access patterns, and audit trails. The a16z CIO survey confirmed that regulated industries like healthcare continue to build internally more than others for this reason.

**The workflow is so unique that no vendor solution exists.** This is increasingly rare for commodity business functions but remains valid for highly specialized applications. If you've searched the market and genuinely cannot find a solution, building makes sense.

**Scale justifies the investment.** Apple's M-series chips made economic sense because they ship hundreds of millions of devices. The fixed cost of development gets amortized across enormous volume. If your scale is sufficient, the economics of building can genuinely work out.

There's also a middle path worth considering. Toyota's keiretsu model represents a "third way" between pure build and pure buy. Toyota maintains deep, long-term partnerships with key suppliers like Denso and Aisin, holding roughly 25% stakes in these companies. They retain integration expertise and strategic control while benefiting from supplier specialization.

For software strategy, this might look like using vendor platforms as the foundation and customizing on top. Use Salesforce but build custom integrations that connect it to your proprietary data. Use Zendesk but extend it with custom workflows specific to your domain. You own the integration layer. You own the domain knowledge. You partner on the underlying platform. This is arguably the most common and most successful approach in practice.

The key test is straightforward. Is this capability part of what makes your company uniquely valuable to customers? If yes, build it. If no, buy it. And be ruthlessly honest about the answer.

## What Ricardo Would Ask You

Ricardo never saw a coding agent or a pull request. But the question he'd ask you is the same one he posed to the merchants and politicians of early 19th-century England.

It isn't "Can you build this?" Portugal could produce cloth. England could produce wine. Your team with Cursor and Claude Code can absolutely build a custom CRM in a weekend. The ability to do something has never been the relevant question.

The question is "What are you *relatively* best at?"

Your engineers' time is finite. Your budget is finite. Your window of competitive relevance is finite. Within those constraints, every sprint spent on a custom internal tool is a sprint not spent on the capabilities that make your company irreplaceable to its customers.

That Friday afternoon prototype is seductive. It works. It's fast. It's exactly what you asked for. But Ricardo would gently point out that Portugal's cloth was perfectly fine, too. That didn't make it the right thing to produce.

The tools have changed. The economics haven't.

---

## Sources and Further Reading

**Economic Theory**
- Ricardo, D. (1817). [On the Principles of Political Economy and Taxation](https://www.econlib.org/library/Ricardo/ricP.html). John Murray.
- Coase, R. (1937). [The Nature of the Firm](https://en.wikipedia.org/wiki/The_Nature_of_the_Firm). *Economica*, 4(16), 386-405.

**AI Coding Agents and Build vs. Buy**
- Retool. (2026). [The Build vs. Buy Shift: AI, Shadow IT, and the SaaS Replacement Era](https://retool.com/blog/ai-build-vs-buy-report-2026).
- ChatBotKit. [Why AI Agents Build Instead of Buy](https://chatbotkit.com/reflections/why-ai-agents-build-instead-of-buy).
- Cooper, J. (2025). [Build vs Buy in the Modern Age of AI Agents: Why Your Weekend Prototype Will Cost 18 Months](https://medium.com/@jasper.cooper_30938/build-vs-buy-in-the-modern-age-of-ai-agents-why-your-weekend-prototype-will-cost-18-months-094322f1c6c1).
- Gartner. (2025). [Why Vibe Coding Needs to Be Taken Seriously](https://info.legitsecurity.com/gartner-vibe-coding-report).
- CIO Dive. [The Enterprise Is Not Ready for Vibe Coding — Yet](https://www.ciodive.com/news/vibe-coding-enterprise-CIO-strategy/750349/).

**Enterprise AI Adoption and Market Data**
- Menlo Ventures. (2025). [The State of Generative AI in the Enterprise](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/).
- Andreessen Horowitz. (2025). [How 100 Enterprise CIOs Are Building and Buying Gen AI in 2025](https://a16z.com/ai-enterprise-2025/).

**Software Maintenance and Project Failure Rates**
- Standish Group. [CHAOS Report on IT Project Outcomes](https://opencommons.org/CHAOS_Report_on_IT_Project_Outcomes).
- Wikipedia. [Software Maintenance](https://en.wikipedia.org/wiki/Software_maintenance).
- O'Reilly. [The 60/60 Rule](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html). *97 Things Every Project Manager Should Know*.

**Case Studies**
- Dolfing, H. [Case Study: The Disastrous Launch of Healthcare.gov](https://www.henricodolfing.com/2022/12/case-study-launch-failure-healthcare-gov.html).
- Harvard. [The Failed Launch of www.HealthCare.gov](https://d3.harvard.edu/platform-rctom/submission/the-failed-launch-of-www-healthcare-gov/).
- BMC Software. [What is Not Invented Here Syndrome?](https://www.bmc.com/blogs/not-invented-here-syndrome/).
- Spotify Engineering. [Backstage 101](https://backstage.spotify.com/discover/backstage-101).
- Gates, D. [Boeing 787's Problems Blamed on Outsourcing, Lack of Oversight](https://www.seattletimes.com/business/boeing-787rsquos-problems-blamed-on-outsourcing-lack-of-oversight/). *The Seattle Times*.
- Fortune. (2022). [Apple Sees Big Mac Sales Boost Thanks to M1 Chips](https://fortune.com/2022/01/28/apple-mac-earnings-macbook-m1-chips/).

**Toyota Keiretsu Model**
- FasterCapital. [Toyota's Production System: A Keiretsu Success Story](https://fastercapital.com/content/Toyota--Toyota-s-Production-System--A-Keiretsu-Success-Story.html).

---

*The opinions expressed in this article are solely those of the author and do not necessarily reflect the views of any organization or entity.*
