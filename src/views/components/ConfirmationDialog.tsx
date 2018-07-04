import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import * as React from 'react';

export interface IProps {
  title: string;
  open: boolean;
  message?: string;
  handleClose: () => void;
  confirmAction: () => void;
}

class ConfirmationDialog extends React.Component<IProps, {}> {
  public render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
        {this.props.message && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{this.props.message}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.props.confirmAction} color="primary" autoFocus={true}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmationDialog;
