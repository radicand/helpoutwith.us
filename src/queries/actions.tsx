// tslint:disable:max-classes-per-file

import * as React from 'react';
import {
  CreateSpotUserRoleMutation,
  DeleteActivityMutation,
  DeleteActivityUserRoleMutation,
  DeleteOrganizationMutation,
  DeleteOrganizationUserRoleMutation,
  DeleteSpotMutation,
  DeleteSpotUserRoleMutation,
  UpdateSpotUserRoleMutation,
} from '.';
import LoginService from '../services/LoginService';
import * as schema from './schema';

type Organization = schema.myData['allOrganizations'][0];
type OrgActivity = schema.myData['allOrganizations'][0]['activities'][0];
type OrgActivitySpot = schema.myData['allOrganizations'][0]['activities'][0]['spots'][0];

export interface ISpotProps {
  children: (param: (spot: OrgActivitySpot) => {}) => {};
}

export class SignupForSpotCombo extends React.Component<ISpotProps, {}> {
  public render() {
    return (
      <CreateSpotUserRoleMutation>
        {(createSpotUserRole) => (
          <UpdateSpotUserRoleMutation>
            {(updateSpotUserRole) => {
              async function executeMutation(spot: OrgActivitySpot) {
                const foundSpotUser = spot.members.find((member) => {
                  return member.user.id === LoginService.getLoginState().id;
                });

                if (!foundSpotUser) {
                  return createSpotUserRole({
                    variables: {
                      status: schema.SpotStatus.Confirmed,
                      userId: LoginService.getLoginState().id,
                      spotId: spot.id,
                    },
                  });
                } else {
                  return updateSpotUserRole({
                    variables: {
                      status: schema.SpotStatus.Confirmed,
                      id: foundSpotUser.id,
                    },
                  });
                }
              }

              return this.props.children(executeMutation);
            }}
          </UpdateSpotUserRoleMutation>
        )}
      </CreateSpotUserRoleMutation>
    );
  }
}

export class MarkUnavailableForSpotCombo extends React.Component<
  ISpotProps,
  {}
> {
  public render() {
    return (
      <CreateSpotUserRoleMutation>
        {(createSpotUserRole) => (
          <UpdateSpotUserRoleMutation>
            {(updateSpotUserRole) => {
              async function executeMutation(spot: OrgActivitySpot) {
                const foundSpotUser = spot.members.find((member) => {
                  return member.user.id === LoginService.getLoginState().id;
                });

                if (!foundSpotUser) {
                  return createSpotUserRole({
                    variables: {
                      status: schema.SpotStatus.Absent,
                      userId: LoginService.getLoginState().id,
                      spotId: spot.id,
                    },
                  });
                } else {
                  return updateSpotUserRole({
                    variables: {
                      status: schema.SpotStatus.Absent,
                      id: foundSpotUser.id,
                    },
                  });
                }
              }

              return this.props.children(executeMutation);
            }}
          </UpdateSpotUserRoleMutation>
        )}
      </CreateSpotUserRoleMutation>
    );
  }
}

export class CancelSpotSignupCombo extends React.Component<ISpotProps, {}> {
  public render() {
    return (
      <UpdateSpotUserRoleMutation>
        {(updateSpotUserRole) => {
          async function executeMutation(spot: OrgActivitySpot) {
            const foundSpotUser = spot.members.find((member) => {
              return member.user.id === LoginService.getLoginState().id;
            });

            if (!foundSpotUser) {
              return;
            } else {
              return updateSpotUserRole({
                variables: {
                  id: foundSpotUser.id,
                  status: schema.SpotStatus.Cancelled,
                },
              });
            }
          }

          return this.props.children(executeMutation);
        }}
      </UpdateSpotUserRoleMutation>
    );
  }
}

export class DeleteSpotCombo extends React.Component<ISpotProps, {}> {
  public render() {
    return (
      <DeleteSpotMutation>
        {(deleteSpot) => (
          <DeleteSpotUserRoleMutation>
            {(deleteSpotUserRole) => {
              async function executeMutationCombo(spot: OrgActivitySpot) {
                await Promise.all(
                  spot.members.map((member) => {
                    return deleteSpotUserRole({
                      variables: {
                        id: member.id,
                      },
                    });
                  }),
                );

                return deleteSpot({
                  variables: {
                    id: spot.id,
                  },
                });
              }

              return this.props.children(executeMutationCombo);
            }}
          </DeleteSpotUserRoleMutation>
        )}
      </DeleteSpotMutation>
    );
  }
}

export interface IActivityProps {
  children: (param: (activity: OrgActivity) => {}) => {};
}
export class DeleteActivityCombo extends React.Component<IActivityProps, {}> {
  public render() {
    return (
      <DeleteActivityMutation>
        {(deleteActivity) => (
          <DeleteActivityUserRoleMutation>
            {(deleteActivityUserRole) => (
              <DeleteSpotCombo>
                {(deleteSpotCombo) => {
                  async function executeMutationCombo(activity: OrgActivity) {
                    const myUserRole = activity.members.find(
                      (member) =>
                        member.user.id === LoginService.getLoginState().id,
                    );
                    await Promise.all(
                      activity.spots.map(async (spot) => {
                        return deleteSpotCombo(spot);
                      }),
                    );

                    // delete all users except myself (to avoid permission race condition)
                    await Promise.all(
                      activity.members
                        .filter((member) => member !== myUserRole)
                        .map((member) => {
                          return deleteActivityUserRole({
                            variables: {
                              id: member.id,
                            },
                          });
                        }),
                    );

                    // now delete myself
                    await deleteActivityUserRole({
                      variables: {
                        id: myUserRole.id,
                      },
                    });

                    return deleteActivity({
                      variables: {
                        id: activity.id,
                      },
                    });
                  }

                  return this.props.children(executeMutationCombo);
                }}
              </DeleteSpotCombo>
            )}
          </DeleteActivityUserRoleMutation>
        )}
      </DeleteActivityMutation>
    );
  }
}

export interface IOrganizationProps {
  children: (param: (org: Organization) => {}) => {};
}
export class DeleteOrganizationCombo extends React.Component<
  IOrganizationProps,
  {}
> {
  public render() {
    return (
      <DeleteOrganizationMutation>
        {(deleteOrganization) => (
          <DeleteOrganizationUserRoleMutation>
            {(deleteOrganizationUserRole) => (
              <DeleteActivityCombo>
                {(deleteActivityCombo) => {
                  async function executeMutationCombo(org: Organization) {
                    const myUserRole = org.members.find(
                      (member) =>
                        member.user.id === LoginService.getLoginState().id,
                    );

                    await Promise.all(
                      org.activities.map(async (activity) => {
                        return deleteActivityCombo(activity);
                      }),
                    );

                    // delete all users except myself (to avoid permission race condition)
                    await Promise.all(
                      org.members
                        .filter((member) => member !== myUserRole)
                        .map((member) => {
                          return deleteOrganizationUserRole({
                            variables: {
                              id: member.id,
                            },
                          });
                        }),
                    );

                    // now delete myself
                    await deleteOrganizationUserRole({
                      variables: {
                        id: myUserRole.id,
                      },
                    });

                    return deleteOrganization({
                      variables: {
                        id: org.id,
                      },
                    });
                  }

                  return this.props.children(executeMutationCombo);
                }}
              </DeleteActivityCombo>
            )}
          </DeleteOrganizationUserRoleMutation>
        )}
      </DeleteOrganizationMutation>
    );
  }
}
