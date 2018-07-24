import crypto from 'crypto';
import * as Hapi from 'hapi';
import ical from 'ical-generator';
import { DateTime } from 'luxon';
import { loggedInUserId, myUpcomingSpots } from '../../queries/schema';
import LoggedInUserQuery from '../../queries/server/loggedInUserId.graphql';
import MyUpcomingSpotsQuery from '../../queries/server/myUpcomingSpots.graphql';
import ApolloService from '../../services/ApolloService';
import IController from './IController';

const H16 = 60 * 60 * 16;

export function signHmacSha512(str: string) {
  const hmac = crypto.createHmac('sha512', process.env.SALT);
  const signed = hmac
    .update(new Buffer(str, 'utf-8'))
    .digest('base64')
    .replace(/[\/=\+]/g, '');

  return signed;
}

export function verifyHmacSha512(str: string, hash: string) {
  return hash === signHmacSha512(str);
}

class CalendarController implements IController {
  public mapRoutes(server: Hapi.Server): void {
    server.route({
      method: 'GET',
      path: '/ical/getMyLink',
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        try {
          const apolloClient = ApolloService.createClient(
            `Bearer ${request.state.token}`,
          );
          const resp = await apolloClient.query<loggedInUserId>({
            query: LoggedInUserQuery,
          });

          request.log(['ical'], 'link created and delivered');

          return h.response(
            JSON.stringify({
              ok: true,
              url: `/ical/${resp.data.loggedInUser.id}/${signHmacSha512(
                resp.data.loggedInUser.id,
              )}.ics`,
            }),
          );
        } catch (ex) {
          request.log(['ical', 'error'], ex.message);

          return h.response(new Error(ex.message));
        }
      },
    });

    server.route({
      method: 'GET',
      path: '/ical/{id}/{mac}.ics',
      handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        if (!verifyHmacSha512(request.params.id, request.params.mac)) {
          return h.response('Unauthorized').code(401);
        }

        try {
          const apolloClient = ApolloService.createClient(
            `Bearer ${process.env.ROOT_TOKEN}`,
          );
          const resp = await apolloClient.query<myUpcomingSpots>({
            query: MyUpcomingSpotsQuery,
            variables: {
              userId: request.params.id,
              startsAfter: DateTime.local().minus({ days: 14 }),
            },
          });

          request.log(
            ['ical'],
            `generating calendar feed for ${request.params.id}`,
          );

          const calfeed = ical({
            domain: request.info.hostname,
            name: `${resp.data.allUsers[0].name}: ${request.info.hostname}`,
          });

          resp.data.allSpots.forEach((spot) => {
            const startTime = DateTime.fromISO(spot.startsAt, {
              zone: 'UTC',
            }).setZone(spot.activity.organization.timezone);

            calfeed.createEvent({
              uid: spot.id,
              summary: `${spot.activity.name} - ${
                spot.activity.organization.name
              }`,
              location:
                spot.activity.location || spot.activity.organization.location,
              allDay: false,
              start: startTime.plus({ minutes: startTime.offset }).toJSDate(),
              end: DateTime.fromISO(spot.endsAt, { zone: 'UTC' })
                .setZone(spot.activity.organization.timezone)
                .plus({ minutes: startTime.offset })
                .toJSDate(),
              timezone: spot.activity.organization.timezone,
              status: 'confirmed',
              alarms: [
                { type: 'display', trigger: H16 },
                { type: 'audio', trigger: H16 },
              ],
              attendees: spot.members.map((member) => ({
                name: member.user.name,
                email: member.user.email,
              })),
            });
          });

          return h
            .response(calfeed.toString())
            .type('text/calendar; charset=utf-8')
            .header(
              'Content-Disposition',
              `attachment; filename="${request.params.id}.ics"`,
            );
        } catch (ex) {
          request.log(['notifications', 'error'], ex.message);

          return h.response(new Error(ex.message));
        }
      },
    });
  }
}

export default CalendarController;
