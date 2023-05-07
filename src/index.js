import React from 'react';
import {createRoot} from 'react-dom/client';

import withReduxFeatures from './withReduxFeatures';
import App from './components/App';
import './index.css';

/** Wrap App component with store providers */
const WrappedApp = withReduxFeatures(App);

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<WrappedApp />);
