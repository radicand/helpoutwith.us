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
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import * as React from 'react';
import { compose } from 'react-apollo';
import { CreateActivityUserRoleMutation } from '../../queries';
import { myData, Role } from '../../queries/schema';

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

export interface IState {
  id?: string;
  userId?: string;
  role?: Role;
}

interface IOProps {
  isOpen: boolean;
  handleClose: () => void;
  userRole?: IState;
  organization: myData['allOrganizations'][0];
  activity: myData['allOrganizations'][0]['activities'][0];
}

type IIProps = WithStyles<typeof styles>;

export type IProps = IOProps & IIProps;

class ActivityUserRoleModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    if (props.userRole && props.userRole) {
      this.state = { ...props.userRole };
    } else {
      this.state = {
        id: null,
        userId: '',
        role: Role.Member,
      };
    }
  }

  public render(): JSX.Element {
    const { classes, organization } = this.props;

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
          <DialogTitle>Activity Member</DialogTitle>
          <DialogContent>
            <DialogContentText />
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="userId">Member *</InputLabel>
              <Select
                value={this.state.userId}
                onChange={this.handleChange('userId')}
                input={<Input name="userId" id="userId" />}
              >
                {organization.members.map((member) => (
                  <MenuItem key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <CreateActivityUserRoleMutation>
              {(createActivityUserRole) => {
                const _onClickAccept = (
                  event: React.MouseEvent<HTMLButtonElement>,
                ): void => {
                  event.preventDefault();

                  createActivityUserRole({
                    variables: {
                      userId: this.state.userId,
                      role: this.state.role,
                      activityId: this.props.activity.id,
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
            </CreateActivityUserRoleMutation>
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
)(ActivityUserRoleModal);
