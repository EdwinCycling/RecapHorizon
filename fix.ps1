$content = Get-Content 'c:\Users\Edwin\Documents\Apps\RecapSmart\App.tsx'
$content[6318] = '                                                const prompt = {'
$content[6319] = '                                                    parts: [{'
$content[6320] = '                                                        text: `Analyseer de volgende transcript en genereer:\n\n1. CONCLUSIES: Belangrijkste bevindingen en inzichten\n2. ACTIEPUNTEN: Concrete vervolgstappen en taken\n\nTOON INSTRUCTIE: ${getToneInstruction(emailTone)}${narrativeInstruction}${getDetailLevelInstruction(emailDetailLevel)}\n\nTranscript:\n${validation.sanitized}\n\nGeef het resultaat in dit formaat:\n\nCONCLUSIES:\n[conclusies hier]\n\nACTIEPUNTEN:\n[actiepunten hier]`'
$content[6321] = '                                                    }]'
$content[6322] = '                                                };'
$content | Set-Content 'c:\Users\Edwin\Documents\Apps\RecapSmart\App.tsx'
Write-Host "File updated successfully."