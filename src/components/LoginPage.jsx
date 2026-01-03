import { useState } from 'react'
import { Wallet, Mail, Lock } from 'lucide-react'
import { signUp, signIn } from '../firebase/authService'
import './LoginPage.css'

function LoginPage() {
  const [errors, setErrors] = useState({})
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFirebaseAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (!email || !password) {
      setErrors({ auth: 'Por favor completa todos los campos' })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrors({ auth: 'La contraseña debe tener al menos 6 caracteres' })
      setLoading(false)
      return
    }

    try {
      let result
      if (isLoginMode) {
        result = await signIn(email, password)
      } else {
        result = await signUp(email, password, displayName || email.split('@')[0])
      }

      if (result.error) {
        setErrors({ auth: result.error })
        setLoading(false)
      } else if (result.user) {
        // El usuario se autenticó correctamente
        // onAuthChange en App.jsx detectará el cambio automáticamente
        setEmail('')
        setPassword('')
        setDisplayName('')
        setLoading(false)
      }
    } catch (error) {
      setErrors({ auth: 'Error al autenticar. Por favor intenta de nuevo.' })
      setLoading(false)
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
          {/* Autenticación con Firebase */}
          <div className="auth-section">
            <h2 className="section-title">
              {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <form className="auth-form" onSubmit={handleFirebaseAuth}>
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.auth) {
                      setErrors({ ...errors, auth: '' })
                    }
                  }}
                  className={errors.auth ? 'input-error' : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={16} />
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.auth) {
                      setErrors({ ...errors, auth: '' })
                    }
                  }}
                  className={errors.auth ? 'input-error' : ''}
                  required
                  minLength={6}
                />
              </div>
              {!isLoginMode && (
                <div className="form-group">
                  <label htmlFor="display-name">Nombre (opcional)</label>
                  <input
                    id="display-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={30}
                  />
                </div>
              )}
              {errors.auth && <span className="error-message">{errors.auth}</span>}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </button>
            </form>
            <button
              className="toggle-auth-button"
              onClick={() => {
                setIsLoginMode(!isLoginMode)
                setErrors({})
                setEmail('')
                setPassword('')
                setDisplayName('')
              }}
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Crear una nueva' 
                : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

