## 账户表 
CREATE TABLE `account` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `account` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `password` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最新登录时间',
  `end_point` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `session` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `is_del` smallint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
## 文章表 
CREATE TABLE `article` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `content` text,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4;

## 目录文章关联
## TODO 这里要关联account
CREATE TABLE `content_article` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `content_id` bigint(20) NOT NULL,
  `article_id` bigint(20) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4;

## 目录表
CREATE TABLE `content_tree` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `type` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_del` smallint(4) NOT NULL DEFAULT '0',
  `parent` bigint(20) NOT NULL,
  `serial` smallint(6) NOT NULL DEFAULT '100',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8mb4;

## 设置默认数据
insert into content_tree (`name`, `type`, parent) values ('我的文件夹', 'content', '-1')

## 脚本：错误检测：查找文件有子文件/文件夹
select
	ct1.id,
	ct1.name as contentName,
	ct1.parent as contentParent,
	ct1.type as contentType,
	ct2.name as fileName,
	ct2.id as fileId,
	ct2.type as parentType
from content_tree ct1
left join content_tree ct2 on ct1.parent = ct2.id 
where ct2.type="file"

## 脚本：空文件夹


## Logger 

CREATE TABLE `logger` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `controller_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `action_name` varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8mb4;