import { AuthProvider } from "./contexts/AuthContext"
import AppRouter from "./routes/AppRouter"
import "./styles/index.css"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App