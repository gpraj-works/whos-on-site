import React from 'react'
import { Box } from '@mantine/core'

import { About } from '../components/landing/About'
import { CtaBanner } from '../components/landing/CtaBanner'
import { Features } from '../components/landing/Features'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHeader } from '../components/landing/LandingHeader'
import { Plans } from '../components/landing/Plans'

export const LandingPage: React.FC = () => {
  return (
    <Box bg="var(--mantine-color-body)" mih="100vh">
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <Plans />
        <CtaBanner />
      </main>
      <LandingFooter />
    </Box>
  )
}

export default LandingPage
