import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AuthService from '../AuthService';
import LoginFormProps from './types';
import useStyles from './useStyles';

const LoginForm = (props: LoginFormProps) => {
  const {
    userNamePlaceholder,
    passwordPlaceholder,
    host,
    onSuccess,
    onError,
    showRememberMe,
    onResetPassword,
    showResetPassword,
    rememberMeLabelText = 'Remember me?',
    resetPasswordLabelText = 'Reset password',
    loginButtonText = 'Login',
    backButtonText = 'Back',
    textFieldVariant = 'outlined',
    otpAuthPlaceholder = 'Two Factor Authenticator',
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [otpAuthenticatorIds, setOtpAuthenticatorIds] = useState([]);
  const [form, setForm] = useState({
    id: '',
    password: '',
    rememberMe: showRememberMe,
    otpAuthenticator: null,
    otp: null,
  });
  const classes = useStyles();
  const auth = new AuthService(host);
  const validate = () => form.id && form.password;

  const handleChange = (name: string, value: string | boolean) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(false);

    if (validate()) {
      setLoading(true);
    }

    auth.login(
      form,
      (otpInfo) => {
        setTwoFA(otpInfo.otpRequired);
        setOtpAuthenticatorIds(otpInfo.otpAuthenticatorIds);
        setLoading(false);
      },
      (user, token) => {
        console.log('login success');
        setLoading(false);

        if (onSuccess != null) {
          onSuccess(user, token);
        }
      },
      (error) => {
        console.log('login error');
        setLoading(false);
        setError(true);

        if (onError != null) {
          onError(error);
        }
      },
    );
  };

  const handleBack = () => {
    setTwoFA(false);
    setError(false);

    setForm({
      ...form,
      otpAuthenticator: null,
      otp: null,
    });
  };

  const handleDefaultAuthenticator = () => {
    setForm({
      ...form,
      otpAuthenticator: otpAuthenticatorIds[0] || null,
    });
  };

  useEffect(() => {
    handleDefaultAuthenticator();
  }, [otpAuthenticatorIds]);

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error">{`Username ${
          twoFA ? 'or Two Factor Authenticator are invalid' : 'and/or password is invalid'
        }`}</Alert>
      )}

      {twoFA ? (
        <>
          <Typography>Please select your 2 Two Factor Authenticator</Typography>
          <FormControl variant="outlined" fullWidth margin="dense">
            <InputLabel shrink id="demo-simple-select-outlined-label" className={classes.shrink}>
              Authenticator
            </InputLabel>
            <Select
              fullWidth
              defaultValue={form?.otpAuthenticator}
              value={form?.otpAuthenticator}
              id="otpAuthenticator"
              label="Authenticator"
              onChange={(e) => handleChange('otpAuthenticator', e.target.value as string)}
            >
              {otpAuthenticatorIds?.map((item, index) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            type="number"
            onChange={(e) => handleChange('otp', e.target.value)}
            label={otpAuthPlaceholder}
            error={error}
            variant={textFieldVariant as 'outlined' | 'standard' | 'filled'}
          />
        </>
      ) : (
        <>
          <TextField
            required
            fullWidth
            name="id"
            error={error}
            margin="dense"
            value={form.id}
            onChange={(e) => handleChange('id', e.target.value)}
            label={userNamePlaceholder}
            variant={textFieldVariant as 'outlined' | 'standard' | 'filled'}
          />
          <TextField
            required
            fullWidth
            margin="dense"
            type="password"
            onChange={(e) => handleChange('password', e.target.value)}
            label={passwordPlaceholder}
            variant={textFieldVariant as 'outlined' | 'standard' | 'filled'}
          />
        </>
      )}
      <div className={classes.rememberMe}>
        {showRememberMe && (
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={form.rememberMe}
                color="primary"
                onChange={(e) => handleChange('rememberMe', e.target.checked)}
              />
            }
            label={<Typography className={classes.labels}>{rememberMeLabelText}</Typography>}
          />
        )}
      </div>
      <div className={classes.submit}>
        {showResetPassword && (
          <Button
            className={classes.rememberMeLink}
            onClick={
              onResetPassword
                ? () => {
                    onResetPassword(true);
                  }
                : undefined
            }
          >
            <Typography className={classes.labels}>{resetPasswordLabelText}</Typography>
          </Button>
        )}
        {twoFA && (
          <Button type="submit" className={classes.button} color="secondary" variant="contained" onClick={handleBack}>
            {backButtonText}
          </Button>
        )}

        <Button type="submit" color="primary" variant="contained">
          {loading ? <CircularProgress color="inherit" size={24} /> : loginButtonText}
        </Button>
      </div>
    </form>
  );
};

export { LoginFormProps, LoginForm };
