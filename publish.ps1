$version = "v0.3"
$product = "GoodreadsCompareBooks"
$repo = "D:\_sources\GoodreadsCompareBooks"
$releaseDest = "{0}\{1}" -f $repo,".releases"
$releaseFullPath = "{0}\{1}.{2}.{3}" -f $releaseDest,$product,$version,"zip"

$excludes = @(
    ".git",
    ".github",
    ".releases",
    "screenshots",
    ".gitignore",
    "publish.ps1"
)
$filesToPack = Get-ChildItem -Path $repo -Exclude $excludes
Compress-Archive -Path $filesToPack -DestinationPath $releaseFullPath