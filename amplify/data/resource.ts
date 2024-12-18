import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { FlexApiFunction } from "../Flex_Api/resource";
import { adminConfirmUser } from "../auth/adminConfirmUser/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  AwaitingPrep: a
    .model({
      id: a.string().required(),
      displayName: a.string().required(),
      plannedStartDate: a.string(),
      categories: a.string().array()
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Category: a
    .model({
      id: a.string().required(), // Unique identifier
      projectId: a.string().required(), // Associated Project ID
      name: a.string().required(), // Category name
      lineItems: a.string().array(), // List of Line Item IDs
    })
    .authorization((allow) => [allow.publicApiKey()]),

  LineItem: a
    .model({
      id: a.string().required(), // Unique identifier
      categoryId: a.string().required(), // Associated Category ID
      description: a.string().required(), // Item description
      quantity: a.integer().required(), // Quantity
      price: a.float().required(), // Price
    })
    .authorization((allow) => [allow.publicApiKey()]),

  adminConfirmUser: a
    .query()
    .arguments({
      username: a.string()
    })
    .returns( a.json() )
    .handler(a.handler.function( adminConfirmUser ))
    .authorization((allow)=>[allow.publicApiKey()]),


  FlexApiFunction: a
    .query()
    .arguments({
      API_STRING: a.string()
    })
    .returns( a.json() )
    .handler(a.handler.function( FlexApiFunction ))
    .authorization((allow)=>[allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
