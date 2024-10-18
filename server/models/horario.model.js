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

    // Método para eliminar un horario
    static async eliminarHorario(id_Horari) {
      try {
        const resultado = await this.destroy({
          where: { id_Horari }
        });
  
        if (resultado === 0) {
          throw new Error(`Horario con id ${id_Horari} no encontrado`);
        }
  
        return { message: `Horario con id ${id_Horari} eliminado con éxito` };
      } catch (error) {
        console.error(`Error al eliminar horario: ${error}`);
        throw error;
      }
    }
  
    // Método para actualizar un horario
    static async actualizarHorario(id_Horari, datosActualizados) {
      try {
        const [filasActualizadas] = await this.update(datosActualizados, {
          where: { id_Horari }
        });
  
        if (filasActualizadas === 0) {
          throw new Error(`Horario con id ${id_Horari} no encontrado o sin cambios`);
        }
  
        return { message: `Horario con id ${id_Horari} actualizado con éxito` };
      } catch (error) {
        console.error(`Error al actualizar horario: ${error}`);
        throw error;
      }
    }

    static async obtenerTodosLosHorarios() {
      try {
        return await this.findAll(); // Consulta todos los registros en la tabla
      } catch (error) {
        console.error(`Error al obtener todos los horarios: ${error}`);
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
