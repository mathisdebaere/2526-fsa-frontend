<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="privacy-page">
    <header class="privacy-header">
      <div class="privacy-header_inner">
        <RouterLink to="/" class="privacy-header_logo">
          <img src="@/assets/images/logo.png" alt="FijneWijk" class="privacy-header_logo-img" />
        </RouterLink>
      </div>
    </header>
    <main id="main-content" class="privacy-main">
      <div class="privacy-content">
        <h1 class="privacy-title">Privacybeleid</h1>
        <p class="privacy-updated">Laatst bijgewerkt: juni 2025</p>

        <section class="privacy-section" aria-labelledby="s1">
          <h2 id="s1">1. Wie zijn wij?</h2>
          <p>
            FijneWijk is een buurtplatform dat mensen die hulp zoeken (dienstvragers) verbindt met vrijwilligers uit de buurt. Het platform wordt beheerd door het FijneWijk-team, bereikbaar via
            <a href="mailto:info@zilverenschakel.com">info@zilverenschakel.com</a>.
          </p>
          <p>Wij treden op als verwerkingsverantwoordelijke voor de persoonsgegevens die u ons toevertrouwt via dit platform.</p>
        </section>

        <section class="privacy-section" aria-labelledby="s2">
          <h2 id="s2">2. Welke gegevens verwerken wij?</h2>
          <p>Wij verwerken de volgende persoonsgegevens:</p>
          <ul>
            <li><strong>Identificatiegegevens:</strong> voornaam, achternaam</li>
            <li><strong>Contactgegevens:</strong> e-mailadres, telefoonnummer</li>
            <li><strong>Accountgegevens:</strong> rol op het platform (dienstvrager, vrijwilliger of adviseur), wachtwoord (versleuteld opgeslagen)</li>
            <li><strong>Profielgegevens:</strong> profielfoto, persoonlijke beschrijving, beschikbaarheid</li>
            <li><strong>Activiteitsgegevens:</strong> hulpvragen, afspraken, intakes, abonnementsstatus en bijbehorende informatie (datum, tijdstip, locatie, categorie, regio)</li>
          </ul>
        </section>

        <section class="privacy-section" aria-labelledby="s3">
          <h2 id="s3">3. Waarvoor gebruiken wij uw gegevens?</h2>
          <table class="privacy-table" aria-label="Doeleinden van gegevensverwerking">
            <thead>
              <tr>
                <th>Doel</th>
                <th>Rechtsgrond</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aanmaken en beheren van uw account</td>
                <td>Uitvoering overeenkomst</td>
              </tr>
              <tr>
                <td>Koppelen van dienstvragers aan vrijwilligers</td>
                <td>Uitvoering overeenkomst</td>
              </tr>
              <tr>
                <td>Inplannen en opvolgen van afspraken en intakes</td>
                <td>Uitvoering overeenkomst</td>
              </tr>
              <tr>
                <td>Beheer van hulpvragen en abonnementen</td>
                <td>Uitvoering overeenkomst</td>
              </tr>
              <tr>
                <td>Communicatie over uw activiteiten op het platform</td>
                <td>Gerechtvaardigd belang</td>
              </tr>
              <tr>
                <td>Verbetering en beveiliging van het platform</td>
                <td>Gerechtvaardigd belang</td>
              </tr>
              <tr>
                <td>Naleving van wettelijke verplichtingen</td>
                <td>Wettelijke verplichting</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="privacy-section" aria-labelledby="s4">
          <h2 id="s4">4. Hoe lang bewaren wij uw gegevens?</h2>
          <p>Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor zij zijn verzameld:</p>
          <ul>
            <li><strong>Accountgegevens:</strong> zolang uw account actief is. Na verwijdering worden gegevens binnen 30 dagen gewist.</li>
            <li><strong>Afspraken en hulpvragen:</strong> maximaal 2 jaar na afronding, tenzij een langere bewaarplicht van toepassing is.</li>
            <li><strong>Boekhoudkundige gegevens (abonnementen):</strong> 7 jaar conform de Belgische fiscale wetgeving.</li>
          </ul>
        </section>

        <section class="privacy-section" aria-labelledby="s5">
          <h2 id="s5">5. Delen wij uw gegevens?</h2>
          <p>Uw gegevens worden enkel gedeeld binnen het platform zelf (bv. een adviseur ziet uw profiel om u te begeleiden) en met de vrijwilliger aan wie u gekoppeld bent.</p>
          <p>Wij verstrekken uw persoonsgegevens niet aan derden voor commerciële doeleinden. Wij kunnen gebruik maken van verwerkers (bv. hostingproviders) die strikt gebonden zijn aan verwerkersovereenkomsten en niet zelfstandig over uw data beschikken.</p>
          <p>Wij geven geen gegevens door buiten de Europese Economische Ruimte (EER).</p>
        </section>

        <section class="privacy-section" aria-labelledby="s6">
          <h2 id="s6">6. Uw rechten</h2>
          <p>Als betrokkene heeft u de volgende rechten onder de AVG (GDPR):</p>
          <ul>
            <li><strong>Recht op inzage:</strong> u kunt opvragen welke gegevens wij van u bewaren.</li>
            <li><strong>Recht op rectificatie:</strong> u kunt onjuiste of onvolledige gegevens laten corrigeren.</li>
            <li><strong>Recht op wissing ("recht op vergetelheid"):</strong> u kunt vragen uw gegevens te verwijderen, tenzij een bewaarplicht van toepassing is.</li>
            <li><strong>Recht op beperking van de verwerking:</strong> u kunt in bepaalde gevallen vragen de verwerking tijdelijk te beperken.</li>
            <li><strong>Recht op overdraagbaarheid:</strong> u kunt uw gegevens in een gestructureerd, gangbaar formaat opvragen.</li>
            <li><strong>Recht van bezwaar:</strong> u kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</li>
          </ul>
          <p>
            Om één van deze rechten uit te oefenen, stuurt u een e-mail naar
            <a href="mailto:info@zilverenschakel.com">info@zilverenschakel.com</a> met een kopie van uw identiteitsbewijs. Wij reageren binnen 30 dagen.
          </p>
          <p>
            U heeft ook het recht een klacht in te dienen bij de Gegevensbeschermingsautoriteit (GBA):
            <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer">www.gegevensbeschermingsautoriteit.be</a>.
          </p>
        </section>

        <section class="privacy-section" aria-labelledby="s7">
          <h2 id="s7">7. Beveiliging</h2>
          <p>Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen verlies, diefstal of ongeoorloofde toegang. Wachtwoorden worden versleuteld opgeslagen en worden nooit in leesbare tekst bewaard of verstuurd. Verbindingen met het platform verlopen via HTTPS.</p>
        </section>

        <section class="privacy-section" aria-labelledby="s8">
          <h2 id="s8">8. Cookies</h2>
          <p>FijneWijk maakt gebruik van functionele cookies die strikt noodzakelijk zijn voor het functioneren van het platform (bv. voor authenticatie en sessiebeheer). Er worden geen tracking- of advertentiecookies geplaatst.</p>
        </section>

        <section class="privacy-section" aria-labelledby="s9">
          <h2 id="s9">9. Wijzigingen aan dit beleid</h2>
          <p>Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. Ingrijpende wijzigingen worden u via het platform meegedeeld. De meest recente versie is steeds beschikbaar op deze pagina.</p>
        </section>

        <section class="privacy-section" aria-labelledby="s10">
          <h2 id="s10">10. Contact</h2>
          <p>Voor vragen over dit privacybeleid of de verwerking van uw persoonsgegevens kunt u ons bereiken via:</p>
          <address class="privacy-address">
            <strong>FijneWijk</strong><br />
            E-mail: <a href="mailto:info@zilverenschakel.com">info@zilverenschakel.com</a>
          </address>
        </section>

        <div class="privacy-back">
          <RouterLink to="/" class="privacy-back-link"> <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Terug naar de startpagina </RouterLink>
        </div>
      </div>
    </main>

    <footer class="privacy-footer">
      <p>© 2026 FijneWijk</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.privacy-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  font-family: var(--font-body);
}

.privacy-header {
  background: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.privacy-header_inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem var(--spacing-lg);
}

.privacy-header_logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.privacy-header_logo-img {
  height: 2.5rem;
  object-fit: contain;
}

.privacy-main {
  flex: 1;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.privacy-content {
  max-width: 52rem;
  margin: 0 auto;
}

.privacy-title {
  font-size: var(--font-size-3xl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.privacy-updated {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-2xl);
}

.privacy-section {
  margin-bottom: var(--spacing-2xl);

  h2 {
    font-size: var(--font-size-xl);
    color: var(--color-text);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-xs);
    border-bottom: 2px solid var(--color-primary-light);
  }

  p {
    line-height: 1.75;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    li {
      line-height: 1.6;
      color: var(--color-text);
    }
  }

  a {
    color: var(--color-primary);
    text-underline-offset: 3px;

    &:hover {
      color: var(--color-primary-dark);
    }
  }
}

.privacy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);

  th,
  td {
    padding: 0.6rem 0.875rem;
    text-align: left;
    border: 1px solid var(--color-border);
  }

  th {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    font-weight: 700;
  }

  tr:nth-child(even) td {
    background: var(--color-bg-card);
  }
}

.privacy-address {
  font-style: normal;
  line-height: 1.8;
  color: var(--color-text);

  a {
    color: var(--color-primary);
  }
}

.privacy-back {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.privacy-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.privacy-footer {
  padding: var(--spacing-lg);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
}

@include breakpoint(sm) {
  .privacy-main {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .privacy-title {
    font-size: var(--font-size-2xl);
  }

  .privacy-table {
    font-size: var(--font-size-xs);

    th,
    td {
      padding: 0.4rem 0.5rem;
    }
  }
}
</style>
