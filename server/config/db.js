import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_SCHEMA,         // El nombre de la base de datos
    process.env.DB_USER,           // El usuario de la base de datos
    process.env.DB_PASS,           // La contraseña del usuario
    {
        host: process.env.DB_HOST,  // El host (autorack.proxy.rlwy.net)
        port: process.env.DB_PORT,  // El puerto (57669)
        dialect: "mysql",           // Usamos MySQL como dialecto
        dialectOptions: {
            // Si tienes alguna opción adicional para el dialecto, añádela aquí
        }
    }
);