// Attention Mechanism Visualizer
// Neural Blueprint Edition - Demonstrates transformer attention step by step

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

// Actual embedding vectors (simplified 4D for visualization)
// Designed to create meaningful attention patterns
const EMBEDDINGS = [
    [0.2, 0.8, 0.1, 0.5],   // The - article
    [0.9, 0.3, 0.7, 0.2],   // cat - noun, animate
    [0.4, 0.6, 0.8, 0.3],   // sat - verb
    [0.1, 0.4, 0.2, 0.9],   // on - preposition
    [0.2, 0.8, 0.1, 0.5],   // the - same as The
    [0.8, 0.2, 0.6, 0.4]    // mat - noun, inanimate
];

// Q, K, V projection matrices (4x3)
const W_Q = [
    [0.1, 0.8, 0.1],
    [0.7, 0.2, 0.1],
    [0.2, 0.9, 0.3],
    [0.3, 0.5, 0.7]
];
const W_K = [
    [0.8, 0.1, 0.2],
    [0.1, 0.9, 0.2],
    [0.2, 0.3, 0.8],
    [0.4, 0.6, 0.3]
];
const W_V = [
    [0.3, 0.5, 0.4],
    [0.6, 0.3, 0.5],
    [0.4, 0.6, 0.3],
    [0.5, 0.4, 0.6]
];

// Computed Q, K, V vectors
let Q_VECTORS = [];
let K_VECTORS = [];
let V_VECTORS = [];

// Attention scores and weights
let ATTENTION_SCORES = [];
let ATTENTION_WEIGHTS = [];
let OUTPUT_VECTORS = [];

// Matrix multiplication helper
function matmul(vec, mat) {
    const result = [];
    for (let j = 0; j < mat[0].length; j++) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * mat[i][j];
        }
        result.push(sum);
    }
    return result;
}

// Dot product
function dot(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Softmax
function softmax(arr) {
    const max = Math.max(...arr);
    const exp = arr.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / sum);
}

// Pre-designed attention patterns with CAUSAL MASKING
// Each token only attends to itself and previous tokens (j <= i)
// This matches how decoder-only LLMs (GPT, Claude) actually work
const DESIGNED_ATTENTION_WEIGHTS = [
    // The (pos 0) -> only sees itself
    [1.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    // cat (pos 1) -> attends to "The" (determiner) and itself
    [0.35, 0.65, 0.00, 0.00, 0.00, 0.00],
    // sat (pos 2) -> attends strongly to "cat" (subject), some to itself and "The"
    // Scores: The=-1.2, cat=1.8, sat=0.2 -> softmax -> 4%, 80%, 16%
    [0.04, 0.80, 0.16, 0.00, 0.00, 0.00],
    // on (pos 3) -> attends to "sat" (verb) and "cat" (subject)
    [0.05, 0.25, 0.55, 0.15, 0.00, 0.00],
    // the (pos 4) -> attends to earlier content
    [0.10, 0.20, 0.30, 0.15, 0.25, 0.00],
    // mat (pos 5) -> attends to all previous, especially "the" and "sat"
    [0.05, 0.15, 0.25, 0.15, 0.25, 0.15]
];

// Compute all values
function computeAttention() {
    // Compute Q, K, V
    Q_VECTORS = EMBEDDINGS.map(e => matmul(e, W_Q));
    K_VECTORS = EMBEDDINGS.map(e => matmul(e, W_K));
    V_VECTORS = EMBEDDINGS.map(e => matmul(e, W_V));

    // Compute attention scores (Q × K^T) with temperature scaling
    const d_k = K_VECTORS[0].length;
    const temperature = 0.5;
    ATTENTION_SCORES = Q_VECTORS.map(q =>
        K_VECTORS.map(k => dot(q, k) / Math.sqrt(d_k) / temperature)
    );

    // Use pre-designed weights for educational visualization
    ATTENTION_WEIGHTS = DESIGNED_ATTENTION_WEIGHTS;

    // Compute output vectors using the designed weights
    OUTPUT_VECTORS = ATTENTION_WEIGHTS.map(weights => {
        const output = [0, 0, 0];
        weights.forEach((w, i) => {
            V_VECTORS[i].forEach((v, j) => {
                output[j] += w * v;
            });
        });
        return output;
    });
}

// State
let currentStep = 1;
let isPlaying = false;
let playTimeout = null;
let speed = 1;

const TOTAL_STEPS = 7;
const STEP_LABELS = [
    'Tokenization',
    'Embeddings',
    'Q, K, V Projections',
    'Attention Scores',
    'Softmax Normalization',
    'Weighted Combination',
    'Contextual Outputs'
];

// Format vector for display
function formatVector(vec, decimals = 2) {
    return '[' + vec.map(v => v.toFixed(decimals)).join(', ') + ']';
}

// Initialize
function init() {
    computeAttention();
    setupEventListeners();
    showStep(1);
    updateButtonStates();
}

function setupEventListeners() {
    document.getElementById('playPause').onclick = togglePlay;
    document.getElementById('stepBack').onclick = stepBack;
    document.getElementById('stepForward').onclick = stepForward;
    document.getElementById('reset').onclick = reset;
    document.getElementById('speed').oninput = updateSpeed;

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

    const delay = 3000 / speed;

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
        case 1: renderTokenization(); break;
        case 2: renderEmbeddings(); break;
        case 3: renderQKV(); break;
        case 4: renderAttentionScores(); break;
        case 5: renderSoftmax(); break;
        case 6: renderWeighted(); break;
        case 7: renderOutput(); break;
    }
}

// Step renderers
function renderTokenization() {
    const container = document.getElementById('tokensContainer');
    container.innerHTML = '';

    TOKENS.forEach((token, i) => {
        const el = document.createElement('div');
        el.className = 'token';
        el.innerHTML = `
            <span class="token-text">${token}</span>
            <span class="token-index">token[${i}]</span>
        `;
        container.appendChild(el);

        setTimeout(() => {
            el.classList.add('visible');
        }, i * (150 / speed));
    });
}

function renderEmbeddings() {
    const container = document.getElementById('embeddingsContainer');
    container.innerHTML = '';

    TOKENS.forEach((token, i) => {
        const embedding = document.createElement('div');
        embedding.className = 'embedding';

        const label = document.createElement('div');
        label.className = 'embedding-label';
        label.textContent = token;

        const vectorText = document.createElement('div');
        vectorText.className = 'embedding-vector-text';
        vectorText.textContent = formatVector(EMBEDDINGS[i]);

        const vectorVis = document.createElement('div');
        vectorVis.className = 'embedding-vector';

        const bars = [];
        EMBEDDINGS[i].forEach((val, j) => {
            const valueBar = document.createElement('div');
            valueBar.className = 'embedding-value';
            valueBar.style.width = (val * 100) + '%';
            valueBar.title = `dim[${j}]: ${val.toFixed(2)}`;
            vectorVis.appendChild(valueBar);
            bars.push(valueBar);
        });

        embedding.appendChild(label);
        embedding.appendChild(vectorText);
        embedding.appendChild(vectorVis);
        container.appendChild(embedding);

        // Animate embedding card appearing
        setTimeout(() => {
            embedding.classList.add('visible');
        }, i * (120 / speed));

        // Animate each bar appearing with stagger
        bars.forEach((bar, j) => {
            setTimeout(() => {
                bar.classList.add('visible');
            }, (i * 120 + 200 + j * 60) / speed);
        });
    });
}

function renderQKV() {
    const queryContainer = document.getElementById('queryVectors');
    const keyContainer = document.getElementById('keyVectors');
    const valueContainer = document.getElementById('valueVectors');

    queryContainer.innerHTML = '';
    keyContainer.innerHTML = '';
    valueContainer.innerHTML = '';

    TOKENS.forEach((token, i) => {
        // Query
        const qItem = createQKVItem(token, Q_VECTORS[i], 'query');
        queryContainer.appendChild(qItem);

        // Key
        const kItem = createQKVItem(token, K_VECTORS[i], 'key');
        keyContainer.appendChild(kItem);

        // Value
        const vItem = createQKVItem(token, V_VECTORS[i], 'value');
        valueContainer.appendChild(vItem);

        // Staggered animation for columns
        setTimeout(() => qItem.classList.add('visible'), (i * 80) / speed);
        setTimeout(() => kItem.classList.add('visible'), (i * 80 + 300) / speed);
        setTimeout(() => vItem.classList.add('visible'), (i * 80 + 600) / speed);
    });
}

function createQKVItem(token, vector, type) {
    const item = document.createElement('div');
    item.className = 'qkv-item';

    const tokenLabel = document.createElement('span');
    tokenLabel.className = 'qkv-token';
    tokenLabel.textContent = token;

    const vectorText = document.createElement('span');
    vectorText.className = 'qkv-vector-text';
    vectorText.textContent = formatVector(vector);

    const vectorVis = document.createElement('div');
    vectorVis.className = 'qkv-vector';

    vector.forEach((val, j) => {
        const cell = document.createElement('div');
        cell.className = 'qkv-cell';
        cell.style.opacity = 0.3 + (val * 0.7);
        cell.title = `${val.toFixed(3)}`;
        vectorVis.appendChild(cell);
    });

    item.appendChild(tokenLabel);
    item.appendChild(vectorText);
    item.appendChild(vectorVis);

    return item;
}

function renderAttentionScores() {
    const matrix = document.getElementById('attentionMatrix');
    const keyLabels = document.getElementById('keyLabels');
    const queryLabels = document.getElementById('queryLabels');

    matrix.innerHTML = '';
    keyLabels.innerHTML = '';
    queryLabels.innerHTML = '';

    // Grid template for matrix
    matrix.style.gridTemplateColumns = `repeat(${TOKENS.length}, 52px)`;

    // Key labels (top)
    TOKENS.forEach(token => {
        const label = document.createElement('div');
        label.className = 'matrix-label';
        label.textContent = token;
        label.style.color = 'var(--key-glow)';
        keyLabels.appendChild(label);
    });

    // Query labels (side) and matrix cells
    TOKENS.forEach((qToken, i) => {
        // Side label
        const rowLabel = document.createElement('div');
        rowLabel.className = 'matrix-row-label';
        rowLabel.textContent = qToken;
        rowLabel.style.color = 'var(--query-glow)';
        queryLabels.appendChild(rowLabel);

        // Data cells for this row
        TOKENS.forEach((kToken, j) => {
            const cell = document.createElement('div');
            cell.className = 'attention-cell';

            const score = ATTENTION_SCORES[i][j];
            cell.textContent = score.toFixed(2);
            cell.title = `Q("${qToken}") · K("${kToken}") = ${score.toFixed(4)}`;

            // Color based on score
            const maxScore = Math.max(...ATTENTION_SCORES.flat());
            const minScore = Math.min(...ATTENTION_SCORES.flat());
            const intensity = (score - minScore) / (maxScore - minScore);

            // Blue gradient for scores
            const r = Math.round(30 + intensity * 29);
            const g = Math.round(58 + intensity * 72);
            const b = Math.round(138 + intensity * 108);
            cell.style.background = `rgb(${r}, ${g}, ${b})`;
            cell.style.color = intensity > 0.4 ? 'white' : 'var(--text-secondary)';

            matrix.appendChild(cell);

            setTimeout(() => {
                cell.classList.add('visible');
            }, ((i * TOKENS.length + j) * 30) / speed);
        });
    });
}

function renderSoftmax() {
    const matrix = document.getElementById('softmaxMatrix');
    const keyLabels = document.getElementById('softmaxKeyLabels');
    const queryLabels = document.getElementById('softmaxQueryLabels');

    matrix.innerHTML = '';
    keyLabels.innerHTML = '';
    queryLabels.innerHTML = '';

    // Grid template for matrix
    matrix.style.gridTemplateColumns = `repeat(${TOKENS.length}, 52px)`;

    // Key labels (top)
    TOKENS.forEach(token => {
        const label = document.createElement('div');
        label.className = 'matrix-label';
        label.textContent = token;
        label.style.color = 'var(--key-glow)';
        keyLabels.appendChild(label);
    });

    // Query labels (side) and matrix cells
    TOKENS.forEach((qToken, i) => {
        // Side label
        const rowLabel = document.createElement('div');
        rowLabel.className = 'matrix-row-label';
        rowLabel.textContent = qToken;
        rowLabel.style.color = 'var(--query-glow)';
        queryLabels.appendChild(rowLabel);

        // Data cells for this row
        TOKENS.forEach((kToken, j) => {
            const cell = document.createElement('div');
            cell.className = 'attention-cell';

            const weight = ATTENTION_WEIGHTS[i][j];
            cell.textContent = (weight * 100).toFixed(0) + '%';
            cell.title = `Attention("${qToken}" → "${kToken}") = ${(weight * 100).toFixed(1)}%`;

            // Green gradient for weights - brighter for higher attention
            const intensity = weight;
            if (weight > 0.25) {
                // High attention - bright emerald
                cell.style.background = `rgba(16, 185, 129, ${0.4 + intensity})`;
                cell.style.color = 'white';
                cell.style.textShadow = '0 0 10px rgba(52, 211, 153, 0.5)';
            } else if (weight > 0.1) {
                // Medium attention
                cell.style.background = `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`;
                cell.style.color = 'white';
            } else {
                // Low attention
                cell.style.background = `rgba(71, 85, 105, ${0.3 + intensity})`;
                cell.style.color = 'var(--text-tertiary)';
            }

            matrix.appendChild(cell);

            setTimeout(() => {
                cell.classList.add('visible');
            }, ((i * TOKENS.length + j) * 30) / speed);
        });
    });
}

function renderWeighted() {
    const calcContainer = document.getElementById('weightedCalc');
    const resultContainer = document.getElementById('weightedResult');

    calcContainer.innerHTML = '';
    resultContainer.innerHTML = '';

    // Show calculation for "sat" (index 2)
    const satIndex = 2;
    const weights = ATTENTION_WEIGHTS[satIndex];

    TOKENS.forEach((token, i) => {
        const term = document.createElement('div');
        term.className = 'weight-term';

        const weightSpan = document.createElement('span');
        weightSpan.className = 'weight-value';
        weightSpan.textContent = (weights[i] * 100).toFixed(0) + '%';

        const times = document.createElement('span');
        times.className = 'weight-times';
        times.textContent = ' × ';

        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'weight-token';
        tokenSpan.textContent = `V("${token}")`;

        const vectorSpan = document.createElement('span');
        vectorSpan.className = 'weight-vector-text';
        vectorSpan.textContent = formatVector(V_VECTORS[i]);

        const equals = document.createElement('span');
        equals.className = 'weight-equals';
        equals.textContent = ' = ';

        const resultSpan = document.createElement('span');
        resultSpan.className = 'weight-partial';
        const partial = V_VECTORS[i].map(v => v * weights[i]);
        resultSpan.textContent = formatVector(partial, 3);

        term.appendChild(weightSpan);
        term.appendChild(times);
        term.appendChild(tokenSpan);
        term.appendChild(vectorSpan);
        term.appendChild(equals);
        term.appendChild(resultSpan);
        calcContainer.appendChild(term);

        setTimeout(() => {
            term.classList.add('visible');
        }, (i * 120) / speed);
    });

    // Show result
    setTimeout(() => {
        const resultLabel = document.createElement('div');
        resultLabel.className = 'weighted-result-label';
        resultLabel.textContent = 'Sum of weighted values:';

        const resultVector = document.createElement('div');
        resultVector.className = 'weighted-result-value';
        resultVector.innerHTML = `<strong>Output("sat")</strong> = ${formatVector(OUTPUT_VECTORS[satIndex], 3)}`;

        resultContainer.appendChild(resultLabel);
        resultContainer.appendChild(resultVector);
        resultContainer.classList.add('visible');
    }, (TOKENS.length * 120 + 200) / speed);
}

function renderOutput() {
    const container = document.getElementById('outputTokens');
    container.innerHTML = '';

    TOKENS.forEach((token, i) => {
        const outputToken = document.createElement('div');
        outputToken.className = 'output-token';
        if (token === 'sat') outputToken.classList.add('highlighted');

        const label = document.createElement('div');
        label.className = 'output-token-label';
        label.textContent = token;

        const vectorText = document.createElement('div');
        vectorText.className = 'output-vector-text';
        vectorText.textContent = formatVector(OUTPUT_VECTORS[i], 3);

        // Show all attention weights as a mini bar chart
        const attentionBars = document.createElement('div');
        attentionBars.className = 'attention-bars';

        ATTENTION_WEIGHTS[i].forEach((weight, j) => {
            const bar = document.createElement('div');
            bar.className = 'attention-bar-item';

            const barLabel = document.createElement('span');
            barLabel.className = 'attention-bar-label';
            barLabel.textContent = TOKENS[j];

            const barTrack = document.createElement('div');
            barTrack.className = 'attention-bar-track';

            const barFill = document.createElement('div');
            barFill.className = 'attention-bar-fill';
            barFill.style.width = (weight * 100) + '%';

            // Color coding based on weight
            if (weight > 0.25) {
                barFill.classList.add('high');
            } else if (weight > 0.1) {
                barFill.classList.add('medium');
            } else {
                barFill.classList.add('low');
            }

            const barValue = document.createElement('span');
            barValue.className = 'attention-bar-value';
            barValue.textContent = (weight * 100).toFixed(0) + '%';

            barTrack.appendChild(barFill);
            bar.appendChild(barLabel);
            bar.appendChild(barTrack);
            bar.appendChild(barValue);
            attentionBars.appendChild(bar);
        });

        outputToken.appendChild(label);
        outputToken.appendChild(vectorText);
        outputToken.appendChild(attentionBars);
        container.appendChild(outputToken);

        setTimeout(() => {
            outputToken.classList.add('visible');
        }, (i * 120) / speed);
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
