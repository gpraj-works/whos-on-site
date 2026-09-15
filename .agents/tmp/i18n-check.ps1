$ErrorActionPreference = 'Stop'

function Get-Json($p) { (Get-Content $p -Raw) | ConvertFrom-Json }

$en = Get-Json 'apps\web\src\app\i18n\resources\en\common.json'

Write-Host '=== i18n keys spec needs ==='
Write-Host "nav.dashboard = '$($en.nav.dashboard)'"
Write-Host "nav.jobs      = '$($en.nav.jobs)'"
Write-Host "jobs.title    = '$($en.jobs.title)'"
Write-Host "customerStatus.title     = '$($en.customerStatus.title)'"
Write-Host "jobs.copyShareLink       = '$($en.jobs.copyShareLink)'"
Write-Host "jobs.linkCopied          = '$($en.jobs.linkCopied)'"

Write-Host ''
Write-Host '=== DetailDrawer Title heading (L344-352) ==='
$d = Get-Content 'apps\web\src\components\jobs\DetailDrawer.tsx'
for ($i = 344; $i -le 352; $i++) { if ($d[$i-1]) { "L$i: $($d[$i-1].Trim())" } }

Write-Host ''
Write-Host '=== CustomerStatusPage heading (L128-136) ==='
$c = Get-Content 'apps\web\src\pages\CustomerStatusPage.tsx'
for ($i = 128; $i -le 136; $i++) { if ($c[$i-1]) { "L$i: $($c[$i-1].Trim())" } }

Write-Host ''
Write-Host '=== seed: dispatcher company + Riverbend job jobId? (company=A cmc?) ==='
$s = Get-Content 'apps\api\src\infrastructure\database\seed\index.ts'
for ($i = 15; $i -le 30; $i++) { if ($s[$i-1]) { "L$i: $($s[$i-1].Trim())" } }
$jref = Select-String -Path 'apps\api\src\infrastructure\database\seed\index.ts' -Pattern "customer\(customerA|job\(" 
$jref | ForEach-Object { "L$($_.LineNumber): $($_.Line.Trim())" } | Select-Object -First 8
