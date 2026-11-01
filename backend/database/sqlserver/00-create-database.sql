-- Run using sqlcmd -b -i ... or SSMS. Never overwrite an existing database.
USE master;
GO
IF DB_ID(N'XUEYAN_Development') IS NULL
BEGIN
    CREATE DATABASE XUEYAN_Development COLLATE Latin1_General_100_CI_AS_SC;
END;
GO
