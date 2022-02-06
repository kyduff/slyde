import Head from "next/head";
import { Center } from "@chakra-ui/react";
import { getAllGuides, getGuideBySlug } from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import utilStyles from "../../styles/utils.module.css";

export async function getStaticProps({ params }) {
  const guideData = getGuideBySlug(params.guide, [
    'slug',
    'content',
    'title',
    'action',
    'object',
    'location',
  ]);

  // convert content to html
  guideData.html = await markdownToHtml(guideData.content);

  return {
    props: {
      guideData,
    }
  }
}

export async function getStaticPaths() {
  const paths = getAllGuides([
    'slug',
  ]).map(path => ({ params: { guide: path.slug } }));

  return {
    paths,
    fallback: false,
  }
}

export default function Guide({ guideData }) {
  return (
    <>
      <Head>
        <title>{guideData.title}</title>
      </Head>
      <Center>
        <article>
          <h1 className={utilStyles.headingXl}>{guideData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: guideData.html }} />
        </article>
      </Center>
    </>
  )
}