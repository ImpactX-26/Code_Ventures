import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  UserCheck,
  Map,
  Video,
  FileCheck,
  Split,
  Maximize2,
  Compass,
  GitFork,
  Download,
} from 'lucide-react';
import { ApplicantProfile, GoalTrack } from './types/index';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { ProfileDashboard } from './components/ProfileDashboard';
import { RoadmapView } from './components/RoadmapView';
import { PathwayComparator } from './components/PathwayComparator';
import { VideoRecorder } from './components/VideoRecorder';
import { DocumentOcrModal } from './components/DocumentOcrModal';
import { DossierModal } from './components/DossierModal';

export function App() {
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [currentApplicantId, setCurrentApplicantId] = useState<string>('');
  const [currentApplicant, setCurrentApplicant] = useState<ApplicantProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'roadmap' | 'comparator'>('chat');
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load applicants on initial mount
  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async (selectId?: string) => {
    try {
      setIsLoading(true);
      const list = await api.getApplicants();
      setApplicants(list);
      if (list.length > 0) {
        const idToSelect = selectId || currentApplicantId || list[0].id;
        setCurrentApplicantId(idToSelect);
        const detailed = await api.getApplicant(idToSelect);
        setCurrentApplicant(detailed);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectApplicant = async (id: string) => {
    setCurrentApplicantId(id);
    try {
      const detailed = await api.getApplicant(id);
      setCurrentApplicant(detailed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefreshApplicant = async () => {
    if (!currentApplicantId) return;
    try {
      const detailed = await api.getApplicant(currentApplicantId);
      setCurrentApplicant(detailed);
      setApplicants((prev) =>
        prev.map((a) => (a.id === detailed.id ? detailed : a)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackChange = async (track: GoalTrack) => {
    if (!currentApplicant) return;
    try {
      await api.updateApplicant(currentApplicant.id, { goalTrack: track });
      await handleRefreshApplicant();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    if (!currentApplicantId) return;
    try {
      setIsResetting(true);
      await api.resetDemoApplicant(currentApplicantId);
      await handleRefreshApplicant();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading && !currentApplicant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-pulse">
          <Compass className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">
          Loading AeroPath AI Onboarding Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        applicants={applicants}
        currentApplicant={currentApplicant}
        onSelectApplicant={handleSelectApplicant}
        onTrackChange={handleTrackChange}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onOpenDossierModal={() => setIsDossierModalOpen(true)}
        onOpenPathwayComparator={() => setActiveTab('comparator')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
        {/* Navigation Bar / Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI ReAct Counselor</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Structured Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('comparator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'comparator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-indigo-300 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Pathway "What-If"</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Roadmap & Educaro</span>
            </button>
          </div>

          {/* Quick Actions & Split View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>

            <button
              onClick={() => setIsOcrModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">OCR Inspection</span>
            </button>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Pitch Video</span>
            </button>

            {/* Split View Toggle for wide displays */}
            <button
              onClick={() => setIsSplitView((prev) => !prev)}
              title={isSplitView ? 'Switch to Focused Tab View' : 'Switch to Split Pane View'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
            >
              {isSplitView ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Single Tab</span>
                </>
              ) : (
                <>
                  <Split className="w-3.5 h-3.5 text-blue-400" />
                  <span>Split Pane</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        {currentApplicant && (
          <div className="flex-1 flex flex-col min-h-0">
            {isSplitView ? (
              /* Split-Pane View: Chat on Left, Profile/Comparator/Roadmap on Right */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[720px]">
                {/* Left Pane: Interactive Chat Counselor (5 cols) */}
                <div className="lg:col-span-5 h-[720px] flex flex-col">
                  <ChatInterface
                    applicant={currentApplicant}
                    onProfileUpdated={handleRefreshApplicant}
                    onOpenOcrModal={() => setIsOcrModalOpen(true)}
                    onOpenVideoRecorder={() => setIsVideoModalOpen(true)}
                  />
                </div>

                {/* Right Pane: Live Profile, Pathway Comparator, or Roadmap (7 cols) */}
                <div className="lg:col-span-7 h-[720px] overflow-y-auto pr-1">
                  {activeTab === 'comparator' ? (
                    <PathwayComparator
                      applicant={currentApplicant}
                      onTrackSelected={handleTrackChange}
                    />
                  ) : activeTab === 'roadmap' ? (
                    <RoadmapView
                      applicant={currentApplicant}
                      onRefreshRecommendation={handleRefreshApplicant}
                      onOpenOcrModal={() => setIsOcrModalOpen(true)}
                    />
                  ) : (
                    <ProfileDashboard
                      applicant={currentApplicant}
                      onOpenOcrModal={() => setIsOcrModalOpen(true)}
                      onOpenVideoRecorder={() => setIsVideoModalOpen(true)}
                      onOpenDossierModal={() => setIsDossierModalOpen(true)}
                      onOpenPathwayComparator={() => setActiveTab('comparator')}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Single Focused Tab View */
              <div className="flex-1">
                {activeTab === 'chat' && (
                  <div className="h-[740px]">
                    <ChatInterface
                      applicant={currentApplicant}
                      onProfileUpdated={handleRefreshApplicant}
                      onOpenOcrModal={() => setIsOcrModalOpen(true)}
                      onOpenVideoRecorder={() => setIsVideoModalOpen(true)}
                    />
                  </div>
                )}

                {activeTab === 'profile' && (
                  <ProfileDashboard
                    applicant={currentApplicant}
                    onOpenOcrModal={() => setIsOcrModalOpen(true)}
                    onOpenVideoRecorder={() => setIsVideoModalOpen(true)}
                    onOpenDossierModal={() => setIsDossierModalOpen(true)}
                    onOpenPathwayComparator={() => setActiveTab('comparator')}
                  />
                )}

                {activeTab === 'comparator' && (
                  <PathwayComparator
                    applicant={currentApplicant}
                    onTrackSelected={handleTrackChange}
                  />
                )}

                {activeTab === 'roadmap' && (
                  <RoadmapView
                    applicant={currentApplicant}
                    onRefreshRecommendation={handleRefreshApplicant}
                    onOpenOcrModal={() => setIsOcrModalOpen(true)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Video Recorder Modal */}
      {currentApplicant && (
        <VideoRecorder
          applicant={currentApplicant}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onVideoProcessed={handleRefreshApplicant}
        />
      )}

      {/* Document OCR Modal */}
      {currentApplicant && (
        <DocumentOcrModal
          applicant={currentApplicant}
          isOpen={isOcrModalOpen}
          onClose={() => setIsOcrModalOpen(false)}
          onOcrCompleted={handleRefreshApplicant}
        />
      )}

      {/* One-Click Educaro Counselor Dossier Handoff Modal (Feature 3) */}
      {currentApplicant && (
        <DossierModal
          applicant={currentApplicant}
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
        />
      )}
    </div>
  );
}
export default App;
