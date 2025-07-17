import './index.css';
import { SteamForm } from './components/SteamForm';
import SteamLauncher from './components/SteamLauncher';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SteamForm />
      <SteamLauncher />
    </div>
  );
}

export default App;
