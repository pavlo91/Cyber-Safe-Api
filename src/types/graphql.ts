import { Prisma } from '@prisma/client';
import StringFilterMode = Prisma.QueryMode;
import OrderDirection = Prisma.SortOrder;
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ApolloContext } from './apollo';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: any, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<any> | any
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  NullObject: null;
};

export type AnyUserRole = UserRole & {
  __typename?: 'AnyUserRole';
  id: Scalars['ID'];
  role: Role;
  status: RoleStatus;
};

export type ArrayOrder = {
  _count?: InputMaybe<OrderDirection>;
};

export type BooleanFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<Scalars['Boolean']>;
};

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<Scalars['DateTime']>;
};

export type FloatFilter = {
  equals?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  not?: InputMaybe<Scalars['Float']>;
};

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<Scalars['Int']>;
};

export type Jwt = {
  __typename?: 'JWT';
  token: Scalars['String'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  activate?: Maybe<Scalars['ID']>;
  createTeam?: Maybe<Scalars['ID']>;
  inviteAthlete?: Maybe<Scalars['ID']>;
  inviteCoach?: Maybe<Scalars['ID']>;
  inviteParent?: Maybe<Scalars['ID']>;
  inviteStaff?: Maybe<Scalars['ID']>;
  leaveTeam?: Maybe<Scalars['ID']>;
  login: Jwt;
  register?: Maybe<Scalars['ID']>;
  removeMember?: Maybe<Scalars['ID']>;
  removeParent?: Maybe<Scalars['ID']>;
  removeRole?: Maybe<Scalars['ID']>;
  requestResetPassword?: Maybe<Scalars['ID']>;
  resetPassword?: Maybe<Scalars['ID']>;
  updatePassword?: Maybe<Scalars['ID']>;
  updateProfile?: Maybe<Scalars['ID']>;
  updateTeam?: Maybe<Scalars['ID']>;
};


export type MutationActivateArgs = {
  password: Scalars['String'];
  passwordToken: Scalars['String'];
  user: UserCreate;
};


export type MutationCreateTeamArgs = {
  input: TeamCreate;
};


export type MutationInviteAthleteArgs = {
  email: Scalars['String'];
};


export type MutationInviteCoachArgs = {
  email: Scalars['String'];
};


export type MutationInviteParentArgs = {
  childId: Scalars['ID'];
  email: Scalars['String'];
  relation?: InputMaybe<Scalars['String']>;
};


export type MutationInviteStaffArgs = {
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRegisterArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  team: TeamCreate;
  user: UserCreate;
};


export type MutationRemoveMemberArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveParentArgs = {
  childId: Scalars['ID'];
  id: Scalars['ID'];
};


export type MutationRemoveRoleArgs = {
  id: Scalars['ID'];
};


export type MutationRequestResetPasswordArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  password: Scalars['String'];
  passwordToken: Scalars['String'];
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String'];
  oldPassword: Scalars['String'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
};

export { OrderDirection };

export type Page = {
  index?: InputMaybe<Scalars['Int']>;
  size?: InputMaybe<Scalars['Int']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  count: Scalars['Int'];
  hasNext: Scalars['Boolean'];
  hasPrev: Scalars['Boolean'];
  index: Scalars['Int'];
  size: Scalars['Int'];
  total: Scalars['Int'];
};

export type PaginatedTeam = {
  __typename?: 'PaginatedTeam';
  nodes: Array<Team>;
  page: PageInfo;
};

export type PaginatedUser = {
  __typename?: 'PaginatedUser';
  nodes: Array<User>;
  page: PageInfo;
};

export type ParentRole = UserRole & {
  __typename?: 'ParentRole';
  childUser: User;
  id: Scalars['ID'];
  relation?: Maybe<Scalars['String']>;
  role: Role;
  status: RoleStatus;
};

export type Query = {
  __typename?: 'Query';
  children: PaginatedUser;
  member: User;
  members: PaginatedUser;
  parents: PaginatedUser;
  profile: User;
  statsByCreatedUsers: Array<StatsByDay>;
  team: Team;
  teams: PaginatedTeam;
  user: User;
  users: PaginatedUser;
};


export type QueryChildrenArgs = {
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryMemberArgs = {
  id: Scalars['ID'];
};


export type QueryMembersArgs = {
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryParentsArgs = {
  childId: Scalars['ID'];
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryStatsByCreatedUsersArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryTeamArgs = {
  id: Scalars['ID'];
};


export type QueryTeamsArgs = {
  order?: InputMaybe<TeamOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryUsersArgs = {
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};

export const Role = {
  Athlete: 'ATHLETE',
  Coach: 'COACH',
  Parent: 'PARENT',
  Staff: 'STAFF'
} as const;

export type Role = typeof Role[keyof typeof Role];
export const RoleStatus = {
  Accepted: 'ACCEPTED',
  Declined: 'DECLINED',
  Pending: 'PENDING'
} as const;

export type RoleStatus = typeof RoleStatus[keyof typeof RoleStatus];
export type StatsByDay = {
  __typename?: 'StatsByDay';
  day: Scalars['DateTime'];
  value: Scalars['Int'];
};

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<StringFilterMode>;
  not?: InputMaybe<Scalars['String']>;
};

export { StringFilterMode };

export type Team = {
  __typename?: 'Team';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  memberCount: Scalars['Int'];
  name: Scalars['String'];
};

export type TeamCreate = {
  name: Scalars['String'];
};

export type TeamOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  memberCount?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
};

export type TeamRole = UserRole & {
  __typename?: 'TeamRole';
  id: Scalars['ID'];
  role: Role;
  status: RoleStatus;
  team: Team;
};

export type UpdateProfileInput = {
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateTeamInput = {
  name?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  emailConfirmed: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  parentCount: Scalars['Int'];
  parentRole?: Maybe<ParentRole>;
  roles: Array<UserRole>;
};

export type UserCreate = {
  name: Scalars['String'];
};

export type UserOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  email?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
  parentCount?: InputMaybe<OrderDirection>;
};

export type UserRole = {
  id: Scalars['ID'];
  role: Role;
  status: RoleStatus;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AnyUserRole: ResolverTypeWrapper<AnyUserRole>;
  ArrayOrder: ArrayOrder;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BooleanFilter: BooleanFilter;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DateTimeFilter: DateTimeFilter;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FloatFilter: FloatFilter;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IntFilter: IntFilter;
  JWT: ResolverTypeWrapper<Jwt>;
  Mutation: ResolverTypeWrapper<{}>;
  NullObject: ResolverTypeWrapper<Scalars['NullObject']>;
  OrderDirection: Prisma.SortOrder;
  Page: Page;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedTeam: ResolverTypeWrapper<PaginatedTeam>;
  PaginatedUser: ResolverTypeWrapper<PaginatedUser>;
  ParentRole: ResolverTypeWrapper<ParentRole>;
  Query: ResolverTypeWrapper<{}>;
  Role: Role;
  RoleStatus: RoleStatus;
  StatsByDay: ResolverTypeWrapper<StatsByDay>;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringFilter: StringFilter;
  StringFilterMode: Prisma.QueryMode;
  Team: ResolverTypeWrapper<Team>;
  TeamCreate: TeamCreate;
  TeamOrder: TeamOrder;
  TeamRole: ResolverTypeWrapper<TeamRole>;
  UpdateProfileInput: UpdateProfileInput;
  UpdateTeamInput: UpdateTeamInput;
  User: ResolverTypeWrapper<User>;
  UserCreate: UserCreate;
  UserOrder: UserOrder;
  UserRole: ResolversTypes['AnyUserRole'] | ResolversTypes['ParentRole'] | ResolversTypes['TeamRole'];
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AnyUserRole: AnyUserRole;
  ArrayOrder: ArrayOrder;
  Boolean: Scalars['Boolean'];
  BooleanFilter: BooleanFilter;
  DateTime: Scalars['DateTime'];
  DateTimeFilter: DateTimeFilter;
  Float: Scalars['Float'];
  FloatFilter: FloatFilter;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  IntFilter: IntFilter;
  JWT: Jwt;
  Mutation: {};
  NullObject: Scalars['NullObject'];
  Page: Page;
  PageInfo: PageInfo;
  PaginatedTeam: PaginatedTeam;
  PaginatedUser: PaginatedUser;
  ParentRole: ParentRole;
  Query: {};
  StatsByDay: StatsByDay;
  String: Scalars['String'];
  StringFilter: StringFilter;
  Team: Team;
  TeamCreate: TeamCreate;
  TeamOrder: TeamOrder;
  TeamRole: TeamRole;
  UpdateProfileInput: UpdateProfileInput;
  UpdateTeamInput: UpdateTeamInput;
  User: User;
  UserCreate: UserCreate;
  UserOrder: UserOrder;
  UserRole: ResolversParentTypes['AnyUserRole'] | ResolversParentTypes['ParentRole'] | ResolversParentTypes['TeamRole'];
};

export type AnyUserRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['AnyUserRole'] = ResolversParentTypes['AnyUserRole']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type JwtResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['JWT'] = ResolversParentTypes['JWT']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activate?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationActivateArgs, 'password' | 'passwordToken' | 'user'>>;
  createTeam?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationCreateTeamArgs, 'input'>>;
  inviteAthlete?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteAthleteArgs, 'email'>>;
  inviteCoach?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteCoachArgs, 'email'>>;
  inviteParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteParentArgs, 'childId' | 'email'>>;
  inviteStaff?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteStaffArgs, 'email'>>;
  leaveTeam?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  login?: Resolver<ResolversTypes['JWT'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'password' | 'team' | 'user'>>;
  removeMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'id'>>;
  removeParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveParentArgs, 'childId' | 'id'>>;
  removeRole?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveRoleArgs, 'id'>>;
  requestResetPassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRequestResetPasswordArgs, 'email'>>;
  resetPassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'password' | 'passwordToken'>>;
  updatePassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdatePasswordArgs, 'newPassword' | 'oldPassword'>>;
  updateProfile?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateTeam?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateTeamArgs, 'input'>>;
};

export interface NullObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullObject'], any> {
  name: 'NullObject';
}

export type OrderDirectionResolvers = EnumResolverSignature<{ ASC?: any, DESC?: any }, ResolversTypes['OrderDirection']>;

export type PageInfoResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasNext?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPrev?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTeamResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedTeam'] = ResolversParentTypes['PaginatedTeam']> = {
  nodes?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedUserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedUser'] = ResolversParentTypes['PaginatedUser']> = {
  nodes?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ParentRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['ParentRole'] = ResolversParentTypes['ParentRole']> = {
  childUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  relation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  children?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryChildrenArgs>>;
  member?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryMemberArgs, 'id'>>;
  members?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryMembersArgs>>;
  parents?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, RequireFields<QueryParentsArgs, 'childId'>>;
  profile?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  statsByCreatedUsers?: Resolver<Array<ResolversTypes['StatsByDay']>, ParentType, ContextType, RequireFields<QueryStatsByCreatedUsersArgs, 'days'>>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<QueryTeamArgs, 'id'>>;
  teams?: Resolver<ResolversTypes['PaginatedTeam'], ParentType, ContextType, Partial<QueryTeamsArgs>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type StatsByDayResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['StatsByDay'] = ResolversParentTypes['StatsByDay']> = {
  day?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StringFilterModeResolvers = EnumResolverSignature<{ DEFAULT?: any, INSENSITIVE?: any }, ResolversTypes['StringFilterMode']>;

export type TeamResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  memberCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['TeamRole'] = ResolversParentTypes['TeamRole']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailConfirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  parentRole?: Resolver<Maybe<ResolversTypes['ParentRole']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserRole']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['UserRole'] = ResolversParentTypes['UserRole']> = {
  __resolveType: TypeResolveFn<'AnyUserRole' | 'ParentRole' | 'TeamRole', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
};

export type Resolvers<ContextType = ApolloContext> = {
  AnyUserRole?: AnyUserRoleResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  JWT?: JwtResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NullObject?: GraphQLScalarType;
  OrderDirection?: OrderDirectionResolvers;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedTeam?: PaginatedTeamResolvers<ContextType>;
  PaginatedUser?: PaginatedUserResolvers<ContextType>;
  ParentRole?: ParentRoleResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StatsByDay?: StatsByDayResolvers<ContextType>;
  StringFilterMode?: StringFilterModeResolvers;
  Team?: TeamResolvers<ContextType>;
  TeamRole?: TeamRoleResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserRole?: UserRoleResolvers<ContextType>;
};

