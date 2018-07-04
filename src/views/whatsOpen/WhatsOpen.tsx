import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { StyleRules, Theme } from '@material-ui/core/styles';
import * as luxon from 'luxon';
import * as React from 'react';
import { compose } from 'react-apollo';
import { ReactCookieProps, withCookies } from 'react-cookie';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import { SITE_TITLE } from '../../constants/System';
import { FRIENDLY_DATE_FORMAT_WITH_DAYNAME } from '../../constants/Time';
import { MyDataQuery } from '../../queries';
import {
  MarkUnavailableForSpotCombo,
  SignupForSpotCombo,
} from '../../queries/actions';
import { myData, SpotStatus } from '../../queries/schema';
import MediaCard from '../components/cards/MediaCard';
import LoadingComponent from '../components/LoadingComponent';

interface IState {}

type IProps = WithStyles<'root' | 'paper' | 'table' | 'grid' | 'notAvailable'> &
  RouteComponentProps<{}> &
  ReactCookieProps;

type OrgActivitySpot = myData['allOrganizations'][0]['activities'][0]['spots'][0];
type OrgActivity = myData['allOrganizations'][0]['activities'][0];
type ModfifiedSpot = OrgActivitySpot & {
  _org: {
    name: string;
    timezone: string;
    location?: string;
  };
  _act: OrgActivity;
};

const styles = (theme: Theme) => {
  const myStyle: StyleRules = {
    root: {
      flexGrow: 1,
      marginTop: 30,
      padding: theme.spacing.unit * 3,
    },
    paper: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
    grid: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit * 2,
    },
    notAvailable: {
      backgroundColor: 'rgba(255,0,0,.075)',
    },
  };

  return myStyle;
};

class WhatsOpen extends React.Component<IProps, IState> {
  public render() {
    const { classes } = this.props;
    const now = luxon.DateTime.local();

    const _getSpotUser = (spot: OrgActivitySpot) => {
      return spot.members.find((member) => {
        return member.user.id === this.props.cookies.get('id');
      });
    };

    const getButtons = (
      activity: OrgActivity,
      spot: OrgActivitySpot,
      _onClickFormSignUpAction: (spot: OrgActivitySpot) => {},
      _onClickFormUnavailableUpAction: (spot: OrgActivitySpot) => {},
    ) => {
      const endsAt = luxon.DateTime.fromISO(spot.endsAt);
      if (now > endsAt) {
        return [];
      }

      const kinds = [
        {
          text: 'Sign Up',
          onClick: _onClickFormSignUpAction.bind(this, spot),
        },
        {
          text: 'Not Available',
          onClick: _onClickFormUnavailableUpAction.bind(this, spot),
        },
      ];

      const foundUser = _getSpotUser(spot);

      return kinds.filter((kind) => {
        if (kind.text === 'Sign Up') {
          if (!foundUser || foundUser.status !== SpotStatus.Confirmed) {
            if (
              spot.members.filter(
                (member) => member.status === SpotStatus.Confirmed,
              ).length < spot.numberNeeded
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else if (kind.text === 'Not Available') {
          if (!foundUser || foundUser.status !== SpotStatus.Absent) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    };

    return (
      <React.Fragment>
        <Helmet>
          <title>What's Open - {SITE_TITLE}</title>
        </Helmet>
        <div className={classes.root}>
          <Typography variant="headline" noWrap={true}>
            What's Open?
          </Typography>
          <Typography variant="body1">
            Find spots that are still in need of volunteers below.
          </Typography>
          <Grid container={true} spacing={24} className={classes.grid}>
            <MarkUnavailableForSpotCombo>
              {(markUnavailableForSpot) => (
                <SignupForSpotCombo>
                  {(signUpForSpot) => (
                    <MyDataQuery>
                      {({ loading, data }) => {
                        if (loading || !data.allOrganizations) {
                          return <LoadingComponent />;
                        }

                        const { allOrganizations } = data;

                        const spots: ModfifiedSpot[] = [];

                        spots.sort((a, b) => {
                          return a.startsAt > b.startsAt ? 1 : -1;
                        });

                        allOrganizations.forEach((org) =>
                          org.activities.forEach((activity) =>
                            activity.spots.forEach((spot) => {
                              const availableSpots =
                                spot.numberNeeded -
                                spot.members.filter(
                                  (member) =>
                                    member.status === SpotStatus.Confirmed,
                                ).length;

                              const inTheFuture =
                                now < luxon.DateTime.fromISO(spot.endsAt);

                              if (availableSpots > 0 && inTheFuture) {
                                const newSpot: ModfifiedSpot = {
                                  ...spot,
                                  _org: {
                                    name: org.name,
                                    timezone: org.timezone,
                                    location: org.location,
                                  },
                                  _act: activity,
                                };
                                spots.push(newSpot);
                              }
                            }),
                          ),
                        );

                        return spots.map((spot) => {
                          const availableSpots =
                            spot.numberNeeded -
                            spot.members.filter(
                              (member) =>
                                member.status === SpotStatus.Confirmed,
                            ).length;

                          return (
                            <Grid item={true} xs={true} key={spot.id}>
                              <MediaCard
                                headline={`${luxon.DateTime.fromISO(
                                  spot.startsAt,
                                )
                                  .setZone(spot._org.timezone)
                                  .toLocaleString(
                                    FRIENDLY_DATE_FORMAT_WITH_DAYNAME,
                                  )} - ${luxon.DateTime.fromISO(spot.endsAt)
                                  .setZone(spot._org.timezone)
                                  .toLocaleString(
                                    luxon.DateTime.fromISO(spot.startsAt)
                                      .setZone(spot._org.timezone)
                                      .toFormat('DD') ===
                                    luxon.DateTime.fromISO(spot.endsAt)
                                      .setZone(spot._org.timezone)
                                      .toFormat('DD')
                                      ? luxon.DateTime.TIME_SIMPLE
                                      : FRIENDLY_DATE_FORMAT_WITH_DAYNAME,
                                  )}`}
                                preheader={spot._org.name}
                                subheader={
                                  <span>
                                    This spot is upcoming with {availableSpots}{' '}
                                    spots still open
                                  </span>
                                }
                                body={
                                  <List>
                                    <ListItem>
                                      <ListItemText
                                        primary="Activity"
                                        secondary={spot._act.name}
                                      />
                                    </ListItem>
                                    {(spot.location ||
                                      spot._act.location ||
                                      spot._org.location) && (
                                      <ListItem>
                                        <ListItemText
                                          primary="Location"
                                          secondary={
                                            spot.location ||
                                            spot._act.location ||
                                            spot._org.location
                                          }
                                        />
                                      </ListItem>
                                    )}
                                  </List>
                                }
                                buttons={getButtons(
                                  spot._act,
                                  spot,
                                  signUpForSpot,
                                  markUnavailableForSpot,
                                )}
                                members={spot.members.filter(
                                  (member) =>
                                    member.status === SpotStatus.Confirmed,
                                )}
                                absentMembers={spot.members.filter(
                                  (member) =>
                                    member.status === SpotStatus.Absent,
                                )}
                              />
                            </Grid>
                          );
                        });
                      }}
                    </MyDataQuery>
                  )}
                </SignupForSpotCombo>
              )}
            </MarkUnavailableForSpotCombo>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default compose(
  withCookies,
  withStyles(styles, { withTheme: true }),
)(WhatsOpen);
