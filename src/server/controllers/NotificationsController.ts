import * as Hapi from 'hapi';
import { sendUpcomingReminders } from '../../queries/schema';
import SendUpcomingRemindersMutation from '../../queries/server/sendUpcomingReminders.graphql';
import ApolloService from '../../services/ApolloService';
import IController from './IController';

class NotificationsController implements IController {
  public mapRoutes(server: Hapi.Server): void {
    server.route({
      method: 'POST',
      path: '/notifications/mySpots',
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        try {
          const apolloClient = ApolloService.createClient(
            request.headers.authorization,
          );
          const resp = await apolloClient.mutate<sendUpcomingReminders>({
            mutation: SendUpcomingRemindersMutation,
            variables: {
              daysOut: 3,
              filled: true,
              unfilled: true,
              adminSummary: true,
            },
          });

          request.log(
            ['notifications'],
            `${
              resp.data.sendUpcomingReminders.notificationsSent
            } notifications sent`,
          );

          return h.response(
            JSON.stringify({
              ok: true,
              sent: resp.data.sendUpcomingReminders.notificationsSent,
            }),
          );
        } catch (ex) {
          request.log(['notifications', 'error'], ex.message);

          return h.response(new Error(ex.message));
        }
      },
    });
  }
}

export default NotificationsController;
