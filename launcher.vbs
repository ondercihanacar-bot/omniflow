Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Onder\Desktop\itmanager"
WshShell.Run chr(34) & "C:\Users\Onder\Desktop\itmanager\baslat.bat" & Chr(34) & " hidden", 0, False
Set WshShell = Nothing
