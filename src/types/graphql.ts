import { Prisma } from '@prisma/client';
import StringFilterMode = Prisma.QueryMode;
import OrderDirection = Prisma.SortOrder;
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ApolloContext } from './apollo';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | undefined;
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

export type ActivateInput = {
  name: Scalars['String'];
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String'];
  id: Scalars['ID'];
  state: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
};

export type AddressCreate = {
  city: Scalars['String'];
  state: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
};

export type AddressFilter = {
  city?: InputMaybe<StringFilter>;
  state?: InputMaybe<StringFilter>;
  street?: InputMaybe<StringFilter>;
  zip?: InputMaybe<StringFilter>;
};

export type AddressOrder = {
  city?: InputMaybe<OrderDirection>;
  state?: InputMaybe<OrderDirection>;
  street?: InputMaybe<OrderDirection>;
  zip?: InputMaybe<OrderDirection>;
};

export type AddressUpdate = {
  city?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
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

export type Membership = {
  __typename?: 'Membership';
  createdAt: Scalars['DateTime'];
  isAdmin: Scalars['Boolean'];
  organization: Organization;
  user: User;
};

export type MembershipFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  isAdmin?: InputMaybe<BooleanFilter>;
  organization?: InputMaybe<OrganizationFilter>;
  user?: InputMaybe<UserFilter>;
};

export type MembershipOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  isAdmin?: InputMaybe<OrderDirection>;
  organization?: InputMaybe<OrganizationOrder>;
  user?: InputMaybe<UserOrder>;
};

export type MembershipUpdate = {
  isAdmin?: InputMaybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activate?: Maybe<Scalars['ID']>;
  inviteMember?: Maybe<Scalars['ID']>;
  inviteParent?: Maybe<Scalars['ID']>;
  inviteStaff?: Maybe<Scalars['ID']>;
  login: Jwt;
  register?: Maybe<Scalars['ID']>;
  removeMember?: Maybe<Scalars['ID']>;
  removeParent?: Maybe<Scalars['ID']>;
  updateOrganization?: Maybe<Scalars['ID']>;
  updateProfile?: Maybe<Scalars['ID']>;
  updateRelationship?: Maybe<Scalars['ID']>;
  updateUser?: Maybe<Scalars['ID']>;
};


export type MutationActivateArgs = {
  input: ActivateInput;
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationInviteMemberArgs = {
  email: Scalars['String'];
  isAdmin?: InputMaybe<Scalars['Boolean']>;
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
  input: RegisterInput;
  password: Scalars['String'];
};


export type MutationRemoveMemberArgs = {
  id: Scalars['ID'];
};


export type MutationRemoveParentArgs = {
  childId: Scalars['ID'];
  id: Scalars['ID'];
};


export type MutationUpdateOrganizationArgs = {
  input: OrganizationUpdate;
};


export type MutationUpdateProfileArgs = {
  input: ProfileUpdate;
};


export type MutationUpdateRelationshipArgs = {
  childId: Scalars['ID'];
  input: RelationshipUpdate;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'];
  input: UserUpdate;
};

export { OrderDirection };

export type Organization = {
  __typename?: 'Organization';
  address: Address;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type OrganizationCreate = {
  address: AddressCreate;
  name: Scalars['String'];
};

export type OrganizationFilter = {
  address?: InputMaybe<AddressFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  name?: InputMaybe<StringFilter>;
};

export type OrganizationOrder = {
  address?: InputMaybe<AddressOrder>;
  createdAt?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
};

export type OrganizationUpdate = {
  address?: InputMaybe<AddressUpdate>;
  name?: InputMaybe<Scalars['String']>;
};

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

export type PaginatedMembership = {
  __typename?: 'PaginatedMembership';
  nodes: Array<Membership>;
  page: PageInfo;
};

export type PaginatedOrganization = {
  __typename?: 'PaginatedOrganization';
  nodes: Array<Organization>;
  page: PageInfo;
};

export type PaginatedRelationship = {
  __typename?: 'PaginatedRelationship';
  nodes: Array<Relationship>;
  page: PageInfo;
};

export type PaginatedUser = {
  __typename?: 'PaginatedUser';
  nodes: Array<User>;
  page: PageInfo;
};

export type ProfileUpdate = {
  email?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  children: PaginatedRelationship;
  members: PaginatedMembership;
  organization: Organization;
  organizations: PaginatedOrganization;
  profile: User;
  user: User;
  users: PaginatedUser;
};


export type QueryChildrenArgs = {
  filter?: InputMaybe<RelationshipFilter>;
  order?: InputMaybe<RelationshipOrder>;
  page?: InputMaybe<Page>;
};


export type QueryMembersArgs = {
  filter?: InputMaybe<MembershipFilter>;
  order?: InputMaybe<MembershipOrder>;
  page?: InputMaybe<Page>;
};


export type QueryOrganizationsArgs = {
  filter?: InputMaybe<OrganizationFilter>;
  order?: InputMaybe<OrganizationOrder>;
  page?: InputMaybe<Page>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilter>;
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
};

export type RegisterInput = {
  name: Scalars['String'];
  organization: OrganizationCreate;
};

export type Relationship = {
  __typename?: 'Relationship';
  childUser: User;
  createdAt: Scalars['DateTime'];
  parentUser: User;
  relation: Scalars['String'];
};

export type RelationshipFilter = {
  childUser?: InputMaybe<UserFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  parentUser?: InputMaybe<UserFilter>;
  relation?: InputMaybe<StringFilter>;
};

export type RelationshipOrder = {
  childUser?: InputMaybe<UserOrder>;
  createdAt?: InputMaybe<OrderDirection>;
  parentUser?: InputMaybe<UserOrder>;
  relation?: InputMaybe<OrderDirection>;
};

export type RelationshipUpdate = {
  relation?: InputMaybe<Scalars['String']>;
};

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<StringFilterMode>;
  not?: InputMaybe<Scalars['String']>;
};

export { StringFilterMode };

export type User = {
  __typename?: 'User';
  children: Array<Relationship>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['ID'];
  isConfirmed: Scalars['Boolean'];
  isStaff: Scalars['Boolean'];
  memberships: Array<Membership>;
  name: Scalars['String'];
  parents: Array<Relationship>;
};

export type UserFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  isConfirmed?: InputMaybe<BooleanFilter>;
  isStaff?: InputMaybe<BooleanFilter>;
  name?: InputMaybe<StringFilter>;
};

export type UserOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  email?: InputMaybe<OrderDirection>;
  isConfirmed?: InputMaybe<OrderDirection>;
  isStaff?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
};

export type UserUpdate = {
  email?: InputMaybe<Scalars['String']>;
  isConfirmed?: InputMaybe<Scalars['Boolean']>;
  isStaff?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
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
  ActivateInput: ActivateInput;
  Address: ResolverTypeWrapper<Address>;
  AddressCreate: AddressCreate;
  AddressFilter: AddressFilter;
  AddressOrder: AddressOrder;
  AddressUpdate: AddressUpdate;
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
  Membership: ResolverTypeWrapper<Membership>;
  MembershipFilter: MembershipFilter;
  MembershipOrder: MembershipOrder;
  MembershipUpdate: MembershipUpdate;
  Mutation: ResolverTypeWrapper<{}>;
  NullObject: ResolverTypeWrapper<Scalars['NullObject']>;
  OrderDirection: Prisma.SortOrder;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationCreate: OrganizationCreate;
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  OrganizationUpdate: OrganizationUpdate;
  Page: Page;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedMembership: ResolverTypeWrapper<PaginatedMembership>;
  PaginatedOrganization: ResolverTypeWrapper<PaginatedOrganization>;
  PaginatedRelationship: ResolverTypeWrapper<PaginatedRelationship>;
  PaginatedUser: ResolverTypeWrapper<PaginatedUser>;
  ProfileUpdate: ProfileUpdate;
  Query: ResolverTypeWrapper<{}>;
  RegisterInput: RegisterInput;
  Relationship: ResolverTypeWrapper<Relationship>;
  RelationshipFilter: RelationshipFilter;
  RelationshipOrder: RelationshipOrder;
  RelationshipUpdate: RelationshipUpdate;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringFilter: StringFilter;
  StringFilterMode: Prisma.QueryMode;
  User: ResolverTypeWrapper<User>;
  UserFilter: UserFilter;
  UserOrder: UserOrder;
  UserUpdate: UserUpdate;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActivateInput: ActivateInput;
  Address: Address;
  AddressCreate: AddressCreate;
  AddressFilter: AddressFilter;
  AddressOrder: AddressOrder;
  AddressUpdate: AddressUpdate;
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
  Membership: Membership;
  MembershipFilter: MembershipFilter;
  MembershipOrder: MembershipOrder;
  MembershipUpdate: MembershipUpdate;
  Mutation: {};
  NullObject: Scalars['NullObject'];
  Organization: Organization;
  OrganizationCreate: OrganizationCreate;
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  OrganizationUpdate: OrganizationUpdate;
  Page: Page;
  PageInfo: PageInfo;
  PaginatedMembership: PaginatedMembership;
  PaginatedOrganization: PaginatedOrganization;
  PaginatedRelationship: PaginatedRelationship;
  PaginatedUser: PaginatedUser;
  ProfileUpdate: ProfileUpdate;
  Query: {};
  RegisterInput: RegisterInput;
  Relationship: Relationship;
  RelationshipFilter: RelationshipFilter;
  RelationshipOrder: RelationshipOrder;
  RelationshipUpdate: RelationshipUpdate;
  String: Scalars['String'];
  StringFilter: StringFilter;
  User: User;
  UserFilter: UserFilter;
  UserOrder: UserOrder;
  UserUpdate: UserUpdate;
};

export type AddressResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  street?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type MembershipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Membership'] = ResolversParentTypes['Membership']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  isAdmin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activate?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationActivateArgs, 'input' | 'password' | 'token'>>;
  inviteMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteMemberArgs, 'email'>>;
  inviteParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteParentArgs, 'childId' | 'email'>>;
  inviteStaff?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteStaffArgs, 'email'>>;
  login?: Resolver<ResolversTypes['JWT'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'input' | 'password'>>;
  removeMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'id'>>;
  removeParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveParentArgs, 'childId' | 'id'>>;
  updateOrganization?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateOrganizationArgs, 'input'>>;
  updateProfile?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateRelationship?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateRelationshipArgs, 'childId' | 'input'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id' | 'input'>>;
};

export interface NullObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullObject'], any> {
  name: 'NullObject';
}

export type OrderDirectionResolvers = EnumResolverSignature<{ ASC?: any, DESC?: any }, ResolversTypes['OrderDirection']>;

export type OrganizationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = {
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasNext?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPrev?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedMembershipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedMembership'] = ResolversParentTypes['PaginatedMembership']> = {
  nodes?: Resolver<Array<ResolversTypes['Membership']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedOrganizationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedOrganization'] = ResolversParentTypes['PaginatedOrganization']> = {
  nodes?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedRelationshipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedRelationship'] = ResolversParentTypes['PaginatedRelationship']> = {
  nodes?: Resolver<Array<ResolversTypes['Relationship']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedUserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedUser'] = ResolversParentTypes['PaginatedUser']> = {
  nodes?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  children?: Resolver<ResolversTypes['PaginatedRelationship'], ParentType, ContextType, Partial<QueryChildrenArgs>>;
  members?: Resolver<ResolversTypes['PaginatedMembership'], ParentType, ContextType, Partial<QueryMembersArgs>>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizations?: Resolver<ResolversTypes['PaginatedOrganization'], ParentType, ContextType, Partial<QueryOrganizationsArgs>>;
  profile?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, Partial<QueryUserArgs>>;
  users?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type RelationshipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Relationship'] = ResolversParentTypes['Relationship']> = {
  childUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  parentUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  relation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StringFilterModeResolvers = EnumResolverSignature<{ DEFAULT?: any, INSENSITIVE?: any }, ResolversTypes['StringFilterMode']>;

export type UserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  children?: Resolver<Array<ResolversTypes['Relationship']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isConfirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStaff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  memberships?: Resolver<Array<ResolversTypes['Membership']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parents?: Resolver<Array<ResolversTypes['Relationship']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = ApolloContext> = {
  Address?: AddressResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  JWT?: JwtResolvers<ContextType>;
  Membership?: MembershipResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NullObject?: GraphQLScalarType;
  OrderDirection?: OrderDirectionResolvers;
  Organization?: OrganizationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedMembership?: PaginatedMembershipResolvers<ContextType>;
  PaginatedOrganization?: PaginatedOrganizationResolvers<ContextType>;
  PaginatedRelationship?: PaginatedRelationshipResolvers<ContextType>;
  PaginatedUser?: PaginatedUserResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Relationship?: RelationshipResolvers<ContextType>;
  StringFilterMode?: StringFilterModeResolvers;
  User?: UserResolvers<ContextType>;
};

