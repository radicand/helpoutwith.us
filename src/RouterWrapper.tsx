import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ApolloClient } from 'apollo-client';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { CookiesProvider } from 'react-cookie';
import JssProvider from 'react-jss/lib/JssProvider';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ActivityList from './views/activities/ActivityList';
import NotFound from './views/errors/NotFound';
import Home from './views/home/Home';
import Landing from './views/landing/Landing';
import Layout from './views/layout/Layout';
import OrganizationList from './views/organizations/OrganizationList';
import SpotList from './views/spots/SpotList';
import getContext from './views/styles/getContext';
import WhatsOpen from './views/whatsOpen/WhatsOpen';

export interface IProviderWrapperProps {
  apolloClient: ApolloClient<any>;
}

const RouterWrapper: React.StatelessComponent<IProviderWrapperProps> = (
  props: IProviderWrapperProps,
): JSX.Element => {
  const thisThemeContext = getContext();
  const apolloClient = props.apolloClient;

  return (
    <React.Fragment>
      <CookiesProvider cookies={null}>
        <BrowserRouter>
          <JssProvider
            registry={thisThemeContext.sheetsRegistry}
            jss={thisThemeContext.jss}
          >
            <MuiThemeProvider
              theme={thisThemeContext.theme}
              sheetsManager={thisThemeContext.sheetsManager}
            >
              <ApolloProvider client={apolloClient}>
                <CssBaseline>
                  <div className="container">
                    <Switch>
                      <Route exact={true} path="/login" component={Landing} />
                      <Layout>
                        <Route exact={true} path="/" component={Home} />
                        <Route
                          exact={true}
                          path="/orgs"
                          component={OrganizationList}
                        />
                        <Route
                          exact={true}
                          path="/activities"
                          component={ActivityList}
                        />
                        <Route
                          exact={true}
                          path="/spots"
                          component={SpotList}
                        />
                        <Route
                          exact={true}
                          path="/open"
                          component={WhatsOpen}
                        />
                      </Layout>
                      <Route component={NotFound} />
                    </Switch>
                  </div>
                </CssBaseline>
              </ApolloProvider>
            </MuiThemeProvider>
          </JssProvider>
        </BrowserRouter>
      </CookiesProvider>
    </React.Fragment>
  );
};

export default RouterWrapper;
