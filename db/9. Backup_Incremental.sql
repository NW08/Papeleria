USE master;
GO

BACKUP DATABASE papeleria
    TO DISK = 'C:\SQL\Incremental\papeleria_diff.bak'
    WITH
    DIFFERENTIAL,
    NAME = 'Papeleria - Differential Backup';
GO