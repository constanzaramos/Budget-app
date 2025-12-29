import { useState, useEffect } from 'react'
import { User, Plus, X, Check } from 'lucide-react'
import './ProfileManager.css'

function ProfileManager({ currentProfile, onProfileChange }) {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('budget-profiles')
    return saved ? JSON.parse(saved) : []
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [error, setError] = useState('')

  // Si no hay perfiles, crear uno por defecto
  useEffect(() => {
    if (profiles.length === 0) {
      const defaultProfile = { id: 'default', name: 'Mi Perfil' }
      setProfiles([defaultProfile])
      localStorage.setItem('budget-profiles', JSON.stringify([defaultProfile]))
      if (!currentProfile) {
        onProfileChange(defaultProfile.id)
      }
    }
  }, [])

  const handleAddProfile = (e) => {
    e.preventDefault()
    const trimmedName = newProfileName.trim()

    if (!trimmedName) {
      setError('El nombre del perfil es obligatorio')
      return
    }

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    if (trimmedName.length > 30) {
      setError('El nombre no puede tener más de 30 caracteres')
      return
    }

    // Verificar que no exista un perfil con el mismo nombre
    if (profiles.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe un perfil con este nombre')
      return
    }

    const newProfile = {
      id: Date.now().toString(),
      name: trimmedName
    }

    const updatedProfiles = [...profiles, newProfile]
    setProfiles(updatedProfiles)
    localStorage.setItem('budget-profiles', JSON.stringify(updatedProfiles))
    
    setNewProfileName('')
    setShowAddForm(false)
    setError('')
    
    // Cambiar automáticamente al nuevo perfil
    onProfileChange(newProfile.id)
  }

  const handleDeleteProfile = (profileId, e) => {
    e.stopPropagation()
    
    if (profiles.length === 1) {
      alert('No puedes eliminar el único perfil. Crea otro perfil primero.')
      return
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil? Se eliminarán todos sus datos.')) {
      // Eliminar datos del perfil
      const profileKey = `profile-${profileId}-`
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(profileKey)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Eliminar el perfil de la lista
      const updatedProfiles = profiles.filter(p => p.id !== profileId)
      setProfiles(updatedProfiles)
      localStorage.setItem('budget-profiles', JSON.stringify(updatedProfiles))

      // Si el perfil eliminado era el actual, cambiar al primero disponible
      if (currentProfile === profileId && updatedProfiles.length > 0) {
        onProfileChange(updatedProfiles[0].id)
      }
    }
  }

  const currentProfileData = profiles.find(p => p.id === currentProfile)

  return (
    <div className="profile-manager">
      <div className="profile-selector">
        <User size={18} />
        <select
          value={currentProfile || ''}
          onChange={(e) => onProfileChange(e.target.value)}
          className="profile-select"
        >
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <button
          className="add-profile-button"
          onClick={() => {
            setShowAddForm(!showAddForm)
            setError('')
          }}
          title="Agregar nuevo perfil"
        >
          <Plus size={16} />
        </button>
      </div>

      {showAddForm && (
        <div className="add-profile-form">
          <form onSubmit={handleAddProfile}>
            <input
              type="text"
              placeholder="Nombre del perfil"
              value={newProfileName}
              onChange={(e) => {
                setNewProfileName(e.target.value)
                setError('')
              }}
              className={error ? 'input-error' : ''}
              autoFocus
              maxLength={30}
            />
            {error && <span className="error-message">{error}</span>}
            <div className="form-actions">
              <button type="submit" className="submit-button-small">
                <Check size={16} />
              </button>
              <button
                type="button"
                className="cancel-button-small"
                onClick={() => {
                  setShowAddForm(false)
                  setNewProfileName('')
                  setError('')
                }}
              >
                <X size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {currentProfileData && (
        <div className="profile-info">
          <span className="profile-name-label">Perfil actual: {currentProfileData.name}</span>
          {profiles.length > 1 && (
            <button
              className="delete-profile-button"
              onClick={(e) => handleDeleteProfile(currentProfile, e)}
              title="Eliminar este perfil"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileManager

