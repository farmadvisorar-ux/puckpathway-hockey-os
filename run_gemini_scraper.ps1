# BlueLine DataWorks: Autonomous Gemini Hockey Web Scraper Swarm Runner
# Executes team-by-team web scraping across hockey leagues every 4 hours, enforces zero duplicates, and stamps the ledger.

param(
    [switch]$Daemon = $false,
    [switch]$DryRun = $false,
    [switch]$Once = $true,
    [int]$IntervalHours = 4
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scraperPath = Join-Path $scriptDir "scripts\gemini_team_scraper.js"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  BLUELINE DATAWORKS: GEMINI AUTONOMOUS HOCKEY WEB SCRAPER SWARM" -ForegroundColor Cyan
Write-Host "  Schedule: 4-Hour Staggered Ingestion | Zero-Duplicate Protocol " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

if ($Daemon) {
    Write-Host "[Daemon Mode] Running continuous 4-hour scraper loop..." -ForegroundColor Green
    while ($true) {
        $now = Get-Date
        Write-Host "`n[$now] Launching Gemini Team-by-Team Scraper Batch..." -ForegroundColor Yellow
        
        node $scraperPath --once
        
        $sleepSeconds = $IntervalHours * 3600
        $nextRun = (Get-Date).AddSeconds($sleepSeconds)
        Write-Host "Cycle complete. Next run scheduled at $nextRun (sleeping $IntervalHours hours)..." -ForegroundColor Cyan
        Start-Sleep -Seconds $sleepSeconds
    }
} else {
    $flag = if ($DryRun) { "--dry-run" } else { "--once" }
    Write-Host "Executing single scraper cycle ($flag)..." -ForegroundColor Yellow
    node $scraperPath $flag
}
