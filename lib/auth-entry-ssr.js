import { getAuthEnvFlags } from "./auth-options";

/** `/login` — sign-in plus create-account beside it on wide screens when Postgres is enabled. */
export async function getLoginServerSideProps() {
  const auth = getAuthEnvFlags();
  return {
    props: {
      auth,
    },
  };
}
