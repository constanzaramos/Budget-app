import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB6ILw5VHYq-S0Y5QIzVrPWpq1fMNwxDRY",
  authDomain: "budget-app-b953d.firebaseapp.com",
  projectId: "budget-app-b953d",
  storageBucket: "budget-app-b953d.firebasestorage.app",
  messagingSenderId: "715512732834",
  appId: "1:715512732834:web:87a5aa2140ad7cde1b4bfb"
}


// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app

