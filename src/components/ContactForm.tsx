import { FormEvent, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Send } from 'lucide-react';
import { validateContactPayload } from '../data/portfolioData';
import { isSupabaseConfigured, submitContactMessage } from '../lib/supabase';

export function ContactForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Web Development / Project Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const check = validateContactPayload({ name, email, subject, message });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please check your input.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({ name, email, subject, message });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSubmitted(false);
            setErrorMsg(null);
          }}
          className="pill-link cursor-pointer"
        >
          <span>Send a direct message</span>
          <Send size={15} />
        </button>
        <a
          className="text-link"
          href="https://github.com/moon-rocks"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore GitHub (@moon-rocks) <ArrowUpRight size={15} />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-xl border border-[#2a2623] bg-[#0b0a09]/90 p-4 text-left sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-[#24201d] pb-3">
        <span className="eyebrow text-[#ff8c59]">DIRECT MESSAGE / SUPABASE INBOX</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 cursor-pointer text-xs text-[#9e958b] hover:text-white"
        >
          Close ✕
        </button>
      </div>

      {submitted ? (
        <div className="py-6">
          <div className="mb-2 flex items-center gap-2 text-[#ff8c59]">
            <CheckCircle2 size={18} />
            <strong className="text-sm uppercase tracking-wider">Message received</strong>
          </div>
          <p className="text-sm text-[#bdb5aa]">
            Thank you for reaching out. Your message has been stored securely in the portfolio
            inbox.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-link mt-4 cursor-pointer text-xs"
          >
            Send another message <ArrowUpRight size={13} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">YOUR NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chandresh Kumar"
                className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
              />
            </div>
            <div>
              <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">YOUR EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
              />
            </div>
          </div>
          <div>
            <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">TOPIC</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
            >
              <option value="Web Development / Project Inquiry">
                Web Development / Project Inquiry
              </option>
              <option value="Full-Stack & Supabase Architecture">
                Full-Stack &amp; Supabase Architecture
              </option>
              <option value="Internship / Academic Collaboration">
                Internship / Academic Collaboration
              </option>
              <option value="General Hello">General Hello</option>
            </select>
          </div>
          <div>
            <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">MESSAGE</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me about your project, timeline, or collaboration idea..."
              className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
            />
          </div>
          {errorMsg && (
            <p className="border border-[#ff5a36]/40 bg-[#ff5a36]/10 px-3 py-2 text-xs text-[#ff9d85]">
              {errorMsg}
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="text-[11px] text-[#9e958b]">
              Note: Configure <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> in your environment to enable live database
              submissions.
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="pill-link cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Sending...' : 'Transmit message'}</span>
              <Send size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
