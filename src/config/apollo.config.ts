
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  from,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { TokenService } from '../services/token.service';
import { ApiEndpoints } from './api.config';

class ApolloConfigService {
  private static instance: ApolloClient
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  static getInstance(): ApolloClient{
    if (!ApolloConfigService.instance) {
      const config = new ApolloConfigService();
      ApolloConfigService.instance = config.createClient();
    }
    return ApolloConfigService.instance;
  }

  private createClient(): ApolloClient {
    const httpLink = this.createHttpLink();
    const wsLink = this.createWsLink();
    const authLink = this.createAuthLink();
    const errorLink = this.createErrorLink();

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([errorLink, authLink, httpLink])
    );

    return new ApolloClient({
      link: splitLink,
      cache: this.createCache(),
      defaultOptions: this.getDefaultOptions(),
    });
  }

  private createHttpLink() {
    return createHttpLink({
      uri: ApiEndpoints.graphql,
      credentials: 'include',
    });
  }

  private createWsLink() {
    return new GraphQLWsLink(
      createClient({
        url: ApiEndpoints.websocket,
        connectionParams: () => {
          const token = this.tokenService.getAccessToken();
          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
        retryAttempts: 3,
        shouldRetry: () => true,
      })
    );
  }

  private createAuthLink() {
    return setContext((_, { headers }) => {
      const token = this.tokenService.getAccessToken();
      return {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      };
    });
  }

  private createErrorLink() {
    return onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(
            `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
          );

          // Handle authentication errors
          if (extensions?.code === 'UNAUTHENTICATED') {
            this.handleAuthError();
          }
        });
      }

      if (networkError) {
        console.error(`Network error: ${networkError}`);
        
        // Handle network authentication errors
        if ('statusCode' in networkError && networkError.statusCode === 401) {
          this.handleAuthError();
        }
      }
    });
  }

  private createCache() {
    return new InMemoryCache({
      typePolicies: {
        FacilityType: {
          fields: {
            bedManagement: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
            ambulanceFleet: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
            inventory: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
        IncidentType: {
          fields: {
            timeline: {
              merge(existing = [], incoming) {
                return [...existing, ...incoming].sort(
                  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
              },
            },
            assignments: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
        Query: {
          fields: {
            incidents: {
              merge(existing = { data: [] }, incoming) {
                return {
                  ...incoming,
                  data: [...existing.data, ...incoming.data],
                };
              },
            },
          },
        },
      },
    });
  }

  private getDefaultOptions() {
    return {
      watchQuery: {
        errorPolicy: 'all' as const,
        notifyOnNetworkStatusChange: true,
      },
      query: {
        errorPolicy: 'all' as const,
      },
      mutate: {
        errorPolicy: 'all' as const,
      },
    };
  }

  private handleAuthError() {
    this.tokenService.clearTokens();
    // Redirect to login page
    window.location.href = '/login';
  }

  public static resetCache() {
    if (ApolloConfigService.instance) {
      ApolloConfigService.instance.cache.reset();
    }
  }

  public static clearStore() {
    if (ApolloConfigService.instance) {
      ApolloConfigService.instance.clearStore();
    }
  }
}

export const apolloClient = ApolloConfigService.getInstance();
export { ApolloConfigService };

