/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useState, Suspense } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import HeadModel from "../public/HeadModel.jsx";
import axios from "axios";
const App = () => {
  const videoRef = useRef();
  var target=0;
  const wait_for=15;
  const canvasRef = useRef();
  const [angles, setAngles] = useState({});
  const [landmarksActual, setLandmarksActual] = useState({});
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
                x: landmarks[index].x * canvasRef.current.width,
                y: landmarks[index].y * canvasRef.current.height,
              })),
            })
          );

          if (landmarksData) {
            console.log(landmarksData);
            setLandmarksActual(landmarksData);
            sendDataToBackend(landmarksData);
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

  const sendDataToBackend = async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/angles", data);
      console.log(res.data);
      if (target==0){
      setAngles(res.data);
      }
      target=target+1;
      target=target%wait_for;
    } catch (error) {
      console.log(error);
    }
  };

  const demo = [
    {
      landmarks: [
        {
          x: 289.2490577697754,
          y: 281.3603210449219,
        },
        {
          x: 294.05567169189453,
          y: 359.6661186218262,
        },
        {
          x: 364.96437072753906,
          y: 227.86447048187256,
        },
        {
          x: 233.79375457763672,
          y: 228.34733963012695,
        },
        {
          x: 329.74430084228516,
          y: 319.711332321167,
        },
        {
          x: 261.43798828125,
          y: 318.62860679626465,
        },
      ],
    },
  ];
  console.log(landmarksActual);
  return (
    <>
      <div>
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          style={videoStyle}
        />
        <canvas ref={canvasRef} width={640} height={480} style={canvasStyle} />
        <p>degX : {angles.degX}</p>
        <p>degY : {angles.degY}</p>
        <p>degZ : {angles.degZ}</p>
      </div>
      <div className="model"></div>
      <div className="landmarks">
        {landmarksActual.map((data, index) => (
          <div key={index}>
            <p>Landmarks {index + 1}:</p>
            <ul>
              {data.landmarks.map((landmark, i) => (
                <li key={i}>
                  x: {landmark.x}, y: {landmark.y}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Canvas
        style={{
          height: "20vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ambientLight />
        <OrbitControls />
        <Suspense fallback={null}>
          <HeadModel rotation={[0, 45,0]} />
        </Suspense>
      </Canvas>
    </>
  );
};

export default App;
