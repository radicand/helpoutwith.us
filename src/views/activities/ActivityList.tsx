import ExpansionPanel from '@material-ui/core/es/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/es/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/es/ExpansionPanelSummary';
import Fab from '@material-ui/core/es/Fab';
import Grid from '@material-ui/core/es/Grid';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import createStyles from '@material-ui/core/es/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import Typography from '@material-ui/core/es/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants/System';
import { MyDataQuery } from '../../queries';
import {
  AdminSpotActionsCombo,
  DeleteActivityCombo,
} from '../../queries/actions';
import { myData, Role } from '../../queries/schema';
import LoginService from '../../services/LoginService';
import MediaCard from '../components/cards/MediaCard';
import LoadingComponent from '../components/LoadingComponent';
import ActivityModal from '../modals/ActivityModal';
import ActivityUserRoleModal from '../modals/ActivityUserRoleModal';

type IProps = WithStyles<typeof styles>;

interface IState {
  modalActOpen: boolean;
  modalActInviteOpen: boolean;
  modalAct: OrgActivity;
  modalActOrg: Organization;
}

type Organization = myData['allOrganizations'][0];
type OrgActivity = myData['allOrganizations'][0]['activities'][0];

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
    expansionHeading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  });

class ActivityList extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      modalAct: null,
      modalActOrg: null,
      modalActInviteOpen: false,
      modalActOpen: false,
    };
  }

  public render() {
    const { classes } = this.props;

    const getActions = (
      organization: Organization,
      activity: OrgActivity,
      _onClickFormRemoveAction: (
        event: React.MouseEvent<HTMLButtonElement>,
      ) => {},
    ) => {
      const kinds = [
        {
          label: 'Edit',
          icon: <EditIcon />,
          onClick: this._onClickFormEditModal.bind(this, activity),
        },

        {
          label: 'Remove',
          icon: <DeleteIcon />,
          onClick: _onClickFormRemoveAction.bind(this, activity),
        },
        {
          label: 'Invite Member',
          icon: <PersonAddIcon />,
          onClick: this._onClickFormInviteAction.bind(
            this,
            activity,
            organization,
          ),
        },
      ];

      return kinds.filter((kind) => {
        const isAdmin = (
          member: typeof activity.members[0] | typeof organization.members[0],
        ) => {
          return (
            member.role === Role.Admin &&
            member.user.id === LoginService.getLoginState().id
          );
        };

        if (kind.label === 'Edit') {
          return (
            !!activity.members.find(isAdmin) ||
            !!organization.members.find(isAdmin)
          );
        } else if (kind.label === 'Remove') {
          return !!organization.members.find(isAdmin);
        } else if (kind.label === 'Invite Member') {
          return (
            !!activity.members.find(isAdmin) ||
            !!organization.members.find(isAdmin)
          );
        } else {
          return false;
        }
      });
    };

    return (
      <React.Fragment>
        <Helmet>
          <title>Activities - {SITE_TITLE}</title>
        </Helmet>
        <div className={classes.root}>
          <Typography variant="h5" noWrap={true}>
            My Activities
          </Typography>
          <Typography variant="body2">
            View the activities you're part of here. Activities are recurring
            needs of the same type, such as "Bring dessert", or "Run
            soundboard".
          </Typography>
        </div>
        <div>
          <MyDataQuery>
            {({ loading, data }) => {
              if (loading) {
                return <LoadingComponent />;
              }

              const { allOrganizations } = data;

              const isOrgAdmin = !!allOrganizations.find(
                (org) =>
                  !!org.members.find(
                    (member) =>
                      member.user.id === LoginService.getLoginState().id &&
                      member.role === Role.Admin,
                  ),
              );

              return (
                <React.Fragment>
                  <AdminSpotActionsCombo>
                    {(adminDeletionFunctions) =>
                      allOrganizations.map((org) => (
                        <ExpansionPanel key={org.id}>
                          <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Typography className={classes.expansionHeading}>
                              {org.name}
                            </Typography>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails>
                            <DeleteActivityCombo>
                              {(executeDeletion) => (
                                <Grid container={true} spacing={24}>
                                  {org.activities.map((activity) => (
                                    <Grid
                                      item={true}
                                      xs={true}
                                      key={activity.id}
                                    >
                                      <MediaCard
                                        title={activity.name}
                                        subheader={org.name}
                                        bodyText={activity.description}
                                        actions={getActions(
                                          org,
                                          activity,
                                          executeDeletion.bind(this, activity),
                                        )}
                                        members={activity.members}
                                        memberDeleteCallback={
                                          isOrgAdmin &&
                                          adminDeletionFunctions.doDeleteActivityUserRole
                                        }
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              )}
                            </DeleteActivityCombo>
                          </ExpansionPanelDetails>
                        </ExpansionPanel>
                      ))
                    }
                  </AdminSpotActionsCombo>
                  {isOrgAdmin && (
                    <Fab
                      onClick={this._onClickFormModal}
                      color="secondary"
                      aria-label="add"
                      className={classes.addButton}
                    >
                      <AddIcon />
                    </Fab>
                  )}
                </React.Fragment>
              );
            }}
          </MyDataQuery>
        </div>
        {this.state.modalActOpen && (
          <ActivityModal
            activity={this.state.modalAct}
            isOpen={this.state.modalActOpen}
            handleClose={this.handleActModalClose}
          />
        )}
        {this.state.modalActInviteOpen && (
          <ActivityUserRoleModal
            activity={this.state.modalAct}
            organization={this.state.modalActOrg}
            isOpen={this.state.modalActInviteOpen}
            handleClose={this.handleActUserRoleModalClose}
          />
        )}
      </React.Fragment>
    );
  }

  private handleActModalClose = () => {
    this.setState({
      modalActOpen: false,
    });
  };

  private handleActUserRoleModalClose = () => {
    this.setState({
      modalActInviteOpen: false,
    });
  };

  private _onClickFormEditModal = (
    activity: OrgActivity,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalAct: activity,
      modalActOpen: true,
    });
  };

  private _onClickFormModal = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalAct: null,
      modalActOpen: true,
    });
  };

  private _onClickFormInviteAction = (
    activity: OrgActivity,
    org: Organization,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    this.setState({
      modalAct: activity,
      modalActOrg: org,
      modalActInviteOpen: true,
    });
  };
}

export default withStyles(styles, { withTheme: true })(ActivityList);
