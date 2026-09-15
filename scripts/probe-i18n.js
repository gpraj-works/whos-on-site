const fs = require('fs')
const p = 'apps/web/src/app/i18n/resources/en/common.json'
const j = JSON.parse(fs.readFileSync(p, 'utf8'))

const keys = [
  ['customerStatus.title', j.customerStatus && j.customerStatus.title],
  ['customerStatus.subtitle', j.customerStatus && j.customerStatus.subtitle],
  ['jobs.linkCopied', j.jobs && j.jobs.linkCopied],
  ['jobs.copyShareLink', j.jobs && j.jobs.copyShareLink],
  ['jobs.title', j.jobs && j.jobs.title],
  ['nav.jobs', j.nav && j.nav.jobs]
]
for (const [k, v] of keys) console.log(`  ${k} = '${v}'`)

console.log('  --- CustomerStatusPage Title/companyName/statusTitle key names present in page ---')
const src = fs.readFileSync('apps/web/src/pages/CustomerStatusPage.tsx', 'utf8')
for (const m of src.matchAll(/t\('([^']+)'/g)) console.log('    ' + m[1])
