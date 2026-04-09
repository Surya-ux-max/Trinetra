import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Eye, Zap, Radar, Satellite, Lock, Target, Activity } from 'lucide-react';
import WavingFlag from '../components/common/WavingFlag';

import heroImg      from '../assets/Whisk_f87668844469a048f554431b37a7d8afdr (1).jpeg';
import navalImg     from '../assets/Navel transit.jpeg';
import droneImg     from '../assets/Whisk_9c77ecbf49e3f9a942949367bcd17921dr (1).jpeg';
import borderImg    from '../assets/Whisk_a9d713cce02a723b82042abbee57acfedr (1).jpeg';
import techImg      from '../assets/Whisk_be30e465a55b5d7843f40bea9b0cabdedr.jpeg';
import commandImg   from '../assets/Whisk_dd32e524ac152539740467da51b64f2cdr.jpeg';
import downloadImg  from '../assets/download.jpeg';

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function ImageSection({ image, children, overlay = 'bg-black/30', minHeight = 'min-h-screen' }) {
  return (
    <section className={`relative ${minHeight} flex items-center justify-center overflow-hidden`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})`, filter: 'brightness(0.9)' }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div style={{ width: '100%', maxWidth: '1800px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '4rem', paddingRight: '4rem', position: 'relative', zIndex: 10, paddingTop: '6rem', paddingBottom: '6rem' }}>
        {children}
      </div>
    </section>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const [sec1Ref, sec1Visible] = useInView();
  const [sec2Ref, sec2Visible] = useInView();
  const [sec3Ref, sec3Visible] = useInView();
  const [sec4Ref, sec4Visible] = useInView();
  const [sec5Ref, sec5Visible] = useInView();
  const [sec6Ref, sec6Visible] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onMouse = (e) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - r.left) / r.width - 0.5,
        y: (e.clientY - r.top) / r.height - 0.5,
      });
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div className="bg-black text-white">

      {/* Classification Bar */}
      <div className="bg-red-900 py-1.5 text-center">
        <span className="font-mono text-[10px] tracking-[3px] uppercase text-white/90">
          CLASSIFIED · MINISTRY OF DEFENCE · GOVERNMENT OF INDIA · AUTHORIZED PERSONNEL ONLY
        </span>
      </div>

      {/* Nav */}
      <nav className={`fixed top-7 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div style={{ width: '100%', maxWidth: '1800px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '4rem', paddingRight: '4rem' }} className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WavingFlag width={60} height={42} />
            <div>
              <div className="font-display font-bold text-xl tracking-widest text-white">TRINETRA</div>
              <div className="font-mono text-[9px] text-white/50 uppercase tracking-widest">त्रिनेत्र · AI Border Surveillance</div>
            </div>
          </div>
          <Link to="/login" className="btn-tactical text-sm px-6 py-2.5">ACCESS SYSTEM</Link>
        </div>
      </nav>

      {/* ── SECTION 1 · HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            transform: `scale(1.05) translate(${mousePos.x * 15}px, ${mousePos.y * 8}px)`,
            willChange: 'transform',
            filter: 'brightness(0.95)',
          }}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

        <div style={{ width: '100%', maxWidth: '1800px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '4rem', paddingRight: '4rem' }} className="relative z-10 text-center py-32">
          <div className="animate-fade-in-up">
            <h1 className="font-display font-bold text-[clamp(4rem,12vw,10rem)] leading-none text-white text-3d mb-4">
              TRINETRA
            </h1>
            <p className="font-mono text-lg text-white/60 uppercase tracking-[6px] mb-10">
              The Third Eye of India
            </p>
            <Link
              to="/login"
              className="btn-tactical btn-glow inline-flex items-center gap-3 text-sm py-4 px-10 hover:scale-105 transition-transform"
            >
              ACCESS COMMAND CENTER <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-white/0 to-white/40" />
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── SECTION 2 · NAVAL / SURVEILLANCE ── */}
      <ImageSection image={navalImg} overlay="bg-black/25">
        <div ref={sec1Ref} className="max-w-5xl mx-auto text-center">
          <h2 className={`font-display text-5xl font-bold text-white mb-4 text-3d transition-all duration-700 ${sec1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Advanced Surveillance Intelligence
          </h2>
          <p className={`text-white/60 text-lg mb-16 transition-all duration-700 delay-100 ${sec1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            AI-powered threat detection and real-time border monitoring
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Eye,    title: 'Vision AI Analysis',  desc: 'Google Gemini 2.0 analyzes every frame with contextual reasoning and threat assessment' },
              { icon: Zap,    title: 'Real-time Detection', desc: 'YOLOv8 detects persons, vehicles, and objects with sub-100ms inference speed' },
              { icon: Shield, title: 'Instant Response',    desc: 'Automated alerts and tactical recommendations delivered to field officers instantly' },
            ].map((item, i) => (
              <div
                key={i}
                className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/25 hover:-translate-y-2 transition-all duration-500 ${sec1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-5 mx-auto">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/55 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ImageSection>

      {/* ── SECTION 3 · DRONE OPS ── */}
      <ImageSection image={droneImg} overlay="bg-black/30">
        <div ref={sec2Ref} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${sec2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'}`}>
            <h2 className="font-display text-5xl font-bold text-white mb-6 text-3d">Autonomous Operations</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Replacing costly drone operations with AI-powered surveillance that operates 24/7 without fatigue.
            </p>
            <div className="space-y-4">
              {[
                { icon: Radar,     text: 'Continuous 360° monitoring' },
                { icon: Satellite, text: 'Multi-sensor data fusion' },
                { icon: Lock,      text: 'Encrypted communications' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`transition-all duration-700 delay-200 ${sec2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img src={borderImg} alt="Border" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="scanning-line" />
              </div>
            </div>
          </div>
        </div>
      </ImageSection>

      {/* ── SECTION 4 · TECH STACK ── */}
      <ImageSection image={techImg} overlay="bg-black/30">
        <div ref={sec3Ref} className="max-w-5xl mx-auto text-center">
          <h2 className={`font-display text-5xl font-bold text-white mb-4 text-3d transition-all duration-700 ${sec3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Cutting-Edge Technology
          </h2>
          <p className={`text-white/60 text-lg mb-16 transition-all duration-700 delay-100 ${sec3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Built on enterprise-grade AI and cloud infrastructure
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Vision Model', value: 'Gemini 2.0 Flash' },
              { label: 'Detection',    value: 'YOLOv8s' },
              { label: 'Backend',      value: 'FastAPI' },
              { label: 'Real-time',    value: 'WebSocket' },
            ].map((item, i) => (
              <div
                key={i}
                className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/25 hover:-translate-y-2 transition-all duration-500 ${sec3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-3">{item.label}</div>
                <div className="font-display text-lg font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </ImageSection>

      {/* ── SECTION 5 · COMMAND CENTER ── */}
      <ImageSection image={commandImg} overlay="bg-black/25">
        <div ref={sec4Ref} className="max-w-4xl mx-auto text-center">
          <h2 className={`font-display text-6xl font-bold text-white mb-6 text-3d transition-all duration-700 ${sec4Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Protecting Every Inch of Bharat
          </h2>
          <p className={`text-white/65 text-xl leading-relaxed mb-12 transition-all duration-700 delay-150 ${sec4Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            India has over <span className="text-white font-semibold">15,000 km</span> of land borders.
            TRINETRA makes every meter intelligent.
          </p>
          <div className={`transition-all duration-700 delay-300 ${sec4Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/login" className="btn-tactical btn-glow inline-flex items-center gap-3 text-sm py-5 px-12 hover:scale-105 transition-transform">
              ENTER COMMAND CENTER <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </ImageSection>

      {/* ── SECTION 6 · REAL-TIME MONITORING ── */}
      <ImageSection image={downloadImg} overlay="bg-black/25">
        <div ref={sec5Ref} className="max-w-5xl mx-auto text-center">
          <h2 className={`font-display text-5xl font-bold text-white mb-4 text-3d transition-all duration-700 ${sec5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Real-time Monitoring & Analytics
          </h2>
          <p className={`text-white/60 text-lg mb-16 transition-all duration-700 delay-100 ${sec5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Comprehensive surveillance with instant threat detection and response
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Target,   title: 'Precision Tracking', desc: 'Advanced algorithms track movement patterns and identify anomalies in real-time across vast border regions' },
              { icon: Activity, title: 'Live Analytics',     desc: 'Continuous data processing provides actionable insights and predictive threat assessment capabilities' },
            ].map((item, i) => (
              <div
                key={i}
                className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-10 text-left hover:bg-white/10 hover:border-white/25 hover:-translate-y-2 transition-all duration-500 ${sec5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 200 + 200}ms` }}
              >
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ImageSection>

      {/* ── SECTION 7 · FINAL CTA ── */}
      <ImageSection image={borderImg} overlay="bg-black/30" minHeight="min-h-[70vh]">
        <div ref={sec6Ref} className="max-w-4xl mx-auto text-center">
          <h2 className={`font-display text-6xl font-bold text-white mb-6 text-3d transition-all duration-700 ${sec6Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Join the Future of Border Security
          </h2>
          <p className={`text-white/65 text-xl leading-relaxed mb-12 transition-all duration-700 delay-150 ${sec6Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Experience the power of AI-driven surveillance and intelligent threat detection.
          </p>
          <div className={`transition-all duration-700 delay-300 ${sec6Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/login" className="btn-tactical btn-glow inline-flex items-center gap-3 text-base py-5 px-14 hover:scale-110 transition-transform">
              ACCESS COMMAND CENTER <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </ImageSection>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8">
        <div style={{ width: '100%', maxWidth: '1800px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '4rem', paddingRight: '4rem' }} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">TRINETRA · Ministry of Defence · GOI</span>
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest text-center">Classified · Unauthorized Access Punishable Under IT Act 2000</span>
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">© 2025 Government of India</span>
        </div>
      </footer>

    </div>
  );
}
