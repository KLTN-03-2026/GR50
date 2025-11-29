const fs = require('fs');
try {
  require('express');
  require('sequelize');
  require('mysql2');
  fs.writeFileSync('check_result.txt', 'Modules found');
} catch (e) {
  fs.writeFileSync('check_result.txt', 'Modules missing: ' + e.message);
}
