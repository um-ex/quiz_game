const QUESTIONS_API = "http://127.0.0.1:5000/questions";
let allQuestions = [];
let selectedQuestions = [];

// shuffle (Fisher-Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        startQuiz();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.addEventListener('keydown', handleEnterKey);

    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.addEventListener('click', startQuiz);
});

async function loadAllQuestions() {
    try {
        const res = await fetch(QUESTIONS_API);
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const data = await res.json();
        allQuestions = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Failed to load questions:', err);
        allQuestions = [];
    }
}

async function startQuiz() {
    const usernameEl = document.getElementById('username');
    const username = usernameEl ? usernameEl.value.trim() : '';
    if (!username) {
        alert('Please enter your name to start the quiz.');
        return;
    }

    if (!allQuestions || allQuestions.length === 0) {
        await loadAllQuestions();
    }

    // pick exactly up to 5 questions at random
    const pool = shuffle([...allQuestions]);
    selectedQuestions = pool.slice(0, Math.min(5, pool.length));

    console.log('Total in DB:', allQuestions.length, 'Selected:', selectedQuestions.length);

    if (selectedQuestions.length === 0) {
        alert('No questions available in the database.');
        return;
    }

    if (usernameEl) usernameEl.disabled = true;
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.disabled = true;

    renderQuestions();
    const quizEl = document.getElementById('quiz');
    if (quizEl) quizEl.style.display = 'block';
}

function renderQuestions() {
    const quizForm = document.getElementById('quizForm');
    if (!quizForm) {
        console.error('quizForm element not found');
        return;
    }

    quizForm.innerHTML = '';
    quizForm.setAttribute('autocomplete', 'off');
    quizForm.setAttribute('autocapitalize', 'off');
    quizForm.setAttribute('spellcheck', 'false');

    const sessionId = Date.now().toString(36);

    selectedQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-block';
        questionDiv.dataset.qid = q.id;

        const title = document.createElement('div');
        title.className = 'question-title';
        title.textContent = `${index + 1}. ${q.text || q.question || 'Untitled question'}`;
        questionDiv.appendChild(title);

        if (Array.isArray(q.options) && q.options.length > 0) {
            q.options.forEach((opt, optIdx) => {
                const id = `q_${q.id}_opt_${optIdx}_${sessionId}`;
                const wrapper = document.createElement('div');
                wrapper.className = 'option';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q_${index}_${sessionId}`;
                input.id = id;
                input.value = optIdx;
                input.setAttribute('autocomplete', 'off');

                const label = document.createElement('label');
                label.htmlFor = id;
                label.textContent = opt;

                wrapper.appendChild(input);
                wrapper.appendChild(label);
                questionDiv.appendChild(wrapper);
            });
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `q_${index}_${sessionId}`;
            input.placeholder = 'Your answer...';
            input.dataset.questionId = q.id;
            input.setAttribute('autocomplete', 'new-password');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
            questionDiv.appendChild(input);
        }

        quizForm.appendChild(questionDiv);
    });

    // debug: verify number of rendered question blocks
    console.log('Rendered question blocks:', quizForm.querySelectorAll('.question-block').length);
}

async function submitQuiz() {
    const username = (document.getElementById('username') || {}).value || '';
    if (!username.trim()) {
        alert("Please enter your name before submitting!");
        return;
    }

    const quizForm = document.getElementById('quizForm');
    if (!quizForm) return;

    const answers = {};
    quizForm.querySelectorAll('.question-block').forEach((qBlock) => {
        const qid = qBlock.dataset.qid;
        if (!qid) return;
        const radio = qBlock.querySelector('input[type="radio"]:checked');
        if (radio) {
            answers[qid] = radio.value;
            return;
        }
        const text = qBlock.querySelector('input[type="text"]');
        if (text) answers[qid] = text.value.trim();
    });

    try {
        const res = await fetch("http://127.0.0.1:5000/submit", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, answers })
        });
        if (!res.ok) throw new Error(`Submit failed ${res.status}`);
        const result = await res.json();

        document.getElementById('quiz').style.display = 'none';
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>User: ${result.username || username}</p>
            <p>Your Score: ${result.score || 0} / ${selectedQuestions.length}</p>
            <p>${result.message || ''}</p>
            <button id="tryAgain">Try Again</button>
        `;

        const tryAgain = document.getElementById('tryAgain');
        if (tryAgain) tryAgain.addEventListener('click', () => location.reload());
    } catch (err) {
        console.error('Submission error:', err);
        alert('Failed to submit quiz. Please try again.');
    }
}