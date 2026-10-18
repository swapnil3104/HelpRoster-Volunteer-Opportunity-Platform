import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import Button from '../components/common/Button';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Contact & Support</h1>
        <p className="text-slate-600 mt-2">
          Have questions about the platform or need assistance? Reach out to our community support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Send a Message</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="jane@example.org"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Organization Verification Inquiry"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="How can we help you?"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>
            <Button variant="primary" className="w-full">
              Send Message
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Direct Email</div>
                <div className="text-sm font-semibold text-slate-900">support@helproster.org</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Frequently Asked Questions</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Q: How do organizations get verified?</p>
              <p>A: Administrators review registration documentation before granting publication privileges.</p>
              <p className="font-semibold text-slate-800 pt-2">Q: Does HelpRoster charge fees?</p>
              <p>A: No. HelpRoster is free for volunteers and community non-profit partners.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
