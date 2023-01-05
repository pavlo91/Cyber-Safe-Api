import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ApolloContext } from './apollo';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: any, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<any> | any
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
};

export type ActivateInput = {
  name: Scalars['String'];
};

export type DateTimeFilter = {
  gte?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
};

export type Facebook = {
  __typename?: 'Facebook';
  token: Scalars['String'];
};

export type Membership = {
  __typename?: 'Membership';
  isAdmin: Scalars['Boolean'];
  organization: Organization;
};

export type MembershipFilter = {
  isAdmin?: InputMaybe<Scalars['Boolean']>;
  organization?: InputMaybe<OrganizationFilter>;
};

export type MembershipOrder = {
  isAdmin?: InputMaybe<OrderDirection>;
  organization?: InputMaybe<OrganizationOrder>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activate?: Maybe<Scalars['ID']>;
  inviteMember?: Maybe<Scalars['ID']>;
  login: Token;
  register?: Maybe<Scalars['ID']>;
};


export type MutationActivateArgs = {
  input: ActivateInput;
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationInviteMemberArgs = {
  email: Scalars['String'];
  isAdmin: Scalars['Boolean'];
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

export const OrderDirection = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type OrderDirection = typeof OrderDirection[keyof typeof OrderDirection];
export type Organization = {
  __typename?: 'Organization';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type OrganizationFilter = {
  name?: InputMaybe<StringFilter>;
};

export type OrganizationOrder = {
  name?: InputMaybe<OrderDirection>;
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
};

export type PaginatedUser = {
  __typename?: 'PaginatedUser';
  nodes: Array<User>;
  page: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  members: PaginatedUser;
  users: PaginatedUser;
};


export type QueryMembersArgs = {
  filter?: InputMaybe<UserFilter>;
  order?: InputMaybe<UserOrder>;
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

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<StringFilterMode>;
};

export const StringFilterMode = {
  Insensitive: 'insensitive'
} as const;

export type StringFilterMode = typeof StringFilterMode[keyof typeof StringFilterMode];
export type Token = {
  __typename?: 'Token';
  token?: Maybe<Scalars['String']>;
  user: User;
};

export type User = {
  __typename?: 'User';
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
  isConfirmed?: InputMaybe<Scalars['Boolean']>;
  isStaff?: InputMaybe<Scalars['Boolean']>;
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
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DateTimeFilter: DateTimeFilter;
  Facebook: ResolverTypeWrapper<Facebook>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Membership: ResolverTypeWrapper<Membership>;
  MembershipFilter: MembershipFilter;
  MembershipOrder: MembershipOrder;
  Mutation: ResolverTypeWrapper<{}>;
  OrderDirection: OrderDirection;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  Page: Page;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedUser: ResolverTypeWrapper<PaginatedUser>;
  Query: ResolverTypeWrapper<{}>;
  RegisterInput: RegisterInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringFilter: StringFilter;
  StringFilterMode: StringFilterMode;
  Token: ResolverTypeWrapper<Token>;
  User: ResolverTypeWrapper<User>;
  UserFilter: UserFilter;
  UserOrder: UserOrder;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActivateInput: ActivateInput;
  Boolean: Scalars['Boolean'];
  DateTime: Scalars['DateTime'];
  DateTimeFilter: DateTimeFilter;
  Facebook: Facebook;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Membership: Membership;
  MembershipFilter: MembershipFilter;
  MembershipOrder: MembershipOrder;
  Mutation: {};
  Organization: Organization;
  OrganizationFilter: OrganizationFilter;
  OrganizationOrder: OrganizationOrder;
  Page: Page;
  PageInfo: PageInfo;
  PaginatedUser: PaginatedUser;
  Query: {};
  RegisterInput: RegisterInput;
  String: Scalars['String'];
  StringFilter: StringFilter;
  Token: Token;
  User: User;
  UserFilter: UserFilter;
  UserOrder: UserOrder;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FacebookResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Facebook'] = ResolversParentTypes['Facebook']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MembershipResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Membership'] = ResolversParentTypes['Membership']> = {
  isAdmin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activate?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationActivateArgs, 'input' | 'password' | 'token'>>;
  inviteMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteMemberArgs, 'email' | 'isAdmin'>>;
  login?: Resolver<ResolversTypes['Token'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'input' | 'password'>>;
};

export type OrganizationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = {
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
  users?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type TokenResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
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
  Membership?: MembershipResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedUser?: PaginatedUserResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

