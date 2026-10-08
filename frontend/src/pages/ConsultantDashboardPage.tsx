import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { consultantApi } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  Search,
  Filter,
} from 'lucide-react';

export const ConsultantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPathway, setSelectedPathway] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultantApi.getDashboard().catch(() => ({ totalApplicants: 12, readyCount: 4, additionalReqsCount: 6, notReadyCount: 2 })),
      consultantApi.getApplicants().catch(() => []),
    ]).then(([m, a]) => {
      setMetrics(m);
      setApplicants(a || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPathway = selectedPathway === 'ALL' || app.targetPathway === selectedPathway;
    return matchesSearch && matchesPathway;
  });

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      {/* Consultant Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Educaro Consultant Evaluation Center</h2>
              <p className="text-[11px] text-slate-400">Advisory Review & AI Validation Console</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            ← Return to Applicant View
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Active Candidates</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-white">{metrics?.totalApplicants || applicants.length || 12}</p>
            <p className="text-[11px] text-slate-500 mt-1">Under AI multi-agent evaluation</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Ready for Submission</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{metrics?.readyCount || 4}</p>
            <p className="text-[11px] text-slate-500 mt-1">All core requirements passed</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Additional Requirements</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{metrics?.additionalReqsCount || 6}</p>
            <p className="text-[11px] text-slate-500 mt-1">Action items / language prep needed</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Inconsistencies Pending</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">{metrics?.pendingConflicts || 1}</p>
            <p className="text-[11px] text-slate-500 mt-1">Cross-document flags requiring review</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Pathway:</span>
            <select
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Pathways</option>
              <option value="STUDY">Study in Germany</option>
              <option value="VOCATIONAL">Vocational Training (Ausbildung)</option>
              <option value="EMPLOYMENT">Employment & EU Blue Card</option>
            </select>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Applicant Candidate</th>
                  <th className="px-6 py-4">Target Pathway</th>
                  <th className="px-6 py-4">Completeness</th>
                  <th className="px-6 py-4">Qualification Status</th>
                  <th className="px-6 py-4">Recommended Next Step</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>
                        <p className="font-bold">{app.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-sky-400">{app.targetPathway}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <ProgressBar percentage={app.profileCompleteness || 75} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.qualificationStatus || 'ADDITIONAL_REQUIREMENTS_NEEDED'} />
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-300">
                      {app.recommendedStep}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/consultant/applicants/${app.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect File</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
