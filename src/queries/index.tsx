// tslint:disable:max-classes-per-file
import { DocumentNode } from 'graphql';
import * as React from 'react';
import {
  Mutation,
  MutationOptions,
  MutationProps,
  MutationState,
  OperationVariables,
  Query,
  QueryProps,
} from 'react-apollo';
import uuid from 'uuid/v4';
import LoginService from '../services/LoginService';
import CreateActivityUserRoleGQL from './addActivityUserRole.graphql';
import CreateOrganizationUserRoleGQL from './addOrgUserRole.graphql';
import CreateActivityGQL from './createAct.graphql';
import CreateOrganizationGQL from './createOrg.graphql';
import CreateSpotGQL from './createSpot.graphql';
import CreateSpotUserRoleGQL from './createSpotUserRole.graphql';
import DeleteActivityGQL from './deleteActivity.graphql';
import DeleteActivityUserRoleGQL from './deleteActivityUserRole.graphql';
import DeleteOrganizationGQL from './deleteOrganization.graphql';
import DeleteOrganizationUserRoleGQL from './deleteOrganizationUserRole.graphql';
import DeleteSpotGQL from './deleteSpot.graphql';
import DeleteSpotUserRoleGQL from './deleteSpotUserRole.graphql';
import LoggedInUserGQL from './loggedInUser.graphql';
import MyDataGQL from './myData.graphql';
import * as schema from './schema';
import SigninUserGQL from './signinUser.graphql';
import UpdateActivityGQL from './updateActivity.graphql';
import UpdateOrganizationGQL from './updateOrganization.graphql';
import UpdateSpotGQL from './updateSpot.graphql';
import UpdateSpotUserRoleGQL from './updateSpotUserRole.graphql';

const wrappedQuery = <P extends any, V = OperationVariables>(
  query: DocumentNode,
  variables?: V,
  opts: {
    replaceUserId?: boolean;
    fetchPolicy?: QueryProps['fetchPolicy'];
  } = {},
) => {
  type QPO = QueryProps<P, V>;

  type WrappedProps = Pick<QPO, Exclude<keyof QPO, 'query'>>;

  return class WrappedQuery extends React.PureComponent<WrappedProps> {
    public render() {
      class UnwrappedComponent extends Query<P, V> {}

      if (opts.replaceUserId && variables && (variables as any).user_id) {
        (variables as any).user_id = LoginService.getLoginState().id;
      }

      return (
        <UnwrappedComponent
          query={query}
          variables={variables}
          {...opts}
          {...this.props}
        />
      );
    }
  };
};

const wrappedMutation = <P extends any, V = OperationVariables>(
  mutation: DocumentNode,
  opts?: {
    refetchQueries?: MutationProps['refetchQueries'];
    variables?: V;
    updateFunc?: (variables: V) => MutationProps<P>['update'];
    update?: MutationProps['update'];
    optimisticResponseFunc?: (
      variables: V,
    ) => MutationProps<P>['optimisticResponse'];
    optimisticResponse?: MutationProps['optimisticResponse'];
  },
) => {
  type MPO = MutationProps<P, V>;

  type WrappedProps = Pick<MPO, Exclude<keyof MPO, 'mutation'>>;

  return class WrappedMutation extends React.PureComponent<
    WrappedProps,
    MutationState<P>
  > {
    public render() {
      class UnwrappedComponent extends Mutation<P, V> {}

      return (
        <UnwrappedComponent mutation={mutation} {...opts} {...this.props}>
          {(unwrappedFunc, unwrappedResult) => {
            const wrappedFunc = (executionOpts?: MutationOptions<P, V>) => {
              if (executionOpts && executionOpts.variables) {
                if (opts && opts.updateFunc) {
                  executionOpts.update = opts.updateFunc(
                    executionOpts.variables,
                  );
                }

                if (opts && opts.optimisticResponseFunc) {
                  executionOpts.optimisticResponse = opts.optimisticResponseFunc(
                    executionOpts.variables,
                  );
                }
              }

              return unwrappedFunc(executionOpts);
            };

            return this.props.children(wrappedFunc, unwrappedResult);
          }}
        </UnwrappedComponent>
      );
    }
  };
};

export const MyDataQuery = wrappedQuery<schema.myData, schema.myDataVariables>(
  MyDataGQL,
  {
    user_id: LoginService.getLoginState().id,
  },
  {
    replaceUserId: true,
  },
);

export const LoggedInUserQuery = wrappedQuery<schema.loggedInUser>(
  LoggedInUserGQL /* , {}, {fetchPolicy: 'network-only'} */,
); // enabling network-only forces a refectch everytime layout is re-rendered (e.g., on menu expansion)

export const CreateOrganizationUserRoleMutation = wrappedMutation<
  schema.addOrgUserRole,
  schema.addOrgUserRoleVariables
>(CreateOrganizationUserRoleGQL, {
  // do this for now since we don't know enough about a new user
  // revisit later.
  refetchQueries: [
    {
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
    },
  ],
});

export const CreateActivityUserRoleMutation = wrappedMutation<
  schema.addActivityUserRole,
  schema.addActivityUserRoleVariables
>(CreateActivityUserRoleGQL, {
  optimisticResponseFunc: (variables: schema.addActivityUserRoleVariables) => ({
    __typename: 'Mutation',
    addActivityUserRole: {
      __typename: 'AddActivityUserRolePayload',
      activityUserRoleId: uuid(),
    },
  }),
  updateFunc: (variables: schema.addActivityUserRoleVariables) => (
    proxy,
    { data: { addActivityUserRole } },
  ) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Add our item from the mutation to the end.
    data.allOrganizations.forEach((org) => {
      const thisAct = org.activities.find(
        (act) => act.id === variables.activityId,
      );
      if (thisAct) {
        const thisUser = org.members.find(
          (member) => member.user.id === variables.userId,
        );

        const insertItem = {
          __typename: 'ActivityUserRole' as 'ActivityUserRole',
          id: addActivityUserRole.activityUserRoleId,
          role: variables.role as schema.myData_allOrganizations_activities_members['role'],
          user: thisUser.user,
        };

        thisAct.members.push(insertItem);
      }
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const CreateSpotMutation = wrappedMutation<
  schema.createSpot,
  schema.createSpotVariables
>(CreateSpotGQL, {
  optimisticResponseFunc: (variables: schema.createSpotVariables) => {
    return {
      __typename: 'Mutation',
      createSpot: {
        __typename: 'Spot',
        id: uuid(),
        startsAt: variables.startsAt,
        endsAt: variables.endsAt,
        location: variables.location,
        members: [],
        numberNeeded: variables.numberNeeded,
        activity: {
          __typename: 'Activity',
          id: variables.activityId,
        },
      },
    };
  },
  updateFunc: (variables: schema.createSpotVariables) => (
    proxy,
    { data: { createSpot } },
  ) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    const currentUserData = proxy.readQuery<schema.loggedInUser>({
      query: LoggedInUserGQL,
    });

    // Add our item from the mutation to the end.
    data.allOrganizations.forEach((org) => {
      const activity = org.activities.find(
        (act) => act.id === variables.activityId,
      );
      if (activity) {
        if (currentUserData) {
          const insertItem = {
            __typename: 'Spot' as 'Spot',
            id: createSpot.id,
            startsAt: createSpot.startsAt,
            endsAt: createSpot.endsAt,
            location: createSpot.location,
            numberNeeded: createSpot.numberNeeded,
            activity: {
              __typename: 'Activity' as 'Activity',
              id: activity.id,
              organization: {
                __typename: 'Organization' as 'Organization',
                id: org.id,
              },
            },
            members: [] as [],
          };
          activity.spots.push(insertItem);
        }
      }
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const CreateOrganizationMutation = wrappedMutation<
  schema.createOrg,
  schema.createOrgVariables
>(CreateOrganizationGQL, {
  optimisticResponseFunc: (variables: schema.createOrgVariables) => ({
    __typename: 'Mutation',
    createOrg: {
      __typename: 'CreateOrgPayload',
      id: uuid(),
      name: variables.name,
      link: variables.link,
      timezone: variables.timezone,
      description: variables.description,
      location: variables.location,
      initialAdminMemberId: uuid(),
    },
  }),
  updateFunc: (variables: schema.createOrgVariables) => (
    proxy,
    { data: { createOrg } },
  ) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    const currentUserData = proxy.readQuery<schema.loggedInUser>({
      query: LoggedInUserGQL,
    });

    if (currentUserData) {
      const insertItem = {
        __typename: 'Organization' as 'Organization',
        id: createOrg.id,
        name: createOrg.name,
        location: createOrg.location,
        description: createOrg.description,
        link: createOrg.link,
        timezone: createOrg.timezone,
        bannerImage: null as null,
        members: [
          {
            __typename: 'OrganizationUserRole' as 'OrganizationUserRole',
            id: createOrg.initialAdminMemberId,
            role: schema.Role.Admin,
            user: {
              ...currentUserData.loggedInUser,
              __typename: 'User' as 'User',
            },
          },
        ],
        activities: [] as any,
      };

      data.allOrganizations.push(insertItem);
    }

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
      data,
    });
  },
});

export const CreateActivityMutation = wrappedMutation<
  schema.createAct,
  schema.createActVariables
>(CreateActivityGQL, {
  optimisticResponseFunc: (variables: schema.createActVariables) => ({
    __typename: 'Mutation',
    createAct: {
      __typename: 'CreateActPayload',
      id: uuid(),
      name: variables.name,
      description: variables.description,
      location: variables.location,
      initialAdminMemberId: uuid(),
    },
  }),
  updateFunc: (variables: schema.createActVariables) => (
    proxy,
    { data: { createAct } },
  ) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    const currentUserData = proxy.readQuery<schema.loggedInUser>({
      query: LoggedInUserGQL,
    });

    // Add our item from the mutation to the end.
    data.allOrganizations.forEach((org) => {
      if (org.id === variables.organizationId) {
        if (currentUserData) {
          const insertItem = {
            __typename: 'Activity' as 'Activity',
            id: createAct.id,
            name: createAct.name,
            location: createAct.location,
            description: createAct.description,
            organization: {
              __typename: 'Organization' as 'Organization',
              id: variables.organizationId,
            },
            members: [
              {
                __typename: 'ActivityUserRole' as 'ActivityUserRole',
                id: createAct.initialAdminMemberId,
                role: schema.Role.Admin,
                user: {
                  ...currentUserData.loggedInUser,
                  __typename: 'User' as 'User',
                },
              },
            ],
            spots: [] as any,
          };
          org.activities.push(insertItem);
        }
      }
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const CreateSpotUserRoleMutation = wrappedMutation<
  schema.createSpotUserRole,
  schema.createSpotUserRoleVariables
>(CreateSpotUserRoleGQL, {
  optimisticResponseFunc: (variables: schema.createSpotUserRoleVariables) => ({
    __typename: 'Mutation',
    createSpotUserRole: {
      __typename: 'SpotUserRole',
      id: uuid(),
      status: variables.status,
      user: {
        __typename: 'User',
        id: variables.userId,
      },
    },
  }),
  updateFunc: (variables: schema.createSpotUserRoleVariables) => (
    proxy,
    { data: { createSpotUserRole } },
  ) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Add our item from the mutation to the end.
    data.allOrganizations.forEach((org) => {
      org.activities.forEach((act) => {
        const thisSpot = act.spots.find((spot) => spot.id === variables.spotId);
        if (thisSpot) {
          const thisUser = org.members.find(
            (member) => member.user.id === variables.userId,
          );

          const insertItem = {
            ...createSpotUserRole,
            user: thisUser.user,
          };
          thisSpot.members.push(insertItem);
        }
      });
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const UpdateOrganizationMutation = wrappedMutation<
  schema.updateOrganization,
  schema.updateOrganizationVariables
>(UpdateOrganizationGQL, {
  optimisticResponseFunc: (variables: schema.updateOrganizationVariables) => ({
    __typename: 'Mutation',
    updateOrganization: {
      __typename: 'Organization',
      id: variables.id,
      name: variables.name,
      description: variables.description,
      location: variables.location,
      timezone: variables.timezone,
      link: variables.link,
    },
  }),
});

export const UpdateActivityMutation = wrappedMutation<
  schema.updateActivity,
  schema.updateActivityVariables
>(UpdateActivityGQL, {
  optimisticResponseFunc: (variables: schema.updateActivityVariables) => ({
    __typename: 'Mutation',
    updateActivity: {
      __typename: 'Activity',
      id: variables.id,
      name: variables.name,
      description: variables.description,
      location: variables.location,
    },
  }),
});

export const UpdateSpotMutation = wrappedMutation<
  schema.updateSpot,
  schema.updateSpotVariables
>(UpdateSpotGQL, {
  optimisticResponseFunc: (variables: schema.updateSpotVariables) => ({
    __typename: 'Mutation',
    updateSpot: {
      __typename: 'Spot',
      id: variables.id,
      numberNeeded: variables.numberNeeded,
      startsAt: variables.startsAt,
      endsAt: variables.endsAt,
      location: variables.location || '',
    },
  }),
});

export const SigninUserMutation = wrappedMutation<
  schema.SigninUser,
  schema.SigninUserVariables
>(SigninUserGQL);

export const DeleteOrganizationUserRoleMutation = wrappedMutation<
  schema.deleteOrganizationUserRole,
  schema.deleteOrganizationUserRoleVariables
>(DeleteOrganizationUserRoleGQL, {
  optimisticResponseFunc: (
    variables: schema.deleteOrganizationUserRoleVariables,
  ) => ({
    __typename: 'Mutation',
    deleteOrganizationUserRole: {
      __typename: 'OrganizationUserRole',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteOrganizationUserRole } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    data.allOrganizations.forEach((org) => {
      const thisItemIndex = org.members.findIndex(
        (item) => item.id === deleteOrganizationUserRole.id,
      );

      if (thisItemIndex >= 0) {
        org.members.splice(thisItemIndex, 1);
      }
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const DeleteOrganizationMutation = wrappedMutation<
  schema.deleteOrganization,
  schema.deleteOrganizationVariables
>(DeleteOrganizationGQL, {
  optimisticResponseFunc: (variables: schema.deleteOrganizationVariables) => ({
    __typename: 'Mutation',
    deleteOrganization: {
      __typename: 'Organization',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteOrganization } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    const thisItemIndex = data.allOrganizations.findIndex(
      (item) => item.id === deleteOrganization.id,
    );

    if (thisItemIndex >= 0) {
      data.allOrganizations.splice(thisItemIndex, 1);
    }

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
      data,
    });
  },
});

export const DeleteActivityUserRoleMutation = wrappedMutation<
  schema.deleteActivityUserRole,
  schema.deleteActivityUserRoleVariables
>(DeleteActivityUserRoleGQL, {
  optimisticResponseFunc: (
    variables: schema.deleteActivityUserRoleVariables,
  ) => ({
    __typename: 'Mutation',
    deleteActivityUserRole: {
      __typename: 'ActivityUserRole',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteActivityUserRole } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    data.allOrganizations.forEach((org) => {
      org.activities.forEach((act) => {
        const thisItemIndex = act.members.findIndex(
          (item) => item.id === deleteActivityUserRole.id,
        );

        if (thisItemIndex >= 0) {
          act.members.splice(thisItemIndex, 1);
        }
      });
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const DeleteActivityMutation = wrappedMutation<
  schema.deleteActivity,
  schema.deleteActivityVariables
>(DeleteActivityGQL, {
  optimisticResponseFunc: (variables: schema.deleteActivityVariables) => ({
    __typename: 'Mutation',
    deleteActivity: {
      __typename: 'Activity',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteActivity } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    data.allOrganizations.find((org) => {
      const thisItemIndex = org.activities.findIndex(
        (item) => item.id === deleteActivity.id,
      );

      if (thisItemIndex >= 0) {
        org.activities.splice(thisItemIndex, 1);

        return true;
      }

      return false;
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const DeleteSpotUserRoleMutation = wrappedMutation<
  schema.deleteSpotUserRole,
  schema.deleteSpotUserRoleVariables
>(DeleteSpotUserRoleGQL, {
  optimisticResponseFunc: (variables: schema.deleteSpotUserRoleVariables) => ({
    __typename: 'Mutation',
    deleteSpotUserRole: {
      __typename: 'SpotUserRole',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteSpotUserRole } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    data.allOrganizations.find((org) => {
      return !!org.activities.find((act) => {
        return !!act.spots.find((spot) => {
          const thisSpotMemberIndex = spot.members.findIndex(
            (member) => member.id === deleteSpotUserRole.id,
          );
          if (thisSpotMemberIndex >= 0) {
            spot.members.splice(thisSpotMemberIndex, 1);

            return true;
          }

          return false;
        });
      });
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const DeleteSpotMutation = wrappedMutation<
  schema.deleteSpot,
  schema.deleteSpotVariables
>(DeleteSpotGQL, {
  optimisticResponseFunc: (variables: schema.deleteSpotVariables) => ({
    __typename: 'Mutation',
    deleteSpot: {
      __typename: 'Spot',
      id: variables.id,
    },
  }),
  update: (proxy, { data: { deleteSpot } }) => {
    // Read the data from our cache for this query.
    const data = proxy.readQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: {
        user_id: LoginService.getLoginState().id,
      },
    });

    // Remove the item
    data.allOrganizations.find((org) => {
      return !!org.activities.find((act) => {
        const thisSpotIndex = act.spots.findIndex(
          (spot) => spot.id === deleteSpot.id,
        );
        if (thisSpotIndex >= 0) {
          act.spots.splice(thisSpotIndex, 1);

          return true;
        }

        return false;
      });
    });

    // Write our data back to the cache.
    proxy.writeQuery<schema.myData, schema.myDataVariables>({
      query: MyDataGQL,
      variables: { user_id: LoginService.getLoginState().id },
      data,
    });
  },
});

export const UpdateSpotUserRoleMutation = wrappedMutation<
  schema.updateSpotUserRole,
  schema.updateSpotUserRoleVariables
>(UpdateSpotUserRoleGQL, {
  optimisticResponseFunc: (variables: schema.updateSpotUserRoleVariables) => ({
    __typename: 'Mutation',
    updateSpotUserRole: {
      __typename: 'SpotUserRole',
      id: variables.id,
      status: variables.status,
    },
  }),
});
