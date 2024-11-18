import { beforeUserCreated } from "firebase-functions/v2/identity";

export const beforecreated = beforeUserCreated((event) => {
  const user = event.data;
  // TODO: Clone with Data Connect
  console.log(user);
});
