import React, { useState } from 'react';
import {
  FileText,
  Scan,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Building,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import { ApplicantProfile, Document } from '../types/index';
import { api } from '../services/api';
import { ProvenanceBadge } from './ProvenanceBadge';

interface DocumentOcrModalProps {
  applicant: ApplicantProfile;
  isOpen: boolean;
  onClose: () => void;
  onOcrCompleted: () => void;
}

export const DocumentOcrModal: React.FC<DocumentOcrModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onOcrCompleted,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  if (!isOpen) return null;

  const docs = applicant.documents || [];

  const handleRunOcr = async (docId: string) => {
    setSelectedDocId(docId);
    setIsScanning(true);
    setOcrResult(null);

    try {
      const res = await api.simulateOcr(applicant.id, docId);
      setOcrResult(res);
      onOcrCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUploadSample = async (type: string, title: string) => {
    try {
      const newDoc = await api.uploadDocument(applicant.id, {
        title,
        docType: type,
        fileName: `${type.toLowerCase()}_sample.pdf`,
      });
      // Auto run OCR
      handleRunOcr(newDoc.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AeroOCR-v2 Document Verification Engine
              </h3>
              <p className="text-xs text-slate-400">
                Indian Credential Extraction & KMK Anabin H+ Database Verification
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick upload sample document buttons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick Test: Select or Upload Indian Document
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() =>
                  handleUploadSample(
                    'DEGREE_CERTIFICATE',
                    'Indian University Degree & Grade Transcripts',
                  )
                }
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition space-y-1 group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                  <span>🎓 Degree / 10+2</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400">Anabin H+ validation & Bavarian GPA</p>
              </button>

              <button
                onClick={() =>
                  handleUploadSample('LANGUAGE_CERTIFICATE', 'Goethe-Zertifikat A2/B1 Scorecard')
                }
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition space-y-1 group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                  <span>📜 Goethe / telc</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400">CEFR modules & registration seal</p>
              </button>

              <button
                onClick={() =>
                  handleUploadSample('APS_CERTIFICATE', 'APS India Certificate (New Delhi Embassy)')
                }
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition space-y-1 group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                  <span>🏛️ APS Certificate</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400">German Embassy verification</p>
              </button>
            </div>
          </div>

          {/* Current Documents list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Applicant Documents ({docs.length})
            </h4>

            <div className="space-y-2.5">
              {docs.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{doc.docType}</span>
                        <span>•</span>
                        <ProvenanceBadge
                          provenance={doc.verificationState === 'VERIFIED' ? 'VERIFIED' : 'APPLICANT_PROVIDED'}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunOcr(doc.id)}
                    disabled={isScanning}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Run OCR Audit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-blue-500/30 text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              <Sparkles className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-200">
                AeroOCR-v2 scanning academic credentials against KMK Anabin database...
              </p>
            </div>
          )}

          {/* OCR Result View */}
          {ocrResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Verification Complete ({Math.round(ocrResult.confidenceScore * 100)}% Confidence)
                  </span>
                </div>
                <ProvenanceBadge provenance="VERIFIED" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                <div className="text-emerald-400 font-bold font-sans">
                  ✓ {ocrResult.verificationNotes}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  {Object.entries(ocrResult.extractedData).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="text-slate-500">{k}:</span>
                      <span className="text-slate-200">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {ocrResult.autoSyncedEntity && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">
                    Profile Auto-Synced: {ocrResult.autoSyncedEntity.entityType} status updated from{' '}
                    <span className="text-blue-400">
                      [{ocrResult.autoSyncedEntity.previousProvenance}]
                    </span>{' '}
                    to <span className="text-emerald-400">[VERIFIED]</span>.
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
