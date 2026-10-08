import React from 'react';
import { Compass, Shield, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#070b16] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <span className="text-sm font-bold text-white tracking-tight">EduPath AI</span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20">
                by Educaro
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Your intelligent, agentic pathway to higher education, vocational training (Ausbildung), and high-skilled employment in Germany.
            </p>
          </div>

          {/* Pathways */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              Germany Pathways
            </h4>
            <ul className="space-y-2">
              <li><span className="hover:text-sky-400 cursor-pointer">Study in Germany (Master / Bachelor)</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">Dual Vocational Training (Ausbildung)</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">Employment & EU Blue Card (FEG)</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">APS Verification Support</span></li>
            </ul>
          </div>

          {/* AI Architecture */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              AI Journey Agents
            </h4>
            <ul className="space-y-2">
              <li><span className="hover:text-sky-400 cursor-pointer">Intake & Profile Agent</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">Document Intelligence & OCR</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">Live German Web Research</span></li>
              <li><span className="hover:text-sky-400 cursor-pointer">Cross-Document Conflict Detector</span></li>
            </ul>
          </div>

          {/* Trust & Compliance */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
              Trust & Standards
            </h4>
            <p className="text-slate-400 mb-3 text-xs">
              Evaluations are grounded in official guidelines from DAAD, KMK Anabin, Make-it-in-Germany, and the German Skilled Immigration Act.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <Shield className="w-4 h-4" />
              <span>Educaro Preliminary Qualification Standard</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
          <p>© 2026 Educaro — EduPath AI Applicant Journey. Hackathon Edition.</p>
          <div className="flex items-center gap-1">
            <span>Engineering European Mobility with Agentic AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
