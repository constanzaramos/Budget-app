import { useState, useEffect } from 'react'
import { User, Plus, Trash2, LogIn, Wallet } from 'lucide-react'
import './LoginPage.css'

function LoginPage({ onLogin, profiles, onCreateProfile, onDeleteProfile }) {
  const [selectedProfile, setSelectedProfile] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Si hay perfiles y no hay uno seleccionado, seleccionar el primero
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0].id)
    }
  }, [profiles, selectedProfile])

  const handleLogin = () => {
    if (!selectedProfile) {
      setErrors({ profile: 'Por favor selecciona un perfil' })
      return
    }
    onLogin(selectedProfile)
  }

  const handleCreateProfile = (e) => {
    e.preventDefault()
    const name = newProfileName.trim()
    
    if (!name) {
      setErrors({ name: 'El nombre del perfil es obligatorio' })
      return
    }
    
    if (name.length < 2) {
      setErrors({ name: 'El nombre debe tener al menos 2 caracteres' })
      return
    }
    
    if (name.length > 30) {
      setErrors({ name: 'El nombre no puede tener más de 30 caracteres' })
      return
    }
    
    if (profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ name: 'Ya existe un perfil con ese nombre' })
      return
    }
    
    onCreateProfile(name)
    setNewProfileName('')
    setShowCreateForm(false)
    setErrors({})
  }

  const handleDeleteProfile = (profileId, e) => {
    e.stopPropagation()
    if (window.confirm('¿Estás seguro de que deseas eliminar este perfil? Esta acción no se puede deshacer.')) {
      onDeleteProfile(profileId)
      if (selectedProfile === profileId) {
        setSelectedProfile('')
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <Wallet size={48} />
          </div>
          <h1 className="login-title">Control de Presupuesto</h1>
          <p className="login-subtitle">Gestiona tus finanzas de manera inteligente</p>
        </div>

        <div className="login-content">
          {profiles.length > 0 ? (
            <>
              <div className="profiles-section">
                <h2 className="section-title">Selecciona tu perfil</h2>
                <div className="profiles-list">
                  {profiles.map(profile => (
                    <div
                      key={profile.id}
                      className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedProfile(profile.id)
                        setErrors({})
                      }}
                    >
                      <div className="profile-icon">
                        <User size={24} />
                      </div>
                      <div className="profile-info">
                        <h3 className="profile-name">{profile.name}</h3>
                        <p className="profile-date">Creado: {new Date(profile.createdAt).toLocaleDateString('es-CL')}</p>
                      </div>
                      {profiles.length > 1 && (
                        <button
                          className="delete-profile-btn"
                          onClick={(e) => handleDeleteProfile(profile.id, e)}
                          title="Eliminar perfil"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.profile && <span className="error-message">{errors.profile}</span>}
              </div>

              <button
                className="login-button"
                onClick={handleLogin}
                disabled={!selectedProfile}
              >
                <LogIn size={20} />
                Iniciar Sesión
              </button>
            </>
          ) : (
            <div className="empty-profiles">
              <p>No hay perfiles creados. Crea uno para comenzar.</p>
            </div>
          )}

          <div className="create-profile-section">
            {!showCreateForm ? (
              <button
                className="create-profile-button"
                onClick={() => {
                  setShowCreateForm(true)
                  setErrors({})
                }}
              >
                <Plus size={20} />
                Crear Nuevo Perfil
              </button>
            ) : (
              <form className="create-profile-form" onSubmit={handleCreateProfile}>
                <div className="form-group">
                  <label htmlFor="profile-name">Nombre del Perfil</label>
                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Ej: Juan, María, Familia..."
                    value={newProfileName}
                    onChange={(e) => {
                      setNewProfileName(e.target.value)
                      if (errors.name) {
                        setErrors({ ...errors, name: '' })
                      }
                    }}
                    className={errors.name ? 'input-error' : ''}
                    autoFocus
                    maxLength={30}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Crear Perfil
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewProfileName('')
                      setErrors({})
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

