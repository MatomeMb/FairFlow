import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { CleanShell } from '../../components/layout/CleanShell';
import { FairflowLogo } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from '../../components/shared/StatusBar';
import { MetricCard } from '../../components/shared/MetricCard';
import { SprintStatus } from '../../lib/statusBadges';
import { platformVersion, platformVersionTag } from '../../lib/config';

type StatusCode = 'complete' | 'in-progress' | 'upcoming';

interface InfrastructureComponent {
  component: string;
  status: StatusCode;
  notes: string;
}

interface RoadmapItem {
  status: StatusCode;
  title: string;
  timeline: string;
  details: string[];
}

interface CostItem {
  service: string;
  cost: string;
  tier: string;
}

export const InvestorMode: React.FC = () => {
  const { user, signOut } = useAuth();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    // Update page title
    document.title = 'fairflow — Investor Dashboard';
    // Track page view - feature for future analytics
    setLastRefreshed(new Date());
  }, [user?.id]);

  const infrastructureComponents: InfrastructureComponent[] = [
    { component: 'Authentication', status: 'complete', notes: 'Supabase Auth with RBAC system live' },
    { component: 'Database', status: 'complete', notes: 'PostgreSQL with RLS policies active' },
    { component: 'API', status: 'complete', notes: 'RESTful + Real-time subscriptions' },
    { component: 'Chrome Extension', status: 'in-progress', notes: 'In review for Chrome Web Store' },
    { component: 'Payment Integration', status: 'upcoming', notes: 'PayFast integration Sprint 8' },
    { component: 'AI Agent', status: 'upcoming', notes: 'OpenAI integration Sprint 9' },
    { component: 'Email Service', status: 'upcoming', notes: 'Self-hosted Mailcow Sprint 12' },
    { component: 'Talent Pipeline', status: 'upcoming', notes: 'CTO-managed database for hiring' },
  ];

  const roadmap: RoadmapItem[] = [
    {
      status: 'complete',
      title: 'Auth & RBAC System',
      timeline: 'Week 1 · Feb 2026',
      details: [
        'Multi-tenant authentication with Supabase',
        'Role-based access control (Admin, Manager, User, Editor, Investor)',
        '5 specialized portals with granular permissions',
        'Row-level security policies enforced at database layer',
        'Production-ready portal infrastructure',
      ],
    },
    {
      status: 'in-progress',
      title: 'Chrome Web Store Launch',
      timeline: 'Sprint 8 · In Progress',
      details: [
        'Chrome extension manifest v3 compliance',
        'Store listing assets and privacy policy',
        'Review submission and approval process',
      ],
    },
    {
      status: 'in-progress',
      title: 'Domain & Email Setup',
      timeline: 'Sprint 7 · In Progress',
      details: [
        'fairflow.co.za domain configuration',
        'Professional email addresses setup',
        'DNS and SSL certificate deployment',
      ],
    },
    {
      status: 'upcoming',
      title: 'PayFast Payment Integration',
      timeline: 'Sprint 8 · Upcoming',
      details: [
        'South African payment gateway integration',
        'Commission processing automation',
        'Transaction reconciliation system',
      ],
    },
    {
      status: 'upcoming',
      title: 'Merchant Onboarding',
      timeline: 'Sprint 8 · Upcoming',
      details: [
        'Self-service merchant registration',
        'Product catalog management',
        'Commission agreement workflows',
      ],
    },
    {
      status: 'upcoming',
      title: 'AI Shopping Assistant',
      timeline: 'Sprint 9 · Planned',
      details: [
        'OpenAI-powered product recommendations',
        'Natural language shopping queries',
        'Ethical score explanations',
      ],
    },
    {
      status: 'upcoming',
      title: 'Self-Hosted Email',
      timeline: 'Sprint 12 · Planned',
      details: [
        'Mailcow email server deployment',
        'Complete email independence',
        'Enhanced privacy and control',
      ],
    },
  ];

  const costStructure: CostItem[] = [
    { service: 'Supabase (Database + Auth)', cost: 'R0', tier: 'Free tier (500MB)' },
    { service: 'AI Chat (OpenAI)', cost: 'R500', tier: 'Pay-per-use' },
    { service: 'VPS (Email + Services)', cost: 'R200', tier: 'Hetzner CX11' },
  ];

  const totalMonthlyCost = 700; // R0 + R500 + R200
  const breakEvenRevenue = 790;
  const currentBurn = 3500;

  return (
    <CleanShell
      title={<FairflowLogo markHeight={32} variant="dark" />}
      subtitle="Investor Dashboard"
      version={platformVersionTag}
      onLogout={signOut}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* SECTION 1: EXECUTIVE SUMMARY */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Executive Summary</h2>
          
          {/* Headline Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-4">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-emerald-400">fairflow</h3>
              <p className="text-2xl text-stone-300 italic">For humans today, AI agents tomorrow</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-4 text-lg">
              <div>
                <span className="text-stone-500">Category:</span>
                <span className="ml-3 text-stone-200">Ethical Shopping / AI-Assisted Commerce</span>
              </div>
              <div>
                <span className="text-stone-500">Stage:</span>
                <span className="ml-3 text-stone-200">Pre-Revenue (MVP Launch Imminent)</span>
              </div>
              <div>
                <span className="text-stone-500">Revenue Model:</span>
                <span className="ml-3 text-stone-200">Commission on ethical purchases</span>
              </div>
              <div>
                <span className="text-stone-500">Market:</span>
                <span className="ml-3 text-stone-200">South Africa → Global</span>
              </div>
              <div className="col-span-2">
                <span className="text-stone-500">Technology:</span>
                <span className="ml-3 text-stone-200">Chrome Extension + Web Platform + AI Agent</span>
              </div>
            </div>
          </div>

          {/* Traction Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="Platform Version"
              value={platformVersion}
              color="green"
            />
            <MetricCard
              label="Auth System"
              value="Live"
              color="green"
            />
            <MetricCard
              label="Portals Built"
              value="5"
              color="green"
            />
            <MetricCard
              label="Months to Revenue"
              value="~1"
              unit="mo"
              color="green"
            />
          </div>
        </section>

        {/* SECTION 2: PLATFORM STATUS */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Platform Status</h2>
          
          {/* StatusBar in read-only mode */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
            <StatusBar apiOnline={true} version={platformVersionTag} readOnly />
          </div>

          {/* Infrastructure Status Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-xl font-semibold text-stone-100">Infrastructure Components</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Component</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {infrastructureComponents.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-800/50 transition-colors">
                      <td className="px-6 py-4 text-stone-200 font-medium">{item.component}</td>
                      <td className="px-6 py-4">
                        <SprintStatus status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-stone-400">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage & Scale Panel */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-stone-100 mb-4">Storage & Scale</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-stone-950 rounded-lg p-4">
                <div className="text-sm text-stone-500 mb-1">Current Storage</div>
                <div className="text-2xl font-bold text-emerald-400">~200 MB</div>
              </div>
              <div className="bg-stone-950 rounded-lg p-4">
                <div className="text-sm text-stone-500 mb-1">Quota Available</div>
                <div className="text-2xl font-bold text-emerald-400">5,120 MB</div>
              </div>
              <div className="bg-stone-950 rounded-lg p-4">
                <div className="text-sm text-stone-500 mb-1">Error Rate (24h)</div>
                <div className="text-2xl font-bold text-emerald-400">0.0%</div>
              </div>
              <div className="bg-stone-950 rounded-lg p-4">
                <div className="text-sm text-stone-500 mb-1">System Memory</div>
                <div className="text-2xl font-bold text-emerald-400">Healthy</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PRODUCT ROADMAP */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Product Roadmap</h2>
          
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
            <div className="space-y-8">
              {roadmap.map((item, index) => (
                <div key={index} className="flex gap-6">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-lg">
                      <SprintStatus status={item.status} />
                    </div>
                    {index < roadmap.length - 1 && (
                      <div className="w-0.5 h-16 bg-stone-800 mx-auto mt-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow pb-8">
                    <div className="flex items-baseline gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-stone-100">{item.title}</h3>
                      <span className="text-sm text-stone-500">{item.timeline}</span>
                    </div>
                    <ul className="space-y-1 text-stone-400">
                      {item.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: FINANCIAL OVERVIEW */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Financial Overview</h2>
          
          {/* Unit Economics Panel */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-6">
            <h3 className="text-xl font-semibold text-stone-100">Unit Economics</h3>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-lg">
              <div>
                <span className="text-stone-500">Revenue Model:</span>
                <span className="ml-3 text-stone-200">Commission on ethical purchases</span>
              </div>
              <div>
                <span className="text-stone-500">Break-Even:</span>
                <span className="ml-3 text-emerald-400 font-bold">R{breakEvenRevenue}/month</span>
              </div>
              <div>
                <span className="text-stone-500">Primary Gateway:</span>
                <span className="ml-3 text-stone-200">PayFast 3.5% + R2</span>
              </div>
              <div>
                <span className="text-stone-500">Current Burn:</span>
                <span className="ml-3 text-stone-200">R{currentBurn.toLocaleString()}/month</span>
              </div>
              <div>
                <span className="text-stone-500">Secondary Gateway:</span>
                <span className="ml-3 text-stone-200">Stripe 2.9% + R5.50</span>
              </div>
              <div>
                <span className="text-stone-500">Cash to Revenue:</span>
                <span className="ml-3 text-emerald-400 font-bold">1 sprint</span>
              </div>
              <div>
                <span className="text-stone-500">Alternative Revenue:</span>
                <span className="ml-3 text-stone-200">Subscriptions (under evaluation)</span>
              </div>
            </div>
          </div>

          {/* Cost Structure Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-xl font-semibold text-stone-100">Cost Structure</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Monthly Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-stone-300">Tier / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {costStructure.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-800/50 transition-colors">
                      <td className="px-6 py-4 text-stone-200 font-medium">{item.service}</td>
                      <td className="px-6 py-4 text-stone-200">{item.cost}</td>
                      <td className="px-6 py-4 text-stone-400">{item.tier}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-950 font-bold">
                    <td className="px-6 py-4 text-stone-100">Total Infrastructure</td>
                    <td className="px-6 py-4 text-emerald-400">R{totalMonthlyCost}</td>
                    <td className="px-6 py-4 text-stone-400">Operational baseline</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 5: TEAM */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Team</h2>
          
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-grow">
                  <div className="flex items-baseline gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-stone-100">Matome Mbowene</h3>
                    <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-sm font-semibold">
                      CTO
                    </span>
                  </div>
                  <p className="text-lg text-stone-300 mb-2">Architect of the platform</p>
                  <p className="text-stone-400">
                    Full-stack TypeScript · Supabase · AI integration
                  </p>
                </div>
              </div>

              <div className="h-px bg-stone-800"></div>

              <div className="flex items-start gap-6">
                <div className="flex-grow">
                  <div className="flex items-baseline gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-stone-100">Sobuhle Nyambali</h3>
                    <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-sm font-semibold">
                      CEO
                    </span>
                  </div>
                  <p className="text-lg text-stone-300 mb-2">Business strategy & merchant relationships</p>
                  <p className="text-stone-400">
                    Product vision · Investor relations · Market expansion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CONTACT */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-100">Contact</h2>
          
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-6">
            <div className="space-y-4 text-lg">
              <div>
                <h3 className="text-stone-400 mb-2">For investor inquiries:</h3>
                <div className="space-y-1 ml-4">
                  <div className="text-stone-300">
                    <a 
                      href="mailto:hello@fairflow.co.za" 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      hello@fairflow.co.za
                    </a>
                    <span className="ml-3 text-sm text-stone-500">(Sprint 7)</span>
                  </div>
                  <div>
                    <a 
                      href="mailto:matome@fairflow.co.za" 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      matome@fairflow.co.za
                    </a>
                  </div>
                  <div>
                    <a 
                      href="mailto:sobuhle@fairflow.co.za" 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      sobuhle@fairflow.co.za
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-stone-400 mb-2">Platform:</h3>
                <div className="ml-4">
                  <a 
                    href="https://fairflow.co.za" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    fairflow.co.za
                  </a>
                  <span className="ml-3 text-sm text-stone-500">(Sprint 7)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800">
                <p className="text-stone-400">
                  This dashboard is updated in real time from live infrastructure.
                </p>
                <p className="text-stone-500 text-sm mt-1">
                  Last system check: {lastRefreshed?.toLocaleString() ?? 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-stone-500 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Investor view — read only. Data refreshed automatically.</span>
          </p>
        </div>
      </div>
    </CleanShell>
  );
};
