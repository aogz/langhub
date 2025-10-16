import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Lightweight guided tour without external deps.
// Uses data-tour attribute to anchor steps and portal-like fixed overlay.

const StepTooltip = ({ targetRect, title, body, onNext, onPrev, onClose, isFirst, isLast, isNextDisabled }) => {
  if (!targetRect) return null;

  // Position tooltip near target; default below, shift into viewport.
  const margin = 12;
  const tooltipWidth = 300;
  const left = Math.min(
    Math.max(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, margin),
    window.innerWidth - tooltipWidth - margin
  );
  const preferBottom = targetRect.bottom + 140 < window.innerHeight;
  const top = preferBottom ? targetRect.bottom + margin : Math.max(margin, targetRect.top - 120);

  // Create 4 masks around the target to avoid covering/blurring it.
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {/* Darken everything except the target region using four masks */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: targetRect.top, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', left: 0, top: targetRect.top, width: targetRect.left, height: targetRect.height, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', left: targetRect.right, top: targetRect.top, width: Math.max(0, vw - targetRect.right), height: targetRect.height, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', left: 0, top: targetRect.bottom, width: '100%', height: Math.max(0, vh - targetRect.bottom), background: 'rgba(0,0,0,0.45)' }} />

      {/* Highlight border around target */}
      <div
        style={{
          position: 'absolute',
          left: targetRect.left - 6,
          top: targetRect.top - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          borderRadius: 10,
          border: '2px solid rgba(59,130,246,0.9)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          background: 'transparent'
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: tooltipWidth,
          pointerEvents: 'auto',
          background: '#111827',
          color: '#e5e7eb',
          border: '1px solid #374151',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, color: '#93c5fd' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 0, color: '#9ca3af', cursor: 'pointer' }} aria-label="Close">✕</button>
          </div>
        </div>
        <div style={{ padding: 12, fontSize: 13, lineHeight: 1.45 }}>{body}</div>
        <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid #374151' }}>
          <button onClick={onPrev} disabled={isFirst} style={{
            opacity: isFirst ? 0.5 : 1,
            background: '#374151', color: 'white', border: 0, borderRadius: 8, padding: '6px 10px', cursor: isFirst ? 'default' : 'pointer'
          }}>Back</button>
          <button onClick={onNext} disabled={isNextDisabled} style={{ background: isNextDisabled ? '#4b5563' : '#2563eb', color: 'white', border: 0, borderRadius: 8, padding: '6px 12px', cursor: isNextDisabled ? 'not-allowed' : 'pointer', opacity: isNextDisabled ? 0.7 : 1 }}>{isLast ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
};

const findTargetRect = (selector) => {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
};

// ProductTour orchestrates a multi-route walkthrough of main features.
export default function ProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const waitersRef = useRef([]);

  // Define steps across routes.
  const steps = useMemo(() => ([
    // Classroom — iframe highlight (selection happens via extension; we highlight frame)
    {
      route: '/classroom',
      selector: '[data-tour="iframe"]',
      title: 'Explore any webpage',
      body: 'This is your live webpage. You can select an article, blog post, or news page to get started. Then select any text on the page or click on a paragraph to send it here to practice.',
      ensure: async () => {},
      autoNextOnEvent: 'langhub:text-selected'
    },
    // Classroom — selected text block
    {
      route: '/classroom',
      selector: '[data-tour="selected-text"]',
      title: 'Your selection appears here',
      body: 'The text you select gets captured here. You can interact with words and phrases to translate and save them.',
      ensure: async () => {},
      waitFor: 'langhub:text-selected',
      autoNextImmediately: true
    },
    // Classroom — words are clickable for translation popup
    {
      route: '/classroom',
      selector: '[data-tour="translation-actions"]',
      title: 'Ask or explain',
      body: 'Use Ask to pose questions about the selection and get explanations.',
      ensure: async () => {}
    },
    // Prompt user to select specific word(s) to open the translation popup
    {
      route: '/classroom',
      selector: '[data-tour="selected-text"]',
      title: 'Select a word or phrase',
      body: 'Highlight a word or a few words in your selection to translate them. The Next button will enable once the translation popup appears.',
      ensure: async () => {},
      // Prefer explicit event over polling for reliability
      autoNextOnEvent: 'langhub:translation-popup-open'
    },
    // Classroom — translation popup target area
    {
      route: '/classroom',
      selector: '[data-tour="translation-popup-area"]',
      title: 'Translate and save words',
      body: 'Drag-select multiple words. The popup shows translation, audio, and lets you add the phrase to your vocabulary.',
      ensure: async () => {}
    },
    // Back to Classroom — immersive mode
    {
      route: '/classroom',
      selector: '[data-tour="immersive-toggle"]',
      title: 'Immersive mode',
      body: 'Toggle immersive mode to float the assistant over the page. Drag and resize as needed.',
      ensure: async () => { if (location.pathname !== '/classroom') navigate('/classroom'); },
      waitFor: 'langhub:immersive-ready'
    },
    {
      route: '/classroom',
      selector: '[data-tour="immersive-window"]',
      title: 'Immersive controls',
      body: 'Grab the header to drag. Use edges and corners to resize. Everything remains interactive.',
      ensure: async () => {}
    }
  ]), [location.pathname, navigate]);

  // Expose a simple start hook on window for now.
  useEffect(() => {
    window.startLanghubTour = () => {
      setIdx(0);
      setIsActive(true);
    };
    return () => { delete window.startLanghubTour; };
  }, []);

  // Basic event wait helper
  useEffect(() => {
    const handler = (e) => {
      const type = e.type;
      const waiters = waitersRef.current;
      waitersRef.current = waiters.filter(w => {
        if (w.type === type) {
          w.resolve();
          return false;
        }
        return true;
      });
    };

    const eventTypes = ['langhub:text-selected', 'langhub:immersive-ready'];
    eventTypes.forEach(t => window.addEventListener(t, handler));
    return () => eventTypes.forEach(t => window.removeEventListener(t, handler));
  }, []);

  // Ensure route and element exist for current step
  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;

    const run = async () => {
      const step = steps[idx];
      if (!step) return;

      // navigate/prepare
      await step.ensure?.();

      // wait for event if specified (no timeout to avoid premature close)
      if (step.waitFor) {
        await new Promise((resolve) => {
          waitersRef.current.push({ type: step.waitFor, resolve });
        });
      }

      // persistently poll for target until found (or cancelled)
      while (!cancelled) {
        const rect = findTargetRect(step.selector);
        if (rect) {
          setTargetRect(rect);
          // Auto-advance behaviors
          if (step.autoNextImmediately) {
            setTimeout(() => setIdx(v => Math.min(steps.length - 1, v + 1)), 300);
          } else if (step.autoNextOnEvent) {
            const eventType = step.autoNextOnEvent;
            const handler = () => {
              window.removeEventListener(eventType, handler);
              setIdx(v => Math.min(steps.length - 1, v + 1));
            };
            window.addEventListener(eventType, handler, { once: true });
          } else if (step.autoNextWhenNextReady) {
            // If the next target already exists, proceed automatically
            const tryAdvance = () => {
              const isLast = idx >= steps.length - 1;
              if (isLast) return;
              const next = steps[idx + 1];
              if (!next || !next.selector) return;
              const nextRect = findTargetRect(next.selector);
              if (nextRect) setIdx(v => Math.min(steps.length - 1, v + 1));
            };
            setTimeout(tryAdvance, 200);
          }
          return;
        }
        await new Promise(r => setTimeout(r, 150));
      }
    };

    run();
    return () => { cancelled = true; };
  }, [isActive, idx, steps]);

  // Track next step availability (disable Next if not ready)
  const [isNextReady, setIsNextReady] = useState(true);

  useEffect(() => {
    if (!isActive) return;
    const check = () => {
      const isLast = idx >= steps.length - 1;
      if (isLast) { setIsNextReady(true); return; }
      const next = steps[idx + 1];
      if (!next || !next.selector) { setIsNextReady(true); return; }
      const rect = findTargetRect(next.selector);
      setIsNextReady(!!rect);
    };
    const id = setInterval(check, 200);
    check();
    return () => clearInterval(id);
  }, [isActive, idx, steps]);

  // Reposition on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    const reposition = () => {
      const step = steps[idx];
      if (!step) return;
      const rect = findTargetRect(step.selector);
      setTargetRect(rect);
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    const id = setInterval(reposition, 300);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      clearInterval(id);
    };
  }, [isActive, idx, steps]);

  if (!isActive) return null;

  const step = steps[idx];
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  return (
    <StepTooltip
      targetRect={targetRect}
      title={step?.title || ''}
      body={step?.body || ''}
      isFirst={isFirst}
      isLast={isLast}
      isNextDisabled={!isLast && !isNextReady}
      onPrev={() => setIdx(v => Math.max(0, v - 1))}
      onNext={() => {
        if (isLast) {
          setIsActive(false);
          return;
        }
        if (!isNextReady) return;
        setIdx(v => Math.min(steps.length - 1, v + 1));
      }}
      onClose={() => setIsActive(false)}
    />
  );
}


