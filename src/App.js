import React from "react";
import "./App.css";
import NewGraph from "./NewGraph";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h3>LOTR Quotes</h3>
           
                <NewGraph
                    width="1500"
                    height="800"
                    id=""
                    name=""
                    type="Movies"
                />
            </header>
        </div>
    );
}

export default App;
