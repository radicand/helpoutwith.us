import Button from '@material-ui/core/es/Button';
import Collapse from '@material-ui/core/es/Collapse';
import IconButton from '@material-ui/core/es/IconButton';
import List from '@material-ui/core/es/List';
import ListItem from '@material-ui/core/es/ListItem';
import ListItemIcon from '@material-ui/core/es/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/es/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/es/ListItemText';
import ListSubheader from '@material-ui/core/es/ListSubheader';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import Typography from '@material-ui/core/es/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircle from '@material-ui/icons/CheckCircle';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MoodIcon from '@material-ui/icons/Mood';
import SyncIcon from '@material-ui/icons/Sync';
import { groupBy, map } from '@typed/list';
import * as luxon from 'luxon';
import * as React from 'react';
import { compose } from 'react-apollo';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants/System';
import { FRIENDLY_DATE_FORMAT_WITH_DAYNAME } from '../../constants/Time';
import { MyDataQuery } from '../../queries';
import { CancelSpotSignupCombo } from '../../queries/actions';
import { myData, SpotStatus } from '../../queries/schema';
import LoginService from '../../services/LoginService';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ICalDialog from '../components/ICalDialog';
import LoadingComponent from '../components/LoadingComponent';

type SuperSpot = myData['allOrganizations'][0]['activities'][0]['spots'][0] & {
  _organization: myData['allOrganizations'][0];
  _activity: myData['allOrganizations'][0]['activities'][0];
};

interface IState {
  openUpcoming: boolean;
  openPast: boolean;
  showConfirmationDialog: boolean;
  showICalDialog: boolean;
  spotToCancel?: any; // LAZY
}

type IProps = WithStyles<'root' | 'listRoot' | 'nested'>;

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 30,
    padding: theme.spacing.unit * 4,
  },
  listRoot: {
    width: '100%',
    // maxWidth: 360,
    background: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class Home extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      openUpcoming: true,
      openPast: false,
      showICalDialog: false,
      showConfirmationDialog: false,
    };
  }

  public render() {
    const { classes } = this.props;

    const spots: SuperSpot[] = [];

    const formatSpotList = (canCancel: boolean, spot: SuperSpot) => (
      <ListItem button={true} className={classes.nested} key={spot.id}>
        <ListItemIcon>
          <CheckCircle />
        </ListItemIcon>
        <ListItemText
          inset={true}
          primary={spot._activity.name}
          secondary={luxon.DateTime.fromISO(spot.startsAt)
            .setZone(spot._organization.timezone)
            .toLocaleString(FRIENDLY_DATE_FORMAT_WITH_DAYNAME)}
        />
        {canCancel && (
          <ListItemSecondaryAction>
            <IconButton
              aria-label="Delete"
              onClick={canCancel && this.confirmRemoval.bind(this, spot)}
            >
              <CancelIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );

    const renderNoSpots = () => (
      <ListItem button={false} className={classes.nested}>
        <ListItemIcon>
          <MoodIcon />
        </ListItemIcon>
        <ListItemText inset={true} primary="Nothing here" />
      </ListItem>
    );

    return (
      <React.Fragment>
        <Helmet>
          <title>Home - {SITE_TITLE}</title>
        </Helmet>
        <div className={classes.root}>
          <Typography variant="h5" noWrap={true}>
            Welcome!
          </Typography>
          <Typography variant="body2">
            Our goal is to make it as easy as possible to manage and sign up for
            volunteering opportunities. Use the navigation on the left to view
            or create organizations, activities, and spots, and{' '}
            <a href="mailto:howus-feedback@radicand.org?subject=HOWUS%20Feedback">
              don't hesitate to let us know
            </a>{' '}
            how we can make the experience better or faster for you.
          </Typography>
        </div>
        <MyDataQuery>
          {({ loading, data }) => {
            if (loading) {
              return <LoadingComponent />;
            }

            const allOrganizations = data.allOrganizations;
            allOrganizations.forEach((org) =>
              org.activities.forEach((activity) =>
                activity.spots.forEach((spot) => {
                  if (
                    spot.members.find(
                      (member) =>
                        member.user.id === LoginService.getLoginState().id &&
                        member.status === SpotStatus.Confirmed,
                    )
                  ) {
                    spots.push({
                      ...spot,
                      _organization: org,
                      _activity: activity,
                    });
                  }
                }),
              ),
            );

            spots.sort((a, b) => {
              return a.startsAt > b.startsAt ? 1 : -1;
            });

            const schedule = groupBy<'upcoming' | 'past', SuperSpot[]>(
              (spot) => {
                return luxon.DateTime.fromISO((spot as any).endsAt) >
                  luxon.DateTime.local()
                  ? 'upcoming'
                  : 'past';
              },
              spots as any,
            );

            return (
              <List
                className={classes.listRoot}
                subheader={
                  <ListSubheader>
                    My Schedule{' '}
                    <Button variant="contained" onClick={this.toggleICalDialog}>
                      {' '}
                      <SyncIcon />
                      Sync with your Calendar
                    </Button>
                  </ListSubheader>
                }
              >
                <ListItem button={true} onClick={this.handleClickUpcoming}>
                  <ListItemText primary="Upcoming" />
                  {this.state.openUpcoming ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse
                  component="li"
                  in={this.state.openUpcoming}
                  timeout="auto"
                  unmountOnExit={true}
                >
                  <List disablePadding={true}>
                    {schedule.upcoming && schedule.upcoming.length > 0
                      ? map(formatSpotList.bind(this, true), schedule.upcoming)
                      : renderNoSpots()}
                  </List>
                </Collapse>
                <ListItem button={true} onClick={this.handleClickPast}>
                  <ListItemText primary="Past" />
                  {this.state.openPast ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse
                  component="li"
                  in={this.state.openPast}
                  timeout="auto"
                  unmountOnExit={true}
                >
                  <List disablePadding={true}>
                    {schedule.past && schedule.past.length > 0
                      ? map(formatSpotList.bind(this, false), schedule.past)
                      : renderNoSpots()}
                  </List>
                </Collapse>
              </List>
            );
          }}
        </MyDataQuery>
        <CancelSpotSignupCombo>
          {(cancelSpotAction) => {
            const cancelAction = async () => {
              await cancelSpotAction(this.state.spotToCancel);

              this.setState({
                showConfirmationDialog: false,
                spotToCancel: null,
              });
            };

            return (
              <ConfirmationDialog
                title="Are you sure you want to cancel?"
                handleClose={this.closeConfirmationDialog}
                open={this.state.showConfirmationDialog}
                confirmAction={cancelAction}
              />
            );
          }}
        </CancelSpotSignupCombo>
        <ICalDialog
          handleClose={this.toggleICalDialog}
          open={this.state.showICalDialog}
        />
      </React.Fragment>
    );
  }

  private toggleICalDialog = () => {
    this.setState((prevState) => ({
      ...prevState,
      showICalDialog: !prevState.showICalDialog,
    }));
  };

  private closeConfirmationDialog = () => {
    this.setState({
      showConfirmationDialog: false,
    });
  };

  private confirmRemoval = (spot: SuperSpot) => {
    this.setState({
      showConfirmationDialog: true,
      spotToCancel: spot,
    });
  };

  private handleClickUpcoming = () => {
    this.setState({ openUpcoming: !this.state.openUpcoming });
  };

  private handleClickPast = () => {
    this.setState({ openPast: !this.state.openPast });
  };
}

export default compose(withStyles(styles, { withTheme: true }))(Home);
