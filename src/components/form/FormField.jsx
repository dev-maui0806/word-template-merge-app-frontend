/**
 * FormField: Renders the appropriate input component based on field definition.
 */

import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import DateWheelPickerDialog from '../pickers/DateWheelPickerDialog.jsx';
import TimeWheelPickerDialog from '../pickers/TimeWheelPickerDialog.jsx';
import { resolveFieldPlaceholder } from '../../utils/fieldPlaceholder.js';

function AutoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
      Auto
    </span>
  );
}

function FieldShell({ label, children, error, rightMeta, clientCard }) {
  const labelCls = clientCard ? 'text-[#364153] text-[15px] font-semibold text-slate-900' : 'text-[#364153] text-[12px] font-medium text-slate-700';
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className={labelCls}>{label}</label>
        {rightMeta}
      </div>
      {children}
      {error ? <div className="mt-1 text-[12px] text-red-600">{error}</div> : null}
    </div>
  );
}

function clientInputClass({ clientCard, computed, hasValue }) {
  if (!clientCard) {
    return 'h-14 w-full rounded-xl border border-slate-200 bg-white px-3 text-[17px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200';
  }
  const color = computed && hasValue ? 'text-[#4f46e5]' : 'text-slate-800';
  return [
    'h-14 w-full rounded-[14px] border border-[#d9dbea] bg-[#f8f9fd] px-4 text-[17px] font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] hover:border-[#ff385c] hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#FF385C] transition-all duration-300',
    color,
  ].join(' ');
}

function InputBase({ value, onChange, placeholder, type = 'text', readOnly, onClick, className }) {
  return (
    <input
      className={className}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      onClick={onClick}
    />
  );
}

function TextAreaBase({ value, onChange, placeholder, readOnly, className }) {
  return (
    <textarea
      className={className}
      rows={4}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function InputIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <div className="text-slate-400">{children}</div>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-8 rounded-full px-3 text-[13px] font-medium transition',
        active ? 'bg-rose-500 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function FormField({
  field,
  sectionTitle: _sectionTitle,
  value,
  onChange,
  onImageUpload,
  onImageRemove,
  imageLayout,
  onImageLayoutChange,
  error,
  clientCard = false,
}) {
  const { name, type, label, options = [], fullWidth, computed: fieldComputed, autoBadge: fieldAutoBadge } = field;
  const computed = !!fieldComputed;
  const effectivePlaceholder = resolveFieldPlaceholder(field);

  const safeChange = (n, v) => {
    if (computed) return;
    onChange(n, v);
  };

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const autoMeta = computed || fieldAutoBadge ? <AutoBadge /> : null;
  const hasVal = (v) => v != null && String(v).trim() !== '';

  if (type === 'text') {
    const base = clientInputClass({ clientCard, computed, hasValue: hasVal(value) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <InputBase
          value={value ?? ''}
          onChange={(e) => safeChange(name, e.target.value)}
          placeholder={effectivePlaceholder}
          readOnly={computed}
          className={[base, computed ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'textarea') {
    const base = [
      clientCard
        ? 'min-h-[120px] w-full rounded-[14px] border border-[#d9dbea] bg-[#f8f9fd] px-4 py-3 text-[17px] text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100'
        : 'min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[17px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200',
    ].join(' ');
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <TextAreaBase
          value={value ?? ''}
          onChange={(e) => safeChange(name, e.target.value)}
          placeholder={effectivePlaceholder}
          readOnly={computed}
          className={[base, computed ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'date' && computed) {
    const raw = value ?? '';
    const d = raw ? dayjs(raw) : null;
    const display =
      raw && d?.isValid() ? (clientCard ? d.format('MM/DD/YYYY') : d.format('DD/MM/YYYY')) : String(raw || '');
    const base = clientInputClass({ clientCard, computed: true, hasValue: hasVal(display) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <div className="relative">
          <InputBase
            value={display}
            onChange={() => {}}
            placeholder={effectivePlaceholder}
            readOnly
            className={[base, 'cursor-default pr-10'].join(' ')}
          />
          <InputIcon>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v3M16 2v3" />
              <path d="M3 9h18" />
              <path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
          </InputIcon>
        </div>
      </FieldShell>
    );
  }

  if (type === 'date') {
    const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;
    const display = dateValue ? (clientCard ? dateValue.format('MM/DD/YYYY') : dateValue.format('DD/MM/YYYY')) : '';
    const base = clientInputClass({ clientCard, computed: false, hasValue: hasVal(display) });
    return (
      <>
        <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              value={display}
              onChange={() => {}}
              placeholder={effectivePlaceholder}
              readOnly
              onClick={() => setDatePickerOpen(true)}
              className={[base, 'cursor-pointer pr-10'].join(' ')}
            />
            <InputIcon>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v3M16 2v3" />
                <path d="M3 9h18" />
                <path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
              </svg>
            </InputIcon>
          </div>
        </FieldShell>
        <DateWheelPickerDialog
          open={datePickerOpen}
          value={value || ''}
          onClose={() => setDatePickerOpen(false)}
          onConfirm={(iso) => {
            safeChange(name, iso);
          }}
        />
      </>
    );
  }

  if (type === 'time') {
    const timeValue = value && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(String(value))
      ? dayjs(`1970-01-01T${value}`)
      : null;
    const display = timeValue ? timeValue.format('HH:mm') : '';
    const base = clientInputClass({ clientCard, computed, hasValue: hasVal(display) });

    if (computed) {
      return (
        <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              value={display}
              onChange={() => {}}
              placeholder={effectivePlaceholder}
              readOnly
              className={[base, 'cursor-default pr-10'].join(' ')}
            />
            <InputIcon>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v5l3 2" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </InputIcon>
          </div>
        </FieldShell>
      );
    }

    return (
      <>
        <FieldShell label={label} error={error} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              value={display}
              onChange={() => {}}
              placeholder={effectivePlaceholder}
              readOnly
              onClick={() => setTimePickerOpen(true)}
              className={[base, 'cursor-pointer pr-10'].join(' ')}
            />
            <InputIcon>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v5l3 2" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </InputIcon>
          </div>
        </FieldShell>
        <TimeWheelPickerDialog
          open={timePickerOpen}
          value={display}
          onClose={() => setTimePickerOpen(false)}
          onConfirm={(timeStr) => {
            safeChange(name, timeStr);
          }}
        />
      </>
    );
  }

  if (type === 'number') {
    const base = clientInputClass({ clientCard, computed, hasValue: hasVal(value) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <InputBase
          type={computed ? 'text' : 'number'}
          value={value ?? ''}
          onChange={(e) => safeChange(name, e.target.value)}
          placeholder={effectivePlaceholder}
          readOnly={computed}
          className={[base, computed ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'select') {
    if (!options || options.length === 0) {
      return (
        <FieldShell label={label} error={error} clientCard={clientCard}>
          <InputBase
            value={value ?? ''}
            onChange={(e) => safeChange(name, e.target.value)}
            placeholder={effectivePlaceholder}
            className={clientInputClass({ clientCard, computed: false, hasValue: hasVal(value) })}
          />
        </FieldShell>
      );
    }
    return (
      <FieldShell label={label} error={error} clientCard={clientCard}>
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt) => (
            <Pill key={opt} active={(value ?? '') === opt} onClick={() => safeChange(name, opt)}>
              {opt}
            </Pill>
          ))}
        </div>
      </FieldShell>
    );
  }

  if (type === 'image') {
    const images = Array.isArray(value) ? value : value ? [value] : [];
    const hasImage = images.length > 0;
    const sizingMode = imageLayout?.mode || 'auto';
    const widthPercent = Number.isFinite(Number(imageLayout?.widthPercent)) ? Number(imageLayout?.widthPercent) : 100;
    const showLabelRow = label != null && String(label).trim() !== '';

    const addBtnClass = clientCard
      ? 'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-400 bg-white px-3 text-[13px] font-semibold text-rose-500 shadow-sm hover:bg-rose-50'
      : 'inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50';

    return (
      <div className={fullWidth ? 'col-span-full' : undefined}>
        <div className={`flex items-center justify-between ${showLabelRow ? '' : 'justify-end'}`}>
          {showLabelRow ? <div className={clientCard ? 'text-[15px] font-bold text-slate-900' : 'text-[12px] font-medium text-slate-700'}>{label}</div> : <span />}
          <button type="button" onClick={() => fileInputRef.current?.click()} className={addBtnClass}>
            {clientCard ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            ) : null}
            Add Files
          </button>
        </div>
        <label
          className="mt-3 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 text-center shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []).filter((f) => f?.type?.startsWith('image/'));
            if (files.length === 1) onImageUpload?.(name, files[0]);
            if (files.length > 1) onImageUpload?.(name, files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []).filter((f) => f?.type?.startsWith('image/'));
              if (files.length === 1) onImageUpload?.(name, files[0]);
              if (files.length > 1) onImageUpload?.(name, files);
              e.target.value = '';
            }}
            hidden
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </div>
          <div className="text-[14px] font-semibold text-slate-600">No attachments yet</div>
          <div className="text-[13px] text-slate-400">Click &apos;Add Files&apos; to upload images or documents.</div>
        </label>
        {hasImage && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={typeof img === 'string' ? img : img?.preview}
                    alt="Uploaded"
                    className="h-[140px] w-[140px] rounded-2xl border border-slate-200 bg-white object-contain p-1 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove?.(name, index)}
                    className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[14px] font-semibold text-white shadow-sm hover:bg-rose-600"
                    aria-label="Remove"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="w-full max-w-[420px]">
              <label className="flex items-center gap-2 text-[14px] text-slate-700">
                <input
                  type="checkbox"
                  checked={sizingMode === 'custom'}
                  onChange={(e) => {
                    onImageLayoutChange?.(name, {
                      ...(imageLayout || {}),
                      mode: e.target.checked ? 'custom' : 'auto',
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-200"
                />
                Custom size
              </label>
              {sizingMode === 'custom' && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 text-[12px] font-medium text-slate-600">Width (% of page content)</div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={Math.min(100, Math.max(10, widthPercent || 100))}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      onImageLayoutChange?.(name, {
                        ...(imageLayout || {}),
                        mode: 'custom',
                        widthPercent: Number.isFinite(next) ? next : 100,
                      });
                    }}
                    className="w-full accent-rose-500"
                  />
                  <div className="mt-2">
                    <FieldShell label="Width (%)">
                      <InputBase
                        type="number"
                        value={Math.min(100, Math.max(10, widthPercent || 100))}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          onImageLayoutChange?.(name, {
                            ...(imageLayout || {}),
                            mode: 'custom',
                            widthPercent: Number.isFinite(next) ? next : 100,
                          });
                        }}
                        className={clientInputClass({ clientCard: false, computed: false, hasValue: true })}
                      />
                    </FieldShell>
                    <div className="mt-1 text-[12px] text-slate-500">Keeps aspect ratio. Preview + final DOCX will use this size.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <FieldShell label={label} error={error} clientCard={clientCard}>
      <InputBase
        value={value ?? ''}
        onChange={(e) => safeChange(name, e.target.value)}
        placeholder={effectivePlaceholder}
        className={clientInputClass({ clientCard, computed: false, hasValue: hasVal(value) })}
      />
    </FieldShell>
  );
}
