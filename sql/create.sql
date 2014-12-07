create database bagsintrees;
GO
use bagsintrees;
GO
create table photos (id varchar(64)
					,created varchar(32)
					,thumbnailUrl varchar(128)
					,lowResUrl varchar(128)
					,hiReslUrl varchar(128)
					,latitude varchar(32)
					,longitude varchar(32)
					,locationName varchar(32)
					,userId varchar(32)
					,caption varchar(1000)
					);

create user bags identified by 'query4Bag$';
grant ALL on bagsintrees.* to bags;

create table settings (settingKey varchar(32), settingValue varchar(32));
insert into settings (settingKey) values ('min_tag_id');