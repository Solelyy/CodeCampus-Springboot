import { showCourseCreationGuide } from './course-creation-guide.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Course Creation Guide Toggle ---
    const guideBtn = document.getElementById('showGuideBtn');

    guideBtn.addEventListener('click', () => {
    showCourseCreationGuide('courseGuideContainer');
    });



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
    const activityId = `activity-${Date.now()}`;

    const activityHTML = `
        <div class="activity-item" data-id="${activityId}">
            <div class="activity-header">
                <span class="activity-title">Activity ${activityCount}</span>
                <button type="button" class="btn-remove">Remove</button>
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

            <div class="form-group test-cases-section">
                <label>Test Cases <span class="required">*</span></label>
                <div class="test-cases-container">
                    <div class="test-case">
                        <div class="test-case-header">
                            <span class="test-case-number">Test Case 1</span>
                            <button type="button" class="btn-remove-test-case">Remove</button>
                        </div>

                        <div class="test-case-input-group">
                            <label>Input</label>
                            <input type="text" class="test-input" placeholder="Example input: 10" required>
                            <label class="no-input-label"><input type="checkbox" class="no-input-activity"> No input needed</label>
                        </div>

                        <div class="test-case-output-group">
                            <label>Output</label>
                            <input type="text" class="test-output" placeholder="Expected output example: Even" required>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn-add btn-add-test-case">+ Add Test Case</button>
            </div>
        </div>
    `;

    const container = document.getElementById('activitiesContainer');
    container.insertAdjacentHTML('beforeend', activityHTML);
    activities.push(activityId);
    updateActivityNumbers();
    validateStep2();

    const activityEl = container.querySelector(`[data-id="${activityId}"]`);

    // Remove Activity
    activityEl.querySelector('.btn-remove').addEventListener('click', function() {
        const activityItem = this.closest('.activity-item');
        const index = activities.indexOf(activityItem.getAttribute('data-id'));
        if (index > -1) activities.splice(index, 1);
        activityItem.remove();
        updateActivityNumbers();
        validateStep2();
    });

    // Add Test Case
    activityEl.querySelector('.btn-add-test-case').addEventListener('click', function() {
        const testCasesContainer = this.closest('.activity-item').querySelector('.test-cases-container');
        const testCaseCount = testCasesContainer.querySelectorAll('.test-case').length + 1;

        const newTestCaseHTML = `
            <div class="test-case">
                <div class="test-case-header">
                    <span class="test-case-number">Test Case ${testCaseCount}</span>
                    <button type="button" class="btn-remove-test-case">Remove</button>
                </div>

                <div class="test-case-input-group">
                    <label>Input</label>
                    <input type="text" class="test-input" placeholder="Example input: 10" required>
                    <label class="no-input-label"><input type="checkbox" class="no-input-activity"> No input needed</label>
                </div>

                <div class="test-case-output-group">
                    <label>Output</label>
                    <input type="text" class="test-output" placeholder="Expected output example: Even" required>
                </div>
            </div>
        `;

        testCasesContainer.insertAdjacentHTML('beforeend', newTestCaseHTML);
        attachTestCaseListeners(testCasesContainer);
        updateTestCaseNumbers(testCasesContainer);
        validateStep2();
    });

    // Attach listeners for initial test case
    const testCasesContainer = activityEl.querySelector('.test-cases-container');
    attachTestCaseListeners(testCasesContainer);

    // Input listeners for validation
    activityEl.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', validateStep2);
    });
}

// Update test case numbers dynamically
function updateTestCaseNumbers(container) {
    container.querySelectorAll('.test-case').forEach((tc, index) => {
        const numberSpan = tc.querySelector('.test-case-number');
        numberSpan.textContent = `Test Case ${index + 1}`;
    });
}

// Attach remove & "No input needed" checkbox listeners
function attachTestCaseListeners(container) {
    container.querySelectorAll('.btn-remove-test-case').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.target.closest('.test-case').remove();
            updateTestCaseNumbers(container);
            validateStep2();
        };
    });

    container.querySelectorAll('.no-input-activity').forEach(cb => {
        const inputField = cb.closest('.test-case-input-group').querySelector('.test-input');
        cb.onchange = function() {
            if (cb.checked) {
                inputField.value = 'NA';
                inputField.disabled = true;
                inputField.classList.add('disabled');
                inputField.removeAttribute('required');
            } else {
                inputField.value = '';
                inputField.disabled = false;
                inputField.classList.remove('disabled');
                inputField.setAttribute('required', 'required');
            }
            validateStep2();
        };
    });
}

// Update activity numbers dynamically
function updateActivityNumbers() {
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        const titleSpan = item.querySelector('.activity-title');
        titleSpan.textContent = `Activity ${index + 1}`;
    });
}

// Validation
function validateStep2() {
    const activityItems = document.querySelectorAll('.activity-item');
    let allValid = activityItems.length > 0;

    activityItems.forEach(item => {
        const title = item.querySelector('.activity-title-input').value.trim();
        const difficulty = item.querySelector('.activity-difficulty').value;
        const problem = item.querySelector('.activity-problem').value.trim();
        const testCases = item.querySelectorAll('.test-case');

        // Main activity fields must not be empty
        if (!title || !difficulty || !problem || testCases.length === 0) {
            allValid = false;
        }

        testCases.forEach(tc => {
            const checkbox = tc.querySelector('.no-input-activity');
            const inputField = tc.querySelector('.test-input');
            const outputField = tc.querySelector('.test-output');

            const inputVal = inputField.value.trim();
            const outputVal = outputField.value.trim();

            // Valid if checkbox checked OR input has value
            const inputValid = checkbox.checked || inputVal !== '';
            const outputValid = outputVal !== '';

            if (!inputValid || !outputValid) {
                allValid = false;
            }
        });
    });

    document.getElementById('step2Next').disabled = !allValid;
    document.getElementById('activitiesError').classList.toggle('show', activityItems.length === 0);
}

    // Event listeners
    document.getElementById('addActivity').addEventListener('click', createActivity);
    document.getElementById('step2Prev').addEventListener('click', () => goToStep(1));
    document.getElementById('step2Next').addEventListener('click', () => {
        if (activities.length > 0) goToStep(3);
    });

    function attachTestCaseListeners(container) {
    container.querySelectorAll('.btn-remove-test-case').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.target.closest('.test-case').remove();
            updateTestCaseNumbers(container);
            validateStep2();
        };
    });

    container.querySelectorAll('.no-input-activity').forEach(cb => {
        // Avoid attaching multiple listeners
        if (!cb.dataset.listenerAttached) {
            cb.dataset.listenerAttached = 'true';

            const inputField = cb.closest('.test-case-input-group').querySelector('.test-input');

            cb.onchange = function() {
                if (cb.checked) {
                    inputField.value = 'NA';
                    inputField.disabled = true;
                    inputField.classList.add('disabled');
                    inputField.removeAttribute('required');
                } else {
                    inputField.value = '';
                    inputField.disabled = false;
                    inputField.classList.remove('disabled');
                    inputField.setAttribute('required', 'required');
                }
                validateStep2();
            };
        }
    });

    // Input listener for newly added test inputs
    container.querySelectorAll('.test-input, .test-output').forEach(input => {
        if (!input.dataset.listenerAttached) {
            input.dataset.listenerAttached = 'true';
            input.addEventListener('input', validateStep2);
        }
    });
}

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

    // Collect activities with proper test cases
    const activities = Array.from(document.querySelectorAll('.activity-item')).map(item => {
        const testCases = Array.from(item.querySelectorAll('.test-case')).map(tc => {
            const inputField = tc.querySelector('.test-input');
            const noInput = tc.querySelector('.no-input-activity').checked;

            return {
                input: noInput ? null : inputField.value.trim(), // use null if no input needed
                noInput: noInput,                                // explicitly send the boolean
                expectedOutput: tc.querySelector('.test-output').value.trim()
            };
        });

        return {
            title: item.querySelector('.activity-title-input').value.trim(),
            problemStatement: item.querySelector('.activity-problem').value.trim(),
            difficulty: item.querySelector('.activity-difficulty').value,
            testCases // array of {input, noInput, expectedOutput}
        };
    });



    // Collect pre-assessment questions
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

    console.log('Sending to backend:', courseData);

    try {
        const token = localStorage.getItem('token');
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
});
