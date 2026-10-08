import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  Square,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { ApplicantProfile } from '../types/index';
import { api } from '../services/api';

interface VideoRecorderProps {
  applicant: ApplicantProfile;
  isOpen: boolean;
  onClose: () => void;
  onVideoProcessed: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  applicant,
  isOpen,
  onClose,
  onVideoProcessed,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [useSimulatedCam, setUseSimulatedCam] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setProcessingResult(null);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      const simulatedTranscript =
        applicant.goalTrack === 'Ausbildung'
          ? `Guten Tag! Mein Name ist ${applicant.fullName} aus ${applicant.city || 'Kerala'}, Indien. Ich habe mein Diplom im Gesundheitswesen abgeschlossen und besitze Deutsch-B1-Kenntnisse. Mein Ziel ist es, mit Educaro eine qualifizierte Pflegeausbildung in Deutschland zu absolvieren und langfristig die staatliche Anerkennung zu erhalten.`
          : applicant.goalTrack === 'Employment'
          ? `Hello, I am ${applicant.fullName} from ${applicant.city || 'India'}. I have extensive engineering and technical experience. I am applying for the German Opportunity Card (Chancenkarte) to join Germany's advanced automotive and tech sector.`
          : `Hallo! I am ${applicant.fullName} from ${applicant.city || 'Pune'}, India. I completed my Bachelor degree with high distinction. I am passionate about pursuing a Master of Science in Germany. I am actively preparing for my B1 German examination and look forward to the Educaro APS and university placement accelerator.`;

      const result = await api.processVideoTranscript(applicant.id, {
        transcript: simulatedTranscript,
        durationSeconds: recordSeconds || 32,
        primaryReason: `Advance career in Germany via ${applicant.goalTrack} pathway.`,
      });

      setProcessingResult(result);
      onVideoProcessed();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AeroPath Video Self-Introduction
              </h3>
              <p className="text-xs text-slate-400">
                AI Speech-to-Text Transcription & Fluency Assessment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Video Preview Viewport */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Visualizer backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950/40 opacity-80" />

            {/* Simulated Applicant Presenter Avatar / Camera */}
            <div className="relative z-10 flex flex-col items-center gap-3 text-center p-6">
              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  isRecording
                    ? 'border-red-500 animate-pulse bg-red-500/20'
                    : 'border-blue-500/50 bg-blue-500/10'
                }`}
              >
                <Camera className={`w-8 h-8 ${isRecording ? 'text-red-400' : 'text-blue-400'}`} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-200">{applicant.fullName}</h4>
                <p className="text-xs text-slate-400">
                  {applicant.goalTrack} Track Pitch • {applicant.city}, India
                </p>
              </div>

              {/* Live Waveform Indicator */}
              {isRecording && (
                <div className="flex items-center gap-1.5 pt-2">
                  {[40, 75, 90, 60, 85, 45, 95, 70, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400 rounded-full animate-bounce"
                      style={{
                        height: `${h / 2}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recording badge */}
            {isRecording && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>REC 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={isProcessing}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Start Video Pitch</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 shadow-lg transition"
              >
                <Square className="w-4 h-4 text-red-400 fill-red-400" />
                <span>Stop & Parse Transcript</span>
              </button>
            )}
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                AeroPath AI transcribing speech, assessing German motivation, and synchronizing profile...
              </p>
            </div>
          )}

          {/* Result Inspection */}
          {processingResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Transcript Analyzed</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {Math.round(processingResult.sentimentScore * 100)}% Positive Sentiment
                </span>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                "{processingResult.transcript}"
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {processingResult.extractedKeywords?.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-semibold border border-blue-500/20"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
