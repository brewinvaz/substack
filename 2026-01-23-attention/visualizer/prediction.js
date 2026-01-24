// Next Token Prediction Visualizer
// Demonstrates how transformers generate text step by step

// Context and vocabulary data
const CONTEXT_TOKENS = ['The', 'cat', 'sat', 'on', 'the'];

// Simplified hidden states (enriched by attention)
const HIDDEN_STATES = [
    [0.42, 0.18, 0.73, 0.31],   // The - carries context
    [0.85, 0.32, 0.61, 0.74],   // cat - subject, animate
    [0.38, 0.71, 0.89, 0.25],   // sat - verb with subject/object info
    [0.29, 0.54, 0.22, 0.83],   // on - preposition context
    [0.51, 0.12, 0.67, 0.45]    // the - expects noun
];

// Vocabulary with base logits (designed to show realistic distribution)
const VOCABULARY = [
    { token: 'mat', logit: 4.2 },
    { token: 'floor', logit: 3.8 },
    { token: 'couch', logit: 3.2 },
    { token: 'ground', logit: 3.0 },
    { token: 'bed', logit: 2.6 },
    { token: 'chair', logit: 2.4 },
    { token: 'table', logit: 2.1 },
    { token: 'sofa', logit: 1.9 },
    { token: 'rug', logit: 1.7 },
    { token: 'carpet', logit: 1.5 },
    { token: 'windowsill', logit: 0.8 },
    { token: 'roof', logit: 0.3 }
];

// Continuation tokens for autoregressive generation
const CONTINUATION_VOCAB = {
    'mat': [
        { token: '.', logit: 4.5 },
        { token: ',', logit: 2.1 },
        { token: 'and', logit: 1.8 }
    ],
    '.': [
        { token: 'The', logit: 4.2 },
        { token: 'It', logit: 3.8 },
        { token: 'She', logit: 2.5 }
    ],
    'The': [
        { token: 'cat', logit: 3.5 },
        { token: 'dog', logit: 3.2 },
        { token: 'sun', logit: 2.8 }
    ]
};

// State
let currentStep = 1;
let isPlaying = false;
let playTimeout = null;
let speed = 1;
let temperature = 1.0;
let samplingMethod = 'greedy';
let paramValue = 5;
let generatedTokens = [];
let probabilities = [];

const TOTAL_STEPS = 5;
const STEP_LABELS = [
    'Context Input',
    'Project to Vocabulary',
    'Temperature & Softmax',
    'Token Selection',
    'Autoregressive Loop'
];

// Softmax function with temperature
function softmax(logits, temp = 1.0) {
    const scaledLogits = logits.map(l => l / temp);
    const maxLogit = Math.max(...scaledLogits);
    const exp = scaledLogits.map(l => Math.exp(l - maxLogit));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(e => e / sum);
}

// Format number as percentage
function formatPercent(n) {
    return (n * 100).toFixed(1) + '%';
}

// Format vector for display
function formatVector(vec, decimals = 2) {
    if (vec.length <= 4) {
        return '[' + vec.map(v => v.toFixed(decimals)).join(', ') + ']';
    }
    return '[' + vec.slice(0, 3).map(v => v.toFixed(decimals)).join(', ') + ', ...]';
}

// Initialize
function init() {
    computeProbabilities();
    setupEventListeners();
    showStep(1);
    updateButtonStates();
}

function computeProbabilities() {
    const logits = VOCABULARY.map(v => v.logit);
    probabilities = softmax(logits, temperature);
}

function setupEventListeners() {
    document.getElementById('playPause').onclick = togglePlay;
    document.getElementById('stepBack').onclick = stepBack;
    document.getElementById('stepForward').onclick = stepForward;
    document.getElementById('reset').onclick = reset;
    document.getElementById('speed').oninput = updateSpeed;
    document.getElementById('temperature').oninput = updateTemperature;
    document.getElementById('paramValue').oninput = updateParam;

    // Step marker clicks
    document.querySelectorAll('.step-marker').forEach(marker => {
        marker.onclick = () => {
            const step = parseInt(marker.dataset.step);
            if (step) {
                stopPlaying();
                showStep(step);
            }
        };
    });

    // Sampling method buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            samplingMethod = btn.dataset.method;
            updateSamplingUI();
            renderTokenSelection();
        };
    });

    // Generation controls
    document.getElementById('generateNext').onclick = generateNextToken;
    document.getElementById('resetGeneration').onclick = resetGeneration;
}

function togglePlay() {
    isPlaying = !isPlaying;
    updatePlayButton();

    if (isPlaying) {
        runAutoPlay();
    } else {
        if (playTimeout) {
            clearTimeout(playTimeout);
            playTimeout = null;
        }
    }
}

function runAutoPlay() {
    if (!isPlaying) return;

    const delay = 3500 / speed;

    playTimeout = setTimeout(() => {
        if (isPlaying && currentStep < TOTAL_STEPS) {
            showStep(currentStep + 1);
            runAutoPlay();
        } else {
            isPlaying = false;
            updatePlayButton();
        }
    }, delay);
}

function updatePlayButton() {
    const btn = document.getElementById('playPause');
    const playIcon = btn.querySelector('.play-icon');
    const pauseIcon = btn.querySelector('.pause-icon');
    const btnText = btn.querySelector('.btn-text');

    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        btnText.textContent = 'Pause';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        btnText.textContent = 'Play';
    }
}

function stepBack() {
    if (currentStep > 1) {
        stopPlaying();
        showStep(currentStep - 1);
    }
}

function stepForward() {
    if (currentStep < TOTAL_STEPS) {
        stopPlaying();
        showStep(currentStep + 1);
    }
}

function reset() {
    stopPlaying();
    showStep(1);
}

function stopPlaying() {
    isPlaying = false;
    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }
    updatePlayButton();
}

function updateSpeed() {
    speed = parseFloat(document.getElementById('speed').value);
    document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
}

function updateTemperature() {
    temperature = parseFloat(document.getElementById('temperature').value);
    document.getElementById('tempValue').textContent = temperature.toFixed(1);
    document.getElementById('tempFormula').textContent = temperature.toFixed(1);
    computeProbabilities();
    renderProbabilityChart();
    updateDistributionInsight();
}

function updateParam() {
    paramValue = parseInt(document.getElementById('paramValue').value);
    document.getElementById('paramDisplay').textContent =
        samplingMethod === 'topp' ? (paramValue / 10).toFixed(1) : paramValue;
    renderTokenSelection();
}

function updateSamplingUI() {
    const paramContainer = document.getElementById('samplingParam');
    const paramLabel = document.getElementById('paramLabel');
    const paramInput = document.getElementById('paramValue');
    const paramDisplay = document.getElementById('paramDisplay');

    if (samplingMethod === 'topk') {
        paramContainer.style.display = 'flex';
        paramLabel.textContent = 'k';
        paramInput.min = 1;
        paramInput.max = 10;
        paramInput.value = 5;
        paramValue = 5;
        paramDisplay.textContent = '5';
    } else if (samplingMethod === 'topp') {
        paramContainer.style.display = 'flex';
        paramLabel.textContent = 'p';
        paramInput.min = 1;
        paramInput.max = 10;
        paramInput.value = 5;
        paramValue = 5;
        paramDisplay.textContent = '0.5';
    } else {
        paramContainer.style.display = 'none';
    }

    updateMethodDescription();
}

function updateMethodDescription() {
    const desc = document.getElementById('methodDescription');
    const descriptions = {
        greedy: '<strong>Greedy:</strong> Always picks the highest probability token. Deterministic and consistent.',
        sample: '<strong>Sampling:</strong> Randomly selects based on probabilities. Each run may produce different results.',
        topk: '<strong>Top-k:</strong> Only considers the k highest probability tokens, then samples. Balances quality and diversity.',
        topp: '<strong>Top-p (Nucleus):</strong> Includes tokens until cumulative probability reaches p, then samples. Adapts to distribution shape.'
    };
    desc.innerHTML = descriptions[samplingMethod];
}

function updateDistributionInsight() {
    const insight = document.getElementById('distributionInsight');
    const text = insight.querySelector('.insight-text');

    if (temperature < 0.5) {
        text.textContent = 'Very low temperature - distribution is extremely peaked. Almost always selects "mat".';
    } else if (temperature < 0.8) {
        text.textContent = 'Low temperature - confident distribution. Strongly favors top candidates.';
    } else if (temperature <= 1.2) {
        text.textContent = 'Default distribution - balanced sampling across likely options.';
    } else if (temperature <= 1.8) {
        text.textContent = 'High temperature - flatter distribution. More diversity in selection.';
    } else {
        text.textContent = 'Very high temperature - nearly uniform distribution. May select unexpected tokens.';
    }
}

function updateButtonStates() {
    document.getElementById('stepBack').disabled = currentStep === 1;
    document.getElementById('stepForward').disabled = currentStep === TOTAL_STEPS;
}

function updateStepMarkers() {
    document.querySelectorAll('.step-marker').forEach(marker => {
        const step = parseInt(marker.dataset.step);
        marker.classList.remove('active', 'completed');
        if (step === currentStep) {
            marker.classList.add('active');
        } else if (step < currentStep) {
            marker.classList.add('completed');
        }
    });
}

function showStep(step) {
    currentStep = step;

    // Update progress bar
    const progress = (step / TOTAL_STEPS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // Update step label
    const stepLabel = document.getElementById('stepLabel');
    stepLabel.querySelector('.step-num').textContent = String(step).padStart(2, '0');
    stepLabel.querySelector('.step-name').textContent = STEP_LABELS[step - 1];

    // Update markers
    updateStepMarkers();

    // Update button states
    updateButtonStates();

    // Hide all steps, show current
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    // Render step content
    renderStep(step);
}

function renderStep(step) {
    switch(step) {
        case 1: renderContextInput(); break;
        case 2: renderProjection(); break;
        case 3: renderProbabilityChart(); break;
        case 4: renderTokenSelection(); break;
        case 5: renderAutoregressiveLoop(); break;
    }
}

// Step 1: Context Input
function renderContextInput() {
    const container = document.getElementById('enrichedTokens');
    container.innerHTML = '';

    CONTEXT_TOKENS.forEach((token, i) => {
        const el = document.createElement('div');
        el.className = 'enriched-token';
        if (i === CONTEXT_TOKENS.length - 1) {
            el.classList.add('last-token');
        }

        el.innerHTML = `
            <span class="token-text">${token}</span>
            <span class="token-vector">${formatVector(HIDDEN_STATES[i])}</span>
            <span class="token-index">pos[${i}]</span>
        `;
        container.appendChild(el);

        setTimeout(() => {
            el.classList.add('visible');
        }, i * (150 / speed));
    });
}

// Step 2: Project to Vocabulary
function renderProjection() {
    const preview = document.getElementById('logitsPreview');
    preview.innerHTML = '';

    // Animate logits appearing
    VOCABULARY.slice(0, 6).forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'logit-item';
        item.innerHTML = `
            <span class="logit-token">${v.token}</span>
            <span class="logit-value">${v.logit.toFixed(1)}</span>
        `;
        preview.appendChild(item);

        setTimeout(() => {
            item.classList.add('visible');
        }, 300 + i * (100 / speed));
    });

    // Add ellipsis
    setTimeout(() => {
        const ellipsis = document.createElement('div');
        ellipsis.className = 'logit-item visible';
        ellipsis.innerHTML = '<span class="logit-token">...</span><span class="logit-value">...</span>';
        preview.appendChild(ellipsis);
    }, 300 + 6 * (100 / speed));
}

// Step 3: Probability Chart
function renderProbabilityChart() {
    const chart = document.getElementById('probabilityChart');
    chart.innerHTML = '';

    computeProbabilities();

    const maxProb = Math.max(...probabilities);

    VOCABULARY.forEach((v, i) => {
        const bar = document.createElement('div');
        bar.className = 'prob-bar';

        const width = (probabilities[i] / maxProb) * 100;
        const isHigh = probabilities[i] > 0.1;
        const isMed = probabilities[i] > 0.03;

        bar.innerHTML = `
            <span class="prob-token">${v.token}</span>
            <div class="prob-track">
                <div class="prob-fill ${isHigh ? 'high' : isMed ? 'medium' : 'low'}" style="width: ${width}%"></div>
            </div>
            <span class="prob-value">${formatPercent(probabilities[i])}</span>
        `;
        chart.appendChild(bar);

        setTimeout(() => {
            bar.classList.add('visible');
        }, i * (60 / speed));
    });
}

// Step 4: Token Selection
function renderTokenSelection() {
    const chart = document.getElementById('selectionChart');
    chart.innerHTML = '';

    computeProbabilities();

    // Determine which tokens are in consideration based on method
    let consideredIndices = [];
    let cutoffLine = null;

    if (samplingMethod === 'greedy') {
        consideredIndices = [0]; // Just the top one
    } else if (samplingMethod === 'sample') {
        consideredIndices = VOCABULARY.map((_, i) => i);
    } else if (samplingMethod === 'topk') {
        consideredIndices = VOCABULARY.slice(0, paramValue).map((_, i) => i);
        cutoffLine = paramValue;
    } else if (samplingMethod === 'topp') {
        let cumulative = 0;
        const threshold = paramValue / 10;
        for (let i = 0; i < probabilities.length; i++) {
            if (cumulative < threshold) {
                consideredIndices.push(i);
                cumulative += probabilities[i];
            }
        }
        cutoffLine = consideredIndices.length;
    }

    const maxProb = Math.max(...probabilities);

    VOCABULARY.forEach((v, i) => {
        const bar = document.createElement('div');
        bar.className = 'selection-bar';

        const width = (probabilities[i] / maxProb) * 100;
        const isConsidered = consideredIndices.includes(i);
        const isSelected = samplingMethod === 'greedy' && i === 0;

        bar.innerHTML = `
            <span class="sel-token">${v.token}</span>
            <div class="sel-track">
                <div class="sel-fill ${isConsidered ? 'considered' : 'excluded'} ${isSelected ? 'selected' : ''}" style="width: ${width}%"></div>
            </div>
            <span class="sel-value ${isConsidered ? '' : 'dim'}">${formatPercent(probabilities[i])}</span>
        `;

        if (cutoffLine && i === cutoffLine - 1) {
            bar.classList.add('cutoff');
        }

        chart.appendChild(bar);

        setTimeout(() => {
            bar.classList.add('visible');
        }, i * (50 / speed));
    });

    // Animate selection
    setTimeout(() => {
        animateSelection(consideredIndices);
    }, VOCABULARY.length * (50 / speed) + 300);
}

function animateSelection(consideredIndices) {
    const diceContainer = document.getElementById('diceContainer');
    const selectedToken = document.getElementById('selectedToken');
    const dice = document.getElementById('dice');

    // Reset
    selectedToken.classList.remove('visible');
    diceContainer.classList.remove('rolling', 'hidden');

    if (samplingMethod === 'greedy') {
        // No dice for greedy
        diceContainer.classList.add('hidden');
        selectedToken.querySelector('.selected-word').textContent = VOCABULARY[0].token;
        setTimeout(() => {
            selectedToken.classList.add('visible');
        }, 100);
    } else {
        // Show dice rolling
        diceContainer.classList.add('rolling');

        setTimeout(() => {
            diceContainer.classList.remove('rolling');
            diceContainer.classList.add('hidden');

            // Weighted random selection from considered indices
            const consideredProbs = consideredIndices.map(i => probabilities[i]);
            const sum = consideredProbs.reduce((a, b) => a + b, 0);
            const normalized = consideredProbs.map(p => p / sum);

            let random = Math.random();
            let selectedIndex = consideredIndices[0];
            for (let i = 0; i < normalized.length; i++) {
                random -= normalized[i];
                if (random <= 0) {
                    selectedIndex = consideredIndices[i];
                    break;
                }
            }

            selectedToken.querySelector('.selected-word').textContent = VOCABULARY[selectedIndex].token;

            // Highlight selected bar
            const bars = document.querySelectorAll('.selection-bar');
            bars[selectedIndex].classList.add('winner');

            setTimeout(() => {
                selectedToken.classList.add('visible');
            }, 100);
        }, 1000 / speed);
    }
}

// Step 5: Autoregressive Loop
function renderAutoregressiveLoop() {
    renderGenerationSteps();
    renderCausalMask();
}

function renderGenerationSteps() {
    const container = document.getElementById('generationSteps');
    container.innerHTML = '';

    const allTokens = [...CONTEXT_TOKENS, ...generatedTokens];

    // Show the generation process
    const step = document.createElement('div');
    step.className = 'gen-step visible';

    let contextHtml = allTokens.map((t, i) => {
        const isGenerated = i >= CONTEXT_TOKENS.length;
        return `<span class="gen-token ${isGenerated ? 'generated' : ''}">${t}</span>`;
    }).join(' ');

    step.innerHTML = `
        <div class="gen-context">
            <span class="gen-label">CONTEXT</span>
            <div class="gen-tokens">${contextHtml}</div>
        </div>
        <div class="gen-arrow">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
        </div>
        <div class="gen-prediction">
            <span class="gen-label">NEXT</span>
            <span class="gen-next">?</span>
        </div>
    `;

    container.appendChild(step);
}

function generateNextToken() {
    if (generatedTokens.length >= 5) return; // Limit generations

    const lastToken = generatedTokens.length > 0
        ? generatedTokens[generatedTokens.length - 1]
        : CONTEXT_TOKENS[CONTEXT_TOKENS.length - 1];

    // Get vocabulary for continuation
    let vocab = CONTINUATION_VOCAB[lastToken] || [
        { token: '.', logit: 3.0 },
        { token: ',', logit: 1.5 },
        { token: 'and', logit: 1.0 }
    ];

    // Select based on current method
    const logits = vocab.map(v => v.logit);
    const probs = softmax(logits, temperature);

    let selectedIndex = 0;
    if (samplingMethod === 'greedy') {
        selectedIndex = 0;
    } else {
        // Sample
        let random = Math.random();
        for (let i = 0; i < probs.length; i++) {
            random -= probs[i];
            if (random <= 0) {
                selectedIndex = i;
                break;
            }
        }
    }

    const newToken = vocab[selectedIndex].token;
    generatedTokens.push(newToken);

    renderGenerationSteps();
    renderCausalMask();
}

function resetGeneration() {
    generatedTokens = [];
    renderGenerationSteps();
    renderCausalMask();
}

function renderCausalMask() {
    const container = document.getElementById('causalMask');
    container.innerHTML = '';

    const allTokens = [...CONTEXT_TOKENS, ...generatedTokens];
    const n = Math.min(allTokens.length, 7); // Limit display size

    // Create matrix
    const matrix = document.createElement('div');
    matrix.className = 'mask-matrix';
    matrix.style.gridTemplateColumns = `60px repeat(${n}, 1fr)`;

    // Header row (keys)
    const headerCell = document.createElement('div');
    headerCell.className = 'mask-cell mask-header-corner';
    headerCell.textContent = 'Q\\K';
    matrix.appendChild(headerCell);

    for (let j = 0; j < n; j++) {
        const cell = document.createElement('div');
        cell.className = 'mask-cell mask-header';
        cell.textContent = allTokens[j];
        matrix.appendChild(cell);
    }

    // Data rows (queries)
    for (let i = 0; i < n; i++) {
        // Row label
        const label = document.createElement('div');
        label.className = 'mask-cell mask-row-label';
        label.textContent = allTokens[i];
        matrix.appendChild(label);

        // Cells
        for (let j = 0; j < n; j++) {
            const cell = document.createElement('div');
            cell.className = 'mask-cell';

            if (j <= i) {
                // Can attend
                cell.classList.add('can-attend');
                cell.textContent = '1';
            } else {
                // Masked
                cell.classList.add('masked');
                cell.textContent = '0';
            }

            matrix.appendChild(cell);
        }
    }

    container.appendChild(matrix);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
