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
    [int]    $SearchTimeout   = 15000,
    [int]    $LoadTimeout     = 60000
)
#
# Setup: Tests Location (absolute/relative file or folder path)
$_projectRoot            = [System.IO.Directory]::GetParent($PSScriptRoot)
$_pluginsRepository      = [System.IO.Path]::Combine($_projectRoot, 'src', 'Plugins')
$_resourcesRepository    = [System.IO.Path]::Combine($_projectRoot, 'src', 'Resources')
$_environmentsRepository = [System.IO.Path]::Combine($_projectRoot, 'src', 'Environments')
$_modelsRepository       = [System.IO.Path]::Combine($_projectRoot, 'src', 'Models')
$_testsRepository        = [System.IO.Path]::Combine($_projectRoot, 'src', 'Tests')
#
# Setup: Endpoints
$_pluginsEndpoint        = "$($Endpoint)/api/v3/plugins"
$_resourcesEndpoint      = "$($Endpoint)/api/v3/resources/bulk"
$_environmentsEndpoint   = "$($Endpoint)/api/v3/environment"
$_modelsJsonEndpoint     = "$($Endpoint)/api/v3/models"
$_modelsMarkdownEndpoint = "$($Endpoint)/api/v3/models/md"
$_invocationEndpoint     = "$($Endpoint)/api/v3/rhino/configurations/invoke"
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
    $response = Invoke-WebRequest -Uri $_pluginsEndpoint -Body $body -ContentType 'text/plain' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Error $response
        exit 10
    }
}
#
# Register: Resources
$content = (Get-ChildItem -Recurse -Path $_resourcesRepository -File) | ForEach-Object {
    @{
        fileName = [System.IO.Path]::GetFileName($_.Name)
        path = $_.FullName
        content = Get-Content -Encoding utf8 -Path $_.FullName -Raw
    }
}
if($content.Count -gt 0) {
    $body     = ConvertTo-Json $content
    $response = Invoke-WebRequest -Uri $_resourcesEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Error $response
        exit 10
    }
}
#
# Register: Environment
$content = (Get-ChildItem -Recurse -Path $_environmentsRepository -File -Filter "$($Environment).*") | Select-Object -First 1
if($content.Count -gt 0) {
    $body     = (Get-Content -Encoding utf8 -Path $content.FullName -Raw)
    $response = Invoke-WebRequest -Uri $_environmentsEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Error $response
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
    $response = Invoke-WebRequest -Uri $_modelsJsonEndpoint -Body $body -ContentType 'application/json' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Error $response
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
    $response = Invoke-WebRequest -Uri $_modelsMarkdownEndpoint -Body $body -ContentType 'text/plain' -Method Post
    if ($response.StatusCode -ge 400) {
        Write-Error $response
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
    testsRepository = @((Get-ChildItem -Recurse -Path $_testsRepository -File -Filter "*.rhino") | ForEach-Object { 
        Get-Content -Encoding utf8 -Path $_.FullName -Raw
    })
    filter = $Filter
}
#
# Invoke Configuration
Write-Host "Invoking configuration on $($rhinoEndpoint), please wait..."
$body = ConvertTo-Json $configuration
$response = Invoke-WebRequest `
    -Method Post `
    -ContentType "application/json" `
    -Uri $_invocationEndpoint `
    -Body $body
#
# Error From the Server
if (($response.StatusCode -ge 400) -or ($response.StatusCode -eq 204)) {
    Write-Error $response
    exit 10
}
#
# Assert That All Tests Passed
$responseObj = ($response.Content | ConvertFrom-Json)
if ($responseObj.actual) {
    Write-Host "All {$($responseObj.testCases.Length)} test(s) passed"
    exit 0
}
Write-Host "There are test(s) failure(s); See report"
exit 10