import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_CONFIG } from '../../config/recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  onError?: () => void;
  size?: 'compact' | 'normal' | 'invisible';
  theme?: 'light' | 'dark';
  className?: string;
}

export interface ReCaptchaRef {
  reset: () => void;
  execute: () => void;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(({
  onVerify,
  onExpire,
  onError,
  size = 'normal',
  theme = 'light',
  className = ''
}, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      recaptchaRef.current?.reset();
    },
    execute: () => {
      recaptchaRef.current?.execute();
    }
  }));

  const handleVerify = (token: string | null) => {
    onVerify(token);
  };

  const handleExpire = () => {
    onExpire?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_CONFIG.SITE_KEY}
        onChange={handleVerify}
        onExpired={handleExpire}
        onError={handleError}
        size={size}
        theme={theme}
      />
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;