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
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import TextField from '@material-ui/core/es/TextField';
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import * as React from 'react';
import { compose } from 'react-apollo';
import { CreateOrganizationUserRoleMutation } from '../../queries';
import { myData, Role } from '../../queries/schema';

type Organization = myData['allOrganizations'][0];

const styles = (theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 200,
    },
    formControl: {
      margin: theme.spacing.unit,
      minWidth: 200,
    },
  });

export interface IState {}

export interface IOrgRoleState {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
}

interface IOProps {
  isOpen: boolean;
  handleClose: () => void;
  userRole?: IOrgRoleState;
  org: Organization;
}

type IIProps = WithStyles<typeof styles>;

export type IProps = IOProps & IIProps;

class OrganizationUserRoleModal extends React.Component<
  IProps,
  IState & IOrgRoleState
> {
  constructor(props: IProps) {
    super(props);
    if (props.userRole && props.userRole) {
      this.state = { ...props.userRole };
    } else {
      this.state = {
        id: null,
        name: '',
        email: '',
        role: Role.Member,
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
          <DialogTitle>Organization Member</DialogTitle>
          <DialogContent>
            <DialogContentText />
            <TextField
              id="email"
              label="Email"
              value={this.state.email}
              className={classes.textField}
              type="email"
              margin="normal"
              multiline={true}
              rowsMax={4}
              onChange={this.handleChange('email')}
            />
            <TextField
              required={true}
              id="name"
              label="Name"
              className={classes.textField}
              value={this.state.name}
              margin="normal"
              disabled={true}
              onChange={this.handleChange('name')}
            />
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="role">Role *</InputLabel>
              <Select
                value={this.state.role}
                onChange={this.handleChange('role')}
                input={<Input name="role" id="role" />}
              >
                {Object.keys(Role).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              color="primary"
              onClick={this.props.handleClose}
            >
              Cancel
            </Button>
            <CreateOrganizationUserRoleMutation>
              {(createOrgUserRole) => {
                const _onClickAccept = (
                  event: React.MouseEvent<HTMLButtonElement>,
                ): void => {
                  event.preventDefault();

                  createOrgUserRole({
                    variables: {
                      email: this.state.email,
                      role: this.state.role,
                      organizationId: this.props.org.id,
                    },
                  });

                  this.props.handleClose();
                };

                return (
                  <Button size="small" color="primary" onClick={_onClickAccept}>
                    {this.props.userRole ? 'Update' : 'Add'}
                  </Button>
                );
              }}
            </CreateOrganizationUserRoleMutation>
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
    if (!this.props.userRole && name === 'email') {
      this.setState({
        name: event.target.value,
      });
    }
  };
}

export default compose(
  withStyles(styles, { withTheme: true }),
  withMobileDialog<IProps>(),
)(OrganizationUserRoleModal);
