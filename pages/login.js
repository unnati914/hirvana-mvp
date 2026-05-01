import AuthEntryPage from "../components/AuthEntryPage";
import { getLoginServerSideProps } from "../lib/auth-entry-ssr";

export default AuthEntryPage;
export const getServerSideProps = getLoginServerSideProps;
