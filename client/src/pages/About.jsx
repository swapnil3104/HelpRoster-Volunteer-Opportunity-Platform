import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Users2,
  Clock,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ArrowRight,
  Award,
  Globe2,
  Compass
} from 'lucide-react';
import Button from '../components/common/Button';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';

export default function About() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Mandatory Non-Profit Verification',
      description:
        'Organizations undergo administrative vetting before posting public opportunities. Unverified organizations cannot publish listings or view volunteer records, guaranteeing safe engagements for all participants.',
      color: 'bg-teal-50 text-accent-600 border-teal-200'
    },
    {
      icon: Clock,
      title: 'Authenticated Service Hours',
      description:
        'Every hour logged by a volunteer is routed to the organization supervisor for explicit verification. Certified transcripts are tamper-resistant and directly usable for school, court, or employer requirements.',
      color: 'bg-brand-50 text-brand-600 border-brand-200'
    },
    {
      icon: Lock,
      title: 'Privacy & Role Isolation by Design',
      description:
        'Volunteers retain full ownership of their personal information. Contact data is shared with hosting organizations only upon formal application acceptance, preventing unsolicited outreach or leakage.',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      icon: Award,
      title: 'Gamified Milestone Recognition',
      description:
        'Our relational achievements engine evaluates verified milestones in real time. Volunteers earn certified digital badges for commitment, diverse causes explored, and sustained community contribution.',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  const principles = [
    {
      title: 'Respect & Dignity for Communities',
      description:
        'Volunteering is a mutual partnership. We believe in serving with humility, listening to community leaders, and prioritizing sustainable local impact over superficial participation.'
    },
    {
      title: 'Reliability & Active Commitment',
      description:
        'Non-profits rely on volunteers to deliver vital services. Showing up on time, honoring scheduled shifts, and communicating changes proactively ensures organizational continuity.'
    },
    {
      title: 'Safety & Inclusive Welcoming',
      description:
        'We enforce zero tolerance for discrimination, harassment, or unsafe practices. All volunteers and organization coordinators are entitled to a safe, welcoming, and inclusive working environment.'
    },
    {
      title: 'Data Transparency & Integrity',
      description:
        'We believe public volunteer metrics must reflect reality. HelpRoster never inflates hours or fabricates claims: every hour and listing is backed by an auditable database record.'
    }
  ];

  return (
    <PageContainer size="xl" className="py-12 space-y-16">
      {/* Page Heading with Breadcrumb */}
      <PageHeading
        title="About HelpRoster"
        description="We believe in the power of organized community service. HelpRoster provides the verified foundation for passionate individuals and reputable non-profits to create real, measurable impact."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us' }
        ]}
      />

      {/* Mission & Vision Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <Target className="w-3.5 h-3.5" />
            <span>Our Mission & Vision</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Bridging the gap between passionate volunteers and vetted non-profit causes.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            For decades, volunteering platforms have struggled with outdated listings, unverified
            organizations, and cumbersome hour verification paperwork. Volunteers were unsure if
            their time was genuinely impactful, while non-profits spent hours managing manual
            spreadsheets.
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            HelpRoster was created to modernize this ecosystem with strict verification gates,
            relational duplicate prevention, and real-time hour authentication. We are proud to
            deliver a platform where trust is the core currency.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-brand-600 to-accent-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">The HelpRoster Pledge</h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              &ldquo;To provide every volunteer and non-profit organization with a transparent,
              secure, and accountable platform that transforms goodwill into measurable, lasting
              community progress.&rdquo;
            </p>
            <div className="pt-4 border-t border-white/20 flex items-center gap-6 text-xs text-brand-100">
              <div>
                <span className="block text-xl font-bold text-white font-mono">100%</span>
                Admin-Verified Orgs
              </div>
              <div>
                <span className="block text-xl font-bold text-white font-mono">Real-Time</span>
                Hours Tracking
              </div>
              <div>
                <span className="block text-xl font-bold text-white font-mono">Zero</span>
                Fabricated Metrics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Core Platform Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Built from the ground up on relational integrity and rigorous product principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="p-6 sm:p-8 space-y-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pillar.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Principles of Responsible Volunteering */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-600" />
            <span>Community Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Principles of Responsible Volunteering
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every user and organization participating on HelpRoster agrees to uphold these
            foundational community standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {principles.map((p, idx) => (
            <div key={p.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer Box */}
      <section className="text-center bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6 shadow-xs">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Ready to join our community network?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Start exploring volunteer openings or register your non-profit organization today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/opportunities">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Opportunities
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="md">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
