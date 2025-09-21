# Fix syntax issues in App.tsx
$filePath = "App.tsx"
$content = Get-Content $filePath -Raw

# Fix the problematic button structure by replacing the malformed section
$oldPattern = @'
                            console.log\('Generated content:', content\);
                            setGeneratedEmail\(content.trim\(\)\);
                            setShowEmailPreviewModal\(true\);
                            
                        \} catch \(error\) \{
                            console.error\('Error generating email preview:', error\);
                        \} finally \{
                            setLoadingText\(''\);
                        \}
                    \}\}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" 
                    disabled=\{loadingText !== ''\}
                >
                    \{loadingText \? t\('generating', \{ type: 'Preview' \}\) : t\('previewEmail'\)\}
                </button>
'@

$newPattern = @'
                            console.log('Generated content:', content);
                            setGeneratedEmail(content.trim());
                            setShowEmailPreviewModal(true);
                            
                        } catch (error) {
                            console.error('Error generating email preview:', error);
                        } finally {
                            setLoadingText('');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loadingText !== ''}
                >
                    {loadingText ? t('generating', { type: 'Preview' }) : t('previewEmail')}
                </button>
'@

# Apply the replacement
$content = $content -replace [regex]::Escape($oldPattern), $newPattern

# Write back to file
$content | Set-Content $filePath -NoNewline

Write-Host "Fixed syntax issues in App.tsx"