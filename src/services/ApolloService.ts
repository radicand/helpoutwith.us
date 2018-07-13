import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import ApolloConstants from '../constants/Apollo';
import LoginService from './LoginService';

export default class ApolloService {
  public static createClient(serverAuth?: string) {
    // Apollo
    const httpLink = new HttpLink({
      uri: ApolloConstants.gqlApiEndpoint,
      credentials: 'same-origin',
    });

    const middlewareLink = new ApolloLink((operation, forward) => {
      const authorization =
        serverAuth ||
        (LoginService.getLoginState().token &&
          `Bearer ${LoginService.getLoginState().token}`);

      // console.log(authorization);
      if (authorization) {
        operation.setContext({
          headers: {
            authorization,
          },
        });
      }

      return forward(operation);
    });

    // const cache =  new Hermes(),
    const cache = new InMemoryCache();

    // apollo-link-state
    const stateLink = withClientState({
      cache,
      resolvers: {
        Mutation: {
          // ...loginUser,
          // ...logoutUser,
        },
      },
      defaults: {
        //      ...defaultLoginState,
      },
      // typeDefs: loginStatetypeDefs,
    });

    // links
    const link = concat(stateLink, concat(middlewareLink, httpLink));

    const apolloClient = new ApolloClient({
      link,
      cache,
    });

    return apolloClient;
  }
}
