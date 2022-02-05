import { Button, HStack, Select, VStack } from '@chakra-ui/react'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {

  // record user choice
  const [path, setPath] = useState({});

  async function handleClick() {
    console.log(JSON.stringify(path, null, 2));

  }
  return (
    <div className={styles.container}>
      <Head>
        <title>slyde</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        {/* Begin custom additions */}

        <p className={styles.description}>
          I want to...
        </p>
        <VStack spacing={4}>

          <HStack>
            <Select placeholder='Action' onChange={value => { path.action = value; setPath(path) }}>
              <option value='send'>Send</option>
              <option value='buy'>Buy</option>
            </Select>
            <Select placeholder='Object'>
              <option value='eth'>ETH</option>
              <option value='matic'>MATIC</option>
            </Select>
            <p>to</p>
            <Select placeholder='Location'>
              <option value='polygon'>Polygon Address</option>
              <option value='eth'>ETH Address</option>
            </Select>
          </HStack>

          <Button onClick={handleClick}>
            Go &rarr;
          </Button>
        </VStack>

        {/*
        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
         </div>
         */}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
