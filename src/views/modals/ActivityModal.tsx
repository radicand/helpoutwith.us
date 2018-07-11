import Button from '@material-ui/core/es/Button';
import Dialog from '@material-ui/core/es/Dialog';
import DialogActions from '@material-ui/core/es/DialogActions';
import DialogContent from '@material-ui/core/es/DialogContent';
import DialogContentText from '@material-ui/core/es/DialogContentText';
import DialogTitle from '@material-ui/core/es/DialogTitle';
import FormControl from '@material-ui/core/es/FormControl';
import Input from '@material-ui/core/es/Input';
import InputLabel from '@material-ui/core/es/InputLabel';
import MenuItem from '@material-ui/core/es/MenuItem';
import Select from '@material-ui/core/es/Select';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import TextField from '@material-ui/core/es/TextField';
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import * as React from 'react';
import { compose } from 'react-apollo';
import {
  CreateActivityMutation,
  MyDataQuery,
  UpdateActivityMutation,
} from '../../queries';
import LoadingComponent from '../components/LoadingComponent';

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 200,
  },
});

interface IState {
  id?: string;
  name?: string;
  description?: string;
  location?: string;
  organization?: string;
}

export interface IOProps {
  isOpen: boolean;
  handleClose: () => void;
  activity?: {
    id?: string;
    name?: string;
    description?: string;
    location?: string;
    organization?: {
      id: string;
    };
  };
}

export type IProps = IOProps & WithStyles<'container' | 'formControl'>;

class ActivityModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    if (props.activity) {
      this.state = {
        ...props.activity,
        organization: props.activity.organization.id,
      };
    } else {
      this.state = {
        name: '',
        description: '',
        location: '',
        organization: '',
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
          <DialogTitle>Activity</DialogTitle>
          <DialogContent>
            <DialogContentText />
            <form className={classes.container} autoComplete="off">
              {!this.props.activity && (
                <MyDataQuery>
                  {({ loading, data }) => {
                    if (loading) {
                      return <LoadingComponent />;
                    }

                    return (
                      <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="organization">
                          Organization *
                        </InputLabel>
                        <Select
                          value={this.state.organization}
                          onChange={this.handleChange('organization')}
                          input={
                            <Input name="organization" id="organization" />
                          }
                        >
                          {data.allOrganizations.map((org) => (
                            <MenuItem key={org.id} value={org.id}>
                              {org.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }}
                </MyDataQuery>
              )}
              <FormControl className={classes.formControl}>
                <TextField
                  required={true}
                  id="name"
                  label="Name"
                  value={this.state.name}
                  margin="normal"
                  onChange={this.handleChange('name')}
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  id="description"
                  label="Description"
                  value={this.state.description}
                  margin="normal"
                  multiline={true}
                  rowsMax={4}
                  onChange={this.handleChange('description')}
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  id="location"
                  label="Location"
                  value={this.state.location}
                  margin="normal"
                  onChange={this.handleChange('location')}
                />
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              color="primary"
              onClick={this.props.handleClose}
            >
              Cancel
            </Button>
            <CreateActivityMutation>
              {(createActivity) => (
                <UpdateActivityMutation>
                  {(updateActivity) => {
                    const _onClickAccept = (
                      event: React.MouseEvent<HTMLButtonElement>,
                    ): void => {
                      event.preventDefault();

                      if (this.props.activity) {
                        updateActivity({
                          variables: {
                            id: this.state.id,
                            name: this.state.name,
                            description: this.state.description,
                            location: this.state.location,
                          },
                        });
                      } else {
                        createActivity({
                          variables: {
                            name: this.state.name,
                            description: this.state.description,
                            location: this.state.location,
                            organizationId: this.props.activity
                              ? undefined
                              : this.state.organization,
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
                        {this.props.activity ? 'Update' : 'Create'}
                      </Button>
                    );
                  }}
                </UpdateActivityMutation>
              )}
            </CreateActivityMutation>
          </DialogActions>
        </React.Fragment>
      </Dialog>
    );
  }

  private handleChange = (name: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    this.setState({
      [name]: event.target.value,
    });
  };
}

export default compose(
  withStyles(styles, { withTheme: true }),
  withMobileDialog<IProps>(),
)(ActivityModal);
