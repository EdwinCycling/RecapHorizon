# Clean up syntax issues in App.tsx
$filePath = "App.tsx"
$content = Get-Content $filePath -Raw

# Remove any invisible characters and normalize line endings
$content = $content -replace '\r\n', '\n'
$content = $content -replace '\r', '\n'
$content = $content -replace '[\u200B-\u200D\uFEFF]', ''

# Fix any remaining syntax issues
$content = $content -replace '\n\s*\}\s*;\s*\n', '\n    }\n'
$content = $content -replace '\n\s*\};\s*\n', '\n    }\n'

# Write back to file with proper encoding
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)

Write-Host "Cleaned syntax issues in App.tsx"