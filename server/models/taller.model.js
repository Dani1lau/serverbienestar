import { DataTypes, INTEGER, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Taller extends Model {
  static async createTaller(taller) {
    try {
      return await this.create(taller);
    } catch (error) {
      console.error(`error al crear taller: ${error}`);
      throw error;
    }
  }


  static async getTiposDeTalleres() {
    try {
        // Llamada al procedimiento almacenado
        const tiposDeTalleres = await sequelize.query(
            "CALL GetTiposDeTalleres()"
        );
        return tiposDeTalleres;
    } catch (error) {
        throw new Error("Error al obtener tipos de talleres: " + error);
    }
}


  static async getTallerPorNombre(nombreTaller) {
    try {
        const [result] = await db.query('CALL ObtenerTallerPorNombre(?)', [nombreTaller]);
        return result;
    } catch (error) {
        console.error(`Error al obtener el taller: ${error}`);
        throw error;
    }
}

  static async getTalleres() {
    try {
      return await this.findAll();
    } catch (error) {
      console.error(`error al encontrar los talleres: ${error}`);
      throw error;
    }
  }

  static async getTaller(id) {
    try {
      return await this.findByPk(id);
    } catch (error) {
      console.error(`error al encontrar el taller: ${error}`);
      throw error;
    }
  }

  static async updateTaller(id, update_taller) {
    try {
      const taller = await this.findByPk(id);
      return taller.update( update_taller )
    } catch (error) {
      console.error(`error no se actualizó el taller: ${error}`);
      throw error;
    }
  }

  static async eliminarTaller(id_Taller) {
    try {
      const taller = await Taller.destroy({ where: { id_Taller } });
      return taller;
    } catch (error) {
      console.error(`error al eliminar el taller: ${error}`);
      throw error;
    }
  }

}

Taller.init(
  {
    id_Taller: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_Taller: { type: DataTypes.STRING(40), allowNull: false },
    tipo_Taller: { type: DataTypes.STRING(55), allowNull: false },
  },
  {
    sequelize, 
    tableName: "Taller",
    timestamps: false,
    underscored: false
  }
);

export {Taller};
