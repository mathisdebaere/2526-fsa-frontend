<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const menuOpen = ref(false)
</script>

<template>
  <div class="landing">
    <a href="#main-content" class="skip-link">Ga naar inhoud</a>
    <header class="lh">
      <div class="lh_inner">
        <RouterLink to="/" class="lh_logo" aria-label="FijneWijk – naar homepage">
          <img src="@/assets/images/logo.png" alt="" aria-hidden="true" class="lh_logo-img" />
        </RouterLink>
        <button class="lh_burger" :aria-expanded="menuOpen" :aria-label="menuOpen ? 'Menu sluiten' : 'Menu openen'" @click="menuOpen = !menuOpen">
          <span class="lh_burger-bar" :class="{ 'lh_burger-bar--top': menuOpen }"></span>
          <span class="lh_burger-bar" :class="{ 'lh_burger-bar--mid': menuOpen }"></span>
          <span class="lh_burger-bar" :class="{ 'lh_burger-bar--bot': menuOpen }"></span>
        </button>
        <nav class="lh_nav" :class="{ 'lh_nav--open': menuOpen }" aria-label="Hoofdnavigatie">
          <RouterLink to="/login" class="lh_nav-link" @click="menuOpen = false">Aanmelden</RouterLink>
          <RouterLink to="/register" class="lh_nav-cta" @click="menuOpen = false">Registreren</RouterLink>
        </nav>
      </div>
    </header>

    <section id="main-content" class="hero" aria-labelledby="hero-heading">
      <img src="@/assets/images/hero-fijnewijk.png" alt="" aria-hidden="true" class="hero_bg" />
      <div class="hero_overlay"></div>
      <div class="hero_inner">
        <div class="hero_text">
          <h1 id="hero-heading" class="hero_title">Het leven wordt<br />warmer als we iets<br />voor elkaar betekenen</h1>
          <p class="hero_sub">FijneWijk verbindt vrijwilligers met 65-plussers in de buurt, voor kleine taken die een groot verschil maken. Niemand hoeft alleen te staan.</p>
          <div class="hero_actions">
            <RouterLink to="/register" class="btn btn--orange">Gratis registreren</RouterLink>
            <RouterLink to="/login" class="btn btn--outline">Aanmelden</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="steps" aria-labelledby="steps-heading">
      <div class="section-inner">
        <div class="section-header">
          <h2 id="steps-heading">Hoe werkt het?</h2>
          <p class="section-sub">In drie stappen op weg naar hulp of helpend zijn.</p>
        </div>

        <ol class="steps_list">
          <li class="step-card">
            <div class="step-card_num" aria-hidden="true">1</div>
            <div class="step-card_icon" aria-hidden="true">
              <i class="fa-solid fa-user-plus"></i>
            </div>
            <h3 class="step-card_title">Registreer je</h3>
            <p class="step-card_desc">Maak een gratis account aan als dienstvrager of vrijwilliger. Een adviseur neemt contact op voor een persoonlijk intakegesprek.</p>
          </li>
          <li class="step-card">
            <div class="step-card_num" aria-hidden="true">2</div>
            <div class="step-card_icon" aria-hidden="true">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="step-card_title">Word gematcht</h3>
            <p class="step-card_desc">Op basis van jouw wensen, beschikbaarheid en hulpvraag koppelen we je aan de juiste persoon in jouw buurt.</p>
          </li>
          <li class="step-card">
            <div class="step-card_num" aria-hidden="true">3</div>
            <div class="step-card_icon" aria-hidden="true">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
            <h3 class="step-card_title">Maak een afspraak</h3>
            <p class="step-card_desc">Plan samen een moment in en bouw aan een fijnere buurt, één kleine daad per keer.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="visual-break" aria-hidden="true">
      <img src="@/assets/images/home-hero.png" alt="" class="visual-break_img" />
    </section>

    <section class="audience" aria-labelledby="audience-heading">
      <div class="section-inner">
        <div class="section-header">
          <h2 id="audience-heading">Voor wie is FijneWijk?</h2>
          <p class="section-sub">Of je nu hulp zoekt of wil bieden, er is een plek voor jou.</p>
        </div>

        <div class="audience_grid">
          <article class="aud-card">
            <div class="aud-card_media">
              <img src="@/assets/images/hands.png" alt="Helpende handen" class="aud-card_img" />
            </div>
            <div class="aud-card_body">
              <h3 class="aud-card_title">Ik zoek hulp</h3>
              <p class="aud-card_desc">Ben je 65-plusser en zoek je een helpende hand bij dagelijkse taken? FijneWijk verbindt je met een vrijwilliger uit je eigen buurt.</p>
              <ul class="aud-card_list">
                <li>Boodschappen doen</li>
                <li>Vervoer naar afspraken</li>
                <li>Gezelschap en een luisterend oor</li>
                <li>Kleine karweitjes thuis</li>
              </ul>
              <RouterLink to="/register" class="aud-card_btn btn btn--primary">Registreer als dienstvrager</RouterLink>
            </div>
          </article>
          <article class="aud-card aud-card--volunteer">
            <div class="aud-card_media aud-card_media--teal">
              <img src="@/assets/images/hands.png" alt="Vrijwilligerswerk" class="aud-card_img" />
            </div>
            <div class="aud-card_body">
              <h3 class="aud-card_title aud-card_title--teal">Ik wil helpen</h3>
              <p class="aud-card_desc">Wil je iets betekenen voor mensen in je buurt? Word vrijwilliger bij FijneWijk. Flexibel, zinvol en met begeleiding van een adviseur.</p>
              <ul class="aud-card_list">
                <li>Flexibel inzetbaar</li>
                <li>Persoonlijke begeleiding</li>
                <li>Zinvolle tijdsbesteding</li>
                <li>Open voor studenten, werkenden &amp; gepensioneerden</li>
              </ul>
              <RouterLink to="/register" class="aud-card_btn btn btn--teal">Registreer als vrijwilliger</RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="cta-banner" aria-labelledby="cta-heading">
      <div class="section-inner cta-banner_inner">
        <h2 id="cta-heading" class="cta-banner_title">Klaar om mee te doen?</h2>
        <p class="cta-banner_sub">Maak gratis een account aan en sluit je aan bij onze groeiende buurtgemeenschap.</p>
        <RouterLink to="/register" class="btn btn--orange">Gratis registreren</RouterLink>
      </div>
    </section>

    <footer class="lf">
      <div class="lf_inner">
        <p class="lf_copy">© 2026 FijneWijk</p>
        <nav class="lf_links" aria-label="Footer navigatie">
          <RouterLink to="/privacy" class="lf_link">Privacybeleid</RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  font-family: var(--font-body);
}

.section-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);

  h2 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }
}

.section-sub {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: 700;
  text-decoration: none;
  min-height: 3rem;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.88;
  }
  &:focus-visible {
    @include focus-ring();
  }

  &--orange {
    background: var(--color-orange);
    color: var(--color-primary);
  }

  &--outline {
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.6);

    &:hover {
      border-color: #fff;
      background: rgba(255, 255, 255, 0.08);
      opacity: 1;
    }
  }

  &--primary {
    background: var(--color-primary);
    color: #fff;
    font-size: var(--font-size-sm);
  }

  &--teal {
    background: var(--color-teal);
    color: #fff;
    font-size: var(--font-size-sm);
  }
}

.lh {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg-nav);

  &_inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    height: var(--nav-height);
    gap: var(--spacing-md);
  }

  &_logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }

  &_logo-img {
    height: 3.5rem;
    width: auto;
  }

  &_nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    @include breakpoint(md) {
      display: none;
      position: absolute;
      top: var(--nav-height);
      left: 0;
      right: 0;
      background: var(--color-primary-dark);
      flex-direction: column;
      align-items: stretch;
      padding: var(--spacing-md) var(--spacing-lg);
      gap: var(--spacing-sm);
    }

    &--open {
      @include breakpoint(md) {
        display: flex;
      }
    }
  }

  &_nav-link {
    padding: 0.5rem 1rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 600;
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius);
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    &:focus-visible {
      outline: 3px solid var(--color-focus);
    }

    @include breakpoint(md) {
      justify-content: center;
    }
  }

  &_nav-cta {
    padding: 0.5rem 1.25rem;
    background: var(--color-orange);
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 700;
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius);
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.88;
    }
    &:focus-visible {
      outline: 3px solid var(--color-focus);
    }

    @include breakpoint(md) {
      justify-content: center;
    }
  }

  &_burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--border-radius);
    transition: background 0.15s ease;

    @include breakpoint(md) {
      display: flex;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 2px;
    }
  }

  &_burger-bar {
    display: block;
    width: 1.5rem;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transform-origin: center;
    transition:
      transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
      opacity 0.2s ease;

    &--top {
      transform: translateY(calc(0.3rem + 2px)) rotate(45deg);
    }

    &--mid {
      opacity: 0;
      transform: scaleX(0);
    }

    &--bot {
      transform: translateY(calc(-0.3rem - 2px)) rotate(-45deg);
    }
  }
}

.hero {
  position: relative;
  color: #fff;
  padding: var(--spacing-2xl) var(--spacing-lg);
  overflow: hidden;
  min-height: 32rem;
  display: flex;
  align-items: center;

  &_bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &_overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0, 48, 80, 0.82) 0%, rgba(0, 48, 80, 0.45) 60%, rgba(0, 48, 80, 0.1) 100%);
  }

  &_inner {
    position: relative;
    z-index: 1;
    max-width: var(--max-width);
    width: 100%;
    margin: 0 auto;
  }

  &_text {
    max-width: 36rem;
  }

  &_title {
    font-family: var(--font-display);
    font-size: clamp(2.25rem, 5vw, 4rem);
    line-height: 1.1;
    letter-spacing: 0.02em;
    color: #fff;
    margin-bottom: var(--spacing-md);
  }

  &_sub {
    font-size: var(--font-size-lg);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.88);
    margin-bottom: var(--spacing-xl);
  }

  &_actions {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }
}

.steps {
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-bg-card);
}

.steps_list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);

  @include breakpoint(md) {
    grid-template-columns: 1fr;
  }
}

.step-card {
  background: var(--color-peach);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;

  &_num {
    font-family: var(--font-display);
    font-size: 4rem;
    line-height: 1;
    color: rgba(0, 72, 112, 0.1);
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
  }

  &_icon {
    width: 3.5rem;
    height: 3.5rem;
    background: var(--color-primary);
    color: #fff;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &_title {
    font-family: var(--font-display);
    font-size: var(--font-size-xl);
    color: var(--color-primary);
    margin: 0;
    letter-spacing: 0.03em;
  }

  &_desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: 1.65;
    margin: 0;
  }
}

.visual-break {
  width: 100%;
  max-height: 28rem;
  overflow: hidden;

  &_img {
    width: 100%;
    height: 28rem;
    object-fit: cover;
    display: block;
  }
}

.audience {
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-teal-light);
}

.audience_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);

  @include breakpoint(md) {
    grid-template-columns: 1fr;
  }
}

.aud-card {
  background: var(--color-bg-card);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &_media {
    background: var(--color-primary-light);
    overflow: hidden;
    height: 12rem;

    &--teal {
      background: var(--color-teal-light);
    }
  }

  &_img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &_body {
    padding: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    flex: 1;
  }

  &_title {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    color: var(--color-primary);
    letter-spacing: 0.03em;
    margin: 0;

    &--teal {
      color: var(--color-teal);
    }
  }

  &_desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: 1.65;
    margin: 0;
  }

  &_list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;

    li {
      font-size: var(--font-size-sm);
      color: var(--color-text);
      padding-left: 1.5rem;
      position: relative;

      &::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--color-orange);
        font-weight: 700;
      }
    }
  }

  &_btn {
    margin-top: auto;
  }
}

.cta-banner {
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-primary);

  &_inner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }

  &_title {
    font-family: var(--font-display);
    font-size: var(--font-size-3xl);
    color: #fff;
    letter-spacing: 0.03em;
  }

  &_sub {
    font-size: var(--font-size-base);
    color: rgba(255, 255, 255, 0.8);
    max-width: 36rem;
    margin: 0;
  }
}

.lf {
  background: #002e48;
  color: rgba(255, 255, 255, 0.6);
  padding: var(--spacing-lg) var(--spacing-xl);
  margin-top: auto;

  &_inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  &_copy {
    font-size: var(--font-size-xs);
    margin: 0;
  }

  &_links {
    display: flex;
    gap: var(--spacing-lg);
  }

  &_link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: var(--font-size-xs);
    font-weight: 600;
    transition: color 0.15s ease;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
}
</style>
