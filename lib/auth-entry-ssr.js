import { getServerSession } from "next-auth/next";
import { authOptions, getAuthEnvFlags } from "./auth-options";

/** `/login` — sign-in plus create-account beside it on wide screens when Postgres is enabled. */
export async function getLoginServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const auth = getAuthEnvFlags();
  return {
    props: {
      auth,
    },
  };
}
