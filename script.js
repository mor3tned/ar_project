const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // 使用后置摄像头
    });
    video.srcObject = stream;
}

async function detectAndMask() {
    const mediapipe = await import('https://cdn.jsdelivr.net/npm/@mediapipe/holistic');
    const holistic = new mediapipe.Holistic({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` });

    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true, 
        smoothSegmentation: true
    });

    holistic.onResults((results) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (results.segmentationMask) {
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }
    });

    const camera = new mediapipe.Camera(video, {
        onFrame: async () => { await holistic.send({ image: video }); },
        width: 640,
        height: 480
    });

    camera.start();
}

video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    detectAndMask();
});

setupCamera();
