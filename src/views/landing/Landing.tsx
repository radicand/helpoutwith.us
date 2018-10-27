import Grid from '@material-ui/core/es/Grid';
import IconButton from '@material-ui/core/es/IconButton';
import Snackbar from '@material-ui/core/es/Snackbar';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles, {
  StyleRules,
  WithStyles,
} from '@material-ui/core/es/styles/withStyles';
import Typography from '@material-ui/core/es/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { memoize } from '@typed/functions';
import * as React from 'react';
import { compose, withApollo, WithApolloClient } from 'react-apollo';
import { Helmet } from 'react-helmet';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { SITE_TITLE } from '../../constants/System';
import { SigninUserMutation } from '../../queries';
import LoginService from '../../services/LoginService';
import GoogleSignIn from '../components/GoogleSignIn';

type IProps = RouteComponentProps<{}> &
  WithStyles<
    | 'root'
    | 'containerGrid'
    | 'titleText'
    | 'loginBox'
    | 'textField'
    | 'closeSnackbar'
  > &
  WithApolloClient<any>;

interface IState {
  snackbarOpen: boolean;
}

const styles = (theme: Theme) => {
  const myStyle: StyleRules = {
    root: {
      width: '100%',
      height: '100vh',
      zIndex: 1,
      overflow: 'hidden',
      backgroundColor: theme.palette.primary.dark,
    },
    containerGrid: {
      marginTop: theme.spacing.unit * 16,
      flexGrow: 1,
    },
    titleText: {
      color: theme.palette.primary.light,
    },
    loginBox: {
      padding: theme.spacing.unit * 2,
      backgroundColor: theme.palette.secondary.light,
    },
    textField: {
      width: '100%',
    },
    closeSnackbar: {
      width: theme.spacing.unit * 4,
      height: theme.spacing.unit * 4,
    },
  };

  return myStyle;
};

class Landing extends React.Component<IProps, IState> {
  private doLogin = memoize(async (signinUser: any, googleUser?: any) => {
    // console.log('called doLogin', googleUser);

    if (!googleUser) {
      return this.handleSnackbarOpen();
    }
    const id_token = googleUser.getAuthResponse().id_token;

    try {
      const result = await signinUser({
        variables: {
          id_token,
        },
      });

      if (
        result &&
        result.data &&
        result.data.authenticateGoogleUser &&
        result.data.authenticateGoogleUser.id
      ) {
        LoginService.login({
          token: result.data.authenticateGoogleUser.token,
          id: result.data.authenticateGoogleUser.id,
        });

        return this.props.history.push('/');

        // console.log(loginRes);
      }
    } catch (ex) {
      return this.handleSnackbarOpen();
    }
  });

  constructor(props: IProps) {
    super(props);
    this.state = {
      snackbarOpen: false,
    };
  }

  public componentWillMount() {
    //LoginService.logout();
    this.props.client.cache.reset();
  }

  public render() {
    const { classes } = this.props;

    // XXX will thise ever get called?
    if (LoginService.getLoginState().token) {
      return <Redirect to="/" />;
    }

    return (
      <div className={classes.root}>
        <Helmet>
          <title>Welcome - {SITE_TITLE}</title>
        </Helmet>
        <Grid
          container={true}
          justify="center"
          alignItems="center"
          className={classes.containerGrid}
        >
          <Grid item={true} xs={10}>
            <Typography
              variant="h3"
              align="center"
              className={classes.titleText}
            >
              {SITE_TITLE}
            </Typography>
            <Typography
              variant="h5"
              align="center"
              className={classes.titleText}
            >
              A place to volunteer and signup for groups and organizations
            </Typography>
          </Grid>
          <Grid item={true} xs={12}>
            <SigninUserMutation ignoreResults={true}>
              {(signinUser: any) => {
                // console.log(
                //     'rendered inner signin',
                // );

                return (
                  <GoogleSignIn
                    width={200}
                    longtitle={true}
                    onSignIn={this.doLogin.bind(this, signinUser)}
                  />
                );
              }}
            </SigninUserMutation>
          </Grid>
        </Grid>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.snackbarOpen}
          autoHideDuration={6000}
          onClose={this.handleSnackbarClose}
          //   SnackbarContentProps={{
          //     'aria-describedby': 'message-id',
          //   }}
          message={<span id="message-id">Login failed.</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.closeSnackbar}
              onClick={this.handleSnackbarClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }

  private handleSnackbarClose = (
    event: React.SyntheticEvent<any>,
    reason?: string,
  ) => {
    if (event) {
      event.preventDefault();
    }
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ snackbarOpen: false });
  };

  private handleSnackbarOpen = (event?: React.SyntheticEvent<any>) => {
    if (event) {
      event.preventDefault();
    }
    this.setState({ snackbarOpen: true });
  };
}

export default compose(
  withApollo,
  withStyles(styles, { withTheme: true }),
)(Landing);
