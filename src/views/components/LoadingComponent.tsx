import CircularProgress from '@material-ui/core/es/CircularProgress';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles from '@material-ui/core/es/styles/withStyles';
import * as React from 'react';

const styles = (theme: Theme) => ({
  progress: {
    margin: `${theme.spacing.unit * 2}px auto`,
  },
});

const LoadingComponent = (props: any) => (
  <CircularProgress className={props.classes.progress} />
);

export default withStyles(styles, { withTheme: true })(LoadingComponent);
