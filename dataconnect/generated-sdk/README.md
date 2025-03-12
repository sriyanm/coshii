# Table of Contents
- [**Overview**](#generated-typescript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*upsertProduct*](#upsertproduct)

# Generated TypeScript README
This README will guide you through the process of using the generated TypeScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@firebasegen/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```javascript
import { connectDataConnectEmulator, getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [generated-sdk/index.d.ts](./index.d.ts):
```javascript
getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;

getCurrentUserRef(): QueryRef<GetCurrentUserData, undefined>;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```javascript
getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData, undefined>;

getCurrentUserRef(dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [generated-sdk/index.d.ts](./index.d.ts). It has the following fields:
```javascript
export interface GetCurrentUserData {
  user?: {
    uid: string;
    phoneNumber?: string | null;
    email?: string | null;
  } & User_Key;
}
```
### Using `GetCurrentUser`'s action shortcut function

```javascript
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@firebasegen/dataconnect';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```javascript
import { getDataConnect, DataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@firebasegen/dataconnect';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [generated-sdk/index.d.ts](./index.d.ts):
```javascript
upsertUser(vars?: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

upsertUserRef(vars?: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```javascript
upsertUser(dc: DataConnect, vars?: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

upsertUserRef(dc: DataConnect, vars?: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
```

### Variables
The `UpsertUser` mutation has an optional argument of type `UpsertUserVariables`, which is defined in [generated-sdk/index.d.ts](./index.d.ts). It has the following fields:

```javascript
export interface UpsertUserVariables {
  phoneNumber?: string | null;
  email?: string | null;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [generated-sdk/index.d.ts](./index.d.ts). It has the following fields:
```javascript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```javascript
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@firebasegen/dataconnect';

// The `UpsertUser` mutation has an optional argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  phoneNumber: ..., // optional
  email: ..., // optional
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ phoneNumber: ..., email: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertUserVariables` argument.
const { data } = await upsertUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```javascript
import { getDataConnect, DataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@firebasegen/dataconnect';

// The `UpsertUser` mutation has an optional argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  phoneNumber: ..., // optional
  email: ..., // optional
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ phoneNumber: ..., email: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertUserVariables` argument.
const ref = upsertUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## upsertProduct
You can execute the `upsertProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [generated-sdk/index.d.ts](./index.d.ts):
```javascript
upsertProduct(vars: UpsertProductVariables): MutationPromise<UpsertProductData, UpsertProductVariables>;

upsertProductRef(vars: UpsertProductVariables): MutationRef<UpsertProductData, UpsertProductVariables>;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```javascript
upsertProduct(dc: DataConnect, vars: UpsertProductVariables): MutationPromise<UpsertProductData, UpsertProductVariables>;

upsertProductRef(dc: DataConnect, vars: UpsertProductVariables): MutationRef<UpsertProductData, UpsertProductVariables>;
```

### Variables
The `upsertProduct` mutation requires an argument of type `UpsertProductVariables`, which is defined in [generated-sdk/index.d.ts](./index.d.ts). It has the following fields:

```javascript
export interface UpsertProductVariables {
  name: string;
  description?: string | null;
  price: number;
  inventory: number;
}
```
### Return Type
Recall that executing the `upsertProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertProductData`, which is defined in [generated-sdk/index.d.ts](./index.d.ts). It has the following fields:
```javascript
export interface UpsertProductData {
  product_upsert: Product_Key;
}
```
### Using `upsertProduct`'s action shortcut function

```javascript
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertProduct, UpsertProductVariables } from '@firebasegen/dataconnect';

// The `upsertProduct` mutation requires an argument of type `UpsertProductVariables`:
const upsertProductVars: UpsertProductVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  inventory: ..., 
};

// Call the `upsertProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertProduct(upsertProductVars);
// Variables can be defined inline as well.
const { data } = await upsertProduct({ name: ..., description: ..., price: ..., inventory: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertProduct(dataConnect, upsertProductVars);

console.log(data.product_upsert);

// Or, you can use the `Promise` API.
upsertProduct(upsertProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_upsert);
});
```

### Using `upsertProduct`'s `MutationRef` function

```javascript
import { getDataConnect, DataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertProductRef, UpsertProductVariables } from '@firebasegen/dataconnect';

// The `upsertProduct` mutation requires an argument of type `UpsertProductVariables`:
const upsertProductVars: UpsertProductVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  inventory: ..., 
};

// Call the `upsertProductRef()` function to get a reference to the mutation.
const ref = upsertProductRef(upsertProductVars);
// Variables can be defined inline as well.
const ref = upsertProductRef({ name: ..., description: ..., price: ..., inventory: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertProductRef(dataConnect, upsertProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_upsert);
});
```

