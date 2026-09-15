const fs = require('fs')
const path = require('path')

const root = 'E:/Projects/whosonsite'
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8') }

// 1. Seed company A name + Riverbend customer name + dispatcher email
const seed = read('apps/api/src/infrastructure/database/seed/index.ts')
const m = seed.match(/const \[companyA\] = await db[\s\S]{0,400}?name: '([^']+)'/s)
console.log('companyA name   =', m && m[1])
const disp = seed.match(/role: UserRole\.DISPATCHER[\s\S]{0,120}?email: '([^']+)'/s)
console.log('first dispatcher email =', disp && disp[1])
const cust = seed.match(/name: '([^']*riverbend[^']*)'/i)
console.log('riverbend customer =', cust && cust[1])

// 2. CustomerStatusPage rendered strings
const csp = read('apps/web/src/pages/CustomerStatusPage.tsx')
console.log('--- t("customerStatus.*") keys used ---')
for (const mm of csp.matchAll(/customerStatus\.(title|notFoundTitle|subtitle|notFoundSubtitle|companyName|customer|scheduledAt|lastUpdated)\b/g)) {
  console.log('  key:', mm[0])
}
// heading text uses t('customerStatus.title')
const titleTd = csp.match(/customerStatus\.title[\s\S]{0,120}?\{t\('customerStatus\.title'\)\}/)
console.log('title usage sample:', titleTd && titleTd[0].replace(/\s+/g, ' ').slice(0, 160))

// 3. En i18n: find the file with customerStatus.title value
function findI18n(dir) {
  const entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      const r = findI18n(full)
      if (r) return r
    } else if (e.name.endsWith('.json')) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(root, full), 'utf8'))
        if (j.customerStatus || (j.title && String(j.title).toLowerCase().includes('status'))) {
          return full + ' :: ' + JSON.stringify(j.customerStatus || { title: j.title })
        }
      } catch (_) {}
    }
  }
  return null
}
console.log('i18n hit:', findI18n('apps/web/src'))

// 4. Jobs page link text for the board (nav.jobs) -> find en nav.jobs
const navJ = (function () {
  const jd = dir => {
    const entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { const r = jd(full); if (r) return r }
      else if (e.name.endsWith('.json')) {
        try {
          const j = JSON.parse(fs.readFileSync(path.join(root, full), 'utf8'))
          if (j.nav && j.nav.jobs) return full.split('whosonsite/')[1] + ' :: nav.jobs = ' + j.nav.jobs
        } catch (_) {}
      }
    }
    return null
  }
  return jd('apps/web/src')
})()
console.log('nav.jobs hit :', navJ)
