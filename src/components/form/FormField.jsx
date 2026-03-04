/**
 * FormField: Renders the appropriate input component based on field definition.
 */

import { useState } from 'react';
import dayjs from 'dayjs';
import { Box, TextField, Chip, Slider, FormControlLabel, Switch } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DateWheelPickerDialog from '../pickers/DateWheelPickerDialog.jsx';
import TimeWheelPickerDialog from '../pickers/TimeWheelPickerDialog.jsx';

const INPUT_PROPS = { InputLabelProps: { shrink: true } };

export default function FormField({
  field,
  value,
  onChange,
  onImageUpload,
  onImageRemove,
  imageLayout,
  onImageLayoutChange,
  error,
}) {
  const { name, type, label, placeholder, options = [], fullWidth } = field;

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const common = {
    fullWidth: true,
    size: 'medium',
    error: !!error,
    helperText: error,
    ...INPUT_PROPS,
  };

  if (type === 'text') {
    return (
      <TextField
        {...common}
        label={label}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (type === 'date') {
    const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;
    const display = dateValue ? dateValue.format('DD MMM YYYY') : '';
    return (
      <>
        <TextField
          {...common}
          label={label}
          value={display}
          onClick={() => setDatePickerOpen(true)}
          placeholder={placeholder}
          InputProps={{
            readOnly: true,
          }}
        />
        <DateWheelPickerDialog
          open={datePickerOpen}
          value={value || ''}
          onClose={() => setDatePickerOpen(false)}
          onConfirm={(iso) => {
            onChange(name, iso);
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
    return (
      <>
        <TextField
          {...common}
          label={label}
          value={display}
          onClick={() => setTimePickerOpen(true)}
          placeholder={placeholder}
          InputProps={{
            readOnly: true,
          }}
        />
        <TimeWheelPickerDialog
          open={timePickerOpen}
          value={display}
          onClose={() => setTimePickerOpen(false)}
          onConfirm={(timeStr) => {
            onChange(name, timeStr);
          }}
        />
      </>
    );
  }

  if (type === 'number') {
    return (
      <TextField
        {...common}
        label={label}
        type="number"
        inputProps={{ min: 0, step: 0.01 }}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (type === 'select') {
    // When no options are provided (e.g. unknown *Type variable), show a text input so the field is always editable
    if (!options || options.length === 0) {
      return (
        <TextField
          {...common}
          label={label}
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
        />
      );
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
        <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }}>
          {label}:
        </Box>
        {options.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            onClick={() => onChange(name, opt)}
            variant={value === opt ? 'filled' : 'outlined'}
            color={value === opt ? 'primary' : 'default'}
            size="medium"
            sx={{ borderRadius: '999px' }}
          />
        ))}
      </Box>
    );
  }

  if (type === 'image') {
    const hasImage = !!value;
    const sizingMode = imageLayout?.mode || 'auto'; // auto | custom
    const widthPercent = Number.isFinite(Number(imageLayout?.widthPercent)) ? Number(imageLayout?.widthPercent) : 100;
    return (
      <Box sx={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            minHeight: 120,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type?.startsWith('image/')) onImageUpload?.(name, file);
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload?.(name, file);
              e.target.value = '';
            }}
            hidden
          />
          <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {label} (PNG, JPEG, GIF, WebP – max 25MB)
          </Box>
        </Box>
        {hasImage && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
            <Box
              component="img"
              src={typeof value === 'string' ? value : value?.preview}
              alt="Uploaded"
              sx={{
                maxWidth: 200,
                maxHeight: 200,
                objectFit: 'contain',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.5,
              }}
            />
            <Box sx={{ width: '100%', maxWidth: 420 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sizingMode === 'custom'}
                    onChange={(e) => {
                      onImageLayoutChange?.(name, {
                        ...(imageLayout || {}),
                        mode: e.target.checked ? 'custom' : 'auto',
                      });
                    }}
                  />
                }
                label="Custom size"
              />
              {sizingMode === 'custom' && (
                <Box sx={{ px: 1, pb: 1 }}>
                  <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
                    Width (% of page content)
                  </Box>
                  <Slider
                    value={Math.min(100, Math.max(10, widthPercent || 100))}
                    min={10}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                    onChange={(_, v) => {
                      const next = Array.isArray(v) ? v[0] : v;
                      onImageLayoutChange?.(name, {
                        ...(imageLayout || {}),
                        mode: 'custom',
                        widthPercent: next,
                      });
                    }}
                  />
                  <TextField
                    {...common}
                    label="Width (%)"
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
                    helperText="Keeps aspect ratio. Preview + final DOCX will use this size."
                  />
                </Box>
              )}
            </Box>
            <Chip label="Remove" size="small" color="error" variant="outlined" onClick={() => onImageRemove?.(name)} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <TextField
      {...common}
      label={label}
      value={value ?? ''}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
    />
  );
}
