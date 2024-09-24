import { Dialect, Sequelize } from "sequelize";
import connection from "../config";

const {database, user, host, password, dbLogging} = connection

const sequelizeConnection = new Sequelize(database, user, password, {
    host,
    logging: dbLogging ? console.log : false,
    dialect: 'postgres' as Dialect,
})

export default sequelizeConnection