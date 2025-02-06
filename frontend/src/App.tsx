import React from "react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";

const App: React.FC = () => {
    return (
        <div className="App">
            <NavBar />
            <Home />
        </div>
    );
};

export default App;