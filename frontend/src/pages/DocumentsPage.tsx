import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { documentApi, clarificationApi } from '../services/api.js';
import { DocumentRecord, DocumentConflict, DocumentType } from '../types/index.js';
import { JourneyStepsBar } from '../components/journey/JourneyStepsBar.js';
import { TrustBadge } from '../components/common/TrustBadge.js';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { applicantId } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [conflicts, setConflicts] = useState<DocumentConflict[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('DEGREE');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionValue, setResolutionValue] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    if (!applicantId) return;
    try {
      const data = await documentApi.getDocuments(applicantId);
      setDocuments(data.documents || []);
      setConflicts(data.conflicts || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [applicantId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !applicantId) return;

    setIsUploading(true);

    try {
      await documentApi.uploadDocument(applicantId, uploadFile, selectedDocType);
      setUploadFile(null);
      await fetchDocs();
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, value: string) => {
    setResolvingId(conflictId);
    try {
      await documentApi.resolveConflict(conflictId, value, 'Applicant Confirmed');
      await fetchDocs();
    } catch (err) {
      console.error('Error resolving conflict:', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <JourneyStepsBar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Intelligence & Consistency Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload your official academic, employment, and language certificates. The AI OCR agent extracts credentials,
            assigns confidence ratings, and flags discrepancies across documents for applicant resolution.
          </p>
        </div>

        {/* Conflict Resolution Banner if conflicts detected */}
        {conflicts.filter((c) => c.status === 'OPEN').length > 0 && (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                Potential Inconsistencies Detected Across Documents
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official German immigration authorities strictly require concordant credentials. Please select the correct factual value below:
            </p>

            <div className="space-y-3">
              {conflicts
                .filter((c) => c.status === 'OPEN')
                .map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-3"
                  >
                    <p className="text-xs font-semibold text-slate-200">
                      Discrepancy for: <span className="text-amber-400 uppercase font-bold">{conflict.fieldName}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Source A ({conflict.sourceA}):</span>
                        <span className="font-semibold text-white">{conflict.valueA}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Source B ({conflict.sourceB}):</span>
                        <span className="font-semibold text-white">{conflict.valueB}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs text-slate-400">Confirm correct value:</span>
                      <button
                        onClick={() => handleResolveConflict(conflict.id, conflict.valueA)}
                        disabled={resolvingId === conflict.id}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-semibold text-sky-300"
                      >
                        Keep "{conflict.valueA}"
                      </button>
                      <button
                        onClick={() => handleResolveConflict(conflict.id, conflict.valueB)}
                        disabled={resolvingId === conflict.id}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-semibold text-sky-300"
                      >
                        Keep "{conflict.valueB}"
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>Upload Document</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Document Classification
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="DEGREE">Degree Certificate / Transcript</option>
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="EXPERIENCE_LETTER">Experience / Internship Letter</option>
                  <option value="LANGUAGE_CERTIFICATE">Language Certificate (Goethe/IELTS)</option>
                  <option value="CERTIFICATE">Financial / Other Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select File (PDF, DOCX, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-slate-700/80 hover:border-sky-400/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/50">
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="docFileInput"
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-300">
                      {uploadFile ? uploadFile.name : 'Click to browse files'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">PDF, DOCX, JPG, PNG up to 25MB</p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running AI OCR Extraction...</span>
                  </>
                ) : (
                  <span>Upload & Analyze Document</span>
                )}
              </button>
            </form>
          </div>

          {/* Documents & Extractions List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Processed Documents & Extractions</span>
            </h3>

            {documents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No documents uploaded yet. Upload your CV or Degree transcript above to initiate OCR processing.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{doc.originalName}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {doc.status}
                      </span>
                    </div>
                  </div>

                  {/* Extractions Preview */}
                  {doc.extractions && doc.extractions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Extracted Entities & Provenance:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {doc.extractions.map((ext) => (
                          <div
                            key={ext.id}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 uppercase text-[10px] font-bold">
                                {ext.fieldKey}
                              </span>
                              <TrustBadge source={ext.source} confidence={ext.confidence} />
                            </div>
                            <p className="font-semibold text-slate-100">{ext.fieldValue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Extraction in progress or completed.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
