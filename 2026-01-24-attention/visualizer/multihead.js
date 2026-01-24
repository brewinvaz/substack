// Multi-Head Attention Visualizer
// Demonstrates how multiple attention heads capture different relationships

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

// Each head has different attention patterns showing different "specializations"
const HEADS = [
    {
        name: 'Head 1',
        specialty: 'Subject-Verb relationships',
        description: 'Learns to connect verbs with their subjects. When processing "sat," this head strongly attends to "cat" to understand WHO is performing the action.',
        example: { from: 'sat', to: 'cat', weight: '47%' },
        // Attention weights: each row is a query token, columns are key tokens
        weights: [
            [0.40, 0.15, 0.10, 0.10, 0.15, 0.10],  // The
            [0.25, 0.20, 0.35, 0.05, 0.05, 0.10],  // cat -> attends to sat
            [0.08, 0.47, 0.15, 0.08, 0.07, 0.15],  // sat -> attends to cat (subject)
            [0.10, 0.10, 0.40, 0.15, 0.10, 0.15],  // on -> attends to sat
            [0.30, 0.10, 0.10, 0.10, 0.20, 0.20],  // the
            [0.10, 0.15, 0.30, 0.15, 0.15, 0.15],  // mat -> attends to sat
        ]
    },
    {
        name: 'Head 2',
        specialty: 'Determiner-Noun relationships',
        description: 'Learns to connect articles with their nouns. "The" attends to "cat" and "mat" to understand which nouns it modifies.',
        example: { from: 'The', to: 'cat', weight: '52%' },
        weights: [
            [0.15, 0.52, 0.08, 0.05, 0.05, 0.15],  // The -> attends to cat
            [0.35, 0.25, 0.10, 0.10, 0.10, 0.10],  // cat -> attends to The
            [0.10, 0.15, 0.20, 0.15, 0.10, 0.30],  // sat
            [0.10, 0.10, 0.15, 0.20, 0.15, 0.30],  // on
            [0.10, 0.10, 0.10, 0.10, 0.15, 0.45],  // the -> attends to mat
            [0.10, 0.10, 0.10, 0.10, 0.40, 0.20],  // mat -> attends to the
        ]
    },
    {
        name: 'Head 3',
        specialty: 'Positional/Adjacent patterns',
        description: 'Focuses on nearby tokens. Each token attends most strongly to its immediate neighbors, capturing local context.',
        example: { from: 'on', to: 'the', weight: '38%' },
        weights: [
            [0.30, 0.40, 0.15, 0.05, 0.05, 0.05],  // The -> cat (next)
            [0.30, 0.25, 0.30, 0.10, 0.03, 0.02],  // cat -> The, sat
            [0.08, 0.35, 0.20, 0.25, 0.07, 0.05],  // sat -> cat, on
            [0.05, 0.10, 0.30, 0.17, 0.30, 0.08],  // on -> sat, the
            [0.05, 0.05, 0.10, 0.32, 0.18, 0.30],  // the -> on, mat
            [0.05, 0.05, 0.08, 0.12, 0.35, 0.35],  // mat -> the
        ]
    },
    {
        name: 'Head 4',
        specialty: 'Semantic similarity',
        description: 'Groups semantically similar tokens. Nouns attend to other nouns, connecting "cat" and "mat" as related entities.',
        example: { from: 'cat', to: 'mat', weight: '35%' },
        weights: [
            [0.25, 0.10, 0.10, 0.10, 0.35, 0.10],  // The -> the (both determiners)
            [0.10, 0.25, 0.10, 0.10, 0.10, 0.35],  // cat -> mat (both nouns)
            [0.10, 0.15, 0.30, 0.25, 0.10, 0.10],  // sat -> on (both function words)
            [0.10, 0.10, 0.30, 0.25, 0.15, 0.10],  // on -> sat
            [0.30, 0.10, 0.10, 0.10, 0.25, 0.15],  // the -> The
            [0.10, 0.35, 0.10, 0.10, 0.10, 0.25],  // mat -> cat (both nouns)
        ]
    }
];

// State
let currentStep = 1;
let isPlaying = false;
let playTimeout = null;
let speed = 1;
const TOTAL_STEPS = 4;

const STEP_LABELS = [
    'Parallel Attention Heads',
    'What Each Head Learned',
    'Concatenate Outputs',
    'Output Projection (W<sub>O</sub>)'
];

// Initialize
function init() {
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
    if (isPlaying) runAutoPlay();
    else if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }
}

function runAutoPlay() {
    if (!isPlaying) return;
    const delay = 4000 / speed;
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
        if (step === currentStep) marker.classList.add('active');
        else if (step < currentStep) marker.classList.add('completed');
    });
}

function showStep(step) {
    currentStep = step;
    const progress = (step / TOTAL_STEPS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    const stepLabel = document.getElementById('stepLabel');
    stepLabel.querySelector('.step-num').textContent = String(step).padStart(2, '0');
    stepLabel.querySelector('.step-name').innerHTML = STEP_LABELS[step - 1];

    updateStepMarkers();
    updateButtonStates();

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) stepEl.classList.add('active');

    renderStep(step);
}

function renderStep(step) {
    switch(step) {
        case 1: renderHeadsGrid(); break;
        case 2: renderSpecializations(); break;
        case 3: renderConcatenation(); break;
        case 4: renderProjection(); break;
    }
}

// Get color intensity based on attention weight
function getWeightColor(weight, headIndex) {
    const colors = [
        { r: 59, g: 130, b: 246 },   // head1 - blue
        { r: 16, g: 185, b: 129 },   // head2 - green
        { r: 245, g: 158, b: 11 },   // head3 - amber
        { r: 236, g: 72, b: 153 }    // head4 - pink
    ];
    const c = colors[headIndex];
    // Scale alpha more aggressively - low weights are subtle, high weights pop
    const alpha = 0.25 + weight * 0.75;
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

function renderHeadsGrid() {
    const container = document.getElementById('headsGrid');
    container.innerHTML = '';

    HEADS.forEach((head, headIndex) => {
        const card = document.createElement('div');
        card.className = `head-card head-${headIndex + 1}`;

        const header = document.createElement('div');
        header.className = 'head-header';
        header.innerHTML = `
            <div class="head-indicator"></div>
            <h3 class="head-title">${head.name}</h3>
        `;

        const specialty = document.createElement('p');
        specialty.className = 'head-specialty';
        specialty.textContent = head.specialty;

        // Mini attention matrix
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'mini-matrix-container';

        // Top labels
        const topLabels = document.createElement('div');
        topLabels.className = 'mini-matrix-labels';
        TOKENS.forEach(token => {
            const label = document.createElement('div');
            label.className = 'mini-matrix-label';
            label.textContent = token;
            topLabels.appendChild(label);
        });
        matrixContainer.appendChild(topLabels);

        // Matrix with side labels
        const wrapper = document.createElement('div');
        wrapper.className = 'mini-matrix-wrapper';

        const sideLabels = document.createElement('div');
        sideLabels.className = 'mini-matrix-side-labels';
        TOKENS.forEach(token => {
            const label = document.createElement('div');
            label.className = 'mini-matrix-side-label';
            label.textContent = token;
            sideLabels.appendChild(label);
        });
        wrapper.appendChild(sideLabels);

        const matrix = document.createElement('div');
        matrix.className = 'mini-matrix';
        matrix.style.gridTemplateColumns = `repeat(${TOKENS.length}, 32px)`;

        head.weights.forEach((row, i) => {
            row.forEach((weight, j) => {
                const cell = document.createElement('div');
                cell.className = 'mini-cell';
                cell.textContent = Math.round(weight * 100) + '%';
                cell.style.background = getWeightColor(weight, headIndex);
                // High weights get bright white, low weights get dimmed
                if (weight > 0.30) {
                    cell.style.color = 'white';
                } else if (weight > 0.15) {
                    cell.style.color = 'rgba(255, 255, 255, 0.6)';
                } else {
                    cell.style.color = 'rgba(255, 255, 255, 0.4)';
                }
                if (weight > 0.35) cell.classList.add('highlight');

                matrix.appendChild(cell);

                setTimeout(() => {
                    cell.classList.add('visible');
                }, (headIndex * 150 + (i * TOKENS.length + j) * 15) / speed);
            });
        });

        wrapper.appendChild(matrix);
        matrixContainer.appendChild(wrapper);

        card.appendChild(header);
        card.appendChild(specialty);
        card.appendChild(matrixContainer);
        container.appendChild(card);

        setTimeout(() => {
            card.classList.add('visible');
        }, (headIndex * 200) / speed);
    });
}

function renderSpecializations() {
    const container = document.getElementById('specializationsGrid');
    container.innerHTML = '';

    HEADS.forEach((head, headIndex) => {
        const card = document.createElement('div');
        card.className = `specialization-card head-${headIndex + 1}`;

        const header = document.createElement('div');
        header.className = 'specialization-header';
        header.innerHTML = `
            <div class="head-indicator"></div>
            <h3 class="specialization-title">${head.name}: ${head.specialty}</h3>
        `;

        const desc = document.createElement('p');
        desc.className = 'specialization-desc';
        desc.textContent = head.description;

        const example = document.createElement('div');
        example.className = 'attention-example';
        example.innerHTML = `
            <span class="example-from">"${head.example.from}"</span>
            <span class="example-arrow">→</span>
            <span class="example-to">"${head.example.to}"</span>
            <span class="example-weight">${head.example.weight}</span>
        `;

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(example);
        container.appendChild(card);

        setTimeout(() => {
            card.classList.add('visible');
        }, (headIndex * 200) / speed);
    });
}

function renderConcatenation() {
    const container = document.getElementById('concatVis');
    container.innerHTML = '';

    // Input section - head outputs
    const inputs = document.createElement('div');
    inputs.className = 'concat-inputs';

    HEADS.forEach((head, headIndex) => {
        const headOutput = document.createElement('div');
        headOutput.className = `concat-head-output head-${headIndex + 1}`;

        const label = document.createElement('div');
        label.className = 'concat-head-label';
        label.textContent = `${head.name} output`;

        const vector = document.createElement('div');
        vector.className = 'concat-vector';
        // Each head outputs a vector (showing 4 cells to represent dimensions)
        for (let i = 0; i < 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'concat-cell';
            cell.style.opacity = 0.5 + Math.random() * 0.5;
            vector.appendChild(cell);
        }

        headOutput.appendChild(label);
        headOutput.appendChild(vector);
        inputs.appendChild(headOutput);

        setTimeout(() => {
            headOutput.classList.add('visible');
        }, (headIndex * 200) / speed);
    });

    container.appendChild(inputs);

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'concat-arrow';
    arrow.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
        <span class="concat-arrow-label">Concatenate</span>
    `;
    container.appendChild(arrow);

    setTimeout(() => {
        arrow.classList.add('visible');
    }, (800) / speed);

    // Result - concatenated vector
    const result = document.createElement('div');
    result.className = 'concat-result';

    const resultLabel = document.createElement('div');
    resultLabel.className = 'concat-result-label';
    resultLabel.textContent = 'Concatenated Output';

    const resultVector = document.createElement('div');
    resultVector.className = 'concat-result-vector';

    // Show cells from each head with their colors
    const headColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    headColors.forEach((color, headIndex) => {
        for (let i = 0; i < 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'concat-result-cell';
            cell.style.background = color;
            cell.style.opacity = 0.5 + Math.random() * 0.5;
            resultVector.appendChild(cell);
        }
    });

    const dimLabel = document.createElement('div');
    dimLabel.className = 'concat-result-dim';
    dimLabel.innerHTML = '4 heads × d<sub>v</sub> = 4d<sub>v</sub> dimensions';

    result.appendChild(resultLabel);
    result.appendChild(resultVector);
    result.appendChild(dimLabel);
    container.appendChild(result);

    setTimeout(() => {
        result.classList.add('visible');
    }, (1200) / speed);
}

function renderProjection() {
    const container = document.getElementById('projectionVis');
    container.innerHTML = '';

    const flow = document.createElement('div');
    flow.className = 'projection-flow';

    // Input (concatenated)
    const input = document.createElement('div');
    input.className = 'projection-input';

    const inputLabel = document.createElement('div');
    inputLabel.className = 'projection-label';
    inputLabel.innerHTML = 'Concatenated (4d<sub>v</sub>)';

    const inputVector = document.createElement('div');
    inputVector.className = 'projection-vector';

    const headColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    headColors.forEach(color => {
        for (let i = 0; i < 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'projection-cell';
            cell.style.background = color;
            cell.style.opacity = 0.5 + Math.random() * 0.5;
            inputVector.appendChild(cell);
        }
    });

    input.appendChild(inputLabel);
    input.appendChild(inputVector);
    flow.appendChild(input);

    setTimeout(() => {
        input.classList.add('visible');
    }, (100) / speed);

    // Arrow
    const arrow1 = document.createElement('div');
    arrow1.className = 'projection-arrow';
    arrow1.textContent = '×';
    flow.appendChild(arrow1);

    setTimeout(() => {
        arrow1.classList.add('visible');
    }, (400) / speed);

    // W_O matrix
    const matrix = document.createElement('div');
    matrix.className = 'projection-matrix';

    const matrixLabel = document.createElement('div');
    matrixLabel.className = 'matrix-label';
    matrixLabel.innerHTML = 'W<sub>O</sub>';

    const matrixGrid = document.createElement('div');
    matrixGrid.className = 'matrix-grid';

    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        if (Math.random() > 0.5) cell.classList.add('active');
        matrixGrid.appendChild(cell);
    }

    const matrixDims = document.createElement('div');
    matrixDims.className = 'matrix-dims';
    matrixDims.innerHTML = '(4d<sub>v</sub> × d<sub>model</sub>)';

    matrix.appendChild(matrixLabel);
    matrix.appendChild(matrixGrid);
    matrix.appendChild(matrixDims);
    flow.appendChild(matrix);

    setTimeout(() => {
        matrix.classList.add('visible');
    }, (600) / speed);

    // Arrow
    const arrow2 = document.createElement('div');
    arrow2.className = 'projection-arrow';
    arrow2.textContent = '=';
    flow.appendChild(arrow2);

    setTimeout(() => {
        arrow2.classList.add('visible');
    }, (900) / speed);

    // Output
    const output = document.createElement('div');
    output.className = 'projection-output';

    const outputLabel = document.createElement('div');
    outputLabel.className = 'projection-label';
    outputLabel.innerHTML = 'Final Output (d<sub>model</sub>)';

    const outputVector = document.createElement('div');
    outputVector.className = 'output-vector-vis';

    // Create output cells with varying heights to show distinct values
    const outputValues = [0.85, 0.42, 0.91, 0.33, 0.78, 0.56, 0.95, 0.67];
    for (let i = 0; i < 8; i++) {
        const cell = document.createElement('div');
        cell.className = 'output-cell';
        const value = outputValues[i];
        cell.style.height = `${20 + value * 30}px`;
        cell.style.opacity = 0.5 + value * 0.5;
        outputVector.appendChild(cell);
    }

    const dimLabel = document.createElement('div');
    dimLabel.className = 'projection-dim-label';
    dimLabel.textContent = 'Back to model dimension';

    output.appendChild(outputLabel);
    output.appendChild(outputVector);
    output.appendChild(dimLabel);
    flow.appendChild(output);

    setTimeout(() => {
        output.classList.add('visible');
    }, (1200) / speed);

    container.appendChild(flow);
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
