import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword, verifyResetCode, resetPassword } from '../api/authApi';

const STEP_INDEX = { email: 0, code: 1, password: 2, done: 3 };

function StepIndicator({ step }) {
  const current = STEP_INDEX[step];
  return (
    <div className="auth-steps">
      {[0, 1, 2].map((dotIndex) => (
        <div key={dotIndex} className="d-flex align-items-center flex-grow-1">
          <div
            className={`auth-step-dot ${current > dotIndex ? 'is-done' : ''} ${current === dotIndex ? 'is-active' : ''}`}
          >
            {current > dotIndex ? <FiCheckCircle /> : dotIndex + 1}
          </div>
          {dotIndex < 2 && <div className={`auth-step-line ${current > dotIndex ? 'is-done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'password' | 'done'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo(`Un code de vérification a été envoyé à ${email}.`);
      setStep('code');
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo(`Un nouveau code a été envoyé à ${email}.`);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      setInfo('');
      setStep('password');
    } catch {
      setError('Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword, confirmPassword);
      setStep('done');
    } catch {
      setError('Impossible de réinitialiser le mot de passe. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth2-page">
      <div className="auth2-card shadow-lg">
        <div className="row g-0">
          <div className="col-lg-7">
            <div className="auth2-form-panel">
              {step !== 'done' && <StepIndicator step={step} />}

              {step === 'email' && (
                <div className="auth-step-content">
                  <h2 className="auth2-title mb-1">Mot de passe oublié</h2>
                  <p className="text-muted mb-4">
                    Saisissez votre email, nous vous enverrons un code de vérification.
                  </p>

                  {error && (
                    <div className="auth-alert alert alert-danger py-2">
                      <FiAlertCircle /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSendEmail}>
                    <div className="mb-4">
                      <input
                        type="email"
                        className="auth2-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="auth2-submit-btn" disabled={loading}>
                      {loading && <span className="btn-spinner" />}
                      {loading ? 'Envoi...' : 'Envoyer le code'}
                    </button>
                  </form>
                </div>
              )}

              {step === 'code' && (
                <div className="auth-step-content">
                  <h2 className="auth2-title mb-1">Vérification</h2>
                  <p className="text-muted mb-4">Saisissez le code à 6 chiffres reçu par email.</p>

                  {info && (
                    <div className="auth-alert alert alert-success py-2">
                      <FiCheckCircle /> {info}
                    </div>
                  )}
                  {error && (
                    <div className="auth-alert alert alert-danger py-2">
                      <FiAlertCircle /> {error}
                    </div>
                  )}

                  <form onSubmit={handleVerifyCode}>
                    <div className="mb-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="auth2-input text-center"
                        placeholder="Code de vérification"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="auth2-submit-btn" disabled={loading}>
                      {loading && <span className="btn-spinner" />}
                      {loading ? 'Vérification...' : 'Vérifier le code'}
                    </button>
                  </form>

                  <p className="text-center text-muted small mt-3 mb-0">
                    Vous n'avez rien reçu ?{' '}
                    <button type="button" className="btn btn-link p-0 small" onClick={handleResend} disabled={loading}>
                      Renvoyer le code
                    </button>
                  </p>
                </div>
              )}

              {step === 'password' && (
                <div className="auth-step-content">
                  <h2 className="auth2-title mb-1">Nouveau mot de passe</h2>
                  <p className="text-muted mb-4">Choisissez un nouveau mot de passe pour votre compte.</p>

                  {error && (
                    <div className="auth-alert alert alert-danger py-2">
                      <FiAlertCircle /> {error}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <input type="email" className="auth2-input" value={email} readOnly disabled />
                    </div>
                    <div className="mb-3 auth2-input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth2-input"
                        placeholder="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="auth2-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <div className="mb-4 auth2-input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="auth2-input"
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="auth2-password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <button type="submit" className="auth2-submit-btn" disabled={loading}>
                      {loading && <span className="btn-spinner" />}
                      {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
                    </button>
                  </form>
                </div>
              )}

              {step === 'done' && (
                <div className="auth-step-content text-center">
                  <div className="auth-success-icon"><FiCheckCircle /></div>
                  <h2 className="auth2-title mb-1">Mot de passe réinitialisé</h2>
                  <p className="text-muted mb-4">
                    Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                  <Link to="/login" className="auth2-submit-btn d-block">
                    Retour à la connexion
                  </Link>
                </div>
              )}

              {step !== 'done' && (
                <p className="text-center text-muted small mt-4 mb-0">
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Retour à la connexion
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="col-lg-5 d-none d-lg-flex auth2-brand-panel auth2-brand-panel--right flex-column align-items-center justify-content-center text-center p-5">
            <h2 className="auth2-brand-title">Mot de passe oublié ?</h2>
            <p className="auth2-brand-text">
              Récupérez l'accès à votre compte en quelques étapes simples.
            </p>
            <Link to="/login" className="auth2-outline-btn">Connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
