import { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
// import '@mediapipe/face_mesh/face_mesh.css';

const App = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const videoStyle = {
    width: "640px",
    height: "480px",
  };
  const canvasStyle = {
    margin: "0",
    padding: "0",
    position: "absolute",
    top: 0,
    left: 0,
  };
  useEffect(() => {
    const runFaceMesh = async () => {
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setInterval(processFrame, 100);
      };

      function processFrame() {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        faceMesh.send({ image: canvas });
      }

      function onResults(results) {
        console.log("bjwj");
        if (results.multiFaceLandmarks) {
          const desiredIndices = [1, 199, 263, 33, 291, 61];
          const landmarksData = results?.multiFaceLandmarks?.map(
            (landmarks) => ({
              landmarks: desiredIndices?.map((index) => ({
                x: landmarks[index].x,
                y: landmarks[index].y,
              })),
            })
          );

          if (landmarksData) {
            console.log(landmarksData);
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            landmarksData.forEach((landmarks) => {
              drawConnections(context, landmarks.landmarks);
            });
          } else {
            console.log("nahi hoga");
          }
        } else {
          console.log("hey");
        }
      }

      function drawConnections(ctx, landmarks) {
        const faceCoords = [1, 199, 263, 33, 291, 61];
        faceCoords.map((value) => {
          const landmark = landmarks[value];
          const x = landmark?.x * canvasRef.current.width;
          const y = landmark?.y * canvasRef.current.height;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    };

    runFaceMesh();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        width={640}
        height={480}
        autoPlay
        style={videoStyle}
      />
      <canvas ref={canvasRef} width={640} height={480} style={canvasStyle} />
    </div>
  );
};

export default App;
