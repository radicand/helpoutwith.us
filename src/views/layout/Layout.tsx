import AppBar from '@material-ui/core/es/AppBar';
import Avatar from '@material-ui/core/es/Avatar';
import Divider from '@material-ui/core/es/Divider';
import Grid from '@material-ui/core/es/Grid';
import IconButton from '@material-ui/core/es/IconButton';
import List from '@material-ui/core/es/List';
import ListItem from '@material-ui/core/es/ListItem';
import ListItemIcon from '@material-ui/core/es/ListItemIcon';
import ListItemText from '@material-ui/core/es/ListItemText';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import SwipeableDrawer from '@material-ui/core/es/SwipeableDrawer';
import Toolbar from '@material-ui/core/es/Toolbar';
import Typography from '@material-ui/core/es/Typography';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupIcon from '@material-ui/icons/Group';
import GroupworkIcon from '@material-ui/icons/GroupWork';
import HomeIcon from '@material-ui/icons/Home';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import MenuIcon from '@material-ui/icons/Menu';
import SecurityIcon from '@material-ui/icons/Security';
import TodayIcon from '@material-ui/icons/Today';
import classnamer from 'classnamer';
import * as React from 'react';
import { compose } from 'react-apollo';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { SITE_TITLE, VERSION } from '../../constants/System';
import { LoggedInUserQuery } from '../../queries';
import LoginService from '../../services/LoginService';
import { getInitials } from '../../utils';
import GoogleSignIn from '../components/GoogleSignIn';
import LoadingComponent from '../components/LoadingComponent';
import PrivacyPolicyModal from '../modals/PrivacyPolicyModal';

type IProps = WithStyles<typeof styles> & RouteComponentProps<{}>;

export interface IState {
  modalPrivacyOpen?: boolean;
  drawerOpen?: boolean;
}

const drawerWidth = 240;
const drawerWidthClosed = 56;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      width: '100%',
      //height: 430,
      marginTop: theme.spacing.unit * 0,
      zIndex: 1,
      overflow: 'hidden',
    },
    appFrame: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: '100%',
    },
    appBar: {
      position: 'fixed',
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      color: theme.palette.primary.contrastText,
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 36,
      color: theme.palette.primary.contrastText,
    },
    flex: {
      flex: 1,
    },
    hide: {
      display: 'none',
    },
    drawerPaper: {
      position: 'fixed',
      height: '100%',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      width: theme.spacing.unit * 7,
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    drawerInner: {
      // Make the items inside not wrap when transitioning:
      width: drawerWidth,
      backgroundColor: 'white',
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    avatarRow: {
      width: drawerWidth,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    avatar: {
      marginLeft: 16,
      marginTop: 8,
      marginBottom: 8,
      color: '#fff',
      backgroundColor: theme.palette.secondary.light,
      transition: theme.transitions.create(
        ['height', 'width', 'marginBottom', 'marginLeft'],
        {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        },
      ),
      marginRight: 16,
      [theme.breakpoints.down('xs')]: {
        marginLeft: theme.spacing.unit * 1.5,
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
      },
      width: 25,
      height: 25,
    },
    bigAvatar: {
      width: 60,
      height: 60,
      marginBottom: 8,
    },
    avatarInfo: {
      marginTop: -8,
      marginLeft: 8,
      marginBottom: 8,
    },
    content: {
      width: '100%',
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      //padding: 24,
      height: 'calc(100% - 56px)',
      marginTop: 16,
      marginLeft: drawerWidthClosed,
      [theme.breakpoints.up('sm')]: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
        marginLeft: drawerWidthClosed + theme.spacing.unit * 2,
      },
    },
    menuButtonList: {
      paddingRight: '16px',
    },
  });

class Layout extends React.Component<IProps, IState> {
  private googleUser: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      modalPrivacyOpen: false,
      drawerOpen: false,
    };
  }
  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.appFrame}>
        <AppBar
          className={classnamer(
            classes.appBar,
            this.state.drawerOpen && classes.appBarShift,
          )}
        >
          <Toolbar disableGutters={!this.state.drawerOpen}>
            <IconButton
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              className={classnamer(
                classes.menuButton,
                this.state.drawerOpen && classes.hide,
              )}
            >
              <MenuIcon />
            </IconButton>
            <div className={classnamer(classes.flex)}>
              <Typography color="inherit" variant="h6" noWrap={true}>
                {SITE_TITLE}
              </Typography>
              <Typography color="inherit" variant="caption" noWrap={true}>
                {VERSION}
              </Typography>
            </div>
          </Toolbar>
        </AppBar>
        <LoggedInUserQuery>
          {({ loading, data }) => {
            if (loading) {
              return <LoadingComponent />;
            } else if (!data || !data.loggedInUser) {
              return <Redirect to="/login" />;
            }

            const loggedInUser = data.loggedInUser;

            return (
              <React.Fragment>
                <SwipeableDrawer
                  variant="permanent"
                  classes={{
                    paper: classnamer(
                      classes.drawerPaper,
                      !this.state.drawerOpen && classes.drawerPaperClose,
                    ),
                  }}
                  open={this.state.drawerOpen}
                  onOpen={this.handleDrawerOpen}
                  onClose={this.handleDrawerClose}
                >
                  <div className={classes.drawerInner}>
                    <div className={classes.drawerHeader}>
                      <div style={{ display: 'none' }}>
                        <GoogleSignIn
                          width={125}
                          height={40}
                          longtitle={false}
                          onSignIn={this.onGoogleSignIn}
                        />
                      </div>
                      <IconButton onClick={this.handleDrawerClose}>
                        <ChevronLeftIcon />
                      </IconButton>
                    </div>

                    <Grid container={true} className={classes.avatarRow}>
                      <Grid item={true}>
                        <Avatar
                          id="avatar"
                          alt={loggedInUser.name}
                          src={loggedInUser.photoLink}
                          className={
                            this.state.drawerOpen
                              ? classnamer(classes.avatar, classes.bigAvatar)
                              : classes.avatar
                          }
                        >
                          {!loggedInUser.photoLink &&
                            getInitials(loggedInUser.name)}
                        </Avatar>
                      </Grid>
                      {this.state.drawerOpen && (
                        <Grid item={true}>
                          <div className={classes.avatarInfo}>
                            <Typography variant="body1">
                              {loggedInUser.name}
                            </Typography>
                            <Typography variant="body2">
                              {loggedInUser.email}
                            </Typography>
                          </div>
                        </Grid>
                      )}
                    </Grid>
                    <Divider />
                    <List className={classes.menuButtonList}>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/')}
                      >
                        <ListItemIcon>
                          <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                      </ListItem>
                    </List>
                    <Divider />
                    <List>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/open')}
                      >
                        <ListItemIcon>
                          <LiveHelpIcon />
                        </ListItemIcon>
                        <ListItemText primary="Who What When" />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/open')}
                      >
                        <ListItemIcon>
                          <TodayIcon />
                        </ListItemIcon>
                        <ListItemText primary="What's Open" />
                      </ListItem>
                    </List>
                    <Divider />
                    <List>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/orgs')}
                      >
                        <ListItemIcon>
                          <GroupIcon />
                        </ListItemIcon>
                        <ListItemText primary="Organizations" />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/activities')}
                      >
                        <ListItemIcon>
                          <BeachAccessIcon />
                        </ListItemIcon>
                        <ListItemText primary="Activities" />
                      </ListItem>
                      <ListItem
                        button={true}
                        onClick={this.goto.bind(this, '/spots')}
                      >
                        <ListItemIcon>
                          <GroupworkIcon />
                        </ListItemIcon>
                        <ListItemText primary="Spots" />
                      </ListItem>
                    </List>
                    <Divider />
                    <List>
                      <ListItem
                        button={true}
                        onClick={this._onClickPrivacyPolicy}
                      >
                        <ListItemIcon>
                          <SecurityIcon />
                        </ListItemIcon>
                        <ListItemText primary="Privacy Policy" />
                      </ListItem>
                      <ListItem button={true} onClick={this.handleLogout}>
                        <ListItemIcon>
                          <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                      </ListItem>
                    </List>
                  </div>
                </SwipeableDrawer>
                <main className={classes.content}>{this.props.children}</main>
              </React.Fragment>
            );
          }}
        </LoggedInUserQuery>
        <PrivacyPolicyModal
          isOpen={this.state.modalPrivacyOpen}
          handleClose={this.handlePrivPolModalClose}
        />
      </div>
    );
  }

  private handlePrivPolModalClose = () => {
    this.setState({
      modalPrivacyOpen: false,
    });
  };

  private _onClickPrivacyPolicy = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalPrivacyOpen: true,
    });
  };

  private goto = (link: string) => {
    this.handleDrawerClose();
    this.props.history.push(link);
  };

  private handleDrawerOpen = () => {
    this.setState({ drawerOpen: true });
  };

  private handleDrawerClose = () => {
    this.setState({ drawerOpen: false });
  };

  private handleLogout = () => {
    if (this.googleUser) {
      try {
        this.googleUser.disconnect();
      } catch (ex) {
        //console.log('token probably expired', ex.message);
      }
    }

    LoginService.logout();

    // Prevent disconnect race condition
    setTimeout(() => {
      this.props.history.push('/login');
    }, 500);
  };

  private onGoogleSignIn = (googleUser: any) => {
    this.googleUser = googleUser;
  };
}

export default compose(
  withStyles(styles, { withTheme: true }),
  withRouter,
)(Layout);
