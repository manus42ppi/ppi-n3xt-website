# ppi n3xt Website – Claude Projektkontext

> Einstiegspunkt für Claude Code. Wird bei jeder Session automatisch geladen.

Corporate Website für „ppi n3xt – Digitale Produkte & Innovation". Seit Mai 2026 inhaltlich unverändert.

---

## 1. Infrastruktur & Branches

| Layer | Technologie | Details |
|---|---|---|
| Frontend | Statisches HTML/CSS/JS | Kein Framework, kein Build-Schritt, kein `package.json` |
| Blog | Client-seitiger Fetch | `js/api.js` lädt Artikel von `https://socialflow-pro.pages.dev/blog` (`functions/blog.js` in SocialFlow Pro) |
| Produktion | https://ppi-n3xt-website.pages.dev | Auto-Deploy: `main` |
| Vorschau | https://develop.ppi-n3xt-website.pages.dev | Auto-Deploy: `develop` |
| Repo | https://github.com/manus42ppi/ppi-n3xt-website | |

### Branch-Strategie ⚠️

```
develop  →  Vorschau-URL  – hier wird IMMER gearbeitet
main     →  Produktion    – NUR bei explizitem "deployen" / "release"
```

```bash
git branch --show-current   # muss "develop" sein
git push origin develop     # Vorschau baut automatisch

# Release (nur auf ausdrückliche Anfrage):
git checkout main && git merge develop && git push origin main && git checkout develop
```

---

## 2. Dateistruktur

```
index.html          # Startseite (One-Pager)
css/style.css       # gesamtes Styling
js/api.js           # Blog-API-Client (fetchPosts, fetchPost, formatDate)
blog/index.html     # Blog-Übersicht
blog/post.html      # Einzelartikel (?slug=…)
assets/             # Bilder
_redirects          # /blog → /blog/index.html
```

---

## 3. Kritische Regeln

- **Abhängigkeit zu SocialFlow Pro:** Wird `functions/blog.js` dort geändert oder entfernt, bricht der Blog hier. Änderungen an der Blog-API immer in beiden Projekten prüfen.
- Kein Build-Schritt — Dateien werden 1:1 ausgeliefert. Nichts ins Repo legen, was nicht öffentlich sein darf.
- Direkt auf `main` pushen ist verboten — immer `develop`, Release nur auf Anfrage.
