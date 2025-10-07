// State management
let currentStep = 1;
let activities = [];
let questions = [];

// DOM Elements
const form = document.getElementById('courseForm');
const progressBar = document.querySelector('.progress-bar');
const stepIndicators = document.querySelectorAll('.step-indicator');
const formSteps = document.querySelectorAll('.form-step');
const creationMessage = document.getElementById('course-creation-message');
const submitBtn = document.getElementById('submitCourse');

// Step navigation
function goToStep(step) {
    // Hide all steps
    formSteps.forEach(s => s.classList.remove('active'));
    stepIndicators.forEach(s => s.classList.remove('active'));

    // Show current step
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.step-indicator[data-step="${step}"]`).classList.add('active');

    // Update progress bar
    progressBar.setAttribute('data-step', step);

    // Mark completed steps
    stepIndicators.forEach((indicator, index) => {
        if (index < step - 1) {
            indicator.classList.add('completed');
        } else {
            indicator.classList.remove('completed');
        }
    });

    currentStep = step;
}

// Step 1 Validation
function validateStep1() {
    const title = document.getElementById('courseTitle').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const nextBtn = document.getElementById('step1Next');

    if (title && description) {
        nextBtn.disabled = false;
        return true;
    } else {
        nextBtn.disabled = true;
        return false;
    }
}

document.getElementById('courseTitle').addEventListener('input', validateStep1);
document.getElementById('courseDescription').addEventListener('input', validateStep1);

document.getElementById('step1Next').addEventListener('click', () => {
    if (validateStep1()) {
        goToStep(2);
    }
});

// Step 2: Activities Management
function createActivity() {
    const activityCount = activities.length + 1;
    const activityId = `activity-${Date.now()}`; // Use timestamp for unique ID

    const activityHTML = `
        <div class="activity-item" data-id="${activityId}">
            <div class="activity-header">
                <span class="activity-title">Activity ${activityCount}</span>
                <button type="button" class="btn-remove" onclick="removeActivity('${activityId}')">Remove</button>
            </div>
            
            <div class="form-group">
                <label>Activity Title <span class="required">*</span></label>
                <input type="text" class="activity-title-input" required placeholder="e.g., Hello World Challenge">
            </div>

            <div class="form-group">
                <label>Difficulty <span class="required">*</span></label>
                <select class="activity-difficulty" required>
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>

            <div class="form-group">
                <label>Problem Statement <span class="required">*</span></label>
                <textarea class="activity-problem" required placeholder="Describe the problem students need to solve..."></textarea>
            </div>

            <div class="form-group">
                <label>Test Cases <span class="required">*</span></label>
                <textarea class="activity-tests" required placeholder="Enter test cases (one per line)"></textarea>
            </div>
        </div>
    `;

    document.getElementById('activitiesContainer').insertAdjacentHTML('beforeend', activityHTML);
    activities.push(activityId);
    updateActivityNumbers();
    validateStep2();

    // Add input listeners
    const activityElement = document.querySelector(`[data-id="${activityId}"]`);
    activityElement.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', validateStep2);
    });
}

function removeActivity(activityId) {
    const index = activities.indexOf(activityId);
    if (index > -1) {
        activities.splice(index, 1);
    }
    document.querySelector(`[data-id="${activityId}"]`).remove();
    updateActivityNumbers();
    validateStep2();
}

function updateActivityNumbers() {
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        const titleSpan = item.querySelector('.activity-title');
        titleSpan.textContent = `Activity ${index + 1}`;
    });
}

function validateStep2() {
    const activityItems = document.querySelectorAll('.activity-item');
    let allValid = activityItems.length > 0;

    activityItems.forEach(item => {
        const title = item.querySelector('.activity-title-input').value.trim();
        const difficulty = item.querySelector('.activity-difficulty').value;
        const problem = item.querySelector('.activity-problem').value.trim();
        const tests = item.querySelector('.activity-tests').value.trim();

        if (!title || !difficulty || !problem || !tests) {
            allValid = false;
        }
    });

    document.getElementById('step2Next').disabled = !allValid;
    document.getElementById('activitiesError').classList.toggle('show', activityItems.length === 0);
}

document.getElementById('addActivity').addEventListener('click', createActivity);
document.getElementById('step2Prev').addEventListener('click', () => goToStep(1));
document.getElementById('step2Next').addEventListener('click', () => {
    if (activities.length > 0) {
        goToStep(3);
    }
});

// Step 3: Questions Management
function createQuestion() {
    if (questions.length >= 10) {
        alert('Maximum 10 questions allowed');
        return;
    }

    const questionCount = questions.length + 1;
    const questionId = `question-${Date.now()}`; // Use timestamp for unique ID

    const questionHTML = `
        <div class="question-item" data-id="${questionId}">
            <div class="question-header">
                <span class="question-title">Question ${questionCount}</span>
                <button type="button" class="btn-remove" onclick="removeQuestion('${questionId}')">Remove</button>
            </div>

            <div class="form-group question-type-select">
                <label>Question Type <span class="required">*</span></label>
                <select class="question-type" onchange="toggleQuestionType('${questionId}')">
                    <option value="multiple">Multiple Choice</option>
                    <option value="fill">Fill in the Blank</option>
                </select>
            </div>

            <div class="form-group">
                <label>Question <span class="required">*</span></label>
                <textarea class="question-text" required placeholder="Enter your question..."></textarea>
            </div>

            <div class="multiple-choice-section">
                <label>Options <span class="required">*</span></label>
                <div class="options-grid">
                    <div class="option-group">
                        <input type="radio" name="correct-${questionId}" value="0" checked>
                        <input type="text" class="option-input" placeholder="Option 1" required>
                    </div>
                    <div class="option-group">
                        <input type="radio" name="correct-${questionId}" value="1">
                        <input type="text" class="option-input" placeholder="Option 2" required>
                    </div>
                    <div class="option-group">
                        <input type="radio" name="correct-${questionId}" value="2">
                        <input type="text" class="option-input" placeholder="Option 3" required>
                    </div>
                    <div class="option-group">
                        <input type="radio" name="correct-${questionId}" value="3">
                        <input type="text" class="option-input" placeholder="Option 4" required>
                    </div>
                </div>
                <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">Select the correct answer</p>
            </div>

            <div class="fill-blank-section" style="display: none;">
                <div class="form-group">
                    <label>Correct Answer <span class="required">*</span></label>
                    <input type="text" class="fill-answer" placeholder="Enter the correct answer">
                </div>
            </div>
        </div>
    `;

    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    questions.push(questionId);
    updateQuestionNumbers();
    validateStep3();

    // Add input listeners
    const questionElement = document.querySelector(`[data-id="${questionId}"]`);
    questionElement.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', validateStep3);
    });
}

function removeQuestion(questionId) {
    const index = questions.indexOf(questionId);
    if (index > -1) {
        questions.splice(index, 1);
    }
    document.querySelector(`[data-id="${questionId}"]`).remove();
    updateQuestionNumbers();
    validateStep3();
}

function updateQuestionNumbers() {
    const questionItems = document.querySelectorAll('.question-item');
    questionItems.forEach((item, index) => {
        const titleSpan = item.querySelector('.question-title');
        titleSpan.textContent = `Question ${index + 1}`;
    });
}

function toggleQuestionType(questionId) {
    const questionElement = document.querySelector(`[data-id="${questionId}"]`);
    const type = questionElement.querySelector('.question-type').value;
    const multipleSection = questionElement.querySelector('.multiple-choice-section');
    const fillSection = questionElement.querySelector('.fill-blank-section');

    if (type === 'multiple') {
        multipleSection.style.display = 'block';
        fillSection.style.display = 'none';
    } else {
        multipleSection.style.display = 'none';
        fillSection.style.display = 'block';
    }
    validateStep3();
}

function validateStep3() {
    const questionItems = document.querySelectorAll('.question-item');
    let allValid = questionItems.length > 0;

    questionItems.forEach(item => {
        const questionText = item.querySelector('.question-text').value.trim();
        const type = item.querySelector('.question-type').value;

        if (!questionText) {
            allValid = false;
            return;
        }

        if (type === 'multiple') {
            const options = item.querySelectorAll('.option-input');
            let optionsFilled = true;
            options.forEach(opt => {
                if (!opt.value.trim()) optionsFilled = false;
            });
            if (!optionsFilled) allValid = false;
        } else {
            const fillAnswer = item.querySelector('.fill-answer').value.trim();
            if (!fillAnswer) allValid = false;
        }
    });

    document.getElementById('submitCourse').disabled = !allValid;
    document.getElementById('questionsError').classList.toggle('show', questionItems.length === 0);
}

document.getElementById('addQuestion').addEventListener('click', createQuestion);
document.getElementById('step3Prev').addEventListener('click', () => goToStep(2));

// Form Submission
document.getElementById('submitCourse').addEventListener('click', async () => {
    const title = document.getElementById('courseTitle').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const isPublic = document.querySelector('input[name="visibility"]:checked').value === 'public';

    // Collect activities
    const activities = Array.from(document.querySelectorAll('.activity-item')).map(item => ({
        title: item.querySelector('.activity-title-input').value.trim(),
        problemStatement: item.querySelector('.activity-problem').value.trim(),
        difficulty: item.querySelector('.activity-difficulty').value,
        points: 100, // default placeholder value
        testCases: item.querySelector('.activity-tests').value.trim()
    }));

    // Collect questions
    const preAssessments = Array.from(document.querySelectorAll('.question-item')).map(item => {
        const type = item.querySelector('.question-type').value;
        let questionObj = {
            question: item.querySelector('.question-text').value.trim(),
            questionType: type === 'multiple' ? 'MCQ' : 'FillBlank'
        };

        if (type === 'multiple') {
            const options = Array.from(item.querySelectorAll('.option-input')).map(opt => opt.value.trim());
            const correctIndex = parseInt(item.querySelector(`input[name^="correct-"]:checked`).value);
            questionObj.options = JSON.stringify(options);
            questionObj.correctAnswer = options[correctIndex];
        } else {
            questionObj.correctAnswer = item.querySelector('.fill-answer').value.trim();
        }

        return questionObj;
    });

    // Construct payload for backend
    const courseData = {
        title,
        description,
        isPublic,
        activities,
        preAssessments
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    creationMessage.style.display = 'none';

    console.log('📤 Sending to backend:', courseData);

    try {
        const token = localStorage.getItem('token');
        console.log('Token in localStorage before sending course:', localStorage.getItem('token'));
        if (!token) throw new Error('You must be logged in to create a course.');

        const response = await fetch('http://localhost:8081/api/courses/full', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': 'Bearer ' + token } : {})
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create course: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Backend response:', result);

        // Instead of result.status, just check if an id exists
        if (result && result.id) {
            creationMessage.style.color = 'green';
            creationMessage.textContent = 'Course created successfully!';
            creationMessage.style.display = 'block';

        setTimeout(() => {
        creationMessage.style.display = 'none';
        window.location.href = '/frontend/webpages/professor-homepage.html';
        }, 2000);
    } else {
    throw new Error('Failed to create course.');
}

    } catch (error) {
        console.error('❌ Error creating course:', error);
        creationMessage.style.color = 'red';
        creationMessage.textContent = error.message || 'Error creating course. Please try again.';
        creationMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Course';
    }
});

// Initialize form validation
validateStep1();