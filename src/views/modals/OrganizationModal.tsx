import Button from '@material-ui/core/es/Button';
import Dialog from '@material-ui/core/es/Dialog';
import DialogActions from '@material-ui/core/es/DialogActions';
import DialogContent from '@material-ui/core/es/DialogContent';
import DialogContentText from '@material-ui/core/es/DialogContentText';
import DialogTitle from '@material-ui/core/es/DialogTitle';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import TextField from '@material-ui/core/es/TextField';
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import * as luxon from 'luxon';
import * as React from 'react';
import { compose } from 'react-apollo';
import {
  CreateOrganizationMutation,
  UpdateOrganizationMutation,
} from '../../queries';

export interface IState {}

export interface IOrgState {
  id?: string;
  name: string;
  timezone: string;
  description: string;
  location: string;
  link: string;
}

interface IOProps {
  handleClose: () => void;
  isOpen: boolean;
  org?: IOrgState;
}

const styles = (theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 200,
    },
  });

type IIProps = WithStyles<typeof styles>;

export type IProps = IOProps & IIProps;

class OrganizationModal extends React.Component<IProps, IState & IOrgState> {
  constructor(props: IProps) {
    super(props);
    if (props.org && props.org) {
      this.state = { ...props.org };
    } else {
      this.state = {
        name: '',
        timezone: luxon.DateTime.local().zoneName,
        description: '',
        location: '',
        link: '',
      };
    }
  }

  public render(): JSX.Element {
    const { classes } = this.props;

    if (!this.props.isOpen) {
      return null;
    }

    return (
      <Dialog
        open={this.props.isOpen}
        // fullScreen={fullScreen}
        onClose={this.props.handleClose}
        onBackdropClick={this.props.handleClose}
      >
        <React.Fragment>
          <DialogTitle>Organization</DialogTitle>
          <DialogContent>
            <DialogContentText />
            <TextField
              required={true}
              id="name"
              label="Name"
              className={classes.textField}
              value={this.state.name}
              margin="normal"
              onChange={this.handleChange('name')}
            />
            <TextField
              required={true}
              id="timezone"
              label="Timezone"
              className={classes.textField}
              value={this.state.timezone}
              margin="normal"
              onChange={this.handleChange('timezone')}
            />
            <TextField
              id="description"
              label="Description"
              value={this.state.description}
              className={classes.textField}
              margin="normal"
              multiline={true}
              rowsMax={4}
              onChange={this.handleChange('description')}
            />
            <TextField
              id="location"
              label="Location"
              value={this.state.location}
              className={classes.textField}
              margin="normal"
              onChange={this.handleChange('location')}
            />
            <TextField
              id="link"
              label="Website Link"
              value={this.state.link}
              className={classes.textField}
              margin="normal"
              onChange={this.handleChange('link')}
            />
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              color="primary"
              onClick={this.props.handleClose}
            >
              Cancel
            </Button>
            <CreateOrganizationMutation>
              {(createOrg) => (
                <UpdateOrganizationMutation>
                  {(updateOrg) => {
                    const _onClickAccept = (
                      event: React.MouseEvent<HTMLButtonElement>,
                    ): void => {
                      event.preventDefault();

                      if (this.props.org) {
                        updateOrg({
                          variables: {
                            id: this.state.id,
                            name: this.state.name,
                            timezone: this.state.timezone,
                            description: this.state.description,
                            location: this.state.location,
                            link: this.state.link,
                          },
                        });
                      } else {
                        createOrg({
                          variables: {
                            name: this.state.name,
                            timezone: this.state.timezone,
                            description: this.state.description,
                            location: this.state.location,
                            link: this.state.link,
                          },
                        });
                      }

                      this.props.handleClose();
                    };

                    return (
                      <Button
                        size="small"
                        color="primary"
                        onClick={_onClickAccept}
                      >
                        {this.props.org ? 'Update' : 'Create'}
                      </Button>
                    );
                  }}
                </UpdateOrganizationMutation>
              )}
            </CreateOrganizationMutation>
          </DialogActions>
        </React.Fragment>
      </Dialog>
    );
  }

  private handleChange = (name: string) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  };
}

export default compose(
  withStyles(styles, { withTheme: true }),
  withMobileDialog<IProps>(),
)(OrganizationModal);
