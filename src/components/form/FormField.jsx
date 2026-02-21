/**
 * FormField: Renders the appropriate input component based on field definition.
 */

import { Box, TextField, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const INPUT_PROPS = { InputLabelProps: { shrink: true } };

export default function FormField({ field, value, onChange, onImageUpload, onImageRemove, error }) {
  const { name, type, label, placeholder, options = [], fullWidth } = field;

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
    return (
      <TextField
        {...common}
        label={label}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
    );
  }

  if (type === 'time') {
    return (
      <TextField
        {...common}
        label={label}
        type="time"
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
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
            {label} (PNG, JPEG, GIF, WebP – max 5MB)
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
