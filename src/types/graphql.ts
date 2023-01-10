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

export type Facebook = {
  __typename?: 'Facebook';
  createdAt: Scalars['DateTime'];
};

export type FacebookFilter = {
  is?: InputMaybe<Scalars['NullObject']>;
  isNot?: InputMaybe<Scalars['NullObject']>;
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
  token?: Maybe<Scalars['String']>;
  user: User;
};

export type Membership = {
  __typename?: 'Membership';
  createdAt: Scalars['DateTime'];
  isAdmin: Scalars['Boolean'];
  organization: Organization;
};

export type MembershipFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  isAdmin?: InputMaybe<BooleanFilter>;
  organization?: InputMaybe<OrganizationFilter>;
};

export type MembershipOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  isAdmin?: InputMaybe<OrderDirection>;
  organization?: InputMaybe<OrganizationOrder>;
};

export type MembershipUpdate = {
  isAdmin?: InputMaybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activate?: Maybe<Scalars['ID']>;
  inviteMember?: Maybe<Scalars['ID']>;
  inviteStaff?: Maybe<Scalars['ID']>;
  linkFacebook?: Maybe<Scalars['ID']>;
  login: Jwt;
  register?: Maybe<Scalars['ID']>;
  removeMember?: Maybe<Scalars['ID']>;
  unlinkSocial?: Maybe<Scalars['ID']>;
  updateMember?: Maybe<Scalars['ID']>;
  updateOrganization?: Maybe<Scalars['ID']>;
  updateProfile?: Maybe<Scalars['ID']>;
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


export type MutationUnlinkSocialArgs = {
  social?: InputMaybe<SocialType>;
};


export type MutationUpdateMemberArgs = {
  id: Scalars['ID'];
  input: MembershipUpdate;
};


export type MutationUpdateOrganizationArgs = {
  input?: InputMaybe<OrganizationUpdate>;
};


export type MutationUpdateProfileArgs = {
  input?: InputMaybe<ProfileUpdate>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'];
  input?: InputMaybe<UserUpdate>;
};

export { OrderDirection };

export type Organization = {
  __typename?: 'Organization';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type OrganizationFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  name?: InputMaybe<StringFilter>;
};

export type OrganizationOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
};

export type OrganizationUpdate = {
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

export type PaginatedOrganization = {
  __typename?: 'PaginatedOrganization';
  nodes: Array<Organization>;
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
  me: User;
  members: PaginatedUser;
  organizations: PaginatedOrganization;
  users: PaginatedUser;
};


export type QueryMembersArgs = {
  filter?: InputMaybe<UserFilter>;
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
};


export type QueryOrganizationsArgs = {
  filter?: InputMaybe<OrganizationFilter>;
  order?: InputMaybe<OrganizationOrder>;
  page?: InputMaybe<Page>;
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilter>;
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
};

export type RegisterInput = {
  name: Scalars['String'];
  organizationName: Scalars['String'];
};

export const SocialType = {
  Facebook: 'FACEBOOK'
} as const;

export type SocialType = typeof SocialType[keyof typeof SocialType];
export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<StringFilterMode>;
  not?: InputMaybe<Scalars['String']>;
};

export { StringFilterMode };

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  facebook?: Maybe<Facebook>;
  id: Scalars['ID'];
  isConfirmed: Scalars['Boolean'];
  isStaff: Scalars['Boolean'];
  membership?: Maybe<Membership>;
  name: Scalars['String'];
};

export type UserFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  facebook?: InputMaybe<FacebookFilter>;
  id?: InputMaybe<StringFilter>;
  isConfirmed?: InputMaybe<BooleanFilter>;
  isStaff?: InputMaybe<BooleanFilter>;
  membership?: InputMaybe<MembershipFilter>;
  name?: InputMaybe<StringFilter>;
};

export type UserOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  email?: InputMaybe<OrderDirection>;
  isConfirmed?: InputMaybe<OrderDirection>;
  isStaff?: InputMaybe<OrderDirection>;
  membership?: InputMaybe<MembershipOrder>;
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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BooleanFilter: BooleanFilter;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DateTimeFilter: DateTimeFilter;
  Facebook: ResolverTypeWrapper<Facebook>;
  FacebookFilter: FacebookFilter;
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
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  OrganizationUpdate: OrganizationUpdate;
  Page: Page;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedOrganization: ResolverTypeWrapper<PaginatedOrganization>;
  PaginatedUser: ResolverTypeWrapper<PaginatedUser>;
  ProfileUpdate: ProfileUpdate;
  Query: ResolverTypeWrapper<{}>;
  RegisterInput: RegisterInput;
  SocialType: SocialType;
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
  Boolean: Scalars['Boolean'];
  BooleanFilter: BooleanFilter;
  DateTime: Scalars['DateTime'];
  DateTimeFilter: DateTimeFilter;
  Facebook: Facebook;
  FacebookFilter: FacebookFilter;
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
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  OrganizationUpdate: OrganizationUpdate;
  Page: Page;
  PageInfo: PageInfo;
  PaginatedOrganization: PaginatedOrganization;
  PaginatedUser: PaginatedUser;
  ProfileUpdate: ProfileUpdate;
  Query: {};
  RegisterInput: RegisterInput;
  String: Scalars['String'];
  StringFilter: StringFilter;
  User: User;
  UserFilter: UserFilter;
  UserOrder: UserOrder;
  UserUpdate: UserUpdate;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FacebookResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Facebook'] = ResolversParentTypes['Facebook']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JwtResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['JWT'] = ResolversParentTypes['JWT']> = {
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MembershipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Membership'] = ResolversParentTypes['Membership']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  isAdmin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activate?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationActivateArgs, 'input' | 'password' | 'token'>>;
  inviteMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteMemberArgs, 'email'>>;
  inviteStaff?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteStaffArgs, 'email'>>;
  linkFacebook?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  login?: Resolver<ResolversTypes['JWT'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'input' | 'password'>>;
  removeMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'id'>>;
  unlinkSocial?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, Partial<MutationUnlinkSocialArgs>>;
  updateMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateMemberArgs, 'id' | 'input'>>;
  updateOrganization?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, Partial<MutationUpdateOrganizationArgs>>;
  updateProfile?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, Partial<MutationUpdateProfileArgs>>;
  updateUser?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id'>>;
};

export interface NullObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NullObject'], any> {
  name: 'NullObject';
}

export type OrderDirectionResolvers = EnumResolverSignature<{ ASC?: any, DESC?: any }, ResolversTypes['OrderDirection']>;

export type OrganizationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = {
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

export type PaginatedOrganizationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedOrganization'] = ResolversParentTypes['PaginatedOrganization']> = {
  nodes?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedUserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedUser'] = ResolversParentTypes['PaginatedUser']> = {
  nodes?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  members?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryMembersArgs>>;
  organizations?: Resolver<ResolversTypes['PaginatedOrganization'], ParentType, ContextType, Partial<QueryOrganizationsArgs>>;
  users?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type StringFilterModeResolvers = EnumResolverSignature<{ DEFAULT?: any, INSENSITIVE?: any }, ResolversTypes['StringFilterMode']>;

export type UserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  facebook?: Resolver<Maybe<ResolversTypes['Facebook']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isConfirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStaff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  membership?: Resolver<Maybe<ResolversTypes['Membership']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = ApolloContext> = {
  DateTime?: GraphQLScalarType;
  Facebook?: FacebookResolvers<ContextType>;
  JWT?: JwtResolvers<ContextType>;
  Membership?: MembershipResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NullObject?: GraphQLScalarType;
  OrderDirection?: OrderDirectionResolvers;
  Organization?: OrganizationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedOrganization?: PaginatedOrganizationResolvers<ContextType>;
  PaginatedUser?: PaginatedUserResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StringFilterMode?: StringFilterModeResolvers;
  User?: UserResolvers<ContextType>;
};

