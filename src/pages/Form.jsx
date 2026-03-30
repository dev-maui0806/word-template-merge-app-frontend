/**
 * Form.jsx - Unified dynamic form for all template-based actions.
 * Fetches field metadata from backend, renders inputs, submits to generate endpoint.
 */

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import FormField from '../components/form/FormField.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import { computeTemplateFormDerived } from '../utils/templateFormDerived.js';
import { isDateOfFRVariableName } from '../utils/dateOfFRField.js';
import { savePreviewDraft } from '../utils/previewDraftStore.js';
import { resolveFieldPlaceholder } from '../utils/fieldPlaceholder.js';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // hard safety cap before compression

async function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = objectUrl;
  });
}

function AlertBox({ variant = 'info', children, onClose }) {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200'
      : variant === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200'
        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-[14px] shadow-sm ${styles}`}>
      <div className="min-w-0">{children}</div>
      {onClose ? (
        <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-2 py-1 text-[14px] hover:bg-black/5 dark:hover:bg-white/10">
          ×
        </button>
      ) : null}
    </div>
  );
}

function CardSectionIcon({ title }) {
  const cls = 'h-[18px] w-[18px]';
  switch (title) {
    case 'Dates':
      return (
        <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M8 3.5v3M16 3.5v3M3.5 9.5h17" />
        </svg>
      );
    case 'Claimant Details':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      );
    case 'Venue Information':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'Times':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v5l3 2" />
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      );
    case 'Event Details':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    case 'Attachments':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      );
    case 'Accommodation':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5V20a1 1 0 0 0 1 1h4v-8h8v8h4a1 1 0 0 0 1-1v-9.5" />
          <path d="M12 3L2 10h20L12 3z" />
        </svg>
      );
    case 'Notary':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case 'ENT Test':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 12h3l2.5-6 2.5 12 2.5-6h3" />
        </svg>
      );
    case 'Distance & Options':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );
    case 'General':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6v6l4 2" />
          <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
        </svg>
      );
  }
}

function CardShell({ title, children, actions, className, contentClassName }) {
  return (
    <div
      className={[
        'rounded-[20px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-slate-700/90 dark:bg-slate-900 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]',
        className || '',
      ].join(' ')}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 mr-1 items-center justify-center rounded-xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-900/50">
            <CardSectionIcon title={title} />
          </div>
          <div style={{fontFamily:"sans-serif"}} className="text-[1.25rem] font-bold text-slate-900 dark:text-slate-100 font-Inter">{title}</div>
        </div>
        {actions}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

function PillToggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-8 rounded-full px-4 text-[13px] font-medium transition',
        active
          ? 'bg-rose-500 text-white dark:bg-rose-600'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function TypeToggle({ value, options, onChange }) {
  const containerRef = useRef(null);
  const [slider, setSlider] = useState({ left: 0, width: 0 });

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => (value ?? '') === o)
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const buttons = el.querySelectorAll('[data-toggle-segment]');
      const btn = buttons[activeIndex];
      if (!btn) return;
      const cr = el.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setSlider({ left: br.left - cr.left, width: br.width });
    };

    requestAnimationFrame(() => requestAnimationFrame(update));
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [activeIndex, options]);

  const iconFor = (opt) => {
    const v = String(opt || '').toLowerCase().replace(/\s+/g, '');
    if (v.includes('virtual')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video w-4 h-4 transition-colors duration-200 text-gray-600 dark:text-gray-500" aria-hidden="true">
          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
          <rect x="2" y="6" width="14" height="12" rx="2"></rect>
        </svg>
      );
    }
    if (v.includes('in-person') || v.includes('inperson') || v.includes('person')) {
      return (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    if (v === 'none' || v.includes('none')) {
      return (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v6l4 2" />
        <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center rounded-[16px] border border-slate-200 bg-white p-1 shadow-[0_10px_26px_rgba(15,23,42,0.08)] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
    >
      <div
        aria-hidden
        className={[
          'pointer-events-none absolute left-0 top-1 bottom-1 rounded-[14px] border border-rose-200 bg-rose-50 shadow-[0_6px_16px_rgba(244,63,94,0.10)] transition-[transform,width,opacity] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-rose-700/50 dark:bg-rose-950/70 dark:shadow-[0_6px_16px_rgba(244,63,94,0.15)]',
          slider.width > 0 ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          width: slider.width,
          transform: `translate3d(${slider.left}px, 0, 0)`,
        }}
      />
      {options.map((opt) => {
        const active = (value ?? '') === opt;
        return (
          <button
            key={opt}
            type="button"
            data-toggle-segment
            onClick={() => onChange(opt)}
            className={[
              'relative z-10 inline-flex h-10 shrink-0 items-center gap-2 rounded-[14px] px-4 text-[14px] font-semibold transition-[color] duration-500 ease-out',
              active ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100',
            ].join(' ')}
          >
            {iconFor(opt)}
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Human-readable title from action slug */
function slugToTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** CSS columns: cards pack top-to-bottom per column to avoid large empty gaps beside short cards. */
function TemplateMasonry({ children }) {
  return <div className="columns-1 md:columns-2 [column-gap:1.5rem]">{children}</div>;
}

function MasonrySection({ fullWidth, spacedTop, children }) {
  return (
    <div
      className={[
        'mb-6 break-inside-avoid',
        fullWidth ? '[column-span:all]' : '',
        spacedTop ? 'mt-8' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export default function Form() {
  const { actionSlug } = useParams();
  const navigate = useNavigate();
  const { country, countryTimezoneId, getEventTypeForBackend } = useApp();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [data, setData] = useState({});
  const [images, setImages] = useState({});
  const [imageLayout, setImageLayout] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claimantOptions, setClaimantOptions] = useState([]);

  const imageFieldNames = useMemo(() => {
    const list = (metadata?.fields || [])
      .filter((f) => f && f.type === 'image' && typeof f.name === 'string')
      .map((f) => f.name);
    // Stable order (matches metadata inference ordering)
    return list;
  }, [metadata]);

  const computedFieldNames = useMemo(
    () => new Set((metadata?.fields || []).filter((f) => f.computed).map((f) => f.name)),
    [metadata]
  );

  const templateDerived = useMemo(() => computeTemplateFormDerived(data), [data]);

  const getFieldValue = useCallback(
    (f) => {
      if (!f) return undefined;
      if (f.type === 'image') return images[f.name];
      if (f.name === 'Event_Type' && (f.computed || actionSlug === 'arrange-venue')) {
        return getEventTypeForBackend() || data[f.name] || '';
      }
      if (f.computed) return templateDerived[f.name] ?? '';
      return data[f.name];
    },
    [actionSlug, data, images, templateDerived, getEventTypeForBackend]
  );

  useEffect(() => {
    if (!actionSlug) return;
    let cancelled = false;
    setLoading(true);
    setMetaError('');
    api(`/templates/${actionSlug}/metadata`, { method: 'GET' })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Failed to load template'); });
        return res.json();
      })
      .then((meta) => {
        if (cancelled) return;
        if (!meta.ok) throw new Error(meta.error);
        setMetadata(meta);
        const initial = {};
        for (const f of meta.fields || []) {
          if (f.computed) continue;
          if (isDateOfFRVariableName(f.name)) continue;
          if (f.type === 'select' && f.options?.length) initial[f.name] = f.default ?? f.options[f.options.length - 1] ?? f.options[0] ?? '';
          else initial[f.name] = '';
        }
        setData(initial);
      })
      .catch((err) => {
        if (!cancelled) setMetaError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [actionSlug]);

  // Date of FR (any template alias): today in the selected country's time zone (not tied to Event_Date).
  useEffect(() => {
    if (!metadata?.fields?.some((f) => isDateOfFRVariableName(f.name))) return;
    if (!country) return;
    let cancelled = false;
    const params = new URLSearchParams();
    params.set('country', country);
    if (countryTimezoneId) params.set('timezoneId', countryTimezoneId);
    api(`/countries/current-time?${params.toString()}`, { method: 'GET' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('time'))))
      .then((d) => {
        if (cancelled || !d?.isoDate) return;
        setData((prev) => {
          const next = { ...prev };
          for (const f of metadata.fields || []) {
            if (isDateOfFRVariableName(f.name)) next[f.name] = d.isoDate;
          }
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = new Date().toISOString().slice(0, 10);
          setData((prev) => {
            const next = { ...prev };
            for (const f of metadata.fields || []) {
              if (!isDateOfFRVariableName(f.name)) continue;
              const cur = next[f.name];
              if (cur != null && String(cur).trim()) continue;
              next[f.name] = fallback;
            }
            return next;
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [metadata, country, countryTimezoneId]);

  // Load claimant name suggestions from history (File Manager) for autosuggest.
  useEffect(() => {
    let cancelled = false;
    api('/documents/claimants', { method: 'GET' })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Failed to load claimants'); });
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data && data.ok && Array.isArray(data.claimants)) {
          setClaimantOptions(data.claimants);
        }
      })
      .catch(() => {
        // Silent fail – autosuggest is optional.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = useCallback((name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback(
    async (key, fileOrFiles) => {
      try {
        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        const safeFiles = files.filter(Boolean);
        if (safeFiles.length === 0) return;

        setError('');

        for (const file of safeFiles) {
          if (!file) continue;

          if (file.size > MAX_IMAGE_SIZE) {
            setError(`"${file.name}" is too large to process. Please choose a smaller file.`);
            continue;
          }

          const compressedDataUrl = await compressImageFile(file);
          if (typeof compressedDataUrl === 'string' && compressedDataUrl.startsWith('data:image/')) {
            setImages((prev) => {
              const existing = prev[key];
              const arr = Array.isArray(existing)
                ? existing
                : existing
                  ? [existing]
                  : [];
              return {
                ...prev,
                [key]: [...arr, compressedDataUrl],
              };
            });
          } else {
            setError('Please select a valid image file');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to process image. Please try a different file.');
      }
    },
    []
  );

  const handleImageRemove = useCallback((key, index) => {
    setImages((prev) => {
      const current = prev[key];
      if (!Array.isArray(current)) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      const arr = current.slice();
      if (typeof index === 'number') {
        arr.splice(index, 1);
      }
      const next = { ...prev };
      if (arr.length === 0) {
        delete next[key];
      } else if (arr.length === 1) {
        next[key] = arr[0];
      } else {
        next[key] = arr;
      }
      return next;
    });
    // Keep one layout per field; if no images remain, clear layout.
    setImageLayout((prev) => {
      if (!(key in images)) return prev;
      const stillHas = images[key] && (Array.isArray(images[key]) ? images[key].length > 1 : true);
      if (stillHas) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, [images]);

  const handleImageLayoutChange = useCallback((key, layout) => {
    setImageLayout((prev) => ({ ...prev, [key]: layout }));
  }, []);

  const buildPayload = useCallback(() => {
    const payload = { ...data };
    for (const key of computedFieldNames) {
      delete payload[key];
    }
    // Always include Country and Event_Type for all action types
    // These come from AppContext, not form inputs - ensure they override any form data
    payload.Country = country;
    if (countryTimezoneId) payload.CountryTimezoneId = countryTimezoneId;
    payload.Event_Type = getEventTypeForBackend();
    if (Object.keys(images).length) payload.images = images;
    if (Object.keys(imageLayout).length) {
      // Send only sizing-relevant fields to backend
      const out = {};
      for (const [k, v] of Object.entries(imageLayout)) {
        if (!v || typeof v !== 'object') continue;
        if (v.mode === 'custom') {
          out[k] = { widthPercent: v.widthPercent };
        }
      }
      if (Object.keys(out).length) payload.imageLayout = out;
    }
    return payload;
  }, [data, images, imageLayout, country, countryTimezoneId, getEventTypeForBackend, computedFieldNames]);

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    
    // Validate required context values
    const eventType = getEventTypeForBackend();
    if (!eventType) {
      setError('Please select an Event Type before generating the document.');
      return;
    }
    if (!country) {
      setError('Please select a Country before generating the document.');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const res = await api(`/generate/${actionSlug}`, {
        method: 'POST',
        body: JSON.stringify({ ...buildPayload(), preview: false }),
      });
      if (!res.ok) {
        const d = await res.json();
        if (d.code === 'TRIAL_LIMIT') {
          const reason = d.reason || 'Subscribe to download complete DOCX documents.';
          throw new Error(`Trial limit reached. ${reason}`);
        }
        throw new Error(d.error || 'Failed to generate');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actionSlug}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Document generated and downloaded successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePreview = () => {
    setError('');
    setSuccess('');
    try {
      savePreviewDraft(actionSlug, buildPayload());
    } catch (e) {
      setError(
        e?.message?.includes('QuotaExceeded') || e?.name === 'QuotaExceededError'
          ? 'Preview data is too large to store (try smaller images).'
          : 'Could not open preview. Try again with smaller attachments.'
      );
      return;
    }
    navigate(`/form/${actionSlug}/preview`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] pb-10 dark:bg-slate-950">
        <Header />
        <div className="mx-auto max-w-[1228px] px-4 py-8">
          <div className="text-[14px] text-slate-600 dark:text-slate-400">Loading form…</div>
        </div>
      </div>
    );
  }

  if (metaError || !metadata?.ok) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] pb-10 dark:bg-slate-950">
        <Header />
        <div className="mx-auto max-w-[1228px] px-4 py-8">
          <AlertBox variant="error">{metaError || metadata?.error || 'Template not found'}</AlertBox>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-slate-700 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <span aria-hidden>←</span> Back
          </button>
        </div>
      </div>
    );
  }

  const fields = metadata.fields || [];
  // TYPE fields (Meeting_Type, Room_Type, etc.) go in header at top-right; exclude from sections
  const typeFields = fields.filter(
    (f) => f.type === 'select' && f.name !== 'Event_Type' && /_Type$/.test(f.name)
  );
  const sectionFields = fields.filter(
    (f) => !typeFields.some((tf) => tf.name === f.name)
  );
  const bySection = sectionFields.reduce((acc, f) => {
    const s = f.section || 'General';
    if (!acc[s]) acc[s] = [];
    acc[s].push(f);
    return acc;
  }, {});

  // Sort sections to ensure consistent order: Attachments always appears last
  const sectionOrder = ['Dates', 'Claimant Details', 'Venue Information', 'Times', 'Event Details', 'Accommodation', 'Notary', 'ENT Test', 'Distance & Options', 'General', 'Attachments'];
  const sortedSections = Object.entries(bySection).sort(([a], [b]) => {
    const aIdx = sectionOrder.indexOf(a);
    const bIdx = sectionOrder.indexOf(b);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  /** Same order as rendered section cards → next field on Enter (must not be a hook: code runs only after loading/error guards) */
  const nextFieldNameByField = (() => {
    const names = [];
    for (const [, fs] of sortedSections) {
      for (const f of fs) names.push(f.name);
    }
    const m = new Map();
    for (let i = 0; i < names.length - 1; i += 1) {
      m.set(names[i], names[i + 1]);
    }
    return m;
  })();

  const isArrangeVenue = actionSlug === 'arrange-venue';

  const sectionMap = (() => {
    const out = {};
    for (const [name, fs] of sortedSections) out[name] = fs;
    return out;
  })();

  /** Unified template UI: match arrange-venue card chrome on every action type */
  const clientCard = true;

  const renderField = (f) => {
    // Claimant_Name: datalist autosuggest (same styling on all template forms)
    if (f.name === 'Claimant_Name') {
      const listId = `claimant-options-${actionSlug}`;
      const effectivePlaceholder = resolveFieldPlaceholder(f);
      return (
        <div key={f.name} className={f.fullWidth ? 'col-span-full' : undefined}>
          <div className="w-full">
            <div style={{fontWeight:500}} className="mb-1.5 text-[15px] font-medium text-slate-900 dark:text-slate-100">{f.label}</div>
            <input
              id="form-field-Claimant_Name"
              list={listId}
              className="h-14 w-full rounded-[14px] border border-[#d9dbea] bg-[#f8f9fd] px-4 text-[18px] font-medium text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] hover:border-[#ff385c] hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#FF385C] transition-all duration-300 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-rose-500 dark:focus:ring-rose-900/40"
              placeholder={effectivePlaceholder}
              value={data[f.name] ?? ''}
              onChange={(e) => handleChange(f.name, e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const next = nextFieldNameByField.get('Claimant_Name');
                if (!next) return;
                e.preventDefault();
                document.getElementById(`form-field-${next}`)?.focus();
              }}
            />
            <datalist id={listId}>
              {claimantOptions.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>
        </div>
      );
    }

    return (
      <div key={f.name} className={f.fullWidth ? 'col-span-full' : undefined}>
        <FormField
          field={f}
          sectionTitle={f.section}
          value={getFieldValue(f)}
          onChange={handleChange}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          imageLayout={f.type === 'image' ? imageLayout[f.name] : undefined}
          onImageLayoutChange={handleImageLayoutChange}
          nextFieldName={nextFieldNameByField.get(f.name)}
          clientCard
        />
      </div>
    );
  };

  const renderSectionCard = (title) => {
    const sectionFields = sectionMap[title] || [];
    if (sectionFields.length === 0) return null;
    const cardPad = 'p-[2.5rem] md:p-[2.5rem]';
    return (
      <CardShell
        title={title}
        className={cardPad}
        contentClassName="pt-1"
        actions={null}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {sectionFields.map(renderField)}
        </div>
      </CardShell>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-12 dark:bg-slate-950">
      <Header />
      <div className="mx-auto max-w-6xl px-2 pt-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group mb-3 inline-flex items-center gap-3 rounded-xl py-2 text-slate-600 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.10)] transition group-hover:-translate-y-[1px] group-hover:bg-slate-50 group-hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)] dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:group-hover:bg-slate-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-500 transition group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
              <span className="text-[16px] font-medium text-slate-600 transition group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-slate-100">Back to Home</span>
            </button>
            <div className="text-[34px] font-sans font-[700] tracking-[-0.02em] text-slate-800 dark:text-slate-100">{slugToTitle(actionSlug)}</div>
            <div className="mt-1 text-[18px] font-semibold font-sans text-slate-500 dark:text-slate-400">{getEventTypeForBackend() || 'Deposition'}</div>
          </div>

          {typeFields.length > 0 ? (
            <div className="flex flex-col w-full items-start gap-3 sm:w-auto sm:items-end">
              {typeFields.map((f) => (
                <div key={f.name} className="text-right">
                  <TypeToggle
                    value={data[f.name] ?? f.default ?? ''}
                    options={f.options || []}
                    onChange={(opt) => handleChange(f.name, opt)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          {fields.length === 0 ? (
            <AlertBox variant="info">
              No template variables were detected in this template. If your document uses placeholders like {'{{Variable_Name}}'}, ensure the template file exists and is valid. You can still use Preview or Generate Document.
            </AlertBox>
          ) : isArrangeVenue ? (
            <TemplateMasonry>
              {['Dates', 'Claimant Details', 'Venue Information', 'Times'].map((title) => {
                const el = renderSectionCard(title);
                return el ? <MasonrySection key={title}>{el}</MasonrySection> : null;
              })}
              {(() => {
                const el = renderSectionCard('Event Details');
                return el ? <MasonrySection key="Event Details">{el}</MasonrySection> : null;
              })()}
              {(() => {
                const el = renderSectionCard('Attachments');
                return el ? (
                  <MasonrySection key="Attachments" fullWidth spacedTop>
                    {el}
                  </MasonrySection>
                ) : null;
              })()}
              {sortedSections
                .map(([section]) => section)
                .filter((s) => !['Dates', 'Claimant Details', 'Venue Information', 'Times', 'Event Details', 'Attachments'].includes(s))
                .map((s) => {
                  const el = renderSectionCard(s);
                  return el ? (
                    <MasonrySection key={s} fullWidth>
                      {el}
                    </MasonrySection>
                  ) : null;
                })}
            </TemplateMasonry>
          ) : (
            <TemplateMasonry>
              {sortedSections.map(([section]) => {
                const el = renderSectionCard(section);
                if (!el) return null;
                return (
                  <MasonrySection key={section} fullWidth={section === 'Attachments'} spacedTop={section === 'Attachments'}>
                    {el}
                  </MasonrySection>
                );
              })}
            </TemplateMasonry>
          )}
        </div>

        {error ? (
          <div className="mt-6">
            <AlertBox variant="error" onClose={() => setError('')}>
              {error}
            </AlertBox>
          </div>
        ) : null}
        {success ? (
          <div className="mt-4">
            <AlertBox variant="success" onClose={() => setSuccess('')}>
              {success}
            </AlertBox>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 pb-10 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full inline-flex items-center justify-center rounded-2xl border border-rose-500 bg-white px-5 py-3 text-[14px] font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-60 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700 sm:w-auto"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={submitLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60 dark:hover:bg-rose-500 sm:w-auto"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
            Generate Document
          </button>
        </div>
      </div>
    </div>
  );
}
