import Button from '@material-ui/core/es/Button';
import Dialog from '@material-ui/core/es/Dialog';
import DialogActions from '@material-ui/core/es/DialogActions';
import DialogContent from '@material-ui/core/es/DialogContent';
import DialogContentText from '@material-ui/core/es/DialogContentText';
import DialogTitle from '@material-ui/core/es/DialogTitle';
import TextField from '@material-ui/core/es/TextField';
import * as React from 'react';

export interface IProps {
  open: boolean;
  handleClose: () => void;
}

interface IState {
  url?: string;
}

class ICalDialog extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      url: '',
    };
  }
  public componentWillMount() {
    fetch('/ical/getMyLink', {
      credentials: 'same-origin',
    })
      .then((response) => response.json())
      .then((json) =>
        this.setState({
          url: `${document.location.protocol}//${document.location.host}${
            json.url
          }`,
        }),
      );
  }

  public render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">iCal URL Link</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Copy the below URL and import it with your favorite Calendar tool
            (such as Google Calendar, Apple Calendar, etc).
            <br />
            <TextField
              multiline={true}
              rowsMax="4"
              fullWidth={true}
              margin="normal"
              value={this.state.url || 'Loading...'}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ICalDialog;
