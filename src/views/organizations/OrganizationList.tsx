import Button from '@material-ui/core/es/Button';
import Grid from '@material-ui/core/es/Grid';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import Typography from '@material-ui/core/es/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import { SITE_TITLE } from '../../constants/System';
import { MyDataQuery } from '../../queries';
import {
  AdminSpotActionsCombo,
  DeleteOrganizationCombo,
} from '../../queries/actions';
import { myData, Role } from '../../queries/schema';
import LoginService from '../../services/LoginService';
import MediaCard from '../components/cards/MediaCard';
import LoadingComponent from '../components/LoadingComponent';
import OrganizationModal from '../modals/OrganizationModal';
import OrganizationUserRoleModal from '../modals/OrganizationUserRoleModal';

type IProps = WithStyles<typeof styles> & RouteComponentProps<{}>;

interface IState {
  modalOrgOpen: boolean;
  modalOrgInviteOpen: boolean;
  modalOrg: myData['allOrganizations'][0];
}

type Organization = myData['allOrganizations'][0];

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: 30,
      padding: theme.spacing.unit * 3,
    },
    paper: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
    addButton: {
      position: 'fixed',
      bottom: theme.spacing.unit * 2,
      right: theme.spacing.unit * 2,
    },
    grid: {
      marginTop: theme.spacing.unit * 2,
    },
  });

class OrganizationList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      modalOrg: null,
      modalOrgOpen: false,
      modalOrgInviteOpen: false,
    };
  }

  public render() {
    const { classes } = this.props;

    const getActions = (
      org: Organization,
      _onClickFormRemoveAction: (org: Organization) => {},
    ) => {
      const kinds = [
        {
          label: 'Edit',
          icon: <EditIcon />,
          onClick: this._onClickFormEditModal.bind(this, org),
        },
        {
          label: 'Remove',
          icon: <DeleteIcon />,
          onClick: _onClickFormRemoveAction.bind(this, org),
        },
        {
          label: 'Invite Member',
          icon: <PersonAddIcon />,
          onClick: this._onClickFormInviteAction.bind(this, org),
        },
      ];

      const isAdmin = (member: typeof org.members[0]) => {
        return (
          member.role === Role.Admin &&
          member.user.id === LoginService.getLoginState().id
        );
      };

      return kinds.filter((kind) => {
        if (kind.label === 'Edit') {
          return !!org.members.find(isAdmin);
        } else if (kind.label === 'Remove') {
          return !!org.members.find(isAdmin);
        } else if (kind.label === 'Invite Member') {
          return !!org.members.find(isAdmin);
        } else {
          return false;
        }
      });
    };

    return (
      <React.Fragment>
        <Helmet>
          <title>Organizations - {SITE_TITLE}</title>
        </Helmet>
        <div className={classes.root}>
          <Typography variant="h5" noWrap={true}>
            My Organizations
          </Typography>
          <Typography variant="body2">
            View the organizations you're part of here. Organizations are groups
            that have one or more volunteering needs. For example, "Soccer Team"
            or "Church".
          </Typography>
          <Grid container={true} spacing={0} className={classes.grid}>
            <AdminSpotActionsCombo>
              {(adminDeletionFunctions) => (
                <DeleteOrganizationCombo>
                  {(deleteOrganization) => {
                    return (
                      <MyDataQuery>
                        {({ loading, data }) => {
                          if (loading) {
                            return <LoadingComponent />;
                          }

                          return data.allOrganizations.map((org) => (
                            <Grid item={true} xs={true} key={org.id}>
                              <MediaCard
                                imageLink={
                                  org.bannerImage ? org.bannerImage.url : null
                                }
                                title={org.name}
                                bodyText={org.description}
                                actions={getActions(org, deleteOrganization)}
                                members={org.members}
                                memberDeleteCallback={
                                  org.members.find(
                                    (member) =>
                                      member.role === Role.Admin &&
                                      member.user.id ===
                                        LoginService.getLoginState().id,
                                  ) &&
                                  adminDeletionFunctions.doDeleteOrganizationUserRole
                                }
                              />
                            </Grid>
                          ));
                        }}
                      </MyDataQuery>
                    );
                  }}
                </DeleteOrganizationCombo>
              )}
            </AdminSpotActionsCombo>
          </Grid>
        </div>
        <Button
          onClick={this._onClickFormModal}
          variant="fab"
          color="secondary"
          aria-label="add"
          className={classes.addButton}
        >
          <AddIcon />
        </Button>
        {this.state.modalOrgOpen && (
          <OrganizationModal
            org={this.state.modalOrg}
            isOpen={this.state.modalOrgOpen}
            handleClose={this.handleOrgModalClose}
          />
        )}
        {this.state.modalOrgInviteOpen && (
          <OrganizationUserRoleModal
            org={this.state.modalOrg}
            isOpen={this.state.modalOrgInviteOpen}
            handleClose={this.handleOrgUserRoleModalClose}
          />
        )}
      </React.Fragment>
    );
  }

  private handleOrgModalClose = () => {
    this.setState({
      modalOrgOpen: false,
    });
  };

  private handleOrgUserRoleModalClose = () => {
    this.setState({
      modalOrgInviteOpen: false,
    });
  };

  private _onClickFormEditModal = (
    org: Organization,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalOrg: org,
      modalOrgOpen: true,
    });
  };

  private _onClickFormModal = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalOrg: null,
      modalOrgOpen: true,
    });
  };

  private _onClickFormInviteAction = (
    org: Organization,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalOrg: org,
      modalOrgInviteOpen: true,
    });
  };
}

export default withStyles(styles, { withTheme: true })(OrganizationList);
