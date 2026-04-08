export default function Home() {
  return (
    <>
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="font-serif text-2xl font-bold tracking-tight">
            Anna
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#about" className="hover:text-neutral-900 transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-neutral-900 transition-colors">
              Services
            </a>
            <a href="#testimonials" className="hover:text-neutral-900 transition-colors">
              Testimonials
            </a>
            <a
              href="#contact"
              className="bg-neutral-900 text-white px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
            >
              Get in Touch
            </a>
          </div>
          {/* Mobile menu button */}
          <a
            href="#contact"
            className="md:hidden bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-6">
            Consultant &amp; Coach
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-8 text-neutral-900">
            Unlock Your
            <br />
            <span className="text-neutral-400">Full Potential</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            I help leaders and teams break through barriers, clarify their
            vision, and build strategies that deliver real, lasting results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="bg-neutral-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-neutral-800 transition-colors"
            >
              Book a Free Consultation
            </a>
            <a
              href="#services"
              className="border border-neutral-300 text-neutral-700 px-8 py-4 rounded-full text-base font-medium hover:border-neutral-400 hover:text-neutral-900 transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-neutral-200" />
      </div>

      {/* ── About Section ── */}
      <section id="about" className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Image placeholder */}
          <div className="bg-neutral-100 rounded-2xl aspect-[4/5] flex items-center justify-center order-2 md:order-1">
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-neutral-200 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-400">Anna&apos;s Photo</p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-4">
              About Anna
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 leading-tight">
              A Decade of Transforming
              <br />
              Leaders &amp; Organizations
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              With over 10 years of experience in executive coaching and
              strategic consulting, I&apos;ve worked with Fortune 500 companies,
              startups, and everything in between. My approach combines
              evidence-based frameworks with deep empathy to create lasting
              change.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-8">
              I believe every leader has untapped potential. My role is to help
              you see what&apos;s possible, build a clear roadmap, and hold you
              accountable to the results you deserve.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-3xl font-bold text-neutral-900">
                  200+
                </p>
                <p className="text-sm text-neutral-500 mt-1">Clients Coached</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-neutral-900">
                  10+
                </p>
                <p className="text-sm text-neutral-500 mt-1">Years Experience</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-neutral-900">
                  95%
                </p>
                <p className="text-sm text-neutral-500 mt-1">Client Retention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-neutral-200" />
      </div>

      {/* ── Services Section ── */}
      <section id="services" className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-4">
              Services
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              How I Can Help You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-6 group-hover:bg-neutral-900 transition-colors">
                <svg
                  className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-3">
                Executive Coaching
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                One-on-one sessions designed to sharpen your leadership skills,
                navigate challenges, and accelerate your career growth.
              </p>
              <a
                href="#contact"
                className="text-sm font-medium text-neutral-900 hover:underline"
              >
                Learn more &rarr;
              </a>
            </div>

            {/* Service 2 */}
            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-6 group-hover:bg-neutral-900 transition-colors">
                <svg
                  className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-3">
                Team Workshops
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Interactive workshops that build stronger teams, improve
                communication, and align everyone around a shared vision.
              </p>
              <a
                href="#contact"
                className="text-sm font-medium text-neutral-900 hover:underline"
              >
                Learn more &rarr;
              </a>
            </div>

            {/* Service 3 */}
            <div className="group p-8 rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-6 group-hover:bg-neutral-900 transition-colors">
                <svg
                  className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-3">
                Strategic Consulting
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Data-driven strategy sessions to help your business identify
                opportunities, optimize operations, and scale with confidence.
              </p>
              <a
                href="#contact"
                className="text-sm font-medium text-neutral-900 hover:underline"
              >
                Learn more &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section id="testimonials" className="py-20 md:py-32 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-4">
              Testimonials
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              What Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-neutral-700 leading-relaxed mb-6 text-lg">
                &ldquo;Anna completely transformed how I approach leadership.
                Her coaching helped me find clarity during a pivotal moment in my
                career. I went from feeling overwhelmed to leading with
                confidence.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-neutral-900">Sarah Mitchell</p>
                <p className="text-sm text-neutral-500">VP of Operations, TechFlow</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-neutral-700 leading-relaxed mb-6 text-lg">
                &ldquo;Our team workshop with Anna was the turning point for our
                company culture. She has a rare gift for reading the room and
                guiding conversations that actually produce results.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-neutral-900">James Rodriguez</p>
                <p className="text-sm text-neutral-500">CEO, Bright Ventures</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Contact Section ── */}
      <section id="contact" className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-4">
            Let&apos;s Work Together
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Take the
            <br />
            Next Step?
          </h2>
          <p className="text-neutral-600 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Book a free 30-minute consultation to discuss your goals and discover
            how coaching and consulting can create breakthrough results.
          </p>

          <form className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-5 py-3.5 rounded-xl border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-5 py-3.5 rounded-xl border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
            />
            <textarea
              placeholder="Tell me about your goals..."
              rows={4}
              className="w-full px-5 py-3.5 rounded-xl border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition resize-none"
            />
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-4 rounded-full text-base font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Book My Free Consultation
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#" className="font-serif text-xl font-bold">
            Anna
          </a>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#about" className="hover:text-neutral-900 transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-neutral-900 transition-colors">
              Services
            </a>
            <a href="#testimonials" className="hover:text-neutral-900 transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="hover:text-neutral-900 transition-colors">
              Contact
            </a>
          </div>
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Anna. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
