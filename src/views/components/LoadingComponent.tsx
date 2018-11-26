import CircularProgress from '@material-ui/core/es/CircularProgress';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import * as React from 'react';

export type ILoadingComponentProps = WithStyles<typeof styles>;

const styles = (theme: Theme) =>
  createStyles({
    progress: {
      margin: `${theme.spacing.unit * 2}px auto`,
    },
  });

const LoadingComponent = ({ classes }: ILoadingComponentProps) => (
  <CircularProgress className={classes.progress} />
);

export default withStyles(styles, { withTheme: true })(LoadingComponent);
