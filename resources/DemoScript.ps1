#--[ General Information ]------------------------------------------------
#
# 1. To run with non-windows OS, please install Powershell Core.
# 2. The script can be used on CI/CD as script file or inline script.
# 3. Use the Command Line parameters to control the invocation behavior.
#
#-------------------------------------------------------------------------
#
# Setup: User Parameters
param(
    [string] $Endpoint        = 'http://localhost:9000',
    [string] $RhinoUsername   = $null,
    [string] $RhinoSecret     = $null, # if you don't know this value use the Rhino API password.
    [string] $DriverBinaries  = '.',
    [string] $Filter          = $null,
    [string] $Environment     = $null,
    [string] $Driver          = 'MockWebDriver',
    [string] $ProjectRoot     = [System.IO.Directory]::GetParent($PSScriptRoot),
    [string] $ReportOut       = [System.IO.Directory]::GetParent($PSScriptRoot),
    [int]    $SearchTimeout   = 15000,
    [int]    $LoadTimeout     = 60000
)
#
# Setup: Functions
function Get-AsyncStatus {
    param ([string] $Uri)

    $response = Invoke-WebRequest `
        -Method Get `
        -ContentType "application/json" `
        -Uri $Uri `

    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }

    return ($response.Content | ConvertFrom-Json -Depth 15)
}
#
# Setup: Tests Location (absolute/relative file or folder path)
$_pluginsRepository      = [System.IO.Path]::Combine($ProjectRoot, 'src', 'Plugins')
$_resourcesRepository    = [System.IO.Path]::Combine($ProjectRoot, 'src', 'Resources')
$_environmentsRepository = [System.IO.Path]::Combine($ProjectRoot, 'src', 'Environments')
$_modelsRepository       = [System.IO.Path]::Combine($ProjectRoot, 'src', 'Models')
$_testsRepository        = [System.IO.Path]::Combine($ProjectRoot, 'src', 'Tests')
#
# Setup: Endpoints
$_pluginsEndpoint        = "$($Endpoint)/api/v3/plugins"
$_resourcesEndpoint      = "$($Endpoint)/api/v3/resources/bulk"
$_environmentsEndpoint   = "$($Endpoint)/api/v3/environment"
$_modelsJsonEndpoint     = "$($Endpoint)/api/v3/models"
$_modelsMarkdownEndpoint = "$($Endpoint)/api/v3/models/md"
$_invocationEndpoint     = "$($Endpoint)/api/v3/rhino/async/configurations/invoke"
$_statusEndpoint         = "$($Endpoint)/api/v3/rhino/async/status"
#
# Setup: Constants
$_newLines  = [System.Environment]::NewLine + [System.Environment]::NewLine
$_separator = $_newLines + '>>>' + $_newLines
#
# Register: Plugins
$content  = (Get-ChildItem -Recurse -Path $_pluginsRepository -File) | ForEach-Object { 
    Get-Content -Encoding utf8 -Path $_.FullName -Raw
}
if($content.Count -gt 0) {
    $body     = [string]::Join($_separator, $content)
    Write-Debug $body
    $response = Invoke-WebRequest -Uri $_pluginsEndpoint -Body $body -ContentType 'text/plain' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }
}
#
# Register: Resources
$content = @((Get-ChildItem -Recurse -Path $_resourcesRepository -File) | ForEach-Object {
    @{
        fileName = [System.IO.Path]::GetFileName($_.Name)
        path = $_.FullName
        content = Get-Content -Encoding utf8 -Path $_.FullName -Raw
    }
})
if($content.Count -gt 0) {
    $body     = ConvertTo-Json $content
    Write-Debug $body
    $response = Invoke-WebRequest -Uri $_resourcesEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }
}
#
# Register: Environment
$content = (Get-ChildItem -Recurse -Path $_environmentsRepository -File -Filter "$($Environment).*") | Select-Object -First 1
if($content.Count -gt 0) {
    $body     = (Get-Content -Encoding utf8 -Path $content.FullName -Raw)
    Write-Debug $body
    $response = Invoke-WebRequest -Uri $_environmentsEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }
}
#
# Register: Models - Json
$content = @((Get-ChildItem -Recurse -Path $_modelsRepository -File -Filter "*.json") | ForEach-Object { 
    ConvertFrom-Json (Get-Content -Encoding utf8 -Path $_.FullName -Raw)
})
if($content.Count -gt 0) {
    $body     = ConvertTo-Json $content -Depth 3
    Write-Debug $body
    $response = Invoke-WebRequest -Uri $_modelsJsonEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }
}
#
# Register: Models - Markdown
$content = @((Get-ChildItem -Recurse -Path $_modelsRepository -File -Filter "*.rmodel") | ForEach-Object { 
    Get-Content -Encoding utf8 -Path $_.FullName -Raw
})
if($content.Count -gt 0) {
    $body     = [string]::Join($_separator, $content)
    Write-Debug $body
    $response = Invoke-WebRequest -Uri $_modelsMarkdownEndpoint -Body $body -ContentType 'text/plain' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Host $response
        exit 10
    }
}
#
# Build: Rhino Configuration Basic (the request body) - must be camelCase convention
$configuration = @{
    connectorConfiguration = @{
        connector = "ConnectorText"
    }
    authentication = @{
        username = $RhinoUsername
        password = $RhinoSecret
    }
    driverParameters = @(
        @{
            driver         = $Driver
            driverBinaries = $DriverBinaries
        }
    )
    engineConfiguration = @{
        maxParallel             = 1
        elementSearchingTimeout = $SearchTimeout
        pageLoadTimeout         = $LoadTimeout
    }
    reportConfiguration = @{
        reporters = @(
            "JunitRepoter",
            "BasicReporter"
        )
    }
    testsRepository = @((Get-ChildItem -Recurse -Path $_testsRepository -File -Filter "*.rhino") | ForEach-Object { 
        Get-Content -Encoding utf8 -Path $_.FullName -Raw
    })
    filter = $Filter
}
#
# Invoke Configuration
Write-Host "Invoke-Configuration -Async -Uri $($Endpoint) -Filter $($Filter)"
$body = ConvertTo-Json $configuration
$response = Invoke-WebRequest `
    -Method Post `
    -ContentType "application/json" `
    -Uri $_invocationEndpoint `
    -Body $body
#
# Error From the Server
if (($response.StatusCode -ge 400) -or ($response.StatusCode -eq 204)) {
    Write-Host $response
    exit 10
}
#
# Setup
$responseObj = ($response.Content | ConvertFrom-Json)
#
# Check Run Async Status
$id          = $responseObj.id
$asyncStatus = Get-AsyncStatus -Uri "$($_statusEndpoint)/$($id)"
while ($asyncStatus.status -ne 'Complete') {
    Start-Sleep -Seconds 30
    $asyncStatus = Get-AsyncStatus -Uri "$($_statusEndpoint)/$($id)"
    Write-Host "$(Get-Date -Format "yyyy-MM-dd hh:mm:ss.fff") in progress: $($asyncStatus.progress)%"
}
#
# Get & Save JUnit Report
$key = $asyncStatus.entityOut.key
$reportEndpoint = "$($Endpoint)/reports/rhino-$($key)/junit.xml"
$response = Invoke-WebRequest -Uri $reportEndpoint -Method Get
if($response.StatusCode -eq 200) {
    $reportArtifact = [System.IO.Path]::Combine($ReportOut, 'junit.xml')
    Set-Content -Path $reportArtifact -Value $response.Content
}
else {
    Write-Host "Was not able to create JUnit report from '$($Endpoint)/reports/rhino-$($key)/junit.xml'"
}
#
# Assert That All Tests Passed
if ($responseObj.actual) {
    Write-Host "All {$($responseObj.testCases.Length)} test(s) passed"
    exit 0
}
Write-Host "There are test(s) failure(s)"
exit 10