import { CircularProgress } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = (theme: Theme) => ({
  progress: {
    margin: `${theme.spacing.unit * 2}px auto`,
  },
});

const LoadingComponent = (props: any) => <CircularProgress className={props.classes.progress} />;

export default withStyles(styles, { withTheme: true })(LoadingComponent);
