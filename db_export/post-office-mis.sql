-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2020 at 05:27 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `resident_key` varchar(6) NOT NULL,
  `number` varchar(50) NOT NULL,
  `street` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `postal_code` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `resident_key`, `number`, `street`, `state`, `postal_code`) VALUES
(1, 'QSD72H', '46', 'Mill Rd', 'Hiriwala', '11160'),
(2, '8VL8IB', '121/B', 'Temple Rd', 'rawathawaththa', '10400');

-- --------------------------------------------------------

--
-- Table structure for table `normal_posts`
--

CREATE TABLE `normal_posts` (
  `address_id` int(11) NOT NULL,
  `on_route_count` int(11) NOT NULL,
  `delivered_count` int(11) NOT NULL,
  `failed_delivery_count` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `normal_posts`
--

INSERT INTO `normal_posts` (`address_id`, `on_route_count`, `delivered_count`, `failed_delivery_count`) VALUES
(1, 2, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `postal_areas`
--

CREATE TABLE `postal_areas` (
  `code` varchar(5) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `postal_areas`
--

INSERT INTO `postal_areas` (`code`, `name`) VALUES
('01000', 'maradana'),
('10400', 'moratuwa'),
('11160', 'kal-eliya'),
('20400', 'peradeniya'),
('80000', 'galle');

-- --------------------------------------------------------

--
-- Table structure for table `registered_posts`
--

CREATE TABLE `registered_posts` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
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

INSERT INTO `registered_posts` (`id`, `sender_id`, `receiver_id`, `status`, `current_location`, `posted_datetime`, `last_update`, `delivery_attempts_receiver`, `delivery_attempts_sender`, `delivered_datetime`) VALUES
(1, 1, 2, 'on-route-receiver', '11160', '2020-04-20 11:00:00', '2020-04-20 11:00:00', 0, 0, NULL);

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
CREATE TRIGGER `check_delivery_attempts` BEFORE UPDATE ON `registered_posts` FOR EACH ROW IF (new.delivery_attempts_receiver = 0 AND new.status = 'back-to-sender') THEN
	SIGNAL SQLSTATE '45000';
END IF
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `reg_post_receiver_details`
-- (See below for the actual view)
--
CREATE TABLE `reg_post_receiver_details` (
`id` int(11)
,`receiver_id` int(11)
,`receiver_number` varchar(50)
,`receiver_street` varchar(50)
,`receiver_state` varchar(50)
,`receiver_postal_code` varchar(5)
,`status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `reg_post_sender_details`
-- (See below for the actual view)
--
CREATE TABLE `reg_post_sender_details` (
`id` int(11)
,`sender_id` int(11)
,`sender_number` varchar(50)
,`sender_street` varchar(50)
,`sender_state` varchar(50)
,`sender_postal_code` varchar(5)
,`status` enum('on-route-receiver','delivered','receiver-unavailable','on-route-sender','sent-back','sender-unavailable','failed')
);

-- --------------------------------------------------------

--
-- Structure for view `reg_post_receiver_details`
--
DROP TABLE IF EXISTS `reg_post_receiver_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reg_post_receiver_details`  AS  select `registered_posts`.`id` AS `id`,`addresses`.`id` AS `receiver_id`,`addresses`.`number` AS `receiver_number`,`addresses`.`street` AS `receiver_street`,`addresses`.`state` AS `receiver_state`,`addresses`.`postal_code` AS `receiver_postal_code`,`registered_posts`.`status` AS `status` from (`registered_posts` join `addresses` on((`registered_posts`.`receiver_id` = `addresses`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `reg_post_sender_details`
--
DROP TABLE IF EXISTS `reg_post_sender_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reg_post_sender_details`  AS  select `registered_posts`.`id` AS `id`,`addresses`.`id` AS `sender_id`,`addresses`.`number` AS `sender_number`,`addresses`.`street` AS `sender_street`,`addresses`.`state` AS `sender_state`,`addresses`.`postal_code` AS `sender_postal_code`,`registered_posts`.`status` AS `status` from (`registered_posts` join `addresses` on((`registered_posts`.`sender_id` = `addresses`.`id`))) ;

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
-- Indexes for table `normal_posts`
--
ALTER TABLE `normal_posts`
  ADD PRIMARY KEY (`address_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `registered_posts`
--
ALTER TABLE `registered_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
