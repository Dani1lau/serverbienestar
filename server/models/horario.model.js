import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Horario extends Model {
  static async createHorario(horario) {
    try {
      return await this.create(horario);
    } catch (error) {
      console.error(`Error al crear horario: ${error}`);
      throw error;
    }
  }

  static async obtenerHorariosPorFichaYCoordinacion(numero_Ficha, cordinacion_Ficha) {
    try {
      // Ejecutar el procedimiento almacenado
      const resultado = await sequelize.query(
        `CALL ObtenerHorariosPorFichaYCoordinacion(:numero_Ficha, :cordinacion_Ficha)`, 
        {
          replacements: { numero_Ficha, cordinacion_Ficha },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      // Limpiar la respuesta para que solo devuelva el primer objeto con los datos
      if (resultado.length > 0 && resultado[0]) {
        // Aquí seleccionamos solo el primer objeto del array (los datos del horario)
        return resultado[0];
      }
  
      return null;
    } catch (error) {
      console.error(`Error al obtener horarios: ${error}`);
      throw error;
    }
  }


  static async getHorarios() {
    try {
      return await this.findAll();
    } catch (error) {
      console.error(`Error al encontrar los horarios: ${error}`);
      throw error;
    }
  }

  static async getHorario(id) {
    try {
      return await this.findByPk(id);
    } catch (error) {
      console.error(`Error al encontrar el horario: ${error}`);
      throw error;
    }
  }

  static async updateHorario(id, update_horario) {
    try {
      const horario = await this.findByPk(id);
      return horario.update(update_horario);
    } catch (error) {
      console.error(`Error al actualizar el horario: ${error}`);
      throw error;
    }
  }

  static async deleteHorario(id) {
    try {
      const horario = await this.findByPk(id);
      if (horario) {
        await horario.destroy();
        return horario;
      }
      return null;
    } catch (error) {
      console.error(`Error al eliminar el horario: ${error}`);
      throw error;
    }
  }
}

Horario.init(
  {
    id_Horari: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha_fintrimestre_Horari: { type: DataTypes.DATE, allowNull: false },
    ruta_imagen_Horari: { type: DataTypes.STRING(255), allowNull: true },  // Campo para la ruta de la imagen
    numero_FichaFK: { type: DataTypes.INTEGER, allowNull: false },  // Clave foránea
  },
  {
    sequelize,
    tableName: "Horario",
    timestamps: false,
    underscored: false
  }
);

export { Horario };
