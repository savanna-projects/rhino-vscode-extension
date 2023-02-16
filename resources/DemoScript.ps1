#┌[General Information ───────────────────────────────────────────────────
#│
#│ 1. To run with non-windows OS, please install Powershell Core.
#│ 2. The script can be used on CI/CD as script file or inline script.
#│ 3. User the Command Line parameters to control the invocation behavior.
#│
#└────────────────────────────────────────────────────────────────────────
#
# Setup: User Parameters
param(
    [string] $HttpProtocol    = $null,
    [string] $RhinoServer     = $null,
    [int]    $RhinoPort       = 0,
    [string] $TestsRepository = $null,
    [string] $RhinoUsername   = $null,
    [string] $RhinoSecret     = $null, # if you don't know this value use the Rhino API password.
    [string] $DriverBinaries  = $null
)
#
# Setup: Rhino Endpoints Default
$_httpProtocol   = "http"
$_rhinoServer    = "localhost"
$_rhinoPort      = 9000
$_driverBinaries = "."
#
# Setup: Tests Location (absolute/relative file or folder path)
$projectRoot      = [System.IO.Directory]::GetParent($PSScriptRoot)
$_testsRepository = [System.IO.Path]::Combine($projectRoot, 'src', 'Tests', 'Examples', 'FindSomethingOnGoogle.rhino')
#
# Setup: Rhino Credentials
$rhinoUsername = "<rhinoUsername>"
$rhinoSecret = "<rhinoSecret>"
#
# Build: User Parameters Value
$HttpProtocol    = if (($null -eq $HttpProtocol)    -or ($HttpProtocol    -eq [string]::Empty)) { $_httpProtocol }    else { $HttpProtocol }
$RhinoServer     = if (($null -eq $RhinoServer)     -or ($RhinoServer     -eq [string]::Empty)) { $_rhinoServer }     else { $RhinoServer }
$RhinoPort       = if (($null -eq $RhinoPort)       -or ($RhinoPort       -eq 0))               { $_rhinoPort }       else { $RhinoPort }
$TestsRepository = if (($null -eq $TestsRepository) -or ($TestsRepository -eq [string]::Empty)) { $_testsRepository } else { $TestsRepository }
$RhinoUsername   = if (($null -eq $RhinoUsername)   -or ($RhinoUsername   -eq [string]::Empty)) { $_rhinoUsername }   else { $RhinoUsername }
$RhinoSecret     = if (($null -eq $RhinoSecret)     -or ($RhinoSecret     -eq [string]::Empty)) { $_rhinoSecret }     else { $RhinoSecret }
$DriverBinaries  = if (($null -eq $DriverBinaries)  -or ($DriverBinaries  -eq [string]::Empty)) { $_driverBinaries }  else { $DriverBinaries }
#
# Build: Invocation Values
$rhinoAction   = "rhino/configurations/invoke"
$rhinoEndpoint = "$($HttpProtocol)://$($RhinoServer):$($RhinoPort)/api/v3/$($rhinoAction)"
#
# Build: Rhino Configuration Basic (the request body) - must be camelCase convention
$configuration = @{
    connectorConfiguration = @{
        connector = "ConnectorText"
    }
    authentication = @{
        username = $RhinoUsername
        Secret = $RhinoSecret
    }
    driverParameters = @(
        @{
            driver         = "ChromeDriver"
            driverBinaries = $DriverBinaries
        }
    )
    engineConfiguration = @{
        maxParallel             = 1
        elementSearchingTimeout = 15000
        pageLoadTimeout         = 60000
    }
    testsRepository = @(
        $TestsRepository
    )
};
#
# Invoke Configuration
Write-Host "Invoking configuration on $($rhinoEndpoint), please wait..."
$body = ConvertTo-Json $configuration
$response = Invoke-WebRequest `
    -Method Post `
    -ContentType "application/json" `
    -Uri $rhinoEndpoint `
    -Body $body
#
# Error From the Server
if ($response.StatusCode -ge 400) {
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
exit 10