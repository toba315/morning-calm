param(
  [string]$TaskName = "MorningCalmNewsFetch",
  [string]$DailyTime = "06:00"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$npmCommand = (Get-Command npm.cmd -ErrorAction SilentlyContinue)?.Source

if (-not $npmCommand) {
  $npmCommand = (Get-Command npm -ErrorAction Stop).Source
}

$action = New-ScheduledTaskAction `
  -Execute $npmCommand `
  -Argument "run news:fetch" `
  -WorkingDirectory $repoRoot

$trigger = New-ScheduledTaskTrigger -Daily -At $DailyTime
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Fetch Morning Calm news metadata and generate app data." `
  -Force

Write-Host "Registered scheduled task '$TaskName' at $DailyTime."
