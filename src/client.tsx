import 'fetch-everywhere';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RouterWrapper from './RouterWrapper';
import ApolloService from './services/ApolloService';

const rootEl: HTMLElement = document.getElementById('root');
const apolloClient = ApolloService.createClient();

const renderApp = () => {
  const router = () => <RouterWrapper apolloClient={apolloClient} />;
  const App = router;
  ReactDOM.render(<App />, rootEl);
};

renderApp();
