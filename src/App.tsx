import React from 'react';
import { WhiteboardProvider } from './context/WhiteboardContext';
import { I18nProvider } from './i18n/I18nContext';
import { Page } from './components/Page/Page';
import { Scroll } from './components/Scroll/Scroll';
import { Property } from './components/Property/Property';
import { Control } from './components/Control/Control';
import { Minimap } from './components/Minimap/Minimap';
import { HeaderBrand } from './components/HeaderBrand/HeaderBrand';
import { ExportModal } from './components/ExportModal/ExportModal';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import './App.scss';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <WhiteboardProvider>
        <Page />
        <Scroll />
        <div className="content" role="main">
          <HeaderBrand />
          <ExportModal />
          <LanguageSelector />
          <ThemeToggle />
          <Property />
          <Control />
          <Minimap />
        </div>
      </WhiteboardProvider>
    </I18nProvider>
  );
};

export default App;
