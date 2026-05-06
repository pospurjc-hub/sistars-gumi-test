const URL = "https://teachablemachine.withgoogle.com/models/GwT8qVJp8/";

let model, webcam, labelContainer, maxPredictions;

// Elements
const fileInput = document.getElementById('file-input');
const faceImage = document.getElementById('face-image');
const webcamBtn = document.getElementById('webcam-btn');
const webcamContainer = document.getElementById('webcam-container');
const loading = document.getElementById('loading');
const resultMessage = document.getElementById('result-message');
const themeToggle = document.getElementById('theme-toggle');

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
});

// Load the model
async function loadModel() {
    if (!model) {
        loading.style.display = 'block';
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
        loading.style.display = 'none';
    }
}

// Image Upload Logic
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        faceImage.src = event.target.result;
        faceImage.style.display = 'block';
        webcamContainer.style.display = 'none';
        
        await loadModel();
        predict(faceImage);
    };
    reader.readAsDataURL(file);
});

// Webcam Logic
webcamBtn.addEventListener('click', async () => {
    await loadModel();
    
    faceImage.style.display = 'none';
    webcamContainer.style.display = 'block';
    
    if (!webcam) {
        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);
        await webcam.setup();
        await webcam.play();
        webcamContainer.appendChild(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
});

async function loop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// Prediction Logic
async function predict(imageElement) {
    const prediction = await model.predict(imageElement);
    labelContainer.innerHTML = '';
    
    let highestProb = 0;
    let winner = "";

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability;
        const probPercentage = (probability * 100).toFixed(0);
        
        if (probability > highestProb) {
            highestProb = probability;
            winner = className;
        }

        const resultBar = document.createElement('div');
        resultBar.className = `result-bar ${className.toLowerCase()}-bar ${className}-bar`;
        
        const barFill = document.createElement('div');
        barFill.className = 'bar-fill';
        barFill.style.width = `${probPercentage}%`;
        barFill.innerHTML = `<span>${className}: ${probPercentage}%</span>`;
        
        resultBar.appendChild(barFill);
        labelContainer.appendChild(resultBar);
    }

    // Set Result Message
    if (winner === "강아지" || winner.toLowerCase() === "dog") {
        resultMessage.innerHTML = "당신은 귀여운 강아지상입니다! 🐶";
    } else if (winner === "고양이" || winner.toLowerCase() === "cat") {
        resultMessage.innerHTML = "당신은 도도한 고양이상입니다! 🐱";
    } else {
        resultMessage.innerHTML = `당신은 ${winner}상입니다!`;
    }
}
