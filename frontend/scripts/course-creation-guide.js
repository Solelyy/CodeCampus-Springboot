// course-creation-guide.js
export function showCourseCreationGuide(targetElementId) {
    const container = document.getElementById(targetElementId);
    if (!container) return;

    // Add CSS animations and styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(102, 195, 85, 0.4); }
            50% { box-shadow: 0 0 30px rgba(102, 195, 85, 0.6); }
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .course-guide-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
            padding: 20px;
        }
        .course-guide-box {
            background: linear-gradient(135deg, rgba(15,19,35,0.98) 0%, rgba(26,31,53,0.98) 100%);
            padding: 0;
            border-radius: 24px;
            max-width: 800px;
            width: 100%;
            max-height: 85vh;
            box-shadow: 0 0 60px rgba(102,195,85,0.4), 0 20px 80px rgba(0,0,0,0.7);
            border: 2px solid rgba(102,195,85,0.5);
            position: relative;
            overflow: hidden;
            animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1);
            display: flex;
            flex-direction: column;
        }
        .course-guide-header {
            padding: 2rem 2rem 1.5rem;
            text-align: center;
            border-bottom: 2px solid rgba(102,195,85,0.3);
            position: relative;
            z-index: 2;
        }
        .course-guide-header h2 {
            color: #fff;
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 25px rgba(102,195,85,0.6);
            letter-spacing: -0.5px;
        }
        .course-guide-header p {
            color: var(--primary-green);
            font-size: 1.05rem;
            font-weight: 600;
            margin: 0;
        }
        .course-guide-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-green) rgba(20, 24, 38, 0.6);
        }
        .course-guide-content::-webkit-scrollbar {
            width: 10px;
        }
        .course-guide-content::-webkit-scrollbar-track {
            background: rgba(20, 24, 38, 0.6);
            border-radius: 10px;
        }
        .course-guide-content::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
            border-radius: 10px;
            border: 2px solid rgba(20, 24, 38, 0.6);
        }
        .course-guide-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%);
            box-shadow: 0 0 10px rgba(102, 195, 85, 0.5);
        }
        .course-guide-card {
            background: linear-gradient(135deg, rgba(102,195,85,0.08) 0%, rgba(108,209,81,0.08) 100%);
            border: 2px solid rgba(102,195,85,0.3);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 20px rgba(102,195,85,0.15);
            transition: all 0.3s ease;
        }
        .course-guide-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(102,195,85,0.25);
            border-color: rgba(102,195,85,0.5);
        }
        .course-guide-card h2 {
            color: var(--primary-green);
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 0.8rem;
            text-shadow: 0 0 15px rgba(102,195,85,0.4);
        }
        .course-guide-card p, .course-guide-card li {
            color: rgba(255,255,255,0.9);
            font-size: 0.95rem;
            line-height: 1.7;
        }
        .course-guide-card ul, .course-guide-card ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }
        .course-guide-card li {
            margin-bottom: 0.5rem;
        }
        .course-guide-card .check {
            background: rgba(102,195,85,0.1);
            border-left: 4px solid var(--primary-green);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        .course-guide-card .check strong {
            color: var(--primary-green);
            display: block;
            margin-bottom: 0.5rem;
        }
        .course-guide-card .muted {
            color: rgba(255,255,255,0.7);
            font-size: 0.9rem;
            font-style: italic;
            margin-top: 1rem;
        }
        .course-guide-card code {
            background: rgba(102,195,85,0.2);
            color: var(--primary-green);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .course-guide-footer {
            padding: 1.5rem 2rem 2rem;
            text-align: center;
            border-top: 2px solid rgba(102,195,85,0.3);
            flex-shrink: 0;
        }
        .course-guide-close-btn {
            padding: 1rem 3rem;
            background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
            color: #0a0e1a;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 800;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 30px rgba(102,195,85,0.5);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .course-guide-close-btn:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 6px 40px rgba(102,195,85,0.7);
        }
        .decor-top {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, var(--primary-green), var(--secondary-green), var(--primary-green));
            background-size: 200% 100%;
            animation: shimmer 3s linear infinite;
            z-index: 2;
        }
        .decor-circle {
            position: absolute;
            top: -60px;
            right: -60px;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102,195,85,0.2) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'course-guide-overlay';
    
    const guideBox = document.createElement('div');
    guideBox.className = 'course-guide-box';
    
    guideBox.innerHTML = `
        <div class="decor-top"></div>
        <div class="decor-circle"></div>
        
        <div class="course-guide-header">
            <h2>📚 Course Creation Guide</h2>
            <p>Everything you need to know about creating courses</p>
        </div>

        <div class="course-guide-content">
            <div class="course-guide-card">
                <h2>Step 1: Enter Course Title</h2>
                <p>Provide a clear and descriptive title. This is what students will see when browsing available courses.</p>
            </div>

            <div class="course-guide-card">
                <h2>Step 2: Add a Course Description</h2>
                <p>Explain what the course covers, expected outcomes, and why it's beneficial. Keep it concise but useful.</p>
            </div>

            <div class="course-guide-card">
                <h2>Step 3: Select a Category</h2>
                <p>Choose the most relevant category (e.g., Programming, Business, Design). This helps with course organization.</p>
            </div>

            <div class="course-guide-card">
                <h2>Step 4: Set Difficulty Level</h2>
                <p>Choose between Easy, Medium, or Hard. Activities that the students see are arranged based on difficulty.</p>
            </div>

            <div class="course-guide-card">
                <h2>📝 Test Case Rules</h2>
                <ul>
                    <li>Avoid asking students to print personal or dynamic data (name, current date, random numbers).</li>
                    <li>Don't include trailing spaces or inconsistent newlines in expected output.</li>
                    <li>Make sure the input format in the test case matches how students will read it (one line vs multiple lines).</li>
                </ul>

                <div class="check">
                    <strong>Quick checklist before saving:</strong>
                    <ul>
                        <li>Is the expected output deterministic?</li>
                        <li>Do test cases match the input format students will read?</li>
                        <li>Have you included multiple test cases for edge conditions?</li>
                        <li>Is formatting (spaces, capitalization, newlines) exactly correct?</li>
                    </ul>
                </div>
            </div>

            <div class="course-guide-card">
                <h2>💡 Tips for Professors</h2>
                <ul>
                    <li>When in doubt, require students to provide any variable data as input.</li>
                    <li>Use multiple test cases to cover normal and edge inputs.</li>
                    <li>Keep expected output minimal and exact — avoid extra explanatory text.</li>
                    <li>Use the course preview to run sample student submissions before publishing.</li>
                </ul>
            </div>

            <div class="course-guide-card">
                <h2>⚙️ How Evaluation Works</h2>
                <ol>
                    <li>Each test case runs the student's program independently with the test input.</li>
                    <li>The student's program output is normalized (CRLF → LF, trimmed) before comparison.</li>
                    <li>Comparison is exact and case-sensitive: <code>actualOutput.equals(expectedOutput)</code>.</li>
                    <li>If all test cases pass → student may submit and activity is marked completed (points awarded).</li>
                </ol>
                <p class="muted">Note: avoid prompts or extra text in expected output because they will cause mismatches.</p>
            </div>
        </div>

        <div class="course-guide-footer">
            <button class="course-guide-close-btn" id="closeCourseGuide">Got it! 🚀</button>
        </div>
    `;

    overlay.appendChild(guideBox);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Close button handler
    document.getElementById('closeCourseGuide').addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
            if (style.parentNode) document.head.removeChild(style);
        }, 300);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.getElementById('closeCourseGuide').click();
        }
    });
}
