import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, RefreshCw, AlertTriangle, Check, ArrowLeftRight } from 'lucide-react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { toast } from './Toast';

const VirtualTryOn = ({ frontPng, anglePng, frameWidthMm = 138, productName, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const landmarkerRef = useRef(null);
  
  // Exponential Moving Average (EMA) smoothing for face tracking coordinates
  const smoothed = useRef({ x1: null, y1: null, x2: null, y2: null, noseY: null, yaw: null, pitch: null });
  const SMOOTHING = 0.25; // lower = smoother/laggy, higher = snappier/jittery

  // States
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing AR Engine...');
  const [cameraError, setCameraError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [noFaceTimer, setNoFaceTimer] = useState(0);

  // Loaded Images Refs
  const frontImgRef = useRef(null);
  const angleImgRef = useRef(null);
  const imagesLoaded = useRef(false);

  // Keep track of face presence to trigger "align face" notification
  const lastFaceTime = useRef(Date.now());

  // 1. Request Camera Access and Setup Stream
  useEffect(() => {
    const startCamera = async () => {
      setLoadingStatus('Accessing camera stream...');
      const isMobile = window.innerWidth <= 768;

      // Safe to request higher quality now — the render loop does its own
      // software cover-crop sized to the screen, so whatever resolution the
      // camera actually returns gets cropped correctly regardless. These are
      // just `ideal` hints (soft preferences), not `exact`, so devices that
      // can't hit them simply return their closest native mode instead of
      // erroring or force-cropping.
      const constraintAttempts = isMobile
        ? [
            { video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
            { video: { facingMode: 'user' }, audio: false }
          ]
        : [
            {
              video: {
                facingMode: 'user',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
              },
              audio: false
            },
            { video: { facingMode: 'user' }, audio: false }
          ];

      let stream = null;
      let lastErr = null;
      for (const constraints of constraintAttempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!stream) {
        console.error('Camera access error:', lastErr);
        setCameraError(
          'Camera access is required for Virtual Try-On. Please check your browser permissions and ensure no other application is using your webcam.'
        );
        setLoading(false);
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    startCamera();

    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Re-fit on orientation change / window resize (mobile browsers fire
  // 'resize' on rotation; some also need 'orientationchange' as a fallback)
  useEffect(() => {
    const handleResize = () => {
      // Canvas internal resolution is already re-synced every frame in the
      // render loop from video.videoWidth/videoHeight, so we don't need to
      // restart the camera stream here — this just forces a layout repaint
      // so object-cover recalculates against the new viewport immediately
      // instead of waiting for the next paint tick.
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
        // eslint-disable-next-line no-unused-expressions
        canvasRef.current.offsetHeight;
        canvasRef.current.style.display = '';
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // 2. Pre-load transparent PNG assets
  useEffect(() => {
    imagesLoaded.current = false;
    let frontOk = false;
    let angleOk = false;

    const maybeUnblock = () => {
      // Front PNG is mandatory. Angle PNG is optional — if it fails, we
      // silently reuse the front image instead of blocking the whole feature.
      if (frontOk) {
        imagesLoaded.current = true;
      }
    };

    const frontImg = new Image();
    frontImg.crossOrigin = 'anonymous';
    frontImg.onload = () => {
      frontOk = true;
      console.log('[TryOn Debug] Front PNG loaded OK:', frontPng, frontImg.width, 'x', frontImg.height);
      maybeUnblock();
    };
    frontImg.onerror = () => {
      console.error('Failed to load front try-on PNG:', frontPng);
      frontOk = false;
      imagesLoaded.current = false;
      setCameraError('Could not load the glasses image for try-on. Please try again in a moment.');
      toast.error('Try-On assets failed to load.');
    };
    frontImg.src = frontPng;
    frontImgRef.current = frontImg;

    const angleImg = new Image();
    angleImg.crossOrigin = 'anonymous';
    angleImg.onload = () => { angleOk = true; maybeUnblock(); };
    angleImg.onerror = () => {
      console.error('Failed to load angle try-on PNG, falling back to front PNG:', anglePng);
      // Fall back to the already-loading front image so the 3/4 angle
      // blend simply reuses the front shot instead of breaking try-on.
      angleImgRef.current = frontImgRef.current;
      angleOk = true;
      maybeUnblock();
    };
    angleImg.src = anglePng || frontPng;
    if (anglePng) {
      angleImgRef.current = angleImg;
    } else {
      angleOk = true;
    }
  }, [frontPng, anglePng]);

  // 3. Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    const initFaceTracking = async () => {
      setLoadingStatus('Loading AI Face Tracker...');
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          numFaces: 1
        });

        landmarkerRef.current = landmarker;
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize MediaPipe FaceLandmarker:', err);
        // Fallback to load model from unpkg if storage.googleapis fails
        try {
          setLoadingStatus('Retrying AI model load...');
          const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
          );
          const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/metadata/face_landmarker.task',
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: true,
            numFaces: 1
          });
          landmarkerRef.current = landmarker;
          setLoading(false);
        } catch (retryErr) {
          console.error('All FaceLandmarker attempts failed:', retryErr);
          setCameraError('Could not load the face tracking AI. Please check your network connection.');
          setLoading(false);
        }
      }
    };

    if (!cameraError) {
      initFaceTracking();
    }
  }, [cameraError]);

  // 4. Animation Frame Tracking Loop
  useEffect(() => {
    if (loading || cameraError) return;

    const smooth = (key, newValue) => {
      if (smoothed.current[key] === null) {
        smoothed.current[key] = newValue; // first frame, no history yet
      } else {
        smoothed.current[key] = smoothed.current[key] + SMOOTHING * (newValue - smoothed.current[key]);
      }
      return smoothed.current[key];
    };

    // Helper to draw a temple arm stretched between its hinge and the ear landmark
    const drawTempleBetweenAnchors = (ctx, frontImg, sx, sy, sWidth, sHeight, hingeX, hingeY, earX, earY, targetHeight, flipX = false) => {
      const dx = earX - hingeX;
      const dy = earY - hingeY;
      const distance = Math.hypot(dx, dy);      // exact pixel length the temple must span this frame
      const angle = Math.atan2(dy, dx);          // exact angle to rotate the temple slice

      ctx.save();
      ctx.translate(hingeX, hingeY);
      ctx.rotate(angle);
      
      if (flipX) {
        ctx.translate(distance, 0);
        ctx.scale(-1, 1);
      }
      
      // Scale and stretch the temple slice so its width matches `distance`
      // and its height matches `targetHeight` (proportionate to the center piece)
      ctx.drawImage(
        frontImg,
        sx, sy, sWidth, sHeight, // source crop
        0, -targetHeight / 2,     // draw from hinge point outward
        distance, targetHeight    // stretch width to distance, match targetHeight
      );
      ctx.restore();
    };

    const renderLoop = () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        landmarkerRef.current &&
        videoRef.current.readyState >= 3 // HAVE_FUTURE_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const landmarker = landmarkerRef.current;

        // Use the canvas's own direct parent for sizing — NOT containerRef,
        // which points to the outer full-viewport backdrop div. On desktop
        // the canvas is actually displayed inside a smaller centered
        // md:aspect-video card, not the full viewport; measuring the wrong
        // element caused the canvas buffer to be sized for the full
        // viewport while it was visually constrained to the smaller card,
        // producing an oversized/cropped result on desktop.
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const displayW = container ? Math.round(container.clientWidth * dpr) : video.videoWidth;
        const displayH = container ? Math.round(container.clientHeight * dpr) : video.videoHeight;

        if (canvas.width !== displayW || canvas.height !== displayH) {
          canvas.width = displayW;
          canvas.height = displayH;
        }

        // Clear canvas for this frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply a single global mirror transform for the entire frame
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        // Software "cover" crop: figure out the largest centered region of
        // the raw video frame whose aspect ratio matches the screen, so we
        // only ever crop as much as the actual screen shape requires —
        // never more, regardless of the camera's native resolution/aspect.
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const vAspect = vw / vh;
        const cAspect = canvas.width / canvas.height;

        let sx, sy, sWidth, sHeight;
        if (vAspect > cAspect) {
          // Video is proportionally wider than the screen — crop left/right
          sHeight = vh;
          sWidth = vh * cAspect;
          sx = (vw - sWidth) / 2;
          sy = 0;
        } else {
          // Video is proportionally taller than the screen — crop top/bottom
          sWidth = vw;
          sHeight = vw / cAspect;
          sx = 0;
          sy = (vh - sHeight) / 2;
        }

        // 1. Draw the mirrored, cover-cropped video frame onto the canvas
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        // Run face detection on the current video frame
        const nowInMs = performance.now();
        const results = landmarker.detectForVideo(video, nowInMs);

        let shouldDraw = false;

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          setFaceDetected(true);
          lastFaceTime.current = Date.now();

          const landmarks = results.faceLandmarks[0];
          
          // Get facial transformation matrix for 3D pose extraction
          let yawDeg = 0;
          let pitchDeg = 0;
          let rollDeg = 0;

          if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
            const matrix = results.facialTransformationMatrixes[0].data;
            const pitch = Math.atan2(-matrix[6], matrix[10]);
            const yaw = Math.atan2(matrix[2], Math.sqrt(matrix[6] * matrix[6] + matrix[10] * matrix[10]));
            const roll = Math.atan2(-matrix[1], matrix[0]);

            yawDeg = yaw * (180 / Math.PI);
            pitchDeg = pitch * (180 / Math.PI);
            rollDeg = roll * (180 / Math.PI);
          } else {
            // Fallback Euler angle calculation from landmark geometry if matrix is missing
            const leftOuter = landmarks[33];
            const rightOuter = landmarks[263];
            const noseBridge = landmarks[168];
            
            const dx = rightOuter.x - leftOuter.x;
            const dy = rightOuter.y - leftOuter.y;
            rollDeg = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Yaw approximation based on nose shift relative to eye centers
            const leftDist = noseBridge.x - leftOuter.x;
            const rightDist = rightOuter.x - noseBridge.x;
            yawDeg = ((leftDist - rightDist) / (leftDist + rightDist)) * 60;
          }

          // Landmark 234 = left face/temple contour point, 454 = right face/temple contour point
          // We use raw (unflipped) coordinates; they map correctly because the context is mirrored.
          const leftAnchor = landmarks[234];
          const rightAnchor = landmarks[454];

          // Convert normalized coords (0..1 against the RAW video frame)
          // into canvas pixel coords — must account for the cover-crop
          // above (sx, sy, sWidth, sHeight), since the canvas no longer
          // shows the full raw video 1:1 like it used to.
          const mapX = (normX) => ((normX * vw) - sx) * (canvas.width / sWidth);
          const mapY = (normY) => ((normY * vh) - sy) * (canvas.height / sHeight);

          const x1 = mapX(leftAnchor.x);
          const y1 = mapY(leftAnchor.y);
          const x2 = mapX(rightAnchor.x);
          const y2 = mapY(rightAnchor.y);

          // Vertical position of the nose bridge (Landmark 168)
          const noseY = mapY(landmarks[168].y);

          // Apply EMA smoothing to every raw tracked value
          smooth('x1', x1);
          smooth('y1', y1);
          smooth('x2', x2);
          smooth('y2', y2);
          smooth('noseY', noseY);
          smooth('yaw', yawDeg);
          smooth('pitch', pitchDeg);

          shouldDraw = true;
        } else {
          setFaceDetected(false);
          const timeSinceLastFace = Date.now() - lastFaceTime.current;
          
          if (timeSinceLastFace > 2000) {
            setNoFaceTimer(Math.floor(timeSinceLastFace / 1000));
          }

          // If face is temporarily lost (less than 500ms), bridge the gap using last known smoothed values
          if (timeSinceLastFace < 500 && smoothed.current.x1 !== null) {
            shouldDraw = true;
          } else if (timeSinceLastFace >= 500) {
            // Reset smoothed values when face is lost for a sustained period (>500ms)
            smoothed.current = { x1: null, y1: null, x2: null, y2: null, noseY: null, yaw: null, pitch: null };
          }
        }

        // --- Temporary diagnostic logging (remove once glasses render confirmed) ---
        if (!renderLoop._lastDebugLog || Date.now() - renderLoop._lastDebugLog > 1000) {
          renderLoop._lastDebugLog = Date.now();
          console.log('[TryOn Debug]', {
            shouldDraw,
            imagesLoaded: imagesLoaded.current,
            hasFrontImg: !!frontImgRef.current,
            smoothedX1: smoothed.current.x1,
            faceDetectedThisFrame: !!(results && results.faceLandmarks && results.faceLandmarks.length > 0)
          });
        }
        // ---------------------------------------------------------------------------

        // Draw overlaid assets using smoothed values if images are fully loaded
        if (shouldDraw && imagesLoaded.current && frontImgRef.current && smoothed.current.x1 !== null) {
          const earLx = smoothed.current.x1;
          const earLy = smoothed.current.y1;
          const earRx = smoothed.current.x2;
          const earRy = smoothed.current.y2;
          const smoothedNoseY = smoothed.current.noseY;
          const smoothedYaw = smoothed.current.yaw;
          const smoothedPitch = smoothed.current.pitch;

          // Derived smoothed coordinates
          const smoothedWidth = Math.hypot(earRx - earLx, earRy - earLy);
          const smoothedTilt = Math.atan2(earRy - earLy, earRx - earLx);
          const midX = (earLx + earRx) / 2;
          const midY = (earLy + earRy) / 2;

          // Center coordinates (averaging midpoint Y with nose bridge Y for vertical stability)
          const cx = midX;
          const cy = (midY + smoothedNoseY) / 2;

          // GLASSES_FIT_RATIO: tuning constant. Real glasses usually extend slightly past the temple contour points.
          // We multiply by (frameWidthMm / 138) to respect the frame width slider customization.
          // Tuned to 1.22 to compensate for transparent asset padding and provide an organic, premium fit.
          const GLASSES_FIT_RATIO = 1.22;
          const targetWidthPx = smoothedWidth * GLASSES_FIT_RATIO * (frameWidthMm / 138);
          
          const frontImg = frontImgRef.current;
          const angleImg = angleImgRef.current;

          const W = frontImg.width;
          const H = frontImg.height;

          // Scale factor relative to the original front image width
          const S = targetWidthPx / W;

          // Calculate vertical scale from pitch (foreshortens as user tilts head)
          const verticalScale = Math.cos(smoothedPitch * (Math.PI / 180));

          // Set high-quality canvas anti-aliasing / smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 2. Draw Soft Blurred Drop Shadow Ellipse
          ctx.save();
          ctx.translate(cx, cy + 10 * S);
          ctx.rotate(smoothedTilt);
          ctx.beginPath();
          // Shadow slightly smaller than the frame, soft transparency
          ctx.ellipse(0, 0, targetWidthPx * 0.44, 7 * S, 0, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.filter = 'blur(6px)';
          ctx.fill();
          ctx.restore();

          // 3. Calculate cross-fade blend opacity for 3/4 angle PNG
          let angleOpacity = 0;
          const absYaw = Math.abs(smoothedYaw);
          if (absYaw > 15) {
            angleOpacity = Math.min(1, (absYaw - 15) / 15);
          }

          // 4. Draw Front Shot as a single, beautiful, unified frame (no slicing distortion)
          if (angleOpacity < 1) {
            ctx.save();
            if (angleOpacity > 0) {
              ctx.globalAlpha = 1 - angleOpacity;
            }
            ctx.translate(cx, cy);
            ctx.rotate(smoothedTilt);

            const targetHeight = H * S * verticalScale;

            ctx.drawImage(
              frontImg,
              -targetWidthPx / 2, -targetHeight / 2,
              targetWidthPx, targetHeight
            );
            ctx.restore();
          }

          // 5. Draw Mirrored 3/4 Angled PNG
          if (angleOpacity > 0 && angleImg) {
            ctx.save();
            ctx.globalAlpha = angleOpacity;
            ctx.translate(cx, cy);
            ctx.rotate(smoothedTilt);

            // If yaw is negative (turning left), mirror the 3/4 angle shot horizontally
            if (smoothedYaw < 0) {
              ctx.scale(-1, 1);
            }

            const angleW = angleImg.width || W;
            const angleH = angleImg.height || H;
            const aspect = angleW / angleH;
            
            const renderW = targetWidthPx;
            const renderH = (renderW / aspect) * verticalScale;

            ctx.drawImage(
              angleImg,
              -renderW / 2, -renderH / 2,
              renderW, renderH
            );
            ctx.restore();
          }
        }

        // Restore global mirror context at the end of the frame
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [loading, cameraError]);

  // 5. Capture Photo and Snapshot Compositing
  const handleCapture = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initiate browser download directly from the main canvas
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `eyeleads_tryon_${productName.replace(/\s+/g, '_').toLowerCase()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('AR Snapshot saved successfully!');
    } catch (err) {
      console.error('Snapshot capture failed:', err);
      toast.error('Failed to capture snapshot. Please try again.');
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none animate-fadeIn"
    >
      {/* Upper Navigation Bar */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-center z-30">
        <div className="text-left select-none">
          <span className="text-[#B8952A] text-[8.5px] font-black uppercase tracking-[0.25em] block">EyeLeads Optics</span>
          <h2 className="text-white text-sm sm:text-base font-light tracking-tight mt-0.5">{productName} · 3D Try-On</h2>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/10 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="Exit Virtual Try-On"
        >
          <X className="h-5 w-5 stroke-[2]" />
        </button>
      </div>

      {/* Main Viewport Container — full screen on mobile, card on md+ */}
      <div className="relative w-full h-full md:h-auto md:max-w-3xl md:mx-auto md:aspect-video md:rounded-3xl md:border md:border-white/10 overflow-hidden bg-slate-900 md:shadow-2xl flex items-center justify-center flex-1">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/90 text-slate-400 p-6">
            <RefreshCw className="h-8 w-8 animate-spin text-[#B8952A]" />
            <p className="text-[10px] font-black uppercase tracking-wider text-[#B8952A]">{loadingStatus}</p>
          </div>
        )}

        {/* Camera Permission Denied Error Card */}
        {cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 text-slate-300 gap-6">
            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-sm">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-white text-lg font-light tracking-tight">Camera Stream Offline</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{cameraError}</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#B8952A] hover:bg-amber-600 text-white font-extrabold text-xxs uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Mirror Video Element (Invisible to user, active for tracking) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        />

        {/* Composited AR Overlay Canvas — buffer already matches container
            exactly via JS cover-crop above, so no CSS object-fit needed */}
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ background: '#0f172a' }}
        />

        {/* Alignment Helper Target Oval */}
        {!loading && !cameraError && !faceDetected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-[200px] h-[280px] sm:w-[240px] sm:h-[320px] rounded-full border-2 border-dashed border-[#B8952A]/50 bg-black/5 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_80px_rgba(0,0,0,0.4)] animate-pulse">
              <span className="text-[#B8952A] text-[9px] font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full border border-[#B8952A]/20">
                Align Face Here
              </span>
            </div>
          </div>
        )}

        {/* Align Face Hint Pill */}
        {!loading && !cameraError && !faceDetected && noFaceTimer > 2 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider shadow-md animate-bounce z-20">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Please move into the camera frame</span>
          </div>
        )}

        {/* Bottom controls overlay — mobile only (pinned inside camera area) */}
        {!cameraError && (
          <div className="absolute bottom-0 inset-x-0 md:hidden z-30 flex flex-col items-center gap-3 pb-6 pt-8 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center gap-6 justify-center">
              <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-extrabold uppercase tracking-wider">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Camera Mirrored</span>
              </div>
              <div className="h-3 w-px bg-slate-600" />
              <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>GPU Accelerated</span>
              </div>
            </div>
            <button
              onClick={handleCapture}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-white hover:bg-[#B8952A] border-4 border-slate-950 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(184,149,42,0.45)] text-slate-950 hover:text-white transition-all transform active:scale-90 duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Capture Try-On Photo"
            >
              <Camera className="h-7 w-7 group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">Tap to take a picture</span>
          </div>
        )}
      </div>

      {/* Lower Control Bar — tablet/desktop only (below the camera card) */}
      {!cameraError && (
        <div className="hidden md:flex w-full max-w-md mt-6 flex-col items-center gap-4 z-30">
          <div className="flex items-center gap-6 justify-center">
            {/* Mirror Indicator */}
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Camera Mirrored</span>
            </div>

            <div className="h-3 w-px bg-slate-800"></div>

            {/* Performance status */}
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>GPU Accelerated</span>
            </div>
          </div>

          {/* Large Gold Capture Button */}
          <button
            onClick={handleCapture}
            disabled={loading}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white hover:bg-[#B8952A] border-4 border-slate-950 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(184,149,42,0.45)] text-slate-950 hover:text-white transition-all transform active:scale-90 duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Capture Try-On Photo"
          >
            <Camera className="h-7 w-7 sm:h-9 sm:w-9 group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Tap to take a picture</span>
        </div>
      )}
    </div>,
    document.body
  );
};

export default VirtualTryOn;
