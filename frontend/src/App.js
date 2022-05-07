import logo from './logo.svg';
import './style.css';
import Home from './pages/home';
import { Router } from 'react-router-dom';
import history from "./history";
function App() {
  return (
    <div className="App">
      <Router history={history}>
        <Home />
      </Router>
    </div>
  );
}


export default App;
