import { DataTypes, INTEGER, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Ficha extends Model {

  static async createFicha(ficha) {
    try {
      // Llamar al procedimiento almacenado con los parámetros necesarios
      const [result] = await sequelize.query(
        "CALL crearFicha(:numero_Ficha, :cordinacion_Ficha, :especialidad_Ficha)",
        {
          replacements: {
            numero_Ficha: ficha.numero_Ficha,
            cordinacion_Ficha: ficha.cordinacion_Ficha,
            especialidad_Ficha: ficha.especialidad_Ficha,
          },
        }
      );
      return result; // Retorna el resultado del procedimiento almacenado
    } catch (error) {
      console.error(`Error al crear ficha: ${error}`);
      throw error;
    }
  }

  static async getFichas() {
    try {
      return await this.findAll();
    } catch (error) {
      console.error(`error al encontrar las fichas: ${error}`);
      throw error;
    }
  }

  static async getFicha(numero_Ficha) {
    try {
      return await this.findByPk(numero_Ficha);
    } catch (error) {
      console.error(`error al encontrar la ficha: ${error}`);
      throw error;
    }
  }

  static async getAllCoordinaciones() {
    try {
      const [results, metadata] = await sequelize.query('SELECT DISTINCT cordinacion_Ficha FROM Ficha');
      return results; // Devuelve los resultados de la consulta
    } catch (error) {
      console.error(`Error al obtener las coordinaciones: ${error}`);
      throw error;
    }
  }
  

  static async updateFicha(numero_Ficha, update_ficha) {
    try {
      // Buscar la ficha por su número
      const ficha = await this.findByPk(numero_Ficha);
      
      // Verificar si la ficha existe
      if (!ficha) {
        throw new Error("Ficha no encontrada");
      }
  
      // Actualizar los campos de la ficha
      const updatedFicha = await ficha.update(update_ficha);
  
      return updatedFicha; // Retornar la ficha actualizada
    } catch (error) {
      console.error(`Error al actualizar la ficha: ${error}`);
      throw error;
    }
  }

  static async eliminarFicha(numero_Ficha) {
    try {
      const ficha = await Ficha.destroy({ where: { numero_Ficha } });
      return ficha;
    } catch (error) {
      console.error(`error al eliminar la ficha: ${error}`);
      throw error;
    }
  }
}

Ficha.init(
  {
    numero_Ficha: { type: DataTypes.INTEGER, primaryKey: true },
    cordinacion_Ficha: { type: DataTypes.STRING(40), allowNull: false },
    especialidad_Ficha: { type: DataTypes.STRING(80), allowNull: false },
  },
  {
    sequelize,
    tableName: "Ficha",
    timestamps: false,
    underscored: false,
  }
);

export { Ficha };
