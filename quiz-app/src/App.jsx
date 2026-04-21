import { useState } from "react";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import "./App.css";

function App() {
  const [config, setConfig] = useState(null);

  return (
    <div className="app">
      <header className="site-header">
        <span className="site-logo">CogPsych</span>
      </header>
      <main className="site-main">
        {!config ? (
          <Home onStart={(cfg) => setConfig(cfg)} />
        ) : (
          <Quiz config={config} onBack={() => setConfig(null)} />
        )}
      </main>
    </div>
  );
}

export default App;
