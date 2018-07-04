import 'fetch-everywhere';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RouterWrapper from './RouterWrapper';
import ApolloService from './services/ApolloService';

// import { AppContainer as ReactHotLoader } from 'react-hot-loader';

const rootEl: HTMLElement = document.getElementById('root');
const apolloClient = ApolloService.createClient();

const renderApp = () => {
  ReactDOM.render(
    // <ReactHotLoader key={Math.random()}>
    //   <RouterWrapper apolloClient={apolloClient} />
    // </ReactHotLoader>,
    <RouterWrapper apolloClient={apolloClient} />,
    rootEl,
  );
};

renderApp();

// if ((module as any).hot) {
//   (module as any).hot.accept('./RouterWrapper', renderApp);
// }
