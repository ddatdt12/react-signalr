import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import ConnectionManager from './components/SocketApp/ConnectionManager';
import ConnectionState from './components/SocketApp/ConnectionState';
import Events from './components/SocketApp/Events';
import Form from './components/SocketApp/Form';
export default function SocketApp() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      console.log('Connected!');
      setIsConnected(true);

      socket.emit('update_location', 'Hello from the client!');
    }

    function onDisconnect() {
      console.log('Disconnected!');
      setIsConnected(false);
    }

    function onLocationUpdate(value) {
      setFooEvents((previous) => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_location', onLocationUpdate);

    socket.on('connect_error', (error) => {
      console.log('connect_error', error);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_location', onLocationUpdate);
    };
  }, []);

  return (
    <div className='App'>
      <ConnectionState isConnected={isConnected} />
      <Events events={fooEvents} />
      <ConnectionManager />
      <Form />
    </div>
  );
}
