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
  const labelCls = clientCard
    ? 'text-[#364153] text-[15px] font-semibold text-slate-900 dark:text-slate-100'
    : 'text-[#364153] text-[12px] font-medium text-slate-700 dark:text-slate-300';
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className={labelCls}>{label}</label>
        {rightMeta}
      </div>
      {children}
      {error ? <div className="mt-1 text-[12px] text-red-600 dark:text-red-400">{error}</div> : null}
    </div>
  );
}

function clientInputClass({ clientCard, computed, hasValue }) {
  if (!clientCard) {
    return 'h-14 w-full rounded-xl border border-slate-200 bg-white px-3 text-[17px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-rose-500 dark:focus:ring-rose-900/40';
  }
  const color = computed && hasValue ? 'text-[#4f46e5] dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100';
  return [
    'h-14 w-full rounded-[14px] border border-[#d9dbea] bg-[#f8f9fd] px-4 text-[17px] font-medium placeholder:text-slate-400 placeholder:font-normal shadow-sm outline-none transition focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] hover:border-[#ff385c] hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#FF385C] transition-all duration-300 dark:border-slate-600 dark:bg-slate-800/90 dark:placeholder:text-slate-500 dark:focus:border-rose-500',
    color,
  ].join(' ');
}

function focusFormFieldByName(fieldName) {
  if (!fieldName) return;
  const el = document.getElementById(`form-field-${fieldName}`);
  if (el && typeof el.focus === 'function') el.focus();
}

/** Enter advances to next field. Textarea: Ctrl+Enter or Cmd+Enter advances; plain Enter inserts newline. */
function handleEnterToNextField(e, nextFieldName, options = {}) {
  const { textarea = false } = options;
  if (!nextFieldName || e.key !== 'Enter') return;
  if (textarea) {
    if (!(e.ctrlKey || e.metaKey)) return;
  }
  e.preventDefault();
  focusFormFieldByName(nextFieldName);
}

function InputBase({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
  onClick,
  className,
  id,
  onKeyDown,
  inputMode,
  pattern,
}) {
  return (
    <input
      id={id}
      className={className}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      onClick={onClick}
      onKeyDown={onKeyDown}
      inputMode={inputMode}
      pattern={pattern}
    />
  );
}

function TextAreaBase({ value, onChange, placeholder, readOnly, className, id, onKeyDown }) {
  return (
    <textarea
      id={id}
      className={className}
      rows={4}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      onKeyDown={onKeyDown}
    />
  );
}

function InputIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <div className="text-slate-400 dark:text-slate-500">{children}</div>
    </div>
  );
}

function Pill({ active, children, onClick, id, onKeyDown }) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={[
        'h-8 rounded-full px-3 text-[13px] font-medium transition',
        active ? 'bg-rose-500 text-white dark:bg-rose-600' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
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
  nextFieldName,
}) {
  const { name, type, label, options = [], fullWidth, computed: fieldComputed, autoBadge: fieldAutoBadge } = field;
  const computed = !!fieldComputed;
  const normalizedName = String(name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isLockedAutoField = normalizedName === 'EVENTTYPE' || normalizedName === 'EVENTDAY';
  const isReadOnlyField = isLockedAutoField;
  const computedForStyle = computed && isReadOnlyField;
  const effectivePlaceholder = resolveFieldPlaceholder(field);

  const safeChange = (n, v) => {
    if (isReadOnlyField) return;
    onChange(n, v);
  };

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const autoMeta = computed || fieldAutoBadge ? <AutoBadge /> : null;
  const hasVal = (v) => v != null && String(v).trim() !== '';
  const fieldText = `${String(name || '')} ${String(label || '')}`.toLowerCase();
  const isStrictNumericTextField =
    type === 'text' &&
    (fieldText.includes('venue number') || String(name || '').toUpperCase() === 'VENUE_NUMBER');

  if (type === 'text') {
    const base = clientInputClass({ clientCard, computed: computedForStyle, hasValue: hasVal(value) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <InputBase
          id={`form-field-${name}`}
          value={value ?? ''}
          onChange={(e) => {
            const next = isStrictNumericTextField
              ? String(e.target.value || '').replace(/\D+/g, '')
              : e.target.value;
            safeChange(name, next);
          }}
          placeholder={effectivePlaceholder}
          readOnly={isReadOnlyField}
          onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
          inputMode={isStrictNumericTextField ? 'numeric' : undefined}
          pattern={isStrictNumericTextField ? '[0-9]*' : undefined}
          className={[base, isReadOnlyField ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'textarea') {
    const base = [
      clientCard
        ? 'min-h-[120px] w-full rounded-[14px] border border-[#d9dbea] bg-[#f8f9fd] px-4 py-3 text-[17px] text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] hover:border-[#ff385c] hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#FF385C] transition-all duration-300 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-rose-500 dark:focus:ring-rose-900/40'
        : 'min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[17px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-[#ff385c] focus:ring-1 focus:ring-[#ff385c] hover:border-[#ff385c] hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#FF385C] transition-all duration-300 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-rose-500 dark:focus:ring-rose-900/40',
    ].join(' ');
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <TextAreaBase
          id={`form-field-${name}`}
          value={value ?? ''}
          onChange={(e) => safeChange(name, e.target.value)}
          placeholder={effectivePlaceholder}
          readOnly={isReadOnlyField}
          onKeyDown={(e) => handleEnterToNextField(e, nextFieldName, { textarea: true })}
          className={[base, isReadOnlyField ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'date' && isReadOnlyField) {
    const raw = value ?? '';
    const d = raw ? dayjs(raw) : null;
    const display = raw && d?.isValid() ? d.format('DD/MM/YYYY') : String(raw || '');
    const base = clientInputClass({ clientCard, computed: true, hasValue: hasVal(display) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <div className="relative">
          <InputBase
            id={`form-field-${name}`}
            value={display}
            onChange={() => {}}
            placeholder="dd/mm/yyyy"
            readOnly
            onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
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
    const display = dateValue ? dateValue.format('DD/MM/YYYY') : '';
    const base = clientInputClass({ clientCard, computed: false, hasValue: hasVal(display) });
    return (
      <>
        <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              id={`form-field-${name}`}
              value={display}
              onChange={() => {}}
              placeholder="dd/mm/yyyy"
              readOnly
              onClick={() => setDatePickerOpen(true)}
              onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
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
    const base = clientInputClass({ clientCard, computed: computedForStyle, hasValue: hasVal(display) });

    if (isReadOnlyField) {
      return (
        <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              id={`form-field-${name}`}
              value={display}
              onChange={() => {}}
              placeholder={effectivePlaceholder}
              readOnly
              onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
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
        <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
          <div className="relative">
            <InputBase
              id={`form-field-${name}`}
              value={display}
              onChange={() => {}}
              placeholder={effectivePlaceholder}
              readOnly
              onClick={() => setTimePickerOpen(true)}
              onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
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
    const base = clientInputClass({ clientCard, computed: computedForStyle, hasValue: hasVal(value) });
    return (
      <FieldShell label={label} error={error} rightMeta={autoMeta} clientCard={clientCard}>
        <InputBase
          id={`form-field-${name}`}
          type={isReadOnlyField ? 'text' : 'number'}
          value={value ?? ''}
          onChange={(e) => safeChange(name, e.target.value)}
          placeholder={effectivePlaceholder}
          readOnly={isReadOnlyField}
          onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
          className={[base, isReadOnlyField ? 'cursor-default' : ''].join(' ')}
        />
      </FieldShell>
    );
  }

  if (type === 'select') {
    if (!options || options.length === 0) {
      return (
        <FieldShell label={label} error={error} clientCard={clientCard}>
          <InputBase
            id={`form-field-${name}`}
            value={value ?? ''}
            onChange={(e) => safeChange(name, e.target.value)}
            placeholder={effectivePlaceholder}
            onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
            className={clientInputClass({ clientCard, computed: false, hasValue: hasVal(value) })}
          />
        </FieldShell>
      );
    }
    return (
      <FieldShell label={label} error={error} clientCard={clientCard}>
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt, idx) => (
            <Pill
              key={opt}
              id={idx === 0 ? `form-field-${name}` : undefined}
              active={(value ?? '') === opt}
              onClick={() => safeChange(name, opt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  focusFormFieldByName(nextFieldName);
                }
              }}
            >
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
      ? 'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-400 bg-white px-3 text-[13px] font-semibold text-rose-500 shadow-sm hover:bg-rose-50 dark:border-rose-500 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700'
      : 'inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

    return (
      <div className={fullWidth ? 'col-span-full' : undefined}>
        <div className={`flex items-center justify-between ${showLabelRow ? '' : 'justify-end'}`}>
          {showLabelRow ? (
            <div className={clientCard ? 'text-[15px] font-bold text-slate-900 dark:text-slate-100' : 'text-[12px] font-medium text-slate-700 dark:text-slate-300'}>
              {label}
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            id={`form-field-${name}`}
            onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
            onClick={() => fileInputRef.current?.click()}
            className={addBtnClass}
          >
            {clientCard ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            ) : null}
            Add Files
          </button>
        </div>
        <label
          className="mt-3 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 text-center shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50 dark:shadow-none dark:hover:bg-slate-800"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-600">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </div>
          <div className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">No attachments yet</div>
          <div className="text-[13px] text-slate-400 dark:text-slate-500">Click &apos;Add Files&apos; to upload images or documents.</div>
        </label>
        {hasImage && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={typeof img === 'string' ? img : img?.preview}
                    alt="Uploaded"
                    className="h-[140px] w-[140px] rounded-2xl border border-slate-200 bg-white object-contain p-1 shadow-sm dark:border-slate-600 dark:bg-slate-900"
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
              <label className="flex items-center gap-2 text-[14px] text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={sizingMode === 'custom'}
                  onChange={(e) => {
                    onImageLayoutChange?.(name, {
                      ...(imageLayout || {}),
                      mode: e.target.checked ? 'custom' : 'auto',
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-200 dark:border-slate-600 dark:focus:ring-rose-900/40"
                />
                Custom size
              </label>
              {sizingMode === 'custom' && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:shadow-none">
                  <div className="mb-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">Width (% of page content)</div>
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
                    <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Keeps aspect ratio. Preview + final DOCX will use this size.</div>
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
        id={`form-field-${name}`}
        value={value ?? ''}
        onChange={(e) => safeChange(name, e.target.value)}
        placeholder={effectivePlaceholder}
        onKeyDown={(e) => handleEnterToNextField(e, nextFieldName)}
        className={clientInputClass({ clientCard, computed: false, hasValue: hasVal(value) })}
      />
    </FieldShell>
  );
}
