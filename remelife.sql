-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 14, 2021 at 02:46 PM
-- Server version: 8.0.22-0ubuntu0.20.04.3
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `remelife`
--

-- --------------------------------------------------------

--
-- Table structure for table `distribution_settings`
--

CREATE TABLE `distribution_settings` (
  `id` int NOT NULL,
  `main_amount` int NOT NULL,
  `level_1_per` int NOT NULL,
  `level_2_per` int NOT NULL,
  `level_3_per` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `referred_user`
--

CREATE TABLE `referred_user` (
  `id` int NOT NULL,
  `uid` varchar(500) DEFAULT NULL,
  `referred_by` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_income`
--

CREATE TABLE `user_income` (
  `id` int NOT NULL,
  `uid` varchar(100) NOT NULL,
  `from_user` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `level` int DEFAULT '0',
  `new` tinyint(1) DEFAULT '0',
  `amount` int NOT NULL DEFAULT '0',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_referral_code`
--

CREATE TABLE `user_referral_code` (
  `id` int NOT NULL,
  `uid` varchar(500) NOT NULL,
  `referral_code` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_withdrawals`
--

CREATE TABLE `user_withdrawals` (
  `id` int NOT NULL,
  `uid` varchar(100) NOT NULL,
  `balance` int NOT NULL,
  `withdrawal` int NOT NULL,
  `currunt_balance` int NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `distribution_settings`
--
ALTER TABLE `distribution_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `referred_user`
--
ALTER TABLE `referred_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_income`
--
ALTER TABLE `user_income`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_referral_code`
--
ALTER TABLE `user_referral_code`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_withdrawals`
--
ALTER TABLE `user_withdrawals`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `distribution_settings`
--
ALTER TABLE `distribution_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `referred_user`
--
ALTER TABLE `referred_user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_income`
--
ALTER TABLE `user_income`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_referral_code`
--
ALTER TABLE `user_referral_code`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_withdrawals`
--
ALTER TABLE `user_withdrawals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
