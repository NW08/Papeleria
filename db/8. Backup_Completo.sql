USE master;
GO

BACKUP DATABASE papeleria
    TO DISK = 'C:\SQL\papeleria_full.bak'
    WITH
    FORMAT,
    MEDIANAME = 'SQLServerBackups',
    NAME = 'Papeleria - Full Backup';
GO