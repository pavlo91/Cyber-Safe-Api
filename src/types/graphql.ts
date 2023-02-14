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

export type Address = {
  __typename?: 'Address';
  city: Scalars['String'];
  formatted: Scalars['String'];
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

export type AddressUpdate = {
  city: Scalars['String'];
  state: Scalars['String'];
  street: Scalars['String'];
  zip: Scalars['String'];
};

export type AnyRole = UserRole & {
  __typename?: 'AnyRole';
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

export type ContactInput = {
  comments?: InputMaybe<Scalars['String']>;
  describe: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  jobTitle?: InputMaybe<Scalars['String']>;
  lastName: Scalars['String'];
  phone?: InputMaybe<Scalars['String']>;
  schoolName: Scalars['String'];
  state: Scalars['String'];
  students: Scalars['String'];
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

export type GlobalSettings = {
  __typename?: 'GlobalSettings';
  enableSignUps?: Maybe<Scalars['Boolean']>;
};

export type GlobalSettingsUpdate = {
  enableSignUps?: InputMaybe<Scalars['Boolean']>;
};

export type Image = {
  __typename?: 'Image';
  url: Scalars['String'];
};

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<Scalars['Int']>;
};

export const InviteMemberRole = {
  Admin: 'ADMIN',
  Athlete: 'ATHLETE',
  Coach: 'COACH'
} as const;

export type InviteMemberRole = typeof InviteMemberRole[keyof typeof InviteMemberRole];
export type Item = {
  __typename?: 'Item';
  id: Scalars['ID'];
};

export type Jwt = {
  __typename?: 'JWT';
  token: Scalars['String'];
  user: User;
};

export type MemberFilter = {
  role?: InputMaybe<MemberRole>;
};

export const MemberRole = {
  Admin: 'ADMIN',
  Athlete: 'ATHLETE',
  Coach: 'COACH'
} as const;

export type MemberRole = typeof MemberRole[keyof typeof MemberRole];
export type Mutation = {
  __typename?: 'Mutation';
  activate?: Maybe<Scalars['ID']>;
  contact?: Maybe<Scalars['ID']>;
  createSchool?: Maybe<Scalars['ID']>;
  inviteMember?: Maybe<Scalars['ID']>;
  inviteParent?: Maybe<Scalars['ID']>;
  inviteStaff?: Maybe<Scalars['ID']>;
  login: Jwt;
  prepareForUpload: Upload;
  readAllNotifications?: Maybe<Scalars['ID']>;
  register: Jwt;
  removeMember?: Maybe<Scalars['ID']>;
  removeParent?: Maybe<Scalars['ID']>;
  removeRole?: Maybe<Scalars['ID']>;
  requestResetPassword?: Maybe<Scalars['ID']>;
  resetPassword?: Maybe<Scalars['ID']>;
  updateGlobalSettings?: Maybe<Scalars['ID']>;
  updatePassword?: Maybe<Scalars['ID']>;
  updateProfile?: Maybe<Scalars['ID']>;
  updateSchool?: Maybe<Scalars['ID']>;
};


export type MutationActivateArgs = {
  password: Scalars['String'];
  passwordToken: Scalars['String'];
  user: UserCreate;
};


export type MutationContactArgs = {
  input: ContactInput;
};


export type MutationCreateSchoolArgs = {
  input: SchoolCreate;
};


export type MutationInviteMemberArgs = {
  email: Scalars['String'];
  role: InviteMemberRole;
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
  school: SchoolCreate;
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


export type MutationUpdateGlobalSettingsArgs = {
  input: GlobalSettingsUpdate;
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String'];
  oldPassword: Scalars['String'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateSchoolArgs = {
  input: SchoolUpdate;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  message: Scalars['String'];
  url?: Maybe<Scalars['String']>;
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

export type PaginatedItem = {
  __typename?: 'PaginatedItem';
  nodes: Array<Item>;
  page: PageInfo;
};

export type PaginatedNotification = {
  __typename?: 'PaginatedNotification';
  nodes: Array<Notification>;
  page: PageInfo;
};

export type PaginatedSchool = {
  __typename?: 'PaginatedSchool';
  nodes: Array<School>;
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
  globalSettings: GlobalSettings;
  globalSettingsCanSignUp: Scalars['Boolean'];
  member: User;
  members: PaginatedUser;
  notifications: PaginatedNotification;
  notificationsCount: Scalars['Int'];
  parents: PaginatedUser;
  profile: User;
  school: School;
  schools: PaginatedSchool;
  statsOfAcceptedMembersInSchool: StatsByDay;
  statsOfCreatedMembers: StatsByDay;
  statsOfCreatedMembersInSchool: StatsByDay;
  statsOfCreatedParents: StatsByDay;
  statsOfCreatedSchools: StatsByDay;
  statsOfCreatedUsers: StatsByDay;
  statsOfInvitedMembersInSchool: StatsByDay;
  tempPaginatedItem: PaginatedItem;
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
  filter?: InputMaybe<MemberFilter>;
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryNotificationsArgs = {
  page?: InputMaybe<Page>;
};


export type QueryParentsArgs = {
  childId: Scalars['ID'];
  order?: InputMaybe<UserOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QuerySchoolArgs = {
  id: Scalars['ID'];
};


export type QuerySchoolsArgs = {
  order?: InputMaybe<SchoolOrder>;
  page?: InputMaybe<Page>;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryStatsOfAcceptedMembersInSchoolArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfCreatedMembersArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfCreatedMembersInSchoolArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfCreatedParentsArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfCreatedSchoolsArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfCreatedUsersArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryStatsOfInvitedMembersInSchoolArgs = {
  days?: InputMaybe<Scalars['Int']>;
};


export type QueryTempPaginatedItemArgs = {
  page?: InputMaybe<Page>;
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
  Admin: 'ADMIN',
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
export type School = {
  __typename?: 'School';
  address?: Maybe<Address>;
  cover?: Maybe<Image>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  logo?: Maybe<Image>;
  memberCount: Scalars['Int'];
  name: Scalars['String'];
  phone?: Maybe<Scalars['String']>;
};

export type SchoolCreate = {
  address?: InputMaybe<AddressCreate>;
  name: Scalars['String'];
  phone?: InputMaybe<Scalars['String']>;
};

export type SchoolOrder = {
  createdAt?: InputMaybe<OrderDirection>;
  memberCount?: InputMaybe<OrderDirection>;
  name?: InputMaybe<OrderDirection>;
  phone?: InputMaybe<OrderDirection>;
};

export type SchoolRole = UserRole & {
  __typename?: 'SchoolRole';
  id: Scalars['ID'];
  role: Role;
  school: School;
  status: RoleStatus;
};

export type SchoolUpdate = {
  address?: InputMaybe<AddressUpdate>;
  cover?: InputMaybe<Scalars['String']>;
  logo?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
};

export type StatByDay = {
  __typename?: 'StatByDay';
  day: Scalars['DateTime'];
  value: Scalars['Int'];
};

export type StatsByDay = {
  __typename?: 'StatsByDay';
  stats: Array<StatByDay>;
  total: Scalars['Int'];
};

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<StringFilterMode>;
  not?: InputMaybe<Scalars['String']>;
};

export { StringFilterMode };

export type UpdateProfileInput = {
  avatar?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  newEmail?: InputMaybe<Scalars['String']>;
};

export type Upload = {
  __typename?: 'Upload';
  headers: Array<UploadHeader>;
  id: Scalars['ID'];
  method: Scalars['String'];
  url: Scalars['String'];
};

export type UploadHeader = {
  __typename?: 'UploadHeader';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Image>;
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
  Address: ResolverTypeWrapper<Address>;
  AddressCreate: AddressCreate;
  AddressUpdate: AddressUpdate;
  AnyRole: ResolverTypeWrapper<AnyRole>;
  ArrayOrder: ArrayOrder;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BooleanFilter: BooleanFilter;
  ContactInput: ContactInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DateTimeFilter: DateTimeFilter;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FloatFilter: FloatFilter;
  GlobalSettings: ResolverTypeWrapper<GlobalSettings>;
  GlobalSettingsUpdate: GlobalSettingsUpdate;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Image: ResolverTypeWrapper<Image>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IntFilter: IntFilter;
  InviteMemberRole: InviteMemberRole;
  Item: ResolverTypeWrapper<Item>;
  JWT: ResolverTypeWrapper<Jwt>;
  MemberFilter: MemberFilter;
  MemberRole: MemberRole;
  Mutation: ResolverTypeWrapper<{}>;
  Notification: ResolverTypeWrapper<Notification>;
  NullObject: ResolverTypeWrapper<Scalars['NullObject']>;
  OrderDirection: Prisma.SortOrder;
  Page: Page;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedItem: ResolverTypeWrapper<PaginatedItem>;
  PaginatedNotification: ResolverTypeWrapper<PaginatedNotification>;
  PaginatedSchool: ResolverTypeWrapper<PaginatedSchool>;
  PaginatedUser: ResolverTypeWrapper<PaginatedUser>;
  ParentRole: ResolverTypeWrapper<ParentRole>;
  Query: ResolverTypeWrapper<{}>;
  Role: Role;
  RoleStatus: RoleStatus;
  School: ResolverTypeWrapper<School>;
  SchoolCreate: SchoolCreate;
  SchoolOrder: SchoolOrder;
  SchoolRole: ResolverTypeWrapper<SchoolRole>;
  SchoolUpdate: SchoolUpdate;
  StatByDay: ResolverTypeWrapper<StatByDay>;
  StatsByDay: ResolverTypeWrapper<StatsByDay>;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringFilter: StringFilter;
  StringFilterMode: Prisma.QueryMode;
  UpdateProfileInput: UpdateProfileInput;
  Upload: ResolverTypeWrapper<Upload>;
  UploadHeader: ResolverTypeWrapper<UploadHeader>;
  User: ResolverTypeWrapper<User>;
  UserCreate: UserCreate;
  UserOrder: UserOrder;
  UserRole: ResolversTypes['AnyRole'] | ResolversTypes['ParentRole'] | ResolversTypes['SchoolRole'];
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Address: Address;
  AddressCreate: AddressCreate;
  AddressUpdate: AddressUpdate;
  AnyRole: AnyRole;
  ArrayOrder: ArrayOrder;
  Boolean: Scalars['Boolean'];
  BooleanFilter: BooleanFilter;
  ContactInput: ContactInput;
  DateTime: Scalars['DateTime'];
  DateTimeFilter: DateTimeFilter;
  Float: Scalars['Float'];
  FloatFilter: FloatFilter;
  GlobalSettings: GlobalSettings;
  GlobalSettingsUpdate: GlobalSettingsUpdate;
  ID: Scalars['ID'];
  Image: Image;
  Int: Scalars['Int'];
  IntFilter: IntFilter;
  Item: Item;
  JWT: Jwt;
  MemberFilter: MemberFilter;
  Mutation: {};
  Notification: Notification;
  NullObject: Scalars['NullObject'];
  Page: Page;
  PageInfo: PageInfo;
  PaginatedItem: PaginatedItem;
  PaginatedNotification: PaginatedNotification;
  PaginatedSchool: PaginatedSchool;
  PaginatedUser: PaginatedUser;
  ParentRole: ParentRole;
  Query: {};
  School: School;
  SchoolCreate: SchoolCreate;
  SchoolOrder: SchoolOrder;
  SchoolRole: SchoolRole;
  SchoolUpdate: SchoolUpdate;
  StatByDay: StatByDay;
  StatsByDay: StatsByDay;
  String: Scalars['String'];
  StringFilter: StringFilter;
  UpdateProfileInput: UpdateProfileInput;
  Upload: Upload;
  UploadHeader: UploadHeader;
  User: User;
  UserCreate: UserCreate;
  UserOrder: UserOrder;
  UserRole: ResolversParentTypes['AnyRole'] | ResolversParentTypes['ParentRole'] | ResolversParentTypes['SchoolRole'];
};

export type AddressResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  formatted?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  street?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AnyRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['AnyRole'] = ResolversParentTypes['AnyRole']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type GlobalSettingsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['GlobalSettings'] = ResolversParentTypes['GlobalSettings']> = {
  enableSignUps?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Image'] = ResolversParentTypes['Image']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JwtResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['JWT'] = ResolversParentTypes['JWT']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  activate?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationActivateArgs, 'password' | 'passwordToken' | 'user'>>;
  contact?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationContactArgs, 'input'>>;
  createSchool?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationCreateSchoolArgs, 'input'>>;
  inviteMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteMemberArgs, 'email' | 'role'>>;
  inviteParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteParentArgs, 'childId' | 'email'>>;
  inviteStaff?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationInviteStaffArgs, 'email'>>;
  login?: Resolver<ResolversTypes['JWT'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  prepareForUpload?: Resolver<ResolversTypes['Upload'], ParentType, ContextType>;
  readAllNotifications?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  register?: Resolver<ResolversTypes['JWT'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'password' | 'school' | 'user'>>;
  removeMember?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'id'>>;
  removeParent?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveParentArgs, 'childId' | 'id'>>;
  removeRole?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveRoleArgs, 'id'>>;
  requestResetPassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRequestResetPasswordArgs, 'email'>>;
  resetPassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'password' | 'passwordToken'>>;
  updateGlobalSettings?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateGlobalSettingsArgs, 'input'>>;
  updatePassword?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdatePasswordArgs, 'newPassword' | 'oldPassword'>>;
  updateProfile?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateSchool?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationUpdateSchoolArgs, 'input'>>;
};

export type NotificationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type PaginatedItemResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedItem'] = ResolversParentTypes['PaginatedItem']> = {
  nodes?: Resolver<Array<ResolversTypes['Item']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedNotificationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedNotification'] = ResolversParentTypes['PaginatedNotification']> = {
  nodes?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedSchoolResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PaginatedSchool'] = ResolversParentTypes['PaginatedSchool']> = {
  nodes?: Resolver<Array<ResolversTypes['School']>, ParentType, ContextType>;
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
  globalSettings?: Resolver<ResolversTypes['GlobalSettings'], ParentType, ContextType>;
  globalSettingsCanSignUp?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  member?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryMemberArgs, 'id'>>;
  members?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryMembersArgs>>;
  notifications?: Resolver<ResolversTypes['PaginatedNotification'], ParentType, ContextType, Partial<QueryNotificationsArgs>>;
  notificationsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  parents?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, RequireFields<QueryParentsArgs, 'childId'>>;
  profile?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  school?: Resolver<ResolversTypes['School'], ParentType, ContextType, RequireFields<QuerySchoolArgs, 'id'>>;
  schools?: Resolver<ResolversTypes['PaginatedSchool'], ParentType, ContextType, Partial<QuerySchoolsArgs>>;
  statsOfAcceptedMembersInSchool?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfAcceptedMembersInSchoolArgs, 'days'>>;
  statsOfCreatedMembers?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfCreatedMembersArgs, 'days'>>;
  statsOfCreatedMembersInSchool?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfCreatedMembersInSchoolArgs, 'days'>>;
  statsOfCreatedParents?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfCreatedParentsArgs, 'days'>>;
  statsOfCreatedSchools?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfCreatedSchoolsArgs, 'days'>>;
  statsOfCreatedUsers?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfCreatedUsersArgs, 'days'>>;
  statsOfInvitedMembersInSchool?: Resolver<ResolversTypes['StatsByDay'], ParentType, ContextType, RequireFields<QueryStatsOfInvitedMembersInSchoolArgs, 'days'>>;
  tempPaginatedItem?: Resolver<ResolversTypes['PaginatedItem'], ParentType, ContextType, Partial<QueryTempPaginatedItemArgs>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUser'], ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type SchoolResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['School'] = ResolversParentTypes['School']> = {
  address?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  cover?: Resolver<Maybe<ResolversTypes['Image']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['Image']>, ParentType, ContextType>;
  memberCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SchoolRoleResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SchoolRole'] = ResolversParentTypes['SchoolRole']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  school?: Resolver<ResolversTypes['School'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StatByDayResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['StatByDay'] = ResolversParentTypes['StatByDay']> = {
  day?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StatsByDayResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['StatsByDay'] = ResolversParentTypes['StatsByDay']> = {
  stats?: Resolver<Array<ResolversTypes['StatByDay']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StringFilterModeResolvers = EnumResolverSignature<{ DEFAULT?: any, INSENSITIVE?: any }, ResolversTypes['StringFilterMode']>;

export type UploadResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Upload'] = ResolversParentTypes['Upload']> = {
  headers?: Resolver<Array<ResolversTypes['UploadHeader']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadHeaderResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['UploadHeader'] = ResolversParentTypes['UploadHeader']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar?: Resolver<Maybe<ResolversTypes['Image']>, ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'AnyRole' | 'ParentRole' | 'SchoolRole', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
};

export type Resolvers<ContextType = ApolloContext> = {
  Address?: AddressResolvers<ContextType>;
  AnyRole?: AnyRoleResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  GlobalSettings?: GlobalSettingsResolvers<ContextType>;
  Image?: ImageResolvers<ContextType>;
  Item?: ItemResolvers<ContextType>;
  JWT?: JwtResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NullObject?: GraphQLScalarType;
  OrderDirection?: OrderDirectionResolvers;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedItem?: PaginatedItemResolvers<ContextType>;
  PaginatedNotification?: PaginatedNotificationResolvers<ContextType>;
  PaginatedSchool?: PaginatedSchoolResolvers<ContextType>;
  PaginatedUser?: PaginatedUserResolvers<ContextType>;
  ParentRole?: ParentRoleResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  School?: SchoolResolvers<ContextType>;
  SchoolRole?: SchoolRoleResolvers<ContextType>;
  StatByDay?: StatByDayResolvers<ContextType>;
  StatsByDay?: StatsByDayResolvers<ContextType>;
  StringFilterMode?: StringFilterModeResolvers;
  Upload?: UploadResolvers<ContextType>;
  UploadHeader?: UploadHeaderResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserRole?: UserRoleResolvers<ContextType>;
};

