"use client";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSsdLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

import renderPredictions from "@/utils/render-predictions";

let detectInterval;

export default function ObjectDetection() {
  const [isLoading, setIsLoading] = useState(true);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function showVideo() {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoHeight = webcamRef.current.video.videoHeight;
      const myVideoWidth = webcamRef.current.video.videoWidth;

      webcamRef.current.video.height = myVideoHeight;
      webcamRef.current.video.width = myVideoWidth;
    }
  }

  async function runCoco() {
    setIsLoading(true);
    const model = await cocoSsdLoad();
    setIsLoading(false);

    detectInterval = setInterval(() => {
      runObjectDetection(model);
    }, 10);
  }

  async function runObjectDetection(model) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoHeight = webcamRef.current.video.videoHeight;
      const myVideoWidth = webcamRef.current.video.videoWidth;

      canvasRef.current.height = myVideoHeight;
      canvasRef.current.width = myVideoWidth;

      // Find detected objects
      const detectedObjects = await model.detect(
        webcamRef.current.video,
        undefined,
        0.6
      );

      //   console.log(detectedObjects);

      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, context);
    }
  }

  useEffect(() => {
    runCoco();
    showVideo();
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          {/* Webcam */}
          <Webcam
            ref={webcamRef}
            muted
            className="rounded-md w-full  lg:h-[720px]"
          />
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-50 w-full lg:h-[720px]"
          />
        </div>
      )}
    </div>
  );
}
