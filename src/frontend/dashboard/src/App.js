import React, {useState, useEffect} from 'react';
import api from './api'

const App = () => {
    const [helloWorld, setHelloWorld] = useState([]);
    const [transactions, setTransactions] = useState([]);

    return (
        <div>
            Hello World!
        </div>
    )
}

export default App;
