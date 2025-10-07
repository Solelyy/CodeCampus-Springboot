let questions = [];
let currentQuestionIndex = 0;
let answers = {};
const API_BASE_URL = 'http://localhost:8081';

// Get course ID from URL
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Show error message
function showError(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="error-message">${message}</div>`;
    document.getElementById('loading').style.display = 'none';
}

// Show success message
function showSuccess(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="success-message">${message}</div>`;
}

// Show score popup/modal
function showScorePopup(score, totalQuestions) {
    const popup = document.getElementById('score-popup');
    const scoreText = document.getElementById('score-text');
    const feedbackText = document.getElementById('feedback-text');
    const continueBtn = document.getElementById('continue-btn');

    scoreText.textContent = `You scored ${score} out of ${totalQuestions}`;
    feedbackText.textContent = (score / totalQuestions >= 0.7) ? "Good Job!" : "Better Next Time!";

    popup.classList.add('show');

    // Read courseId fresh from URL here
    const courseId = getCourseIdFromURL();
    if (!courseId) {
        console.error('No courseId found in URL for redirect');
        return;
    }

    continueBtn.onclick = () => {
        window.location.href = `/frontend/webpages/student-course-activities.html?courseId=${courseId}`;
    };

    popup.onclick = (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    };
}

// Fetch pre-assessment questions
async function fetchPreAssessmentQuestions() {
    const courseId = getCourseIdFromURL();
    if (!courseId) return showError('Course ID not found in URL');

    const token = getAuthToken();
    if (!token) return showError('Authentication required. Please log in.');

    try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/preassessment`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch pre-assessment (Status: ${response.status})`);

        questions = await response.json();

        if (!questions.length) {
            showError('No pre-assessment questions available for this course');
            return;
        }

        document.getElementById('course-title').textContent = `Pre-Assessment`;
        document.getElementById('total-questions').textContent = questions.length;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('assessment-content').style.display = 'block';

        displayQuestion(0);
    } catch (error) {
        console.error('Error fetching questions:', error);
        showError(`Failed to load assessment: ${error.message}`);
    }
}

// Display a question
function displayQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];

    document.getElementById('current-question').textContent = index + 1;
    document.getElementById('question-text').textContent = question.question;

    const answerOptionsContainer = document.getElementById('answer-options');
    answerOptionsContainer.innerHTML = '';

    if (question.questionType === 'MCQ') {
        const options = JSON.parse(question.options || '[]');
        options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `question-${index}`;
            radioInput.id = `option-${index}-${i}`;
            radioInput.value = option;
            if (answers[index] === option) radioInput.checked = true;

            radioInput.addEventListener('change', () => { answers[index] = option; });

            const label = document.createElement('label');
            label.htmlFor = radioInput.id;
            label.textContent = option;

            optionDiv.appendChild(radioInput);
            optionDiv.appendChild(label);
            answerOptionsContainer.appendChild(optionDiv);
        });
    } else if (question.questionType === 'FillBlank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'fill-blank-input';
        input.placeholder = 'Enter your answer here...';
        input.value = answers[index] || '';
        input.addEventListener('input', e => answers[index] = e.target.value);
        answerOptionsContainer.appendChild(input);
    }

    updateNavigationButtons();
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) displayQuestion(currentQuestionIndex + 1);
}

function previousQuestion() {
    if (currentQuestionIndex > 0) displayQuestion(currentQuestionIndex - 1);
}

// Submit assessment
async function submitAssessment() {
    const unanswered = questions
        .map((q, i) => (!answers[i] || answers[i].trim() === '' ? i + 1 : null))
        .filter(Boolean);

    if (unanswered.length) {
        showError(`Please answer all questions. Unanswered: ${unanswered.join(', ')}`);
        return;
    }

    const token = getAuthToken();
    if (!token) return showError('Authentication required. Please log in.');

    const courseId = getCourseIdFromURL();
    if (!courseId) return showError('Course ID missing');

    const submissionData = {
        courseId: parseInt(courseId),
        answers: questions.map((q, i) => ({ question: q.question, answer: answers[i] }))
    };

    console.log('Submitting assessment:', submissionData);

    try {
        const response = await fetch(`${API_BASE_URL}/api/student/pre-assessment/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(submissionData)
        });

        if (response.ok) {
            const result = await response.json();
            showScorePopup(result.score, questions.length);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            showError(errorData.message || `Failed to submit assessment (Status: ${response.status})`);
        }
    } catch (error) {
        console.error('Error submitting assessment:', error);
        showError('An error occurred while submitting. Please try again.');
    }
}

window.addEventListener('DOMContentLoaded', fetchPreAssessmentQuestions);
