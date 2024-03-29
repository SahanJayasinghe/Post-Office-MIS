-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 13, 2020 at 07:05 PM
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `active_money_orders_received` (IN `in_code` VARCHAR(5))  NO SQL
SELECT id, sender_name, receiver_name, amount, expire_after, postal_areas.name AS posted_area, posted_location AS posted_code, posted_datetime FROM money_orders, postal_areas WHERE postal_areas.code = posted_location AND receiver_postal_code = in_code AND status = 'created' ORDER by id DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_money_orders_sent` (IN `in_code` VARCHAR(5))  NO SQL
SELECT id, sender_name, receiver_name, amount, expire_after, postal_areas.name AS receiver_area, receiver_postal_code AS receiver_code, posted_datetime FROM money_orders, postal_areas WHERE postal_areas.code = receiver_postal_code AND posted_location = in_code AND status = 'created' ORDER by id DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_parcels_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable'))  NO SQL
SELECT detailed_parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, current_area, current_code, last_update, posted_location, delivery_attempts FROM detailed_parcels, addresses WHERE addresses.id = receiver_id AND addresses.postal_code = in_code AND status = in_status ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_parcels_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable'))  NO SQL
SELECT detailed_parcels.id, receiver_id, receiver_name, addresses.number AS receiver_number, addresses.street AS receiver_street, addresses.sub_area AS receiver_sub_area, addresses.postal_code AS receiver_code, current_area, current_code, last_update, posted_datetime, delivery_attempts FROM detailed_parcels, addresses WHERE addresses.id = receiver_id AND posted_location = in_code AND status = in_status ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_reg_posts_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable','on-route-sender','sender-unavailable'))  NO SQL
SELECT detailed_reg_posts.id, receiver_id, receiver_name, sender_id, sender_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND addresses.id = receiver_id AND addresses.postal_code=in_code ORDER BY speed_post DESC, last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `active_reg_posts_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('on-route-receiver','receiver-unavailable','on-route-sender','sender-unavailable'))  NO SQL
SELECT detailed_reg_posts.id, sender_id, sender_name, receiver_id, receiver_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND addresses.id = sender_id AND addresses.postal_code=in_code ORDER BY speed_post DESC, last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_money_orders_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','returned'))  NO SQL
SELECT id, sender_name, receiver_name, amount, postal_areas.name AS posted_area, posted_location AS posted_code, posted_datetime, delivered_datetime FROM money_orders, postal_areas WHERE postal_areas.code = posted_location AND receiver_postal_code = in_code AND status = in_status AND posted_datetime BETWEEN DATE_SUB(CURDATE(), INTERVAL 730 DAY) AND CURDATE() ORDER by id DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_money_orders_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','returned'))  NO SQL
SELECT id, sender_name, receiver_name, amount, expire_after, postal_areas.name AS receiver_area, receiver_postal_code AS receiver_code, posted_datetime, delivered_datetime FROM money_orders, postal_areas WHERE postal_areas.code = receiver_postal_code AND posted_location = in_code AND status = in_status AND posted_datetime BETWEEN DATE_SUB(CURDATE(), INTERVAL 730 DAY) AND CURDATE() ORDER by id DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_parcels_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','failed'))  NO SQL
SELECT parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, last_update, posted_location, delivery_attempts, delivered_datetime FROM parcels, addresses WHERE receiver_id = addresses.id AND addresses.postal_code = in_code AND status = in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_parcels_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','failed'))  NO SQL
SELECT parcels.id, receiver_id, receiver_name, number AS receiver_number, street AS receiver_street, sub_area AS receiver_sub_area, postal_code AS receiver_code, last_update, posted_datetime, delivery_attempts, delivered_datetime FROM parcels, addresses WHERE posted_location = in_code AND status = in_status AND receiver_id = addresses.id AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_reg_posts_received` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT detailed_reg_posts.id, receiver_id, receiver_name, sender_id, sender_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() AND addresses.id = receiver_id AND addresses.postal_code=in_code ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `completed_reg_posts_sent` (IN `in_code` VARCHAR(5), IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT detailed_reg_posts.id, sender_id, sender_name, receiver_id, receiver_name, speed_post, current_area, current_code, last_update, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM `detailed_reg_posts`, `addresses` WHERE status=in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 90 DAY) AND CURDATE() AND addresses.id = sender_id AND addresses.postal_code=in_code ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `parcel_route` (IN `in_id` INT)  NO SQL
SELECT postal_areas.name AS name, location AS code, updated_at FROM parcels_route_info, postal_areas WHERE parcel_id=in_id AND location=postal_areas.code ORDER BY updated_at DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `reg_post_route` (IN `in_id` INT)  NO SQL
SELECT postal_areas.name AS name, location AS code, updated_at, direction FROM reg_posts_route_info, postal_areas WHERE reg_post_id=in_id AND location=postal_areas.code ORDER BY updated_at DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_active_parcels` (IN `resident_id` INT)  NO SQL
SELECT id, receiver_name, description, current_location, last_update, postal_areas.name AS posted_area_name, posted_location AS posted_area_code, posted_datetime, delivery_attempts FROM parcels, postal_areas WHERE receiver_id = resident_id AND status IN ('on-route-receiver', 'receiver-unavailable') AND postal_areas.code = posted_location ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_active_reg_posts_received` (IN `resident_id` INT, IN `in_status` ENUM('delivering','returning'))  NO SQL
IF in_status='delivering' THEN
SELECT registered_posts.id, sender_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, receiver_name, speed_post, current_location, last_update, posted_datetime, delivery_attempts_receiver FROM registered_posts, detailed_addresses WHERE receiver_id = resident_id AND sender_id = detailed_addresses.id AND status IN ('on-route-receiver', 'receiver-unavailable') ORDER BY last_update DESC;

ELSE
SELECT registered_posts.id, sender_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, receiver_name, speed_post, current_location, last_update, posted_datetime, delivery_attempts_receiver, delivery_attempts_sender FROM registered_posts, detailed_addresses WHERE receiver_id = resident_id AND sender_id = detailed_addresses.id AND status IN ('on-route-sender', 'sender-unavailable') ORDER BY last_update DESC;

END IF$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_active_reg_posts_sent` (IN `resident_id` INT, IN `in_status` ENUM('delivering','returning'))  NO SQL
IF in_status='delivering' THEN
SELECT registered_posts.id, sender_name, receiver_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, speed_post, current_location, last_update, posted_datetime, delivery_attempts_receiver FROM registered_posts, detailed_addresses WHERE sender_id = resident_id AND receiver_id = detailed_addresses.id AND status IN ('on-route-receiver', 'receiver-unavailable') ORDER BY posted_datetime DESC;

ELSE
SELECT registered_posts.id, sender_name, receiver_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, speed_post, current_location, last_update, posted_datetime, delivery_attempts_receiver, delivery_attempts_sender FROM registered_posts, detailed_addresses WHERE sender_id = resident_id AND receiver_id = detailed_addresses.id AND status IN ('on-route-sender', 'sender-unavailable') ORDER BY last_update DESC;

END IF$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_completed_parcels` (IN `resident_id` INT, IN `in_status` ENUM('delivered','failed'))  NO SQL
SELECT id, receiver_name, description, last_update, postal_areas.name AS posted_area_name, posted_location AS posted_area_code, posted_datetime, delivery_attempts, delivered_datetime FROM parcels, postal_areas WHERE receiver_id = resident_id AND status = in_status AND postal_areas.code = posted_location AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 365 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_completed_reg_posts_received` (IN `resident_id` INT, IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT registered_posts.id, sender_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, receiver_name, speed_post, last_update, posted_datetime, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM registered_posts, detailed_addresses WHERE receiver_id = resident_id AND sender_id = detailed_addresses.id AND status=in_status AND last_update BETWEEN DATE_SUB(CURDATE(), INTERVAL 365 DAY) AND CURDATE() ORDER BY last_update DESC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `resident_completed_reg_posts_sent` (IN `resident_id` INT, IN `in_status` ENUM('delivered','sent-back','failed'))  NO SQL
SELECT registered_posts.id, sender_name, receiver_name, detailed_addresses.number, detailed_addresses.street, detailed_addresses.sub_area, detailed_addresses.postal_area, detailed_addresses.postal_code, speed_post, last_update, posted_datetime, delivery_attempts_receiver, delivery_attempts_sender, delivered_datetime FROM registered_posts, detailed_addresses WHERE sender_id = resident_id AND receiver_id = detailed_addresses.id AND status=in_status AND posted_datetime BETWEEN DATE_SUB(CURDATE(), INTERVAL 365 DAY) AND CURDATE() ORDER BY posted_datetime DESC$$

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
(11, 'B66RLU', '70/2/1', 'james pieris road', 'rawathawatta', '10400'),
(12, 'BM9ZTO', '140/C', '2nd Cross Street', 'Diyatha Uyana', '12100'),
(13, 'SNRDYE', '226/1', 'Hill Road', 'Pahala Yaya', '90000'),
(14, 'TRXL8T', '50/3', NULL, 'New town', '20800');

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
-- Table structure for table `money_orders`
--

CREATE TABLE `money_orders` (
  `id` int(11) NOT NULL,
  `sender_name` varchar(50) NOT NULL,
  `receiver_name` varchar(50) NOT NULL,
  `receiver_postal_code` varchar(5) NOT NULL,
  `amount` decimal(6,2) NOT NULL,
  `status` enum('created','delivered','returned') NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `expire_after` int(11) NOT NULL DEFAULT '6',
  `posted_location` varchar(5) NOT NULL,
  `posted_datetime` datetime NOT NULL,
  `secret_key` varchar(255) NOT NULL,
  `delivered_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `money_orders`
--

INSERT INTO `money_orders` (`id`, `sender_name`, `receiver_name`, `receiver_postal_code`, `amount`, `status`, `price`, `expire_after`, `posted_location`, `posted_datetime`, `secret_key`, `delivered_datetime`) VALUES
(1, 'A.B.C. Perera', 'John Hamish Watson', '10400', '500.00', 'delivered', '80.50', 6, '11160', '2020-06-02 07:39:00', '$2b$10$jC9z8WDD0TxTyOldcD4q1eeMsA6.ZHREJOWl7KjPi5Jez8iKlZBEO', '2020-06-03 11:39:12'),
(2, 'C.H. Mary Campbell', 'Colum Mckenzie', '90000', '1825.50', 'returned', '156.20', 6, '10400', '2020-06-02 07:52:00', '$2b$10$zNjz6qbPF2Efsm4WiDow/.MZ8SmwXxN5L5q83ate.ZzROq2v3GRy2', '2020-06-05 22:10:52'),
(3, 'Lindsey Morgan', 'I.J. Sarath', '10400', '3645.50', 'created', '25.00', 2, '10400', '2020-06-05 19:30:07', '$2b$10$t.EJI.f2de7cU36loFv25eDgtpwpqlPfwdkcIR6TqqVadmrj2X08u', NULL),
(4, 'E. D. C. Jayaratna', 'M. N. Wanigarathne', '20800', '784.75', 'created', '63.90', 5, '10400', '2020-06-05 22:35:53', '$2b$10$E60cGmJdbTh2yDDHsLmRa.WmEHetl96Fw01buTSg1SKr.vzFn1Iee', NULL),
(5, 'A.B.C. Perera', 'Mary', '10400', '1825.50', 'created', '75.00', 2, '10400', '2020-06-30 23:25:35', '$2b$10$UfmMY6gNUehSy8uQBckiU.HXO6f1jqw8Pu6uFPEO2uqiELzA.xJNS', NULL);

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
(1, 5, 6, 2, '59.37'),
(2, 3, 0, 1, '22.00'),
(3, 5, 0, 0, '0.00'),
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
  `delivery_attempts` int(11) NOT NULL DEFAULT '0',
  `delivered_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parcels`
--

INSERT INTO `parcels` (`id`, `receiver_id`, `receiver_name`, `payment`, `description`, `status`, `current_location`, `last_update`, `posted_location`, `posted_datetime`, `delivery_attempts`, `delivered_datetime`) VALUES
(1, 2, 'John W.', '170.00', NULL, 'delivered', '10400', '2020-05-12 09:10:00', '01000', '2020-05-09 07:25:13', 1, '2020-05-12 09:10:00'),
(2, 4, 'Alice', '96.20', NULL, 'on-route-receiver', '80300', '2020-05-12 13:00:09', '10400', '2020-05-09 07:32:11', 0, NULL),
(3, 7, 'Clark', '40.00', NULL, 'failed', '10400', '2020-05-13 17:12:24', '10400', '2020-05-10 08:58:40', 3, NULL),
(4, 9, 'Abeyratna', '225.50', NULL, 'receiver-unavailable', '81000', '2020-05-15 19:35:58', '01000', '2020-05-13 17:08:34', 1, NULL),
(5, 10, 'William', '384.15', 'e-bay order', 'on-route-receiver', '80000', '2020-05-17 14:06:13', '82000', '2020-05-15 07:26:00', 0, NULL),
(6, 2, 'Sam W.', '95.00', NULL, 'on-route-receiver', '10400', '2020-05-17 14:08:53', '12100', '2020-05-15 13:17:34', 0, NULL),
(7, 11, 'Mr. Bates', '205.00', 'FRAGILE !!!', 'on-route-receiver', '90000', '2020-05-19 08:16:51', '90000', '2020-05-19 08:16:51', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `parcels_route_info`
--

CREATE TABLE `parcels_route_info` (
  `parcel_id` int(11) NOT NULL,
  `location` varchar(5) NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parcels_route_info`
--

INSERT INTO `parcels_route_info` (`parcel_id`, `location`, `updated_at`) VALUES
(4, '00400', '2020-05-13 20:38:14'),
(4, '10400', '2020-05-14 07:06:00'),
(4, '80300', '2020-05-14 10:22:44'),
(4, '80000', '2020-05-14 15:34:11'),
(4, '81000', '2020-05-15 12:21:46');

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
('00400', 'bambalapitiya', NULL),
('01000', 'maradana', '$2b$10$jGIITzcjRWCOGwjsPKEsruLYG2tGYDGCK9ejTklDlPIxCKxQl32uS'),
('10400', 'moratuwa', '$2b$10$.YIOLgPm2.M98wvc4GIsi.e/.dQtblU6LGn2qluFKLjz6JBqBKZcW'),
('11000', 'gampaha', NULL),
('11160', 'kal-eliya', NULL),
('11200', 'mirigama', NULL),
('12000', 'kalutara', NULL),
('12100', 'matugama', NULL),
('20400', 'peradeniya', NULL),
('20800', 'katugastota', NULL),
('22200', 'nuwara-eliya', NULL),
('40000', 'jaffna', NULL),
('70600', 'eheliyagoda', NULL),
('80000', 'galle', '$2b$10$kDgIBKFcSmQ50MsujqhouejsT6km92oZnlqAHErYV7jBsRmdmC7fa'),
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
(2, 3, 'Silva', 1, 'A. Peter', '44.25', 0, 'on-route-receiver', '20400', '2020-04-20 19:44:52', '2020-04-20 19:44:52', 0, 0, NULL),
(3, 2, 'Mary W.', 3, 'Connor', '88.75', 0, 'sent-back', '10400', '2020-04-20 07:23:55', '2020-04-24 14:41:20', 1, 1, '2020-04-24 14:41:20'),
(4, 1, 'Tom', 4, 'A. Cooray', '97.50', 0, 'on-route-receiver', '20400', '2020-04-22 16:45:04', '2020-05-02 16:45:04', 0, 0, NULL),
(5, 4, 'Wells', 2, 'John W.', '125.80', 0, 'sent-back', '80000', '2020-04-23 16:16:28', '2020-04-27 06:28:19', 3, 1, '2020-04-27 06:28:19'),
(6, 5, 'Pieris', 7, 'Watson', '65.30', 0, 'failed', '11000', '2020-04-27 11:24:26', '2020-05-08 12:52:31', 3, 2, NULL),
(7, 7, 'Watson', 6, 'Krishna', '148.65', 0, 'delivered', '40000', '2020-04-29 07:08:20', '2020-05-07 10:15:14', 1, 0, '2020-05-07 10:15:14'),
(8, 2, 'Mary W.', 8, 'Frank', '55.48', 0, 'failed', '10400', '2020-04-30 17:26:46', '2020-05-09 08:11:00', 3, 3, NULL),
(9, 9, 'Weerakkody', 2, 'John W.', '105.00', 0, 'failed', '81000', '2020-05-01 05:08:29', '2020-05-13 12:40:10', 3, 2, NULL),
(10, 2, 'John W.', 10, 'Abeyratna', '40.50', 0, 'delivered', '10400', '2020-05-04 15:19:11', '2020-05-05 10:00:00', 1, 0, '2020-05-05 10:00:00'),
(11, 6, 'Don', 2, 'Sam W.', '238.00', 0, 'sender-unavailable', '40000', '2020-05-05 08:17:33', '2020-05-13 14:27:13', 3, 1, NULL),
(12, 2, 'Mary W.', 3, 'Felicia', '115.25', 0, 'sender-unavailable', '10400', '2020-05-14 09:14:00', '2020-05-20 13:23:15', 2, 1, NULL),
(13, 2, 'Sam W.', 4, 'Cooray', '68.60', 0, 'on-route-sender', '80300', '2020-05-14 18:44:23', '2020-05-19 17:45:24', 3, 0, NULL),
(14, 8, 'Paul', 2, 'Dean W.', '73.00', 0, 'on-route-sender', '11000', '2020-05-16 09:15:25', '2020-05-23 06:08:49', 2, 0, NULL),
(15, 2, 'Mary W.', 4, 'Gunasingha', '54.75', 0, 'receiver-unavailable', '80000', '2020-05-17 08:18:12', '2020-05-20 13:51:45', 1, 0, NULL),
(16, 6, 'Drupal', 2, 'Sam W.', '267.00', 0, 'receiver-unavailable', '10400', '2020-05-21 06:39:22', '2020-05-24 22:19:37', 1, 0, NULL),
(17, 9, 'Weerakkody', 2, 'Dean W.', '324.50', 1, 'on-route-receiver', '80000', '2020-05-25 06:11:54', '2020-05-26 10:21:00', 0, 0, NULL),
(18, 2, 'John W.', 5, 'Peiris', '93.50', 0, 'on-route-receiver', '01000', '2020-05-26 11:50:37', '2020-05-29 19:45:05', 0, 0, NULL),
(19, 1, 'Kamal Perera', 7, 'Silva', '106.50', 0, 'on-route-receiver', '11000', '2020-05-31 16:40:30', '2020-06-02 07:53:22', 0, 0, NULL),
(20, 3, 'Sarath', 11, 'Edison', '244.90', 1, 'on-route-receiver', '01000', '2020-06-04 23:39:51', '2020-06-05 22:17:48', 0, 0, NULL),
(21, 9, 'A.B.C. Silva', 13, 'Ferguson', '258.80', 1, 'on-route-receiver', '80300', '2020-06-30 23:21:48', '2020-07-11 22:54:03', 0, 0, NULL);

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
-- Table structure for table `reg_posts_route_info`
--

CREATE TABLE `reg_posts_route_info` (
  `reg_post_id` int(11) NOT NULL,
  `location` varchar(5) NOT NULL,
  `updated_at` datetime NOT NULL,
  `direction` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `reg_posts_route_info`
--

INSERT INTO `reg_posts_route_info` (`reg_post_id`, `location`, `updated_at`, `direction`) VALUES
(21, '80000', '2020-07-02 19:53:36', 0),
(14, '11000', '2020-05-16 16:07:42', 0),
(14, '01000', '2020-05-17 12:49:00', 0),
(14, '00400', '2020-05-17 19:11:41', 0),
(14, '10400', '2020-05-18 09:36:12', 0),
(14, '10400', '2020-05-22 08:48:19', 1),
(14, '11000', '2020-05-23 06:08:49', 1),
(21, '10400', '2020-07-02 22:50:09', 0),
(21, '80000', '2020-07-04 08:17:22', 0),
(21, '80300', '2020-07-11 22:54:03', 0);

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

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `detailed_parcels`  AS  select `parcels`.`id` AS `id`,`parcels`.`receiver_id` AS `receiver_id`,`parcels`.`receiver_name` AS `receiver_name`,`parcels`.`payment` AS `payment`,`parcels`.`description` AS `description`,`parcels`.`status` AS `status`,`postal_areas`.`name` AS `current_area`,`parcels`.`current_location` AS `current_code`,`parcels`.`last_update` AS `last_update`,`parcels`.`posted_location` AS `posted_location`,`parcels`.`posted_datetime` AS `posted_datetime`,`parcels`.`delivery_attempts` AS `delivery_attempts`,`parcels`.`delivered_datetime` AS `delivered_datetime` from (`parcels` join `postal_areas` on((`parcels`.`current_location` = `postal_areas`.`code`))) ;

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
-- Indexes for table `money_orders`
--
ALTER TABLE `money_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_postal_code` (`receiver_postal_code`),
  ADD KEY `posted_location` (`posted_location`);

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
-- Indexes for table `parcels_route_info`
--
ALTER TABLE `parcels_route_info`
  ADD KEY `parcel_id` (`parcel_id`),
  ADD KEY `location` (`location`);

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
-- Indexes for table `reg_posts_route_info`
--
ALTER TABLE `reg_posts_route_info`
  ADD KEY `reg_post_id` (`reg_post_id`),
  ADD KEY `location` (`location`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `money_orders`
--
ALTER TABLE `money_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `parcels`
--
ALTER TABLE `parcels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `registered_posts`
--
ALTER TABLE `registered_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`postal_code`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `money_orders`
--
ALTER TABLE `money_orders`
  ADD CONSTRAINT `money_orders_ibfk_1` FOREIGN KEY (`receiver_postal_code`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `money_orders_ibfk_2` FOREIGN KEY (`posted_location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `parcels_route_info`
--
ALTER TABLE `parcels_route_info`
  ADD CONSTRAINT `parcels_route_info_ibfk_1` FOREIGN KEY (`parcel_id`) REFERENCES `parcels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `parcels_route_info_ibfk_2` FOREIGN KEY (`location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `registered_posts`
--
ALTER TABLE `registered_posts`
  ADD CONSTRAINT `registered_posts_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registered_posts_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registered_posts_ibfk_3` FOREIGN KEY (`current_location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reg_posts_route_info`
--
ALTER TABLE `reg_posts_route_info`
  ADD CONSTRAINT `reg_posts_route_info_ibfk_1` FOREIGN KEY (`reg_post_id`) REFERENCES `registered_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reg_posts_route_info_ibfk_2` FOREIGN KEY (`location`) REFERENCES `postal_areas` (`code`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
