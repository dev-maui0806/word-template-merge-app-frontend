/**
 * Full-page document preview (replaces modal). Loads preview via saved draft + generate API.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { loadPreviewDraft } from '../utils/previewDraftStore.js';

export default function DocumentPreviewPage() {
  const { actionSlug } = useParams();
  const navigate = useNavigate();
  const previewContentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewBlob, setPreviewBlob] = useState(null);
  /** When false, document is read-only (preview); when true, user can edit. */
  const [isEditMode, setIsEditMode] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError('');
    setLoading(true);

    const draft = loadPreviewDraft(actionSlug);
    if (!draft || typeof draft !== 'object') {
      setError('No preview data found. Return to the form and choose Preview again.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api(`/generate/${actionSlug}`, {
          method: 'POST',
          body: JSON.stringify({ ...draft, preview: true }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || 'Failed to load preview');
        }
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const { default: mammoth } = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (cancelled) return;
        setPreviewHtml(result.value);
        setPreviewBlob(blob);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actionSlug]);

  useEffect(() => {
    if (!previewHtml || loading) return;
    const el = previewContentRef.current;
    if (!el) return;
    const fill = () => {
      if (el && !el.innerHTML.trim()) {
        el.innerHTML = previewHtml;
      }
    };
    fill();
    const t = setTimeout(fill, 50);
    return () => clearTimeout(t);
  }, [previewHtml, loading]);

  const handleBack = useCallback(() => {
    navigate(`/form/${actionSlug}`);
  }, [navigate, actionSlug]);

  const handleDownloadDocx = useCallback(async () => {
    const fromRef = previewContentRef.current?.innerHTML;
    if (fromRef && fromRef.trim()) {
      setDownloadBusy(true);
      try {
        const res = await api(`/generate/${actionSlug}/edited-docx`, {
          method: 'POST',
          body: JSON.stringify({ html: fromRef }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || 'Failed to generate DOCX');
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${actionSlug}-edited.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        setError(e.message || 'Failed to download');
      } finally {
        setDownloadBusy(false);
      }
      return;
    }
    if (!previewBlob) return;
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${actionSlug}-preview.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [actionSlug, previewBlob]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      const next = !prev;
      if (next) {
        queueMicrotask(() => {
          previewContentRef.current?.focus();
        });
      } else {
        previewContentRef.current?.blur();
      }
      return next;
    });
  }, []);

  return (
    <div className="document-preview-print-root min-h-screen bg-[#f3f4f6] print:min-h-0 print:bg-white">
      <header className="no-print sticky top-0 z-20 border-b border-slate-200/80 bg-white shadow-sm print:hidden">
        <div className="mx-auto flex max-w-8xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Back to form"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight text-slate-900 sm:text-[20px]">Document Preview</h1>
              <p className="mt-0.5 text-[14px] text-slate-500">Review and edit before downloading</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={toggleEditMode}
              aria-pressed={isEditMode}
              className={[
                'inline-flex items-center gap-2 px-5 py-2 text-[14px] font-semibold shadow-sm transition',
                isEditMode
                  ? 'rounded-xl border-2 border-[#a4f4cf] bg-[#ecfdf5] text-[#007a55] hover:bg-[#d0fae5]'
                  : 'rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
              ].join(' ')}
            >
              {isEditMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
              {isEditMode ? 'Done Editing' : 'Edit document'}
            </button>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={downloadBusy || (!previewBlob && !previewHtml)}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
              title="Download the current document as a Word file (includes your edits)"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M4 21h16" />
              </svg>
              Download Doc
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-slate-600">Generating preview…</div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
            {error}
            <button
              type="button"
              onClick={() => navigate(`/form/${actionSlug}`)}
              className="mt-3 block text-[14px] font-semibold text-rose-700 underline"
            >
              Back to form
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-[680px] print:max-w-none">
            {isEditMode ? (
              <div className="no-print mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => previewContentRef.current?.focus()}
                  className="inline-flex items-center gap-2.5 rounded-full bg-neutral-900 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-neutral-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px] shrink-0"
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Click Anywhere To Edit</span>
                </button>
              </div>
            ) : null}
            <div
              className={[
                'rounded-xl bg-white px-6 py-10 md:px-12 md:py-14 print:rounded-none',
                isEditMode
                  ? 'border-2 border-[#00bc7d30] shadow-[0_0_0_1px_rgba(0,121,107,0.12),0_3px_4px_-3px_rgba(56,189,248,0.45),0_0_10px_-5px_rgba(14,165,233,0.35)]'
                  : 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.06)]',
                'print:border-0 print:shadow-none',
              ].join(' ')}
            >
              <div
                ref={previewContentRef}
                contentEditable={isEditMode}
                suppressContentEditableWarning
                className={[
                  'min-h-[50vh] w-full outline-none print:min-h-0',
                  isEditMode ? '' : 'cursor-default select-text',
                ].join(' ')}
                style={{
                  fontFamily: '"Aptos", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: '13pt',
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
