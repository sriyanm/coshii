import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';
export const connectorConfig: ConnectorConfig;

export type TimestampString = string;

export type UUIDString = string;

export type Int64String = string;

export type DateString = string;



export interface GetCurrentUserData {
  user?: {
    uid: string;
    phoneNumber?: string | null;
    email?: string | null;
  } & User_Key;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  phoneNumber?: string | null;
  email?: string | null;
}

export interface User_Key {
  uid: string;
  __typename?: 'User_Key';
}



/* Allow users to create refs without passing in DataConnect */
export function upsertUserRef(vars?: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
/* Allow users to pass in custom DataConnect instances */
export function upsertUserRef(dc: DataConnect, vars?: UpsertUserVariables): MutationRef<UpsertUserData,UpsertUserVariables>;

export function upsertUser(vars?: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars?: UpsertUserVariables): MutationPromise<UpsertUserData,UpsertUserVariables>;


/* Allow users to create refs without passing in DataConnect */
export function getCurrentUserRef(): QueryRef<GetCurrentUserData, undefined>;/* Allow users to pass in custom DataConnect instances */
export function getCurrentUserRef(dc: DataConnect): QueryRef<GetCurrentUserData,undefined>;

export function getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData,undefined>;


