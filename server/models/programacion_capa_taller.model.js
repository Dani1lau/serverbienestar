import { DataTypes, INTEGER, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class ProgramacionCapaTaller extends Model {
  
  static async createProgramacionCT(data) {
    try {
      return await this.create(data);
    } catch (error) {
      console.error(`Error al crear la programación: ${error}`);
      throw error;
    }
  }

  // Llamar al procedimiento almacenado para obtener la programación por ficha
  static async getProgramacionPorFicha(ficha, cordinacion) {
    try {
      return await sequelize.query(
        'CALL ObtenerProgramacionPorFicha(:ficha, :cordinacion)',
        {
          replacements: { ficha, cordinacion },
          type: sequelize.QueryTypes.SELECT
        }
      );
    } catch (error) {
      console.error('Error al ejecutar ObtenerProgramacionPorFicha:', error);
      throw error;
    }
  }

  // Método para obtener la programación por sede
  static async getProgramacionesBySede(sede) {
    try {
      return await sequelize.query(
        'CALL ObtenerProgramacionPorSede(:sede)',
        {
          replacements: { sede },
          type: sequelize.QueryTypes.SELECT
        }
      );
    } catch (error) {
      console.error(`Error al obtener las programaciones por sede (${sede}): `, error);
      throw error;
    }
  }

  static async getProgramacionesCT() {
    try {
      return await this.findAll();
    } catch (error) {
      console.error(`error al encontrar las programaciones: ${error}`);
      throw error;
    }
  }

  static async getProgramacionCT(id_procaptall) {
    try {
      return await this.findByPk(id_procaptall);
    } catch (error) {
      console.error(`error al encontrar la programacion: ${error}`);
      throw error;
    }
  }

  static async updateProgramacionCT(id_procaptall, update_programacionCT) {
    try {
      const programacionCT = await this.findByPk(id_procaptall);
      return programacionCT.update(update_programacionCT);
    } catch (error) {
      console.error(`error no se actualizó la programacion: ${error}`);
      throw error;
    }
  }

  static async eliminarProgramacionCT(id_procaptall) {
    try {
      const programacionCT = await ProgramacionCapaTaller.destroy({
        where: { id_procaptall },
      });
      return programacionCT;
    } catch (error) {
      console.error(`error al eliminar la programacion: ${error}`);
      throw error;
    }
  }
}

ProgramacionCapaTaller.init(
  {
    id_procaptall: { type: DataTypes.INTEGER, primaryKey: true },
    sede_procaptall: {
      type: DataTypes.ENUM("SEDE 52", "SEDE 64", "SEDE FONTIBON"),
      allowNull: false,
    },
    descripcion_procaptall: { type: DataTypes.STRING(50), allowNull: false },
    fecha_procaptall: { type: DataTypes.DATE, allowNull: false },
    horaInicio_procaptall: { type: DataTypes.TIME, allowNull: false },
    horaFin_procaptall: { type: DataTypes.TIME, allowNull: false },
    id_TallerFK: { type: DataTypes.INTEGER, allowNull: false },
    id_CapacFK: { type: DataTypes.INTEGER, allowNull: false },
    numero_FichaFK: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "ProgramacionCapaTaller",
    timestamps: false,
    underscored: false,
  }
);

export { ProgramacionCapaTaller };
