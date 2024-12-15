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

export interface UpsertUserEmailData {
  user_upsert: User_Key;
}

export interface UpsertUserEmailVariables {
  email: string;
}

export interface UpsertUserPhoneNumberData {
  user_upsert: User_Key;
}

export interface UpsertUserPhoneNumberVariables {
  phoneNumber: string;
}

export interface User_Key {
  uid: string;
  __typename?: 'User_Key';
}



/* Allow users to create refs without passing in DataConnect */
export function getCurrentUserRef(): QueryRef<GetCurrentUserData, undefined>;/* Allow users to pass in custom DataConnect instances */
export function getCurrentUserRef(dc: DataConnect): QueryRef<GetCurrentUserData,undefined>;

export function getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData,undefined>;


/* Allow users to create refs without passing in DataConnect */
export function upsertUserPhoneNumberRef(vars: UpsertUserPhoneNumberVariables): MutationRef<UpsertUserPhoneNumberData, UpsertUserPhoneNumberVariables>;
/* Allow users to pass in custom DataConnect instances */
export function upsertUserPhoneNumberRef(dc: DataConnect, vars: UpsertUserPhoneNumberVariables): MutationRef<UpsertUserPhoneNumberData,UpsertUserPhoneNumberVariables>;

export function upsertUserPhoneNumber(vars: UpsertUserPhoneNumberVariables): MutationPromise<UpsertUserPhoneNumberData, UpsertUserPhoneNumberVariables>;
export function upsertUserPhoneNumber(dc: DataConnect, vars: UpsertUserPhoneNumberVariables): MutationPromise<UpsertUserPhoneNumberData,UpsertUserPhoneNumberVariables>;


/* Allow users to create refs without passing in DataConnect */
export function upsertUserEmailRef(vars: UpsertUserEmailVariables): MutationRef<UpsertUserEmailData, UpsertUserEmailVariables>;
/* Allow users to pass in custom DataConnect instances */
export function upsertUserEmailRef(dc: DataConnect, vars: UpsertUserEmailVariables): MutationRef<UpsertUserEmailData,UpsertUserEmailVariables>;

export function upsertUserEmail(vars: UpsertUserEmailVariables): MutationPromise<UpsertUserEmailData, UpsertUserEmailVariables>;
export function upsertUserEmail(dc: DataConnect, vars: UpsertUserEmailVariables): MutationPromise<UpsertUserEmailData,UpsertUserEmailVariables>;


