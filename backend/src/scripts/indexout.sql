use BasketballRefDB

DECLARE @sql NVARCHAR(MAX)=
  (SELECT STRING_AGG(
     'DROP INDEX ' + QUOTENAME(i.name)
     + ' ON ' + QUOTENAME(OBJECT_SCHEMA_NAME(i.object_id))
     + '.' + QUOTENAME(OBJECT_NAME(i.object_id)),'; ')
   FROM sys.indexes i
   WHERE i.name LIKE 'IDX_%');
EXEC(@sql);


DROP INDEX IF EXISTS dbo.Games.IX_Games_Referee_Date;
DROP INDEX IF EXISTS dbo.Games.IX_Games_Status_Date;
DROP INDEX IF EXISTS dbo.Referees.IX_Referees_League_Id;
GO







SELECT 
  OBJECT_SCHEMA_NAME(i.object_id) AS [Schema],
  OBJECT_NAME(i.object_id)        AS [Table],
  i.name                          AS [IndexName]
FROM sys.indexes i
WHERE i.name LIKE 'IDX_%'
  AND i.index_id > 0     -- exclude heap (0) și implicit clustered (1) dacă nu ai dat DROP
ORDER BY [Schema], [Table], [IndexName];

EXEC sp_helpindex 'dbo.Games';
EXEC sp_helpindex 'dbo.Referees';

EXEC sp_helpindex 'dbo.Games';


select * from Referees;
select * from Games;

--select refrees where 