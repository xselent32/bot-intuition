const { Sequelize } = require("sequelize");

module.exports = new Sequelize("default_db", "gen_user", "png4oh0z45", {
    host: "83.222.10.189",
    port: 5432,
    dialect: "postgres"
});