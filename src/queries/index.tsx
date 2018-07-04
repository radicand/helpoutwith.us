// tslint:disable:max-classes-per-file
import { DocumentNode } from 'graphql';
import * as React from 'react';
import {
  Mutation,
  MutationProps,
  MutationState,
  OperationVariables,
  Query,
  QueryProps,
} from 'react-apollo';
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
  fetchPolicy?: QueryProps['fetchPolicy'],
) => {
  type QPO = QueryProps<P, V>;

  type WrappedProps = Pick<QPO, Exclude<keyof QPO, 'query'>>;

  return class WrappedQuery extends React.Component<WrappedProps> {
    public render() {
      class UnwrappedComponent extends Query<P, V> {}

      return (
        <UnwrappedComponent
          query={query}
          variables={variables}
          fetchPolicy={fetchPolicy}
          {...this.props}
        />
      );
    }
  };
};

const wrappedMutation = <P extends any, V = OperationVariables>(
  mutation: DocumentNode,
  refetchQueries?: MutationProps['refetchQueries'],
  variables?: V,
) => {
  type MPO = MutationProps<P, V>;

  type WrappedProps = Pick<MPO, Exclude<keyof MPO, 'mutation'>>;

  return class WrappedMutation extends React.Component<
    WrappedProps,
    MutationState<P>
  > {
    public render() {
      class UnwrappedComponent extends Mutation<P, V> {}

      return (
        <UnwrappedComponent
          mutation={mutation}
          variables={variables}
          refetchQueries={refetchQueries}
          {...this.props}
        />
      );
    }
  };
};

export const MyDataQuery = wrappedQuery<schema.myData, schema.myDataVariables>(
  MyDataGQL,
  {
    user_id: LoginService.getLoginState().id,
  },
);
export const LoggedInUserQuery = wrappedQuery<schema.loggedInUser>(
  LoggedInUserGQL /* , {}, 'network-only' */,
); // enabling network-only forces a refectch everytime layout is re-rendered (e.g., on menu expansion)

export const CreateOrganizationUserRoleMutation = wrappedMutation<
  schema.addOrgUserRole,
  schema.addOrgUserRoleVariables
>(CreateOrganizationUserRoleGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const CreateActivityUserRoleMutation = wrappedMutation<
  schema.addActivityUserRole,
  schema.addActivityUserRoleVariables
>(CreateActivityUserRoleGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const CreateSpotMutation = wrappedMutation<
  schema.createSpot,
  schema.createSpotVariables
>(CreateSpotGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const CreateOrganizationMutation = wrappedMutation<
  schema.createOrg,
  schema.createOrgVariables
>(CreateOrganizationGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const CreateActivityMutation = wrappedMutation<
  schema.createAct,
  schema.createActVariables
>(CreateActivityGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const CreateSpotUserRoleMutation = wrappedMutation<
  schema.createSpotUserRole,
  schema.createSpotUserRoleVariables
>(CreateSpotUserRoleGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const UpdateOrganizationMutation = wrappedMutation<
  schema.updateOrganization,
  schema.updateOrganizationVariables
>(UpdateOrganizationGQL);

export const UpdateActivityMutation = wrappedMutation<
  schema.updateActivity,
  schema.updateActivityVariables
>(UpdateActivityGQL);

export const UpdateSpotMutation = wrappedMutation<
  schema.updateSpot,
  schema.updateSpotVariables
>(UpdateSpotGQL);

export const SigninUserMutation = wrappedMutation<
  schema.SigninUser,
  schema.SigninUserVariables
>(SigninUserGQL);

export const DeleteOrganizationUserRoleMutation = wrappedMutation<
  schema.deleteOrganizationUserRole,
  schema.deleteOrganizationUserRoleVariables
>(DeleteOrganizationUserRoleGQL);

export const DeleteOrganizationMutation = wrappedMutation<
  schema.deleteOrganization,
  schema.deleteOrganizationVariables
>(DeleteOrganizationGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const DeleteActivityUserRoleMutation = wrappedMutation<
  schema.deleteActivityUserRole,
  schema.deleteActivityUserRoleVariables
>(DeleteActivityUserRoleGQL);

export const DeleteActivityMutation = wrappedMutation<
  schema.deleteActivity,
  schema.deleteActivityVariables
>(DeleteActivityGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const DeleteSpotUserRoleMutation = wrappedMutation<
  schema.deleteSpotUserRole,
  schema.deleteSpotUserRoleVariables
>(DeleteSpotUserRoleGQL);

export const DeleteSpotMutation = wrappedMutation<
  schema.deleteSpot,
  schema.deleteSpotVariables
>(DeleteSpotGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);

export const UpdateSpotUserRoleMutation = wrappedMutation<
  schema.updateSpotUserRole,
  schema.updateSpotUserRoleVariables
>(UpdateSpotUserRoleGQL, [
  {
    query: MyDataGQL,
    variables: { user_id: LoginService.getLoginState().id },
  },
]);
