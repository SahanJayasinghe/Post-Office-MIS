-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2020 at 04:24 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `post_office_mis`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `active_parcels_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable'))  NO SQL
SELECT detailed_parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, current_area, current_code, last_update, posted_location, delivery_attempts FROM detailed_parcels, addresses WHERE addresses.id = receiver_id AND addresses.postal_code = in_code AND status = in_status ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_parcels_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable'))  NO SQL
SELECT detailed_parcels.id, receiver_id, receiver_name, addresses.number AS receiver_number, addresses.street AS receiver_street, addresses.sub_area AS receiver_sub_area, addresses.postal_code AS receiver_code, current_area, current_code, last_update, posted_datetime, delivery_attempts FROM detailed_parcels, addresses WHERE addresses.id = receiver_id AND posted_location = in_code AND status = in_status ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_reg_posts_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable','on-route-sender','sender-unavailable'))  NO SQL
SELECT detailed_reg_posts.id, receiver_id, receiver_name, sender_id, sender_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND addresses.id = receiver_id AND addresses.postal_code=in_code ORDER BY speed_post DESC, last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_reg_posts_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable','on-route-sender','sender-unavailable'))  NO SQL
SELECT detailed_reg_posts.id, sender_id, sender_name, receiver_id, receiver_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND addresses.id = sender_id AND addresses.postal_code=in_code ORDER BY speed_post DESC, last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_parcels_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','failed'))  NO SQL
SELECT parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, last_update, posted_location, delivery_attempts, delivered_datetime FROM parcels, addresses WHERE receiver_id = addresses.id AND addresses.postal_code = in_code AND status = in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_parcels_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','failed'))  NO SQL
SELECT parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, last_update, posted_datetime, delivery_attempts, delivered_datetime FROM parcels, addresses WHERE posted_location = in_code AND status = in_status AND receiver_id = addresses.id AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_reg_posts_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT detailed_reg_posts.id, receiver_id, receiver_name, sender_id, sender_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() AND addresses.id = receiver_id AND addresses.postal_code=in_code ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_reg_posts_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT detailed_reg_posts.id, sender_id, sender_name, receiver_id, receiver_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() AND addresses.id = sender_id AND addresses.postal_code=in_code ORDER BY last_update DESC$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `resident_key` varchar(6) NOT NULL,
  `number` varchar(50) NOT NULL,
  `street` varchar(50) DEFAULT NULL,
  `sub_area` varchar(50) DEFAULT NULL,
  `postal_code` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `resident_key`, `number`, `street`, `sub_area`, `postal_code`) VALUES
(1, 'QSD72H', '46', 'Mill Rd', 'Hiriwala', '11160'),
(2, '8VL8IB', '121/B', 'Temple Rd', 'rawathawatta', '10400'),
(3, 'WZL80W', '91/2', 'Lake Av', 'uda iriyagama', '20400'),
(4, 'JQHWH0', '259/2', 'flovive square', 'Old town', '80000'),
(5, 'MZ293L', '87', 'bauddaloka mawatha', NULL, '11000'),
(6, '7VEKK6', '48/A', 'bazzar street', 'thirukkovil', '40000'),
(7, 'U55XAY', '290/2', 'arnold st.', 'koralawella', '10400'),
(8, 'WQAWCC', '15', 'vihara watta', 'yapalana', '11160'),
(9, '33JH85', '33/1', 'abbey grange', 'walipanna', '81000'),
(10, 'SY0F42', '102/C', 'Galle Rd', NULL, '10400'),
(11, 'B66RLU', '70/2/1', 'james pieris road', 'rawathawatta', '10400');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`) VALUES
(1, 'john123', '$2b$10$EV1HGqx0GKlaAFNxQdzy/uU8WNB1soh3QJYaH5Mfx4wTzQBCshaYO');

-- --------------------------------------------------------

--
-- Stand-in structure for view `detailed_addresses`
-- (See below for the actual view)
--
CREATE TABLE `detailed_addresses` (
`id` int(11)
,`number` varchar(50)
,`street` varchar(50)
,`sub_area` varchar(50)
,`postal_area` varchar(20)
,`postal_code` varchar(5)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `detailed_parcels`
-- (See below for the actual view)
--
CREATE TABLE `detailed_parcels` (
`id` int(11)
,`receiver_id` int(11)
,`receiver_name` varchar(50)
,`payment` decimal(6,2)
,`description` varchar(1024)
,`status` enum('on-route-receiver','receiver-unavailable','delivered','failed')
,`current_area` varchar(20)
,`current_code` varchar(5)
,`last_update` datetime
,`posted_location` varchar(5)
,`posted_datetime` datetime
,`reached_receiver_po` datetime
,`delivery_attempts` int(11)
,`delivered_datetime` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `detailed_reg_posts`
-- (See below for the actual view)
--
CREATE TABLE `detailed_reg_posts` (
`id` int(11)
,`sender_id` int(11)
,`sender_name` varchar(50)
,`receiver_id` int(11)
,`receiver_name` varchar(50)
,`price` decimal(6,2)
,`speed_post` tinyint(1)
,`status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed')
,`current_area` varchar(20)
,`current_code` varchar(5)
,`posted_datetime` datetime
,`last_update` datetime
,`delivery_attempts_receiver` int(11)
,`delivery_attempts_sender` int(11)
,`delivered_datetime` datetime
);

-- --------------------------------------------------------

--
-- Table structure for table `normal_posts`
--

CREATE TABLE `normal_posts` (
  `address_id` int(11) NOT NULL,
  `on_route_count` int(11) NOT NULL,
  `delivered_count` int(11) NOT NULL,
  `failed_delivery_count` int(11) NOT NULL,
  `total_price` decimal(6,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `normal_posts`
--

INSERT INTO `normal_posts` (`address_id`, `on_route_count`, `delivered_count`, `failed_delivery_count`, `total_price`) VALUES
(1, 20, 0, 0, '59.37'),
(2, 3, 0, 0, '0.00'),
(3, 4, 0, 0, '0.00'),
(5, 1, 0, 0, '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `parcels`
--

CREATE TABLE `parcels` (
  `id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_name` varchar(50) NOT NULL,
  `payment` decimal(6,2) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `status` enum('on-route-receiver','receiver-unavailable','delivered','failed') NOT NULL,
  `current_location` varchar(5) NOT NULL,
  `last_update` datetime NOT NULL,
  `posted_location` varchar(5) NOT NULL,
  `posted_datetime` datetime NOT NULL,
  `reached_receiver_po` datetime DEFAULT NULL,
  `delivery_attempts` int(11) NOT NULL DEFAULT '0',
  `delivered_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parcels`
--

INSERT INTO `parcels` (`id`, `receiver_id`, `receiver_name`, `payment`, `description`, `status`, `current_location`, `last_update`, `posted_location`, `posted_datetime`, `reached_receiver_po`, `delivery_attempts`, `delivered_datetime`) VALUES
(1, 2, 'John W.', '170.00', NULL, 'delivered', '10400', '2020-05-12 09:10:00', '01000', '2020-05-09 07:25:13', '2020-05-11 14:23:44', 1, '2020-05-12 09:10:00'),
(2, 4, 'Alice', '96.20', NULL, 'on-route-receiver', '80300', '2020-05-12 12:39:21', '10400', '2020-05-09 07:32:11', NULL, 0, NULL),
(3, 7, 'Clark', '40.00', NULL, 'failed', '10400', '2020-05-13 17:12:24', '10400', '2020-05-10 08:58:40', '2020-05-10 08:58:40', 3, NULL),
(4, 9, 'Abeyratna', '225.50', NULL, 'receiver-unavailable', '81000', '2020-05-16 06:55:00', '01000', '2020-05-13 17:08:34', '2020-05-15 12:21:46', 1, NULL),
(5, 10, 'William', '384.15', 'e-bay order', 'on-route-receiver', '80000', '2020-05-17 14:06:13', '82000', '2020-05-15 07:26:00', NULL, 0, NULL),
(6, 2, 'Sam W.', '95.00', NULL, 'on-route-receiver', '10400', '2020-05-17 14:08:53', '12100', '2020-05-15 13:17:34', '2020-05-17 14:08:53', 0, NULL),
(7, 11, 'Mr. Bates', '205.00', 'FRAGILE !!!', 'on-route-receiver', '90000', '2020-05-19 08:16:51', '90000', '2020-05-19 08:16:51', NULL, 0, NULL);

--
-- Triggers `parcels`
--
DELIMITER $$
CREATE TRIGGER `insert_reached_receiver_po` BEFORE INSERT ON `parcels` FOR EACH ROW BEGIN
	DECLARE receiver_po VARCHAR(5);
    SELECT postal_code INTO @receiver_po FROM detailed_addresses 		WHERE id=NEW.receiver_id;
    IF @receiver_po=NEW.posted_location THEN
    	SET NEW.reached_receiver_po = NEW.posted_datetime;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_reached_receiver_po` BEFORE UPDATE ON `parcels` FOR EACH ROW BEGIN
	DECLARE receiver_po VARCHAR(5);
    SELECT postal_code INTO @receiver_po FROM detailed_addresses 		WHERE id=NEW.receiver_id;
    IF @receiver_po=NEW.current_location AND OLD.reached_receiver_po is NULL THEN
    	SET NEW.reached_receiver_po = NEW.last_update;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `postal_areas`
--

CREATE TABLE `postal_areas` (
  `code` varchar(5) NOT NULL,
  `name` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `postal_areas`
--

INSERT INTO `postal_areas` (`code`, `name`, `password`) VALUES
('01000', 'maradana', '$2b$10$jGIITzcjRWCOGwjsPKEsruLYG2tGYDGCK9ejTklDlPIxCKxQl32uS'),
('10400', 'moratuwa', '$2b$10$.YIOLgPm2.M98wvc4GIsi.e/.dQtblU6LGn2qluFKLjz6JBqBKZcW'),
('11000', 'gampaha', NULL),
('11160', 'kal-eliya', NULL),
('12000', 'kalutara', NULL),
('12100', 'matugama', NULL),
('20400', 'peradeniya', NULL),
('20800', 'katugastota', NULL),
('22200', 'nuwara-eliya', NULL),
('40000', 'jaffna', NULL),
('70600', 'eheliyagoda', NULL),
('80000', 'galle', NULL),
('80300', 'ambalangoda', NULL),
('81000', 'matara', NULL),
('82000', 'hambantota', NULL),
('90000', 'badulla', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `registered_posts`
--

CREATE TABLE `registered_posts` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_name` varchar(50) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_name` varchar(50) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `speed_post` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed') NOT NULL,
  `current_location` varchar(5) NOT NULL,
  `posted_datetime` datetime NOT NULL,
  `last_update` datetime NOT NULL,
  `delivery_attempts_receiver` int(11) NOT NULL DEFAULT '0',
  `delivery_attempts_sender` int(11) NOT NULL DEFAULT '0',
  `delivered_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `registered_posts`
--

INSERT INTO `registered_posts` (`id`, `sender_id`, `sender_name`, `receiver_id`, `receiver_name`, `price`, `speed_post`, `status`, `current_location`, `posted_datetime`, `last_update`, `delivery_attempts_receiver`, `delivery_attempts_sender`, `delivered_datetime`) VALUES
(1, 1, 'Kamal Perera', 2, 'John W.', '60.00', 0, 'delivered', '10400', '2020-04-18 13:41:22', '2020-04-21 23:38:48', 2, 0, '2020-04-21 23:38:48'),
(2, 3, 'Silva', 1, 'A. Peter', '44.25', 0, 'on-route-receiver', '20400', '2020-04-20 19:44:52', '2020-04-21 09:36:00', 0, 0, NULL),
(3, 2, 'Mary W.', 3, 'Connor', '88.75', 0, 'sent-back', '10400', '2020-04-20 07:23:55', '2020-04-24 14:41:20', 1, 1, '2020-04-24 14:41:20'),
(4, 1, 'Tom', 4, 'A. Cooray', '97.50', 0, 'on-route-receiver', '20400', '2020-04-22 16:45:04', '2020-05-02 16:45:04', 0, 0, NULL),
(5, 4, 'Wells', 2, 'John W.', '125.80', 0, 'sent-back', '80000', '2020-04-23 16:16:28', '2020-04-27 06:28:19', 3, 1, '2020-04-27 06:28:19'),
(6, 5, 'Pieris', 7, 'Watson', '65.30', 0, 'failed', '11000', '2020-04-24 11:24:26', '2020-04-30 12:52:31', 3, 2, NULL),
(7, 7, 'Watson', 6, 'Krishna', '148.65', 0, 'delivered', '40000', '2020-04-25 07:08:20', '2020-04-29 10:15:14', 1, 0, '2020-04-29 10:15:14'),
(8, 2, 'Mary W.', 8, 'Frank', '55.48', 0, 'failed', '10400', '2020-04-25 17:26:46', '2020-05-02 08:11:00', 3, 3, NULL),
(9, 9, 'Weerakkody', 2, 'John W.', '105.00', 0, 'failed', '81000', '2020-04-27 05:08:29', '2020-05-04 12:40:10', 3, 2, NULL),
(10, 2, 'John W.', 10, 'Abeyratna', '40.50', 0, 'delivered', '10400', '2020-04-28 15:19:11', '2020-04-29 10:00:00', 1, 0, '2020-04-29 10:00:00'),
(11, 6, 'Don', 2, 'Sam W.', '238.00', 0, 'sender-unavailable', '40000', '2020-04-29 13:50:45', '2020-05-06 11:32:27', 3, 1, NULL),
(12, 2, 'Mary W.', 3, 'Felicia', '115.25', 0, 'sender-unavailable', '10400', '2020-04-29 09:14:00', '2020-05-05 13:23:15', 2, 1, NULL),
(13, 2, 'Sam W.', 4, 'Cooray', '68.60', 0, 'on-route-sender', '80300', '2020-04-30 18:44:23', '2020-05-05 17:45:24', 3, 0, NULL),
(14, 8, 'Paul', 2, 'Dean W.', '73.00', 0, 'on-route-sender', '11000', '2020-05-01 09:15:25', '2020-05-06 06:08:49', 2, 0, NULL),
(15, 2, 'Mary W.', 4, 'Gunasingha', '54.75', 0, 'receiver-unavailable', '80000', '2020-05-02 08:18:12', '2020-05-05 12:17:00', 1, 0, NULL),
(16, 6, 'Drupal', 2, 'Sam W.', '267.00', 0, 'receiver-unavailable', '10400', '2020-05-02 06:39:22', '2020-05-06 13:25:39', 1, 0, NULL),
(17, 9, 'Weerakkody', 2, 'Dean W.', '324.50', 1, 'on-route-receiver', '80000', '2020-05-05 06:11:54', '2020-05-06 10:21:00', 0, 0, NULL),
(18, 2, 'John W.', 5, 'Peiris', '93.50', 0, 'on-route-receiver', '01000', '2020-05-06 11:50:37', '2020-05-06 19:45:05', 0, 0, NULL),
(19, 1, 'Kamal Perera', 7, 'Silva', '106.50', 0, 'on-route-receiver', '11000', '2020-05-06 16:40:30', '2020-05-07 07:53:22', 0, 0, NULL),
(20, 3, 'Sarath', 11, 'Edison', '244.90', 1, 'on-route-receiver', '20400', '2020-05-08 23:39:51', '2020-05-08 23:39:51', 0, 0, NULL);

--
-- Triggers `registered_posts`
--
DELIMITER $$
CREATE TRIGGER `check_addresses` BEFORE INSERT ON `registered_posts` FOR EACH ROW IF new.sender_id = new.receiver_id THEN
	SIGNAL SQLSTATE '45000';
END IF
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `check_delivery_attempts` BEFORE UPDATE ON `registered_posts` FOR EACH ROW IF (new.delivery_attempts_receiver = 0 AND new.status = 'on-route-sender') THEN
	SIGNAL SQLSTATE '45000';
END IF
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `reg_posts_receiver_details`
-- (See below for the actual view)
--
CREATE TABLE `reg_posts_receiver_details` (
`id` int(11)
,`sender_id` int(11)
,`sender_name` varchar(50)
,`receiver_name` varchar(50)
,`receiver_id` int(11)
,`receiver_number` varchar(50)
,`receiver_street` varchar(50)
,`receiver_sub_area` varchar(50)
,`receiver_postal_area` varchar(20)
,`receiver_postal_code` varchar(5)
,`price` decimal(6,2)
,`speed_post` tinyint(1)
,`status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed')
,`current_area` varchar(20)
,`current_code` varchar(5)
,`posted_datetime` datetime
,`last_update` datetime
,`delivery_attempts_receiver` int(11)
,`delivery_attempts_sender` int(11)
,`delivered_datetime` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `reg_posts_sender_details`
-- (See below for the actual view)
--
CREATE TABLE `reg_posts_sender_details` (
`id` int(11)
,`receiver_id` int(11)
,`receiver_name` varchar(50)
,`sender_name` varchar(50)
,`sender_id` int(11)
,`sender_number` varchar(50)
,`sender_street` varchar(50)
,`sender_sub_area` varchar(50)
,`sender_postal_area` varchar(20)
,`sender_postal_code` varchar(5)
,`price` decimal(6,2)
,`speed_post` tinyint(1)
,`status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed')
,`current_area` varchar(20)
,`current_code` varchar(5)
,`posted_datetime` datetime
,`last_update` datetime
,`delivery_attempts_receiver` int(11)
,`delivery_attempts_sender` int(11)
,`delivered_datetime` datetime
);

-- --------------------------------------------------------

--
-- Structure for view `detailed_addresses`
--
DROP TABLE IF EXISTS `detailed_addresses`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `detailed_addresses`  AS  select `addresses`.`id` AS `id`,`addresses`.`number` AS `number`,`addresses`.`street` AS `street`,`addresses`.`sub_area` AS `sub_area`,`postal_areas`.`name` AS `postal_area`,`postal_areas`.`code` AS `postal_code` from (`addresses` join `postal_areas` on((`addresses`.`postal_code` = `postal_areas`.`code`))) ;

-- --------------------------------------------------------

--
-- Structure for view `detailed_parcels`
--
DROP TABLE IF EXISTS `detailed_parcels`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `detailed_parcels`  AS  select `parcels`.`id` AS `id`,`parcels`.`receiver_id` AS `receiver_id`,`parcels`.`receiver_name` AS `receiver_name`,`parcels`.`payment` AS `payment`,`parcels`.`description` AS `description`,`parcels`.`status` AS `status`,`postal_areas`.`name` AS `current_area`,`parcels`.`current_location` AS `current_code`,`parcels`.`last_update` AS `last_update`,`parcels`.`posted_location` AS `posted_location`,`parcels`.`posted_datetime` AS `posted_datetime`,`parcels`.`reached_receiver_po` AS `reached_receiver_po`,`parcels`.`delivery_attempts` AS `delivery_attempts`,`parcels`.`delivered_datetime` AS `delivered_datetime` from (`parcels` join `postal_areas` on((`parcels`.`current_location` = `postal_areas`.`code`))) ;

-- --------------------------------------------------------

--
-- Structure for view `detailed_reg_posts`
--
DROP TABLE IF EXISTS `detailed_reg_posts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `detailed_reg_posts`  AS  select `registered_posts`.`id` AS `id`,`registered_posts`.`sender_id` AS `sender_id`,`registered_posts`.`sender_name` AS `sender_name`,`registered_posts`.`receiver_id` AS `receiver_id`,`registered_posts`.`receiver_name` AS `receiver_name`,`registered_posts`.`price` AS `price`,`registered_posts`.`speed_post` AS `speed_post`,`registered_posts`.`status` AS `status`,`postal_areas`.`name` AS `current_area`,`postal_areas`.`code` AS `current_code`,`registered_posts`.`posted_datetime` AS `posted_datetime`,`registered_posts`.`last_update` AS `last_update`,`registered_posts`.`delivery_attempts_receiver` AS `delivery_attempts_receiver`,`registered_posts`.`delivery_attempts_sender` AS `delivery_attempts_sender`,`registered_posts`.`delivered_datetime` AS `delivered_datetime` from (`registered_posts` join `postal_areas` on((`registered_posts`.`current_location` = `postal_areas`.`code`))) ;

-- --------------------------------------------------------

--
-- Structure for view `reg_posts_receiver_details`
--
DROP TABLE IF EXISTS `reg_posts_receiver_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reg_posts_receiver_details`  AS  select `detailed_reg_posts`.`id` AS `id`,`detailed_reg_posts`.`sender_id` AS `sender_id`,`detailed_reg_posts`.`sender_name` AS `sender_name`,`detailed_reg_posts`.`receiver_name` AS `receiver_name`,`detailed_addresses`.`id` AS `receiver_id`,`detailed_addresses`.`number` AS `receiver_number`,`detailed_addresses`.`street` AS `receiver_street`,`detailed_addresses`.`sub_area` AS `receiver_sub_area`,`detailed_addresses`.`postal_area` AS `receiver_postal_area`,`detailed_addresses`.`postal_code` AS `receiver_postal_code`,`detailed_reg_posts`.`price` AS `price`,`detailed_reg_posts`.`speed_post` AS `speed_post`,`detailed_reg_posts`.`status` AS `status`,`detailed_reg_posts`.`current_area` AS `current_area`,`detailed_reg_posts`.`current_code` AS `current_code`,`detailed_reg_posts`.`posted_datetime` AS `posted_datetime`,`detailed_reg_posts`.`last_update` AS `last_update`,`detailed_reg_posts`.`delivery_attempts_receiver` AS `delivery_attempts_receiver`,`detailed_reg_posts`.`delivery_attempts_sender` AS `delivery_attempts_sender`,`detailed_reg_posts`.`delivered_datetime` AS `delivered_datetime` from (`detailed_reg_posts` join `detailed_addresses` on((`detailed_reg_posts`.`receiver_id` = `detailed_addresses`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `reg_posts_sender_details`
--
DROP TABLE IF EXISTS `reg_posts_sender_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reg_posts_sender_details`  AS  select `detailed_reg_posts`.`id` AS `id`,`detailed_reg_posts`.`receiver_id` AS `receiver_id`,`detailed_reg_posts`.`receiver_name` AS `receiver_name`,`detailed_reg_posts`.`sender_name` AS `sender_name`,`detailed_addresses`.`id` AS `sender_id`,`detailed_addresses`.`number` AS `sender_number`,`detailed_addresses`.`street` AS `sender_street`,`detailed_addresses`.`sub_area` AS `sender_sub_area`,`detailed_addresses`.`postal_area` AS `sender_postal_area`,`detailed_addresses`.`postal_code` AS `sender_postal_code`,`detailed_reg_posts`.`price` AS `price`,`detailed_reg_posts`.`speed_post` AS `speed_post`,`detailed_reg_posts`.`status` AS `status`,`detailed_reg_posts`.`current_area` AS `current_area`,`detailed_reg_posts`.`current_code` AS `current_code`,`detailed_reg_posts`.`posted_datetime` AS `posted_datetime`,`detailed_reg_posts`.`last_update` AS `last_update`,`detailed_reg_posts`.`delivery_attempts_receiver` AS `delivery_attempts_receiver`,`detailed_reg_posts`.`delivery_attempts_sender` AS `delivery_attempts_sender`,`detailed_reg_posts`.`delivered_datetime` AS `delivered_datetime` from (`detailed_reg_posts` join `detailed_addresses` on((`detailed_reg_posts`.`sender_id` = `detailed_addresses`.`id`))) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_number_code` (`number`,`postal_code`),
  ADD KEY `postal_area` (`postal_code`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `normal_posts`
--
ALTER TABLE `normal_posts`
  ADD PRIMARY KEY (`address_id`);

--
-- Indexes for table `parcels`
--
ALTER TABLE `parcels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `current_location` (`current_location`),
  ADD KEY `posted_location` (`posted_location`);

--
-- Indexes for table `postal_areas`
--
ALTER TABLE `postal_areas`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `registered_posts`
--
ALTER TABLE `registered_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `current_location` (`current_location`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `parcels`
--
ALTER TABLE `parcels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `registered_posts`
--
ALTER TABLE `registered_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`postal_code`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `normal_posts`
--
ALTER TABLE `normal_posts`
  ADD CONSTRAINT `normal_posts_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `parcels`
--
ALTER TABLE `parcels`
  ADD CONSTRAINT `parcels_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `parcels_ibfk_2` FOREIGN KEY (`current_location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `parcels_ibfk_3` FOREIGN KEY (`posted_location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `registered_posts`
--
ALTER TABLE `registered_posts`
  ADD CONSTRAINT `registered_posts_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registered_posts_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registered_posts_ibfk_3` FOREIGN KEY (`current_location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
