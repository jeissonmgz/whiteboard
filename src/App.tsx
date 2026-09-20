import React from 'react';
import { WhiteboardProvider } from './context/WhiteboardContext';
import { Page } from './components/Page/Page';
import { Scroll } from './components/Scroll/Scroll';
import { Property } from './components/Property/Property';
import { Control } from './components/Control/Control';
import { Minimap } from './components/Minimap/Minimap';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import './App.scss';

export const App: React.FC = () => {
  return (
    <WhiteboardProvider>
      <Page />
      <Scroll />
      <div className="content" role="main">
        <ThemeToggle />
        <Property />
        <Control />
        <Minimap />
      </div>
    </WhiteboardProvider>
  );
};

export default App;
