import React, {useState, useEffect} from 'react';
import api from './api'

const App = () => {
    const [helloWorld, setHelloWorld] = useState([]);

    const fetchHelloWorld = async () => {
      const response = await api.post('/helloWorld');
      setHelloWorld(response.data);
    }

    useEffect(() => {
        fetchHelloWorld();//hier muss vllt try/catch bzw. .then()...
    },[]);

    return (
        <div>
            {helloWorld}
        </div>
    )
}

export default App;
