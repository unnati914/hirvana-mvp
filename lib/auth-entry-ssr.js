import { getServerSession } from "next-auth/next";
import { authOptions, getAuthEnvFlags } from "./auth-options";

/** `/login` — sign-in plus create-account form on the same page when Postgres is enabled. */
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
