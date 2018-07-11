import Button from '@material-ui/core/es/Button';
import Dialog from '@material-ui/core/es/Dialog';
import DialogActions from '@material-ui/core/es/DialogActions';
import DialogContent from '@material-ui/core/es/DialogContent';
import DialogContentText from '@material-ui/core/es/DialogContentText';
import DialogTitle from '@material-ui/core/es/DialogTitle';
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
            <DialogContentText id="alert-dialog-description">
              {this.props.message}
            </DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={this.props.confirmAction}
            color="primary"
            autoFocus={true}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmationDialog;
