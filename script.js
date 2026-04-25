document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = document.getElementById('uploadContent');
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput');

    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const resultView = document.getElementById('resultView');

    const progressFill = document.getElementById('progressFill');
    const loadingText = document.querySelector('.loading-text');

    let userImageUrl = null;

    // Upload Area Interactivity
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userImageUrl = e.target.result;
                uploadContent.innerHTML = `
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <p style="color: white; font-size: 0.9rem; margin-top: 10px;"><strong>${file.name}</strong> selected</p>
                `;
                // Add a default prompt if empty
                if (!promptInput.value) {
                    promptInput.value = "Transform this room into a futuristic cyberpunk style with neon lights, sleek dark furniture, and glowing accents";
                }
            };
            reader.readAsDataURL(file);
        }
    }

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Generation Flow
    generateBtn.addEventListener('click', () => {
        if (!promptInput.value) {
            alert("Please enter a transformation prompt.");
            return;
        }

        // Show loading state
        emptyState.classList.add('hidden');
        resultView.classList.add('hidden');
        loadingState.classList.remove('hidden');

        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';

        // Simulate generation process
        let progress = 0;
        const loadingTexts = [
            "Analyzing image structure...",
            "Applying ControlNet maps...",
            "Generating neural latents...",
            "Refining style details...",
            "Finalizing image..."
        ];

        let textIndex = 0;

        const interval = setInterval(() => {
            progress += 1;
            progressFill.style.width = `${progress}%`;

            if (progress % 20 === 0 && textIndex < loadingTexts.length) {
                loadingText.innerText = loadingTexts[textIndex];
                textIndex++;
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    showResult();
                }, 500);
            }
        }, 50); // 5 seconds total simulation
    });

    function showResult() {
        loadingState.classList.add('hidden');
        resultView.classList.remove('hidden');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.innerHTML = `
            <span>Generate Again</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        `;

        const beforeImage = document.getElementById('beforeImage');
        const afterImage = document.getElementById('afterImage');

        if (userImageUrl) {
            beforeImage.src = userImageUrl;
            afterImage.src = userImageUrl;
        } else {
            // Use the default image if none uploaded
            beforeImage.src = "assets/original.png";
            afterImage.src = "assets/original.png";
        }

        // Always apply a CSS filter to the after image to simulate the AI edit based on the prompt task
        const promptText = promptInput.value.toLowerCase();
        let filterString = "contrast(1.2) saturate(1.5)";

        if (promptText.includes("cyberpunk") || promptText.includes("neon") || promptText.includes("futuristic")) {
            filterString = "contrast(1.3) saturate(1.8) hue-rotate(30deg) brightness(0.9)";
        } else if (promptText.includes("vintage") || promptText.includes("old")) {
            filterString = "sepia(0.8) contrast(1.1) brightness(0.9)";
        } else if (promptText.includes("black and white") || promptText.includes("b&w")) {
            filterString = "grayscale(1) contrast(1.2)";
        } else if (promptText.includes("blur") || promptText.includes("soft")) {
            filterString = "blur(3px) contrast(1.1)";
        } else if (promptText.includes("bright") || promptText.includes("light")) {
            filterString = "brightness(1.4) contrast(1.1)";
        } else if (promptText.includes("dark")) {
            filterString = "brightness(0.6) contrast(1.3)";
        } else if (promptText.includes("warm")) {
            filterString = "sepia(0.4) saturate(1.5) hue-rotate(-10deg)";
        } else if (promptText.includes("cool") || promptText.includes("cold")) {
            filterString = "saturate(1.2) hue-rotate(180deg)";
        } else {
            // Generate a deterministic filter based on the string hash so different prompts give different consistent effects
            let hash = 0;
            for (let i = 0; i < promptText.length; i++) {
                hash = promptText.charCodeAt(i) + ((hash << 5) - hash);
            }
            const rot = Math.abs(hash) % 360;
            const sat = 1 + (Math.abs(hash) % 10) / 10;
            filterString = `contrast(1.2) saturate(${sat}) hue-rotate(${rot}deg)`;
        }

        afterImage.style.filter = filterString;

        initSlider();
    }

    // Comparison Slider Logic
    function initSlider() {
        const slider = document.querySelector('.comparison-slider');
        const handle = document.querySelector('.slider-handle');
        const beforeWrapper = document.querySelector('.before-image-wrapper');

        let isSliding = false;

        handle.addEventListener('mousedown', (e) => {
            isSliding = true;
        });

        window.addEventListener('mouseup', () => {
            isSliding = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isSliding) return;

            const rect = slider.getBoundingClientRect();
            let x = e.clientX - rect.left;

            // Constrain x within the slider
            x = Math.max(0, Math.min(x, rect.width));

            const percent = (x / rect.width) * 100;

            handle.style.left = `${percent}%`;
            beforeWrapper.style.width = `${percent}%`;
        });

        // Touch support
        handle.addEventListener('touchstart', () => {
            isSliding = true;
        });

        window.addEventListener('touchend', () => {
            isSliding = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isSliding) return;

            const rect = slider.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;

            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;

            handle.style.left = `${percent}%`;
            beforeWrapper.style.width = `${percent}%`;
        });
    }
});
