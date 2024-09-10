import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  id: string;
  required?: boolean;
  testId: string;
  error?: boolean;
  helperText?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ 
  value, 
  onChange, 
  label, 
  id, 
  required = false, 
  testId = '', 
  error = false,
  helperText = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <TextField
      variant="outlined"
      margin="normal"
      required={required}
      fullWidth
      name="password"
      label={label}
      type={showPassword ? 'text' : 'password'}
      id={id}
      autoComplete="password"
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      inputProps={{
        "data-testid": testId,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="Toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordField;
