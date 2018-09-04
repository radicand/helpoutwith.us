import Button from '@material-ui/core/es/Button';
import ExpansionPanel from '@material-ui/core/es/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/es/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/es/ExpansionPanelSummary';
import FormControlLabel from '@material-ui/core/es/FormControlLabel';
import Grid from '@material-ui/core/es/Grid';
import List from '@material-ui/core/es/List';
import ListItem from '@material-ui/core/es/ListItem';
import ListItemText from '@material-ui/core/es/ListItemText';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles, {
  StyleRules,
  WithStyles,
} from '@material-ui/core/es/styles/withStyles';
import Switch from '@material-ui/core/es/Switch';
import Typography from '@material-ui/core/es/Typography';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
  AdminSpotActionsCombo,
  CancelSpotSignupCombo,
  DeleteSpotCombo,
  MarkUnavailableForSpotCombo,
  SignupForSpotCombo,
} from '../../queries/actions';
import { myData, Role, SpotStatus } from '../../queries/schema';
import MediaCard from '../components/cards/MediaCard';
import LoadingComponent from '../components/LoadingComponent';
import SpotModal from '../modals/SpotModal';

type IProps = WithStyles<
  'root' | 'paper' | 'table' | 'addButton' | 'expansionHeading' | 'notAvailable'
> &
  RouteComponentProps<{}> &
  ReactCookieProps;

interface IState {
  modalSpot: OrgActivitySpot;
  modalSpotOpen: boolean;
  modalSpotTimezone: string;
  showPast: boolean;
  panelStates: {
    [key: string]: boolean;
  };
}

type OrgActivitySpot = myData['allOrganizations'][0]['activities'][0]['spots'][0];
type OrgActivity = myData['allOrganizations'][0]['activities'][0];
type Organization = myData['allOrganizations'][0];

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
    addButton: {
      position: 'fixed',
      bottom: theme.spacing.unit * 2,
      right: theme.spacing.unit * 2,
    },
    expansionHeading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    notAvailable: {
      backgroundColor: 'rgba(255,0,0,.075)',
    },
  };

  return myStyle;
};

class SpotList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      modalSpot: null,
      modalSpotOpen: false,
      modalSpotTimezone: null,
      showPast: false,
      panelStates: {},
    };
  }

  public render() {
    const { classes } = this.props;
    const now = luxon.DateTime.local();

    const getActions = (
      org: Organization,
      activity: OrgActivity,
      spot: OrgActivitySpot,
      _onClickFormRemoveAction: (spot: OrgActivitySpot) => {},
    ) => {
      const kinds = [
        {
          label: 'Edit',
          icon: <EditIcon />,
          onClick: this._onClickFormEditModal.bind(this, org, spot),
        },
        {
          label: 'Remove',
          icon: <DeleteIcon />,
          onClick: _onClickFormRemoveAction.bind(this, spot),
        },
      ];

      const endsAt = luxon.DateTime.fromISO(spot.endsAt);

      return kinds.filter((kind) => {
        if (kind.label === 'Edit') {
          if (now > endsAt) {
            return false;
          }

          return !!activity.members.find((member) => {
            return (
              member.role === Role.Admin &&
              member.user.id === this.props.cookies.get('id')
            );
          });
        } else if (kind.label === 'Remove') {
          return !!activity.members.find((member) => {
            return (
              member.role === Role.Admin &&
              member.user.id === this.props.cookies.get('id')
            );
          });
        } else {
          return false;
        }
      });
    };

    const getButtons = (
      activity: OrgActivity,
      spot: OrgActivitySpot,
      _onClickFormSignUpAction: (spot: OrgActivitySpot) => {},
      _onClickFormUnavailableUpAction: (spot: OrgActivitySpot) => {},
      _onClickFormCancelAction: (spot: OrgActivitySpot) => {},
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
        {
          text: 'Cancel',
          onClick: _onClickFormCancelAction.bind(this, spot),
        },
      ];

      const foundUser = this._getSpotUser(spot);

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
          if (
            !foundUser ||
            (foundUser.status !== SpotStatus.Absent &&
              foundUser.status !== SpotStatus.Confirmed)
          ) {
            return true;
          } else {
            return false;
          }
        } else if (kind.text === 'Cancel') {
          return foundUser && foundUser.status === SpotStatus.Confirmed;
        } else {
          return false;
        }
      });
    };

    return (
      <React.Fragment>
        <Helmet>
          <title>Spots - {SITE_TITLE}</title>
        </Helmet>
        <div className={classes.root}>
          <Typography variant="headline" noWrap={true}>
            My Spots
          </Typography>
          <Typography variant="body1">
            View the spots for activities you're a member of.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.showPast}
                onChange={this.handlePastToggleChange}
                value="on"
                color="primary"
              />
            }
            label="Show past spots"
          />
        </div>
        <div>
          <MyDataQuery>
            {({ loading, data }) => {
              if (loading || !data.allOrganizations) {
                return <LoadingComponent />;
              }

              const { allOrganizations } = data;

              const isActivityAdmin = !!allOrganizations.find(
                (org) =>
                  !!org.activities.find(
                    (activity) =>
                      !!activity.members.find(
                        (member) =>
                          member.user.id === this.props.cookies.get('id') &&
                          member.role === Role.Admin,
                      ),
                  ),
              );

              return (
                <React.Fragment>
                  <AdminSpotActionsCombo>
                    {(adminDeletionFunctions) => (
                      <SignupForSpotCombo>
                        {(signUpForSpot) => (
                          <MarkUnavailableForSpotCombo>
                            {(markUnavailableForSpot) => (
                              <CancelSpotSignupCombo>
                                {(cancelSpotSignup) => (
                                  <DeleteSpotCombo>
                                    {(deleteSpot) => {
                                      return allOrganizations.map((org) => (
                                        <React.Fragment key={org.id}>
                                          <br />
                                          <Typography variant="subheading">
                                            {org.name}
                                          </Typography>
                                          {org.activities.map((activity) => (
                                            <ExpansionPanel
                                              key={activity.id}
                                              expanded={
                                                this.state.panelStates[
                                                  activity.id
                                                ] === true
                                              }
                                              onChange={this.handlePanelChange(
                                                activity.id,
                                              )}
                                            >
                                              <ExpansionPanelSummary
                                                expandIcon={<ExpandMoreIcon />}
                                              >
                                                <Typography
                                                  className={
                                                    classes.expansionHeading
                                                  }
                                                >
                                                  {activity.name}
                                                </Typography>
                                              </ExpansionPanelSummary>
                                              <ExpansionPanelDetails>
                                                <Grid
                                                  container={true}
                                                  spacing={24}
                                                >
                                                  {activity.spots
                                                    //   .sort((spot1, spot2) => {
                                                    //     return spot1.startsAt > spot2.startsAt ? -1 : 1;
                                                    //   })
                                                    // this isn't working for now ^
                                                    .filter((spot) => {
                                                      if (this.state.showPast) {
                                                        return true;
                                                      } else {
                                                        return (
                                                          luxon.DateTime.fromISO(
                                                            spot.endsAt,
                                                          ) >
                                                          luxon.DateTime.local()
                                                        );
                                                      }
                                                    })
                                                    .map((spot) => {
                                                      const availableSpots =
                                                        spot.numberNeeded -
                                                        spot.members.filter(
                                                          (member) =>
                                                            member.status ===
                                                            SpotStatus.Confirmed,
                                                        ).length;

                                                      return (
                                                        <Grid
                                                          item={true}
                                                          xs={true}
                                                          key={spot.id}
                                                        >
                                                          <MediaCard
                                                            title={`${luxon.DateTime.fromISO(
                                                              spot.startsAt,
                                                            )
                                                              .setZone(
                                                                org.timezone,
                                                              )
                                                              .toLocaleString(
                                                                FRIENDLY_DATE_FORMAT_WITH_DAYNAME,
                                                              )} - ${luxon.DateTime.fromISO(
                                                              spot.endsAt,
                                                            )
                                                              .setZone(
                                                                org.timezone,
                                                              )
                                                              .toLocaleString(
                                                                luxon.DateTime.fromISO(
                                                                  spot.startsAt,
                                                                )
                                                                  .setZone(
                                                                    org.timezone,
                                                                  )
                                                                  .toFormat(
                                                                    'DD',
                                                                  ) ===
                                                                luxon.DateTime.fromISO(
                                                                  spot.endsAt,
                                                                )
                                                                  .setZone(
                                                                    org.timezone,
                                                                  )
                                                                  .toFormat(
                                                                    'DD',
                                                                  )
                                                                  ? luxon
                                                                      .DateTime
                                                                      .TIME_SIMPLE
                                                                  : FRIENDLY_DATE_FORMAT_WITH_DAYNAME,
                                                              )}`}
                                                            subheader={
                                                              <span>
                                                                {availableSpots ===
                                                                  0 && (
                                                                  <CheckCircleIcon fontSize="16px" />
                                                                )}{' '}
                                                                {now >
                                                                luxon.DateTime.fromISO(
                                                                  spot.endsAt,
                                                                )
                                                                  ? 'This spot is in the past with '
                                                                  : 'This spot is upcoming with '}{' '}
                                                                {availableSpots ===
                                                                0
                                                                  ? 'all spots filled'
                                                                  : `${availableSpots} spots still open`}
                                                              </span>
                                                            }
                                                            body={
                                                              <List>
                                                                {(spot.location ||
                                                                  activity.location ||
                                                                  org.location) && (
                                                                  <ListItem>
                                                                    <ListItemText
                                                                      primary="Location"
                                                                      secondary={
                                                                        spot.location ||
                                                                        activity.location ||
                                                                        org.location
                                                                      }
                                                                    />
                                                                  </ListItem>
                                                                )}
                                                              </List>
                                                            }
                                                            buttons={getButtons(
                                                              activity,
                                                              spot,
                                                              signUpForSpot,
                                                              markUnavailableForSpot,
                                                              cancelSpotSignup,
                                                            )}
                                                            actions={getActions(
                                                              org,
                                                              activity,
                                                              spot,
                                                              deleteSpot,
                                                            )}
                                                            members={spot.members.filter(
                                                              (member) =>
                                                                member.status ===
                                                                SpotStatus.Confirmed,
                                                            )}
                                                            absentMembers={spot.members.filter(
                                                              (member) =>
                                                                member.status ===
                                                                SpotStatus.Absent,
                                                            )}
                                                            memberDeleteCallback={
                                                              isActivityAdmin &&
                                                              adminDeletionFunctions.doDeleteSpotUserRole
                                                            }
                                                          />
                                                        </Grid>
                                                      );
                                                    })}
                                                </Grid>
                                              </ExpansionPanelDetails>
                                            </ExpansionPanel>
                                          ))}
                                        </React.Fragment>
                                      ));
                                    }}
                                  </DeleteSpotCombo>
                                )}
                              </CancelSpotSignupCombo>
                            )}
                          </MarkUnavailableForSpotCombo>
                        )}
                      </SignupForSpotCombo>
                    )}
                  </AdminSpotActionsCombo>
                  {isActivityAdmin && (
                    <Button
                      onClick={this._onClickFormAddModal}
                      variant="fab"
                      color="secondary"
                      aria-label="add"
                      className={classes.addButton}
                    >
                      <AddIcon />
                    </Button>
                  )}
                </React.Fragment>
              );
            }}
          </MyDataQuery>
        </div>
        {this.state.modalSpotOpen && (
          <SpotModal
            handleClose={this.handleSpotModalClose}
            spot={this.state.modalSpot}
            timezone={this.state.modalSpotTimezone}
            isOpen={this.state.modalSpotOpen}
          />
        )}
      </React.Fragment>
    );
  }

  private handleSpotModalClose = () => {
    this.setState({
      modalSpotOpen: false,
    });
  };

  private handlePanelChange = (panelId: string) => (
    event: React.ChangeEvent<{}>,
    expanded: boolean,
  ) => {
    this.setState({
      panelStates: {
        ...this.state.panelStates,
        [panelId]: expanded,
      },
    });
  };

  private handlePastToggleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({ showPast: event.currentTarget.checked });
  };

  private _getSpotUser = (spot: OrgActivitySpot) => {
    return spot.members.find((member) => {
      return member.user.id === this.props.cookies.get('id');
    });
  };

  private _onClickFormAddModal = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalSpot: null,
      modalSpotOpen: true,
    });
  };

  private _onClickFormEditModal = (
    org: Organization,
    spot: OrgActivitySpot,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalSpot: spot,
      modalSpotTimezone: org.timezone,
      modalSpotOpen: true,
    });
  };
}

export default compose(
  withCookies,
  withStyles(styles),
)(SpotList);
