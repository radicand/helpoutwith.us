import gql from 'graphql-tag';
import * as Hapi from 'hapi';
import ApolloService from '../../services/ApolloService';
import IController from './IController';

class NotificationsController implements IController {
  public mapRoutes(server: Hapi.Server): void {
    server.route({
      method: 'POST',
      path: '/notifications/mySpots',
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        try {
          const apolloClient = ApolloService.createClient(request.headers.authorization);
          const resp = await apolloClient.mutate({
            mutation: gql`
              mutation sendUpcomingReminders($daysOut: Int!, $filled: Boolean!, $unfilled: Boolean!) {
                sendUpcomingReminders(daysOut: $daysOut, filled: $filled, unfilled: $unfilled) {
                  notificationsSent
                  errors
                }
              }
            `,
            variables: {
              daysOut: 3,
              filled: true,
              unfilled: false,
            },
          });

          request.log([ 'notifications' ], `${resp.data.sendUpcomingReminders.notificationsSent} notifications sent`);

          return h.response(JSON.stringify({ ok: true, sent: resp.data.sendUpcomingReminders.notificationsSent }));
        } catch (ex) {
          request.log([ 'notifications', 'error' ], ex.message);

          return h.response(new Error(ex.message));
        }
      },
    });
  }
}

export default NotificationsController;
