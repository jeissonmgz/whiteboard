import React from 'react';
import { WhiteboardProvider } from './context/WhiteboardContext';
import { Page } from './components/Page/Page';
import { Scroll } from './components/Scroll/Scroll';
import { Property } from './components/Property/Property';
import { Control } from './components/Control/Control';
import './App.scss';

export const App: React.FC = () => {
  return (
    <WhiteboardProvider>
      <Page />
      <Scroll />
      <div className="content" role="main">
        <Property />
        <Control />
      </div>
    </WhiteboardProvider>
  );
};

export default App;
