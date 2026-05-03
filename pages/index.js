import Head from "next/head";
import Layout from "../components/Layout";
import HirvanaLanding from "../components/HirvanaLanding";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hirvana — career prep with AI</title>
        <meta
          name="description"
          content="Resume hub, interview practice, and application tracking for students and early-career builders."
        />
      </Head>
      <Layout>
        <HirvanaLanding />
      </Layout>
    </>
  );
}
