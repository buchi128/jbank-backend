const express = require('express')
function generateAccountNumber() {
  const prefix = "BANK"; // optional prefix
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit
  return `${prefix}${randomDigits}`;
}

module.exports = generateAccountNumber
