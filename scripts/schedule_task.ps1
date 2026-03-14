$Action = New-ScheduledTaskAction -Execute "python" -Argument "`"$PSScriptRoot\update_database.py`"" -WorkingDirectory "$PSScriptRoot"
$Trigger = New-ScheduledTaskTrigger -Daily -DaysInterval 2 -At 03:00AM
$Settings = New-ScheduledTaskSettingsSet -Hidden:$true -StartWhenAvailable
$Principal = New-ScheduledTaskPrincipal -UserId (Get-CimInstance Win32_ComputerSystem).UserName -LogonType Interactive

Register-ScheduledTask -TaskName "UpdateSausageDatabase" -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Fetches newest videos from Ordinary Sausage channel and adds them to the database every other day." -Force

Write-Host "Scheduled task 'UpdateSausageDatabase' has been registered."
