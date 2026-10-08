import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { videoApi } from '../services/api.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import {
  Video,
  Camera,
  Square,
  UploadCloud,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const VideoPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [videoData, setVideoData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [manualTranscript, setManualTranscript] = useState(
    'Hello, my name is applicant candidate. I graduated with a degree in Engineering from India. I am passionately driven to pursue my future in Germany because of its world-leading technological standards, renowned research universities, and welcoming Skilled Immigration Act. My career goal is to become a technical specialist in Germany and contribute actively to German industry.',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (applicantId) {
      videoApi.getVideoDetails(applicantId).then((res) => {
        if (res) setVideoData(res);
      }).catch(console.error);
    }
  }, [applicantId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Webcam access not granted or unavailable, falling back to simulated file upload:', err);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleSubmitVideo = async () => {
    if (!applicantId) return;
    setIsProcessing(true);
    setSuccessMsg(null);

    try {
      const res = await videoApi.uploadVideo(
        applicantId,
        recordedBlob ? (recordedBlob as any) : undefined,
        manualTranscript,
      );
      setVideoData(res);
      setSuccessMsg('Video analyzed successfully! Insights extracted by Video Insight Agent.');
    } catch (err) {
      console.error('Error submitting video:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const latestInsight = videoData?.insights?.[0] || videoData?.insights;
  const latestTranscript = videoData?.transcripts?.[0]?.transcriptText || videoData?.transcript;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Introduction Video Studio & Insight Agent
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Record a short 1-minute video introducing yourself, your academic background, why you want to move to Germany,
            and your career goals. The Video Insight Agent transcribes and extracts your core motivations.
          </p>
        </div>

        {/* Video Prompt Card */}
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 flex items-start gap-3">
          <Bot className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sky-300 mb-0.5">Recommended Prompt for Your Video:</h4>
            <p className="italic">
              "Introduce yourself, explain your academic background in India, why you want to move to Germany (Study / Ausbildung / Employment), and your long-term career goals."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Recorder Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>Record or Upload Intro Video</span>
            </h3>

            {/* Video Preview Box */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`}
                muted
                autoPlay
              />

              {!isRecording && (
                <div className="text-center p-6 space-y-2">
                  <Video className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">
                    {recordedBlob ? 'Video recorded and ready for AI analysis' : 'Camera inactive'}
                  </p>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>REC</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-xs border border-sky-400/40 flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {/* Manual / Speech to Text Transcript Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Speech-to-Text Transcript (Editable)</span>
                <span className="text-[10px] text-slate-500">Auto-extracted or typed</span>
              </label>
              <textarea
                rows={4}
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                className="w-full p-3.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitVideo}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isProcessing ? (
                <span>Video Insight Agent Analyzing...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for AI Insight Extraction</span>
                </>
              )}
            </button>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Right: Extracted Insights Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Video Insight Agent Results</span>
              </h3>
              <TrustBadge source="VIDEO_EXTRACTED" confidence={0.92} />
            </div>

            {latestInsight ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Extracted Motivation for Germany
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {latestInsight.extractedMotivation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Career Goals & Target Role
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {latestInsight.careerGoals}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Preferred Field
                    </span>
                    <span className="font-semibold text-sky-400">{latestInsight.preferredField}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Communication Score
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {latestInsight.communicationScore} / 10
                    </span>
                  </div>
                </div>

                {latestTranscript && (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Full Audio Transcript:</span>
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{latestTranscript}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-xs text-slate-400 space-y-2">
                <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Submit your video or speech transcript on the left to view AI-extracted motivation insights.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
