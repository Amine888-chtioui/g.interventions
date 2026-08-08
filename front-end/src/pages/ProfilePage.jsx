import { useEffect, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../api/profileApi';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ProfilePage() {
  const { updateIdentity } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [profileForm, setProfileForm] = useState({ nom: '', prenom: '', email: '' });
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError('');
    try {
      const { data } = await getProfile();
      setProfileForm({ nom: data.nom, prenom: data.prenom, email: data.email });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil.');
    } finally {
      setLoading(false);
    }
  }

  function handleProfileChange(e) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const { data } = await updateProfile(profileForm);
      updateIdentity({ email: data.email, token: data.token });
      setToast('Profil mis à jour avec succès.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setToast('Mot de passe modifié avec succès.');
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      {toast && <Toast key={toast} message={toast} onDone={() => setToast('')} />}
      <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Mon profil</h2>
          <p>Gérez vos informations personnelles et votre mot de passe</p>
        </div>
        <div className="dash-topline-actions">
          <NotificationBell />
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="dash-card">
        <h3>Informations du profil</h3>
        {profileError && <div className="alert alert-danger py-2">{profileError}</div>}
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="nom"
                  className="form-control"
                  value={profileForm.nom}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  className="form-control"
                  value={profileForm.prenom}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="dash-card">
        <h3>Changer le mot de passe</h3>
        {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-3">
            <label className="form-label">Mot de passe actuel</label>
            <input
              type="password"
              name="currentPassword"
              className="form-control"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
      </DashboardShell>
    </>
  );
}
