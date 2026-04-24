import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalityInfo, targetClassData, organSystemData } from "@/data/pipelineData";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CategoryType = "modality" | "target" | "organ";

interface NavItem {
  key: string;
  label: string;
  category: CategoryType;
}

// ─── Color Map ─────────────────────────────────────────────────────────────────

const MODALITY_COLORS: Record<string, string> = {
  smallMolecule: "#06b6d4",
  mAb: "#6366f1",
  adc: "#f43f5e",
  bispecific: "#a855f7",
  geneTherapy: "#10b981",
  carT: "#f97316",
  rnaTherapeutic: "#eab308",
  peptide: "#ec4899",
  mRNAVaccine: "#3b82f6",
  fcFusion: "#14b8a6",
};

const TREND_COLORS: Record<string, string> = {
  up: "#10b981",
  down: "#f43f5e",
  stable: "#6366f1",
};

const ORGAN_COLORS: Record<string, string> = {
  brain: "#a855f7",
  eye: "#06b6d4",
  lungs: "#3b82f6",
  heart: "#f43f5e",
  liver: "#f97316",
  stomach: "#10b981",
  kidney: "#eab308",
  bone: "#ec4899",
  skin: "#f59e0b",
  blood: "#ef4444",
  immune: "#6366f1",
  pancreas: "#14b8a6",
};

// ─── SVG Mechanism Diagrams ────────────────────────────────────────────────────

function ADCDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* Antibody */}
      <g transform="translate(30,60)">
        <line x1="0" y1="-30" x2="-20" y2="-50" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-30" x2="20" y2="-50" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-30" x2="0" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-20" y2="25" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="20" y2="25" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="-20" cy="-50" r="6" fill={color} opacity="0.9" />
        <circle cx="20" cy="-50" r="6" fill={color} opacity="0.9" />
        <circle cx="-20" cy="25" r="6" fill={color} opacity="0.5" />
        <circle cx="20" cy="25" r="6" fill={color} opacity="0.5" />
      </g>
      <text x="30" y="115" textAnchor="middle" fill={color} fontSize="10" fontFamily="JetBrains Mono, monospace">Antibody</text>

      {/* Arrow */}
      <line x1="70" y1="60" x2="120" y2="60" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />
      <polygon points="120,56 130,60 120,64" fill="#475569" />

      {/* Linker */}
      <rect x="132" y="52" width="50" height="16" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <text x="157" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono, monospace">Linker</text>
      <text x="157" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Chemical</text>

      {/* Arrow */}
      <line x1="182" y1="60" x2="210" y2="60" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />
      <polygon points="210,56 220,60 210,64" fill="#475569" />

      {/* Payload */}
      <circle cx="240" cy="60" r="22" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
      <text x="240" y="57" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">TOXIC</text>
      <text x="240" y="68" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono, monospace">Payload</text>
      <text x="240" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Cytotoxin</text>

      {/* Arrow */}
      <line x1="263" y1="60" x2="295" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="295,56 305,60 295,64" fill="#475569" />

      {/* Cancer Cell */}
      <circle cx="340" cy="60" r="30" fill="#1a0a0a" stroke="#f43f5e" strokeWidth="2" />
      <circle cx="340" cy="60" r="14" fill="#2d0a0a" stroke="#f43f5e" strokeWidth="1" opacity="0.7" />
      <text x="340" y="56" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono, monospace">Cancer</text>
      <text x="340" y="67" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono, monospace">Cell</text>
      <text x="340" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Target</text>
    </svg>
  );
}

function BispecificDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 130" className="w-full" style={{ maxHeight: 130 }}>
      {/* T-Cell */}
      <circle cx="55" cy="65" r="38" fill="#0f1a2e" stroke="#6366f1" strokeWidth="2" />
      <text x="55" y="61" textAnchor="middle" fill="#6366f1" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">T-Cell</text>
      <circle cx="55" cy="65" r="16" fill="#111827" stroke="#6366f1" strokeWidth="1" opacity="0.6" />
      <text x="55" y="69" textAnchor="middle" fill="#818cf8" fontSize="8" fontFamily="JetBrains Mono, monospace">CD3</text>
      <text x="55" y="118" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Immune Cell</text>

      {/* Bispecific antibody in center — Y shape bridging */}
      <g transform="translate(200,65)">
        {/* Left arm → T-cell */}
        <line x1="-80" y1="0" x2="-30" y2="-22" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="-80" y1="0" x2="-30" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Right arm → Tumor */}
        <line x1="80" y1="0" x2="30" y2="-22" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="80" y1="0" x2="30" y2="22" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Fc stem */}
        <line x1="-30" y1="22" x2="0" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="22" x2="0" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {/* Binding dots */}
        <circle cx="-80" cy="-3" r="5" fill={color} opacity="0.9" />
        <circle cx="-80" cy="3" r="5" fill={color} opacity="0.9" />
        <circle cx="80" cy="-3" r="5" fill={color} opacity="0.9" />
        <circle cx="80" cy="3" r="5" fill={color} opacity="0.9" />
        <rect x="-14" y="42" width="28" height="14" rx="3" fill="#1e293b" stroke={color} strokeWidth="1" />
        <text x="0" y="53" textAnchor="middle" fill={color} fontSize="7" fontFamily="JetBrains Mono, monospace">Bispecific</text>
      </g>
      <text x="200" y="118" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Dual Binder</text>

      {/* Tumor Cell */}
      <circle cx="345" cy="65" r="38" fill="#1a0a0a" stroke="#f43f5e" strokeWidth="2" />
      <text x="345" y="61" textAnchor="middle" fill="#f43f5e" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Tumor</text>
      <circle cx="345" cy="65" r="16" fill="#2d0a0a" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
      <text x="345" y="69" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="JetBrains Mono, monospace">BCMA</text>
      <text x="345" y="118" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Cancer Cell</text>
    </svg>
  );
}

function CARTDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 130" className="w-full" style={{ maxHeight: 130 }}>
      {/* Step 1: Extract */}
      <rect x="5" y="30" width="75" height="70" rx="8" fill="#0f1117" stroke="#475569" strokeWidth="1.5" />
      <circle cx="42" cy="62" r="22" fill="#1e293b" stroke={color} strokeWidth="2" opacity="0.7" />
      <text x="42" y="59" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace">T-Cell</text>
      <text x="42" y="70" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace">natural</text>
      <text x="42" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">1. Extract</text>

      {/* Arrow */}
      <line x1="82" y1="65" x2="100" y2="65" stroke="#475569" strokeWidth="1.5" />
      <polygon points="100,61 110,65 100,69" fill="#475569" />

      {/* Step 2: Engineer */}
      <rect x="112" y="30" width="75" height="70" rx="8" fill="#0f1117" stroke="#475569" strokeWidth="1.5" />
      <circle cx="150" cy="62" r="22" fill="#1e293b" stroke={color} strokeWidth="2" />
      <text x="150" y="59" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">CAR</text>
      <text x="150" y="70" textAnchor="middle" fill={color} fontSize="7" fontFamily="JetBrains Mono, monospace">receptor</text>
      {/* CAR receptor spikes */}
      <line x1="150" y1="40" x2="150" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="162" y1="43" x2="168" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="138" y1="43" x2="132" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="150" cy="28" r="4" fill={color} />
      <circle cx="170" cy="33" r="4" fill={color} />
      <circle cx="130" cy="33" r="4" fill={color} />
      <text x="150" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">2. Engineer</text>

      {/* Arrow */}
      <line x1="189" y1="65" x2="207" y2="65" stroke="#475569" strokeWidth="1.5" />
      <polygon points="207,61 217,65 207,69" fill="#475569" />

      {/* Step 3: Expand */}
      <rect x="219" y="30" width="75" height="70" rx="8" fill="#0f1117" stroke="#475569" strokeWidth="1.5" />
      {[[-10,-12],[8,-14],[-14,4],[10,2],[-6,16],[12,14]].map(([dx,dy],i) => (
        <circle key={i} cx={256+dx} cy={62+dy} r="8" fill="#1e293b" stroke={color} strokeWidth="1.5" opacity={0.7+i*0.05} />
      ))}
      <text x="256" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">3. Expand</text>

      {/* Arrow */}
      <line x1="296" y1="65" x2="314" y2="65" stroke="#475569" strokeWidth="1.5" />
      <polygon points="314,61 324,65 314,69" fill="#475569" />

      {/* Step 4: Infuse */}
      <rect x="326" y="30" width="68" height="70" rx="8" fill="#0f1117" stroke={color} strokeWidth="1.5" />
      <text x="360" y="55" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Patient</text>
      {[[-8,0],[8,-8],[0,12],[-10,16]].map(([dx,dy],i) => (
        <circle key={i} cx={360+dx} cy={70+dy} r="9" fill="#1e293b" stroke={color} strokeWidth="1.5" opacity={0.8} />
      ))}
      <text x="360" y="115" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">4. Infuse</text>
    </svg>
  );
}

function GeneTherapyDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* Viral vector */}
      <g transform="translate(55,60)">
        <circle cx="0" cy="0" r="30" fill="#0f1a2e" stroke={color} strokeWidth="2" />
        {[0,60,120,180,240,300].map((angle, i) => {
          const x = Math.cos(angle * Math.PI / 180) * 34;
          const y = Math.sin(angle * Math.PI / 180) * 34;
          return <circle key={i} cx={x} cy={y} r="5" fill={color} opacity="0.8" />;
        })}
        <text x="0" y="-5" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">AAV</text>
        <text x="0" y="6" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace">vector</text>
        <path d="-8,0 0,-10 8,0" fill={color} opacity="0.4" />
      </g>
      <text x="55" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Viral Vector</text>

      {/* Arrow into cell */}
      <line x1="92" y1="60" x2="128" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="128,56 138,60 128,64" fill="#475569" />

      {/* Cell */}
      <ellipse cx="220" cy="60" r="75" ry="48" fill="#0c1118" stroke="#475569" strokeWidth="1.5" />
      {/* Nucleus */}
      <ellipse cx="220" cy="60" r="36" ry="26" fill="#111827" stroke={color} strokeWidth="2" />
      <text x="220" y="57" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Nucleus</text>
      {/* DNA helix simplified */}
      <path d="M 205,65 Q 212,58 220,65 Q 228,72 235,65" stroke={color} strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M 205,65 Q 212,72 220,65 Q 228,58 235,65" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.6" />
      <text x="220" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Cell + Nucleus</text>

      {/* Arrow out */}
      <line x1="296" y1="60" x2="328" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="328,56 338,60 328,64" fill="#475569" />

      {/* Protein output */}
      <g transform="translate(365,60)">
        <path d="M0,-28 Q18,-18 20,0 Q18,18 0,28 Q-18,18 -20,0 Q-18,-18 0,-28Z" fill="#0f1a2e" stroke={color} strokeWidth="2" />
        <text x="0" y="-4" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Working</text>
        <text x="0" y="7" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace">Protein</text>
      </g>
      <text x="365" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Gene Product</text>
    </svg>
  );
}

function RNAiDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* dsRNA */}
      <g transform="translate(50,60)">
        <path d="M-20,-30 Q0,-10 20,-30" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-20,-30 Q0,-50 20,-30" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4,3" />
        <path d="M-20,0 Q0,20 20,0" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-20,0 Q0,-20 20,0" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4,3" />
        <path d="M-20,30 Q0,50 20,30" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-20,30 Q0,10 20,30" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4,3" />
        <line x1="-20" y1="-30" x2="-20" y2="30" stroke={color} strokeWidth="2" opacity="0.4" />
        <line x1="20" y1="-30" x2="20" y2="30" stroke="#10b981" strokeWidth="2" opacity="0.4" />
      </g>
      <text x="50" y="110" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">dsRNA (siRNA)</text>

      {/* Arrow */}
      <line x1="82" y1="60" x2="108" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="108,56 118,60 108,64" fill="#475569" />

      {/* RISC complex */}
      <g transform="translate(165,60)">
        <rect x="-38" y="-30" width="76" height="60" rx="12" fill="#1e293b" stroke={color} strokeWidth="2" />
        <text x="0" y="-8" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">RISC</text>
        <text x="0" y="5" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace">Complex</text>
        <text x="0" y="17" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">Ago2</text>
      </g>
      <text x="165" y="110" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">RISC / Ago2</text>

      {/* Arrow */}
      <line x1="204" y1="60" x2="228" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="228,56 238,60 228,64" fill="#475569" />

      {/* mRNA target */}
      <g transform="translate(290,60)">
        <path d="M-50,-15 Q-30,-25 0,-15 Q30,-25 50,-15" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M-50,0 Q-30,10 0,0 Q30,10 50,0" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="3,3" />
        <text x="0" y="20" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono, monospace">mRNA → cleaved</text>
        {/* Scissors icon */}
        <text x="0" y="-22" textAnchor="middle" fill={color} fontSize="14">✂</text>
      </g>
      <text x="290" y="110" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">mRNA Degraded</text>
    </svg>
  );
}

function mRNADiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* LNP */}
      <g transform="translate(55,60)">
        <circle cx="0" cy="0" r="32" fill="#0f1a2e" stroke={color} strokeWidth="2" />
        {[...Array(8)].map((_, i) => {
          const a = i * 45 * Math.PI / 180;
          return <circle key={i} cx={Math.cos(a)*28} cy={Math.sin(a)*28} r="5" fill={color} opacity="0.6" />;
        })}
        <path d="M-12,-6 Q0,-12 12,-6 Q12,6 0,12 Q-12,6 -12,-6Z" fill={color} opacity="0.3" />
        <text x="0" y="-3" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">LNP</text>
        <text x="0" y="8" textAnchor="middle" fill={color} fontSize="7" fontFamily="JetBrains Mono, monospace">+mRNA</text>
      </g>
      <text x="55" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Lipid Nanoparticle</text>

      {/* Arrow */}
      <line x1="90" y1="60" x2="112" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="112,56 122,60 112,64" fill="#475569" />

      {/* Cell with endosome */}
      <ellipse cx="190" cy="60" r="60" ry="42" fill="#0c1118" stroke="#475569" strokeWidth="1.5" />
      <circle cx="190" cy="60" r="22" fill="#1e293b" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" />
      <text x="190" y="57" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace">Cell</text>
      <text x="190" y="68" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">endosome</text>
      <text x="190" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Entry + Release</text>

      {/* Arrow */}
      <line x1="253" y1="60" x2="272" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="272,56 282,60 272,64" fill="#475569" />

      {/* Ribosome → Protein */}
      <g transform="translate(340,60)">
        <ellipse cx="0" cy="0" rx="42" ry="20" fill="#1e293b" stroke={color} strokeWidth="2" />
        <ellipse cx="0" cy="-10" rx="25" ry="14" fill="#0f1117" stroke={color} strokeWidth="1.5" />
        <text x="0" y="-6" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Ribosome</text>
        <text x="0" y="6" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">→ Protein</text>
        {/* Output protein dots */}
        <circle cx="35" cy="-20" r="6" fill={color} opacity="0.7" />
        <circle cx="48" cy="-12" r="5" fill={color} opacity="0.5" />
        <circle cx="52" cy="2" r="5" fill={color} opacity="0.4" />
      </g>
      <text x="340" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Protein Produced</text>
    </svg>
  );
}

function SmallMoleculeDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* Pill */}
      <g transform="translate(45,60)">
        <rect x="-25" y="-14" width="50" height="28" rx="14" fill="#1e293b" stroke={color} strokeWidth="2" />
        <line x1="0" y1="-14" x2="0" y2="14" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <rect x="0" y="-14" width="25" height="28" rx="14" fill={color} opacity="0.2" />
        <text x="0" y="4" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Oral</text>
      </g>
      <text x="45" y="110" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Tablet</text>

      {/* Arrow */}
      <line x1="78" y1="60" x2="98" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="98,56 108,60 98,64" fill="#475569" />

      {/* Bloodstream */}
      <g transform="translate(155,60)">
        <path d="M-40,0 Q-20,-20 0,0 Q20,20 40,0" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="-25" cy="-6" r="5" fill="#f43f5e" opacity="0.5" />
        <circle cx="0" cy="8" r="5" fill="#f43f5e" opacity="0.5" />
        <circle cx="25" cy="-4" r="5" fill="#f43f5e" opacity="0.5" />
        <text x="0" y="-26" textAnchor="middle" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono, monospace">Bloodstream</text>
      </g>
      <text x="155" y="110" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Systemic</text>

      {/* Arrow */}
      <line x1="198" y1="60" x2="218" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="218,56 228,60 218,64" fill="#475569" />

      {/* Cell membrane + target */}
      <g transform="translate(300,60)">
        {/* Cell membrane */}
        <rect x="-35" y="-40" width="70" height="80" rx="8" fill="#0c1118" stroke="#475569" strokeWidth="1.5" />
        {/* Molecule entering */}
        <circle cx="-20" cy="0" r="10" fill={color} opacity="0.7" />
        <text x="-20" y="4" textAnchor="middle" fill="#0f1117" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">SM</text>
        {/* Intracellular target */}
        <rect x="8" y="-12" width="24" height="24" rx="4" fill="#1e293b" stroke={color} strokeWidth="1.5" />
        <text x="20" y="4" textAnchor="middle" fill={color} fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">kinase</text>
        <line x1="-10" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1.5" strokeDasharray="3,2" />
      </g>
      <text x="300" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Intracellular Target</text>
    </svg>
  );
}

function mAbDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* mAb Y-shape */}
      <g transform="translate(80,60)">
        <line x1="0" y1="-35" x2="-28" y2="-55" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-35" x2="28" y2="-55" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-35" x2="0" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="5" x2="-24" y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="5" x2="24" y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="-28" cy="-55" r="8" fill={color} opacity="0.9" />
        <circle cx="28" cy="-55" r="8" fill={color} opacity="0.9" />
        <text x="-28" y="-51" textAnchor="middle" fill="#0f1117" fontSize="6" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Fab</text>
        <text x="28" y="-51" textAnchor="middle" fill="#0f1117" fontSize="6" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Fab</text>
        <rect x="-18" y="28" width="36" height="20" rx="4" fill="#1e293b" stroke={color} strokeWidth="1" />
        <text x="0" y="42" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace">Fc</text>
      </g>
      <text x="80" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Monoclonal Ab</text>

      {/* Arrow */}
      <line x1="128" y1="60" x2="158" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="158,56 168,60 158,64" fill="#475569" />

      {/* Cell surface receptor */}
      <g transform="translate(260,60)">
        {/* Cell body */}
        <ellipse cx="0" cy="20" rx="70" ry="35" fill="#0c1118" stroke="#475569" strokeWidth="1.5" />
        {/* Receptor */}
        <rect x="-12" y="-30" width="24" height="50" rx="8" fill="#1e293b" stroke={color} strokeWidth="2" />
        <circle cx="0" cy="-30" r="12" fill="#1e293b" stroke={color} strokeWidth="2" />
        <text x="0" y="-27" textAnchor="middle" fill={color} fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Target</text>
        {/* Binding indicator */}
        <text x="0" y="-44" textAnchor="middle" fill={color} fontSize="16">⚡</text>
      </g>
      <text x="260" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Surface Receptor</text>
    </svg>
  );
}

function PeptideDiagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
      {/* Peptide chain */}
      <g transform="translate(80,60)">
        {["A","L","K","S","T","G"].map((aa, i) => (
          <g key={i} transform={`translate(${i*18-45},0)`}>
            <circle cx="0" cy="0" r="10" fill="#1e293b" stroke={color} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">{aa}</text>
            {i < 5 && <line x1="10" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1.5" />}
          </g>
        ))}
        <text x="0" y="-24" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace">Peptide Chain</text>
        <text x="0" y="-14" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace">(2–50 amino acids)</text>
      </g>
      <text x="80" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">GLP-1 Analog</text>

      {/* Arrow */}
      <line x1="130" y1="60" x2="155" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="155,56 165,60 155,64" fill="#475569" />

      {/* GPCR receptor */}
      <g transform="translate(240,60)">
        {/* 7-TM helices */}
        {[-42,-28,-14,0,14,28,42].map((x,i) => (
          <rect key={i} x={x-5} y={-30} width="10" height="60" rx="4" fill="#1e293b" stroke={color} strokeWidth="1.5" opacity={0.5+i*0.07} />
        ))}
        <text x="0" y="-38" textAnchor="middle" fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">GPCR</text>
        <text x="0" y="-26" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace">7-transmembrane</text>
      </g>
      <text x="240" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Receptor</text>

      {/* Arrow + signal */}
      <line x1="293" y1="60" x2="318" y2="60" stroke="#475569" strokeWidth="1.5" />
      <polygon points="318,56 328,60 318,64" fill="#475569" />

      <g transform="translate(360,60)">
        <circle cx="0" cy="0" r="28" fill="#0f1a2e" stroke={color} strokeWidth="2" />
        <text x="0" y="-8" textAnchor="middle" fill={color} fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">cAMP</text>
        <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">↑ Insulin</text>
        <text x="0" y="14" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono, monospace">↓ Glucagon</text>
      </g>
      <text x="360" y="112" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">Signal Response</text>
    </svg>
  );
}

const MECHANISM_DIAGRAMS: Record<string, React.FC<{ color: string }>> = {
  adc: ADCDiagram,
  bispecific: BispecificDiagram,
  carT: CARTDiagram,
  geneTherapy: GeneTherapyDiagram,
  rnaTherapeutic: RNAiDiagram,
  mRNAVaccine: mRNADiagram,
  smallMolecule: SmallMoleculeDiagram,
  mAb: mAbDiagram,
  peptide: PeptideDiagram,
};

// ─── Modality Card ─────────────────────────────────────────────────────────────

function ModalityCard({ modalityKey }: { modalityKey: string }) {
  const data = modalityInfo[modalityKey];
  const color = MODALITY_COLORS[modalityKey] || "#6366f1";
  const DiagramComponent = MECHANISM_DIAGRAMS[modalityKey];

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-3 h-full rounded-full self-stretch min-h-[60px]"
          style={{ background: color, minHeight: 60, minWidth: 4, maxWidth: 4 }}
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white font-['Inter',sans-serif]">{data.name}</h2>
          <p className="text-sm mt-1 font-['JetBrains_Mono',monospace]" style={{ color }}>
            {data.mechanism}
          </p>
        </div>
      </div>

      {/* Mechanism Diagram */}
      {DiagramComponent && (
        <div
          className="rounded-xl p-5 border"
          style={{ background: "rgba(15,17,23,0.8)", borderColor: `${color}30` }}
        >
          <p className="text-xs text-slate-500 mb-3 font-['JetBrains_Mono',monospace] uppercase tracking-wider">
            Mechanism Diagram
          </p>
          <DiagramComponent color={color} />
        </div>
      )}

      {/* How It Works */}
      <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          How It Works
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-['Inter',sans-serif]">
          {data.howItWorks}
        </p>
        {data.quickTooltip && (
          <p className="text-xs text-slate-500 mt-3 leading-relaxed italic border-l-2 pl-3 font-['JetBrains_Mono',monospace]"
            style={{ borderColor: color }}>
            {data.quickTooltip}
          </p>
        )}
      </div>

      {/* Advantages + Limitations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-emerald-900/40 bg-emerald-950/20">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
            ✓ Advantages
          </h3>
          <ul className="space-y-2">
            {data.advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-['Inter',sans-serif]">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4 border border-rose-900/40 bg-rose-950/20">
          <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
            ✗ Limitations
          </h3>
          <ul className="space-y-2">
            {data.limitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-['Inter',sans-serif]">
                <span className="text-rose-500 mt-0.5 flex-shrink-0">•</span>
                {lim}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Landmark Drugs Timeline */}
      <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-['JetBrains_Mono',monospace]">
          Landmark Drugs
        </h3>
        <div className="relative">
          <div className="absolute left-[52px] top-3 bottom-3 w-px bg-slate-700" />
          <div className="space-y-4">
            {data.landmarks.map((lm, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div
                  className="text-xs font-bold font-['JetBrains_Mono',monospace] w-12 text-right flex-shrink-0 pt-0.5"
                  style={{ color }}
                >
                  {lm.year}
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 z-10"
                  style={{ background: color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white font-['Inter',sans-serif]">{lm.drug}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-['Inter',sans-serif]">{lm.significance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div
        className="rounded-xl p-4 border"
        style={{ borderColor: `${color}40`, background: `${color}08` }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-2 font-['JetBrains_Mono',monospace]"
          style={{ color }}
        >
          Current Pipeline Status
        </h3>
        <p className="text-sm text-slate-300 font-['Inter',sans-serif]">{data.currentStatus}</p>
      </div>
    </motion.div>
  );
}

// ─── Target Class Card ─────────────────────────────────────────────────────────

function TargetCard({ targetKey }: { targetKey: string }) {
  const data = targetClassData[parseInt(targetKey)];
  if (!data) return null;

  const trendColor = TREND_COLORS[data.trend] || "#6366f1";
  const trendLabel = data.trend === "up" ? "Rising ↑" : data.trend === "down" ? "Declining ↓" : "Stable →";
  const maxActivity = Math.max(data.activity2005, data.activity2015, data.activity2025);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-['Inter',sans-serif]">{data.targetClass}</h2>
          <p className="text-xs mt-1 font-['JetBrains_Mono',monospace]" style={{ color: trendColor }}>
            {trendLabel}
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold font-['JetBrains_Mono',monospace]"
          style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}30` }}
        >
          {data.activity2025} programs (2025)
        </span>
      </div>

      {/* Activity Bar Chart */}
      <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-['JetBrains_Mono',monospace]">
          Pipeline Activity Over Time
        </h3>
        <div className="space-y-3">
          {[
            { year: "2005", value: data.activity2005 },
            { year: "2015", value: data.activity2015 },
            { year: "2025", value: data.activity2025 },
          ].map(({ year, value }) => (
            <div key={year} className="flex items-center gap-3">
              <span className="text-xs font-bold font-['JetBrains_Mono',monospace] text-slate-400 w-10 flex-shrink-0">
                {year}
              </span>
              <div className="flex-1 h-7 bg-slate-800/60 rounded-md overflow-hidden">
                <motion.div
                  className="h-full rounded-md flex items-center px-2"
                  style={{ background: trendColor, opacity: 0.8 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / maxActivity) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <span className="text-xs font-bold text-white font-['JetBrains_Mono',monospace] whitespace-nowrap">
                    {value}
                  </span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          Overview
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-['Inter',sans-serif]">{data.description}</p>
      </div>

      {/* Tooltip / Deep Mechanism */}
      <div className="rounded-xl p-5 border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          Biology Deep-Dive
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-['Inter',sans-serif]">{data.tooltip}</p>
      </div>

      {/* Example Drugs */}
      <div
        className="rounded-xl p-4 border"
        style={{ borderColor: `${trendColor}30`, background: `${trendColor}08` }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-2 font-['JetBrains_Mono',monospace]"
          style={{ color: trendColor }}
        >
          Example Drugs
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.examples.split(", ").map((drug, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded text-xs font-['JetBrains_Mono',monospace]"
              style={{ background: `${trendColor}15`, color: trendColor }}
            >
              {drug}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Organ System Card ─────────────────────────────────────────────────────────

function OrganCard({ organKey }: { organKey: string }) {
  const data = organSystemData[organKey];
  if (!data) return null;

  const color = ORGAN_COLORS[organKey] || "#6366f1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-['Inter',sans-serif]">{data.name}</h2>
          <p className="text-xs mt-1 font-['JetBrains_Mono',monospace]" style={{ color }}>
            {data.pipelineGrowth} pipeline growth
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-['JetBrains_Mono',monospace]" style={{ color }}>
            {data.trials.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">active trials</div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          Overview
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-['Inter',sans-serif]">{data.description}</p>
      </div>

      {/* Biology Tooltip */}
      <div className="rounded-xl p-5 border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          Biology Deep-Dive
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-['Inter',sans-serif]">{data.tooltip}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border border-slate-800 bg-slate-900/40">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
            Top Modalities
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.topModalities.map((m, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs font-['JetBrains_Mono',monospace]"
                style={{ background: `${color}15`, color }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4 border border-slate-800 bg-slate-900/40">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
            Delivery Routes
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.deliveryRoutes.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-['JetBrains_Mono',monospace]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="rounded-xl p-4 border border-slate-800 bg-slate-900/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]">
          Key Drug Targets
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.topTargets.map((t, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md text-xs font-['JetBrains_Mono',monospace] border"
              style={{ borderColor: `${color}30`, color, background: `${color}08` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Key Drugs */}
      <div
        className="rounded-xl p-4 border"
        style={{ borderColor: `${color}30`, background: `${color}06` }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-3 font-['JetBrains_Mono',monospace]"
          style={{ color }}
        >
          Approved / Key Drugs
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.keyDrugs.map((d, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded text-xs text-slate-300 bg-slate-800/60 font-['JetBrains_Mono',monospace]"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Encyclopedia Page ────────────────────────────────────────────────────

export default function Encyclopedia() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ key: string; category: CategoryType } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    modalities: true,
    targets: true,
    organs: true,
  });

  // Build nav items
  const allNavItems: NavItem[] = useMemo(() => {
    const modalities: NavItem[] = Object.keys(modalityInfo).map((key) => ({
      key,
      label: modalityInfo[key].name,
      category: "modality",
    }));
    const targets: NavItem[] = targetClassData.map((tc, i) => ({
      key: String(i),
      label: tc.targetClass,
      category: "target",
    }));
    const organs: NavItem[] = Object.keys(organSystemData).map((key) => ({
      key,
      label: organSystemData[key].name,
      category: "organ",
    }));
    return [...modalities, ...targets, ...organs];
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery, allNavItems]);

  const filteredModalities = filteredItems.filter((i) => i.category === "modality");
  const filteredTargets = filteredItems.filter((i) => i.category === "target");
  const filteredOrgans = filteredItems.filter((i) => i.category === "organ");

  // Auto-select first item on load
  useMemo(() => {
    if (!selectedItem && allNavItems.length > 0) {
      setSelectedItem({ key: allNavItems[0].key, category: allNavItems[0].category });
    }
  }, [allNavItems]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSelect = (key: string, category: CategoryType) => {
    setSelectedItem({ key, category });
  };

  const isSelected = (key: string, category: CategoryType) =>
    selectedItem?.key === key && selectedItem?.category === category;

  const getItemColor = (key: string, category: CategoryType) => {
    if (category === "modality") return MODALITY_COLORS[key] || "#6366f1";
    if (category === "target") {
      const tc = targetClassData[parseInt(key)];
      return TREND_COLORS[tc?.trend || "stable"];
    }
    return ORGAN_COLORS[key] || "#6366f1";
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0f1117", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Sidebar */}
      <div
        className="flex flex-col border-r border-slate-800/60 flex-shrink-0 overflow-hidden"
        style={{ width: 250 }}
      >
        {/* Header + Search */}
        <div className="p-4 border-b border-slate-800/60">
          <h1 className="text-sm font-bold text-white mb-3 font-['JetBrains_Mono',monospace] tracking-wide uppercase">
            Drug Encyclopedia
          </h1>
          <input
            data-testid="encyclopedia-search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-800/60 border border-slate-700/50 text-slate-300 placeholder-slate-500 outline-none focus:border-slate-500 transition-colors font-['JetBrains_Mono',monospace]"
          />
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {/* Modalities Section */}
          {filteredModalities.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection("modalities")}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors font-['JetBrains_Mono',monospace]"
                data-testid="section-modalities"
              >
                <span>Modalities</span>
                <span className="text-slate-600">{expandedSections.modalities ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {expandedSections.modalities && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {filteredModalities.map((item) => {
                      const color = getItemColor(item.key, item.category);
                      const selected = isSelected(item.key, item.category);
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleSelect(item.key, item.category)}
                          data-testid={`nav-modality-${item.key}`}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-all hover:bg-slate-800/40"
                          style={{
                            background: selected ? `${color}12` : undefined,
                            borderLeft: selected ? `2px solid ${color}` : "2px solid transparent",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: color }}
                          />
                          <span
                            className="font-['Inter',sans-serif]"
                            style={{ color: selected ? color : "#94a3b8" }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Target Classes Section */}
          {filteredTargets.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => toggleSection("targets")}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors font-['JetBrains_Mono',monospace]"
                data-testid="section-targets"
              >
                <span>Target Classes</span>
                <span className="text-slate-600">{expandedSections.targets ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {expandedSections.targets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {filteredTargets.map((item) => {
                      const tc = targetClassData[parseInt(item.key)];
                      const color = TREND_COLORS[tc?.trend || "stable"];
                      const selected = isSelected(item.key, item.category);
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleSelect(item.key, item.category)}
                          data-testid={`nav-target-${item.key}`}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-all hover:bg-slate-800/40"
                          style={{
                            background: selected ? `${color}12` : undefined,
                            borderLeft: selected ? `2px solid ${color}` : "2px solid transparent",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: color }}
                          />
                          <span
                            className="font-['Inter',sans-serif]"
                            style={{ color: selected ? color : "#94a3b8" }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Organ Systems Section */}
          {filteredOrgans.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => toggleSection("organs")}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors font-['JetBrains_Mono',monospace]"
                data-testid="section-organs"
              >
                <span>Organ Systems</span>
                <span className="text-slate-600">{expandedSections.organs ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {expandedSections.organs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {filteredOrgans.map((item) => {
                      const color = ORGAN_COLORS[item.key] || "#6366f1";
                      const selected = isSelected(item.key, item.category);
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleSelect(item.key, item.category)}
                          data-testid={`nav-organ-${item.key}`}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-all hover:bg-slate-800/40"
                          style={{
                            background: selected ? `${color}12` : undefined,
                            borderLeft: selected ? `2px solid ${color}` : "2px solid transparent",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: color }}
                          />
                          <span
                            className="font-['Inter',sans-serif]"
                            style={{ color: selected ? color : "#94a3b8" }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-slate-600 font-['JetBrains_Mono',monospace]">
              No results for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-slate-800/60">
          <p className="text-xs text-slate-600 font-['JetBrains_Mono',monospace]">
            {filteredItems.length} / {allNavItems.length} entries
          </p>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {!selectedItem ? (
            <div className="flex items-center justify-center h-96 text-slate-600 text-sm font-['JetBrains_Mono',monospace]">
              Select an item from the sidebar
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedItem.category}-${selectedItem.key}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedItem.category === "modality" && (
                  <ModalityCard modalityKey={selectedItem.key} />
                )}
                {selectedItem.category === "target" && (
                  <TargetCard targetKey={selectedItem.key} />
                )}
                {selectedItem.category === "organ" && (
                  <OrganCard organKey={selectedItem.key} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
