<script setup>
import { computed } from 'vue'
import { useGitHubProfile } from '../../composables/useGitHubProfile'
import { contacts, profile } from '../../data/portfolio'

const { ghUser } = useGitHubProfile()

const socialContacts = computed(() =>
  contacts.slice(1).map((item) => {
    if (item.id === 'github') {
      return {
        ...item,
        href: ghUser.value.htmlUrl,
        value: `github.com/${ghUser.value.login} · ${ghUser.value.publicRepos} repos`
      }
    }
    return item
  })
)
</script>

<template>
  <footer id="contact" class="site-footer section-band section-padding">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-lead">
          <p class="section-eyebrow">05 / contact</p>
          <h2 class="section-title">Get in Touch</h2>
          <p class="footer-note">
            Always happy to chat about back-end systems, full-stack web apps, or coding ideas. Feel free to send an email or drop by any profile here.
          </p>
          <a class="btn-key btn-key--primary email-cta" :href="`mailto:${contacts[0].value}`">
            <svg
              aria-hidden="true"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <span>Send Email ({{ contacts[0].value }})</span>
          </a>
        </div>

        <div class="footer-links-wrap">
          <h3 class="links-heading">Other Profiles</h3>
          <ul class="contact-list">
            <li v-for="item in socialContacts" :key="item.id">
              <a
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
                class="contact-link"
              >
                <span class="contact-brand">
                  <svg
                    v-if="item.id === 'github'"
                    aria-hidden="true"
                    class="contact-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                    />
                  </svg>
                  <svg
                    v-else-if="item.id === 'gitlab'"
                    aria-hidden="true"
                    class="contact-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="m22.65 14.39-1.27-3.9L18.87 2.8a.43.43 0 0 0-.82 0L15.54 10.5H8.46L5.95 2.8a.43.43 0 0 0-.82 0L2.62 10.49l-1.27 3.9a.85.85 0 0 0 .31.95L12 22.86l10.34-7.52a.85.85 0 0 0 .31-.95Z"
                    />
                  </svg>
                  <svg
                    v-else-if="item.id === 'linkedin'"
                    aria-hidden="true"
                    class="contact-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
                    />
                  </svg>
                  <svg
                    v-else-if="item.id === 'instagram'"
                    aria-hidden="true"
                    class="contact-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect width="16" height="16" x="4" y="4" rx="4" />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
                  </svg>
                  <span class="contact-label">{{ item.label }}</span>
                </span>
                <span class="contact-value">{{ item.value }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 {{ profile.name }} · Built with Vue &amp; Lenis</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-border-subtle);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.footer-note {
  margin-top: 0.75rem;
  max-width: 48ch;
  color: var(--color-ink-secondary);
}

.email-cta {
  margin-top: 1.25rem;
}

.links-heading {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-ink-muted);
  margin-bottom: 0.75rem;
}

.contact-list {
  list-style: none;
  border-top: 1px solid var(--color-border-subtle);
}

.contact-list li {
  border-bottom: 1px solid var(--color-border-subtle);
}

.contact-link {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 1rem;
  min-height: 48px;
  padding-block: 0.65rem;
  text-decoration: none;
  color: var(--color-ink);
}

@media (prefers-reduced-motion: no-preference) {
  .contact-link,
  .contact-icon,
  .contact-value {
    transition: color 140ms ease, transform 140ms ease;
  }
}

.contact-link:hover,
.contact-link:hover .contact-value,
.contact-link:hover .contact-icon {
  color: var(--color-accent);
}

@media (any-hover: hover) and (prefers-reduced-motion: no-preference) {
  .contact-link:hover {
    transform: translateX(4px);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .contact-link:active {
    transform: translateX(2px);
  }
}

.contact-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}

.contact-icon {
  color: var(--color-ink-secondary);
  flex-shrink: 0;
}

.contact-label {
  font-weight: 700;
}

.contact-value {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-ink-secondary);
}

.footer-bottom {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-subtle);
  font-size: 0.88rem;
  color: var(--color-ink-muted);
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 1.2fr 1fr;
    align-items: start;
  }
}
</style>
