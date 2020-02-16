import React from "react";
import "./css/App.css";
import { createStore } from "redux";
import { Provider } from "react-redux";
import Map from "./Map";
import ShownEntities from "./EntityInfo";
import EndScreen from "./EndScreen";
import Tutorial from "./Tutorial";
import reducer from "./reducer"

/*TODO:
  
*/

const store = createStore(reducer);

const App = () => (
  <Provider store={store}>
    <div className="App">
      <EndScreen />
      <ShownEntities />
      <Map />
      <Tutorial/>
    </div>
  </Provider>
);

export default App;
