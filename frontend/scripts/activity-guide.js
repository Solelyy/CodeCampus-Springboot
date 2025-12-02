// activityGuide.js
export function showActivityGuide({ alreadySubmitted = false } = {}) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
        padding: 20px;
    `;
    document.body.style.overflow = 'hidden';

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(102, 195, 85, 0.4), 0 8px 40px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 0 30px rgba(102, 195, 85, 0.6), 0 12px 50px rgba(0,0,0,0.4); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        /* Scrollbar styles */
        .activity-guide-scroll::-webkit-scrollbar {
            width: 10px;
        }
        .activity-guide-scroll::-webkit-scrollbar-track {
            background: rgba(20, 24, 38, 0.6);
            border-radius: 10px;
        }
        .activity-guide-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
            border-radius: 10px;
            border: 2px solid rgba(20, 24, 38, 0.6);
        }
        .activity-guide-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%);
            box-shadow: 0 0 10px rgba(102, 195, 85, 0.5);
        }
        .activity-guide-scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--primary-green) rgba(20, 24, 38, 0.6);
        }
    `;
    document.head.appendChild(style);

    const guideBox = document.createElement('div');
    guideBox.style.cssText = `
        background: linear-gradient(135deg, rgba(15,19,35,0.98) 0%, rgba(26,31,53,0.98) 100%);
        padding: 0;
        border-radius: 24px;
        max-width: 650px;
        width: 100%;
        max-height: 85vh;
        height: auto;
        text-align: center;
        box-shadow: 0 0 60px rgba(102,195,85,0.4), 0 20px 80px rgba(0,0,0,0.7);
        border: 2px solid rgba(102,195,85,0.5);
        position: relative;
        overflow: hidden;
        animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1);
        display: flex;
        flex-direction: column;
    `;

    // Decorative elements
    const decorTop = document.createElement('div');
    decorTop.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, var(--primary-green), var(--secondary-green), var(--primary-green));
        background-size: 200% 100%;
        animation: shimmer 3s linear infinite;
        z-index: 2;
    `;
    const decorCircle = document.createElement('div');
    decorCircle.style.cssText = `
        position: absolute;
        top: -60px;
        right: -60px;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(102,195,85,0.2) 0%, transparent 70%);
        animation: pulse 3s ease-in-out infinite;
        pointer-events: none;
    `;
    guideBox.appendChild(decorTop);
    guideBox.appendChild(decorCircle);

    // Content HTML
    guideBox.innerHTML += alreadySubmitted
        ? `
        <div style="position: relative; z-index:1; display:flex; flex-direction: column; height:100%; max-height: 85vh; padding: 2.5rem 2rem 2rem;">
            <div style="font-size:4rem; margin-bottom:1rem; animation: float 2s ease-in-out infinite;">✅</div>
            <h2 style="color:#fff;font-size:2rem;font-weight:800;margin-bottom:1rem;text-shadow:0 0 25px rgba(102,195,85,0.6); letter-spacing: -0.5px;">Activity Completed!</h2>
            <div class="activity-guide-scroll" style="flex:1 1 auto; overflow-y:auto; overflow-x: hidden; padding:0 1rem; margin-bottom:2rem; max-height: calc(85vh - 300px);">
                <p style="color:rgba(255,255,255,0.9); font-size:1.1rem; line-height:1.8; margin-bottom:1.5rem;">
                    Great job! 🎉 You've already submitted this activity.<br>
                    Your score has been recorded on the leaderboard!
                </p>
                <div style="background: linear-gradient(135deg, rgba(102,195,85,0.15) 0%, rgba(108,209,81,0.1) 100%); border:2px solid rgba(102,195,85,0.4); border-radius:16px; padding:1.5rem; box-shadow: 0 4px 20px rgba(102,195,85,0.2);">
                    <p style="color:var(--primary-green); font-weight:700; font-size:1.05rem; margin:0; text-shadow:0 0 15px rgba(102,195,85,0.6); line-height: 1.6;">
                        💡 This activity is now read-only<br>
                        <span style="font-size: 0.9rem; font-weight: 500; opacity: 0.9;">You can review your solution anytime</span>
                    </p>
                </div>
            </div>
            <button id="closeGuideBtn" style="padding:1rem 3rem; background:linear-gradient(135deg,var(--primary-green),var(--secondary-green)); color:#0a0e1a; border:none; border-radius:14px; cursor:pointer; font-size:1.1rem; font-weight:800; font-family:'Inter',sans-serif; box-shadow:0 4px 30px rgba(102,195,85,0.5); transition:all 0.3s ease; position:relative; overflow:hidden; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;"
                onmouseover="this.style.transform='translateY(-4px) scale(1.02)';this.style.boxShadow='0 6px 40px rgba(102,195,85,0.7)'" 
                onmouseout="this.style.transform='translateY(0) scale(1)';this.style.boxShadow='0 4px 30px rgba(102,195,85,0.5)'">
                Got it! ✨
            </button>
        </div>
        `
        : `
        <div style="position: relative; z-index:1; display:flex; flex-direction: column; height:100%; max-height: 85vh; padding: 2.5rem 2rem 2rem;">
            <div style="flex-shrink: 0;">
                <div style="font-size:4rem; margin-bottom:1rem; animation: float 2s ease-in-out infinite;">🚀</div>
                <h2 style="color:#fff; font-size:2rem; font-weight:800; margin-bottom:0.5rem; text-shadow:0 0 25px rgba(102,195,85,0.6); letter-spacing: -0.5px;">Welcome to Your First Activity!</h2>
                <p style="color:var(--primary-green); font-size:1.05rem; margin-bottom:1.5rem; font-weight:700; text-shadow:0 0 15px rgba(102,195,85,0.4);">Let's code something amazing! 💚</p>
            </div>
            <div class="activity-guide-scroll" style="flex:1 1 auto; overflow-y:auto; overflow-x: hidden; padding:0 1rem; margin-bottom:2rem; max-height: calc(85vh - 380px);">
                <div style="background: linear-gradient(135deg, rgba(102,195,85,0.08) 0%, rgba(108,209,81,0.08) 100%); border:2px solid rgba(102,195,85,0.3); border-radius:16px; padding:1.5rem 1.2rem; margin-bottom:1.5rem; box-shadow: 0 4px 20px rgba(102,195,85,0.15);">
                    <p style="color:var(--primary-green); font-weight:800; font-size:1.15rem; margin-bottom:1.2rem; text-align:center; text-shadow:0 0 15px rgba(102,195,85,0.4); text-transform: uppercase; letter-spacing: 0.5px;">📋 Important Rules</p>
                    <ul style="list-style:none; padding:0; margin:0 auto; max-width:500px;">
                        <li style="color:rgba(255,255,255,0.92); font-size:0.95rem; line-height:1.7; margin-bottom:1rem; padding-left:2rem; position:relative; text-align:left; background: rgba(102,195,85,0.05); padding: 0.8rem 0.8rem 0.8rem 2rem; border-radius: 10px; border-left: 3px solid var(--primary-green);"><span style="position:absolute; left:0.8rem; color:var(--primary-green); font-weight:bold; font-size: 1.1rem;">✓</span> Each activity can be taken <strong style="color:var(--primary-green); font-weight: 700;">only once</strong></li>
                        <li style="color:rgba(255,255,255,0.92); font-size:0.95rem; line-height:1.7; margin-bottom:1rem; padding-left:2rem; position:relative; text-align:left; background: rgba(102,195,85,0.05); padding: 0.8rem 0.8rem 0.8rem 2rem; border-radius: 10px; border-left: 3px solid var(--primary-green);"><span style="position:absolute; left:0.8rem; color:var(--primary-green); font-weight:bold; font-size: 1.1rem;">✓</span> Complete current activity to unlock the next one</li>
                        <li style="color:rgba(255,255,255,0.92); font-size:0.95rem; line-height:1.7; margin-bottom:1rem; padding-left:2rem; position:relative; text-align:left; background: rgba(102,195,85,0.05); padding: 0.8rem 0.8rem 0.8rem 2rem; border-radius: 10px; border-left: 3px solid var(--primary-green);"><span style="position:absolute; left:0.8rem; color:var(--primary-green); font-weight:bold; font-size: 1.1rem;">✓</span> Your code must be <strong style="color:var(--primary-green); font-weight: 700;">correct</strong> to submit</li>
                        <li style="color:rgba(255,255,255,0.92); font-size:0.95rem; line-height:1.7; margin-bottom:1rem; padding-left:2rem; position:relative; text-align:left; background: rgba(102,195,85,0.05); padding: 0.8rem 0.8rem 0.8rem 2rem; border-radius: 10px; border-left: 3px solid var(--primary-green);"><span style="position:absolute; left:0.8rem; color:var(--primary-green); font-weight:bold; font-size: 1.1rem;">✓</span> Submitted activities become read-only</li>
                        <li style="color:rgba(255,255,255,0.92); font-size:0.95rem; line-height:1.7; margin-bottom:0; padding-left:2rem; position:relative; text-align:left; background: rgba(102,195,85,0.05); padding: 0.8rem 0.8rem 0.8rem 2rem; border-radius: 10px; border-left: 3px solid var(--primary-green);"><span style="position:absolute; left:0.8rem; color:var(--primary-green); font-weight:bold; font-size: 1.1rem;">✓</span> Earn points for the <strong style="color:var(--primary-green); font-weight: 700;">leaderboard</strong> 🏆</li>
                    </ul>
                </div>
                <div style="background: linear-gradient(135deg, rgba(102,195,85,0.2) 0%, rgba(108,209,81,0.15) 100%); border:2px solid var(--primary-green); border-radius:16px; padding:1.3rem; box-shadow:0 4px 25px rgba(102,195,85,0.3);">
                    <p style="color:#fff; font-size:1.05rem; font-weight:700; margin:0; text-shadow:0 0 15px rgba(102,195,85,0.6); line-height: 1.6;">💪 You've got this! Let's start coding! 💻</p>
                </div>
            </div>
            <button id="closeGuideBtn" style="padding:1rem 3rem; background:linear-gradient(135deg,var(--primary-green),var(--secondary-green)); color:#0a0e1a; border:none; border-radius:14px; cursor:pointer; font-size:1.1rem; font-weight:800; font-family:'Inter',sans-serif; box-shadow:0 4px 30px rgba(102,195,85,0.5); transition:all 0.3s ease; position:relative; overflow:hidden; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;"
                onmouseover="this.style.transform='translateY(-4px) scale(1.02)';this.style.boxShadow='0 6px 40px rgba(102,195,85,0.7)'" 
                onmouseout="this.style.transform='translateY(0) scale(1)';this.style.boxShadow='0 4px 30px rgba(102,195,85,0.5)'">
                Let's Code! 🚀
            </button>
        </div>
        `;

    overlay.appendChild(guideBox);
    document.body.appendChild(overlay);

    document.getElementById('closeGuideBtn').addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
            if (style.parentNode) document.head.removeChild(style);
        }, 300);
    });
}
