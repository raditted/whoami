<script setup>
import { provideFractalControl } from './composables/useFractal'
import { provideGitHubProfile } from './composables/useGitHubProfile'
import { provideLenis } from './composables/useLenis'
import { provideTheme } from './composables/useTheme'
import FractalCanvas from './components/ui/FractalCanvas.vue'
import NavBar from './components/layout/NavBar.vue'
import HeroSection from './components/sections/HeroSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import ExperienceSection from './components/sections/ExperienceSection.vue'
import GitHubReadmeSection from './components/sections/GitHubReadmeSection.vue'
import ProjectsSection from './components/sections/ProjectsSection.vue'
import FooterSection from './components/layout/FooterSection.vue'

provideTheme()
provideFractalControl()
provideLenis()
provideGitHubProfile('raditted')
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <FractalCanvas />
  <NavBar />

  <main id="main-content" tabindex="-1">
    <HeroSection />
    <AboutSection />
    <ExperienceSection />
    <GitHubReadmeSection />
    <ProjectsSection />
  </main>

  <FooterSection />
</template>
