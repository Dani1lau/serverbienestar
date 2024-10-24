import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Capacitador } from "./capacitador.model.js";

class ProgramacionCapaTaller extends Model {
  // Crear programación invocando el procedimiento almacenado

  static async createProgramacionCT({
    sede_procaptall,
    descripcion_procaptall,
    ambiente_procaptall,
    fecha_procaptall,
    horaInicio_procaptall,
    horaFin_procaptall,
    nombreTaller,
    nombreCapacitador,
    numero_FichaFK,
    nombreInstructor,
  }) {
    try {
      // Ejecutar el procedimiento almacenado
      const resultado = await sequelize.query(
        `CALL sp_programarTaller(
                    :sede_procaptall, 
                    :descripcion_procaptall, 
                    :ambiente_procaptall, 
                    :fecha_procaptall, 
                    :horaInicio_procaptall, 
                    :horaFin_procaptall, 
                    :nombreTaller, 
                    :nombreCapacitador, 
                    :numero_FichaFK, 
                    :nombreInstructor
                )`,
        {
          replacements: {
            sede_procaptall,
            descripcion_procaptall,
            ambiente_procaptall,
            fecha_procaptall,
            horaInicio_procaptall,
            horaFin_procaptall,
            nombreTaller,
            nombreCapacitador,
            numero_FichaFK,
            nombreInstructor,
          },
        }
      );

      // Extraer los correos devueltos por el procedimiento almacenado
      const correos = resultado[0]; // Asegurarse que el procedimiento retorna datos correctos
      console.log("correos :", correos);
      if (!correos || !correos.correoCapacitador || !correos.correoInstructor) {
        throw new Error("No se pudieron obtener los correos.");
      }

      // Devolver un resultado exitoso
      return { success: true, correos };
    } catch (error) {
      console.error("Error al crear la programación:", error.message);
      throw new Error("No se pudo crear la programación: " + error.message);
    }
  }

  // Llamar al procedimiento almacenado para obtener la programación por ficha
  static async getProgramacionPorFicha(ficha, cordinacion) {
    try {
      const programaciones = await sequelize.query(
        "CALL ObtenerProgramacionPorFicha(:ficha, :cordinacion)",
        {
          replacements: { ficha, cordinacion },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Filtrar duplicados por 'fecha_procaptall' y 'horaInicio_procaptall'
      return programaciones.filter(
        (programacion, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.fecha_procaptall === programacion.fecha_procaptall &&
              p.horaInicio_procaptall === programacion.horaInicio_procaptall
          )
      );
    } catch (error) {
      console.error("Error al ejecutar ObtenerProgramacionPorFicha:", error);
      throw error;
    }
  }

  // Método para obtener la programación por sede
  static async getProgramacionesBySede(sede) {
    try {
      return await sequelize.query("CALL ObtenerProgramacionPorSede(:sede)", {
        replacements: { sede },
        type: sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por sede (${sede}): `,
        error
      );
      throw error;
    }
  }

  // model.js
  static async getProgramacionesCT() {
    try {
      const results = await this.sequelize.query(
        "CALL sp_obtenerProgramaciones()",
        {
          type: this.sequelize.QueryTypes.SELECT,
        }
      );
      console.log(results); // Verifica la estructura de results aquí
      return results; // Esto debería ser un array
    } catch (error) {
      console.error(`Error al encontrar las programaciones: ${error}`);
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

  // Método para obtener programaciones por sede 52
  static async getProgramacionesBySede52() {
    try {
      return await sequelize.query("CALL ObtenerProgramacionPorSede52()", {
        type: sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      console.error(`Error al obtener las programaciones por sede 52:`, error);
      throw error;
    }
  }

  // Método para obtener programaciones por sede 64
  static async getProgramacionesBySede64() {
    try {
      return await sequelize.query("CALL ObtenerProgramacionPorSede64()", {
        type: sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      console.error(`Error al obtener las programaciones por sede 64:`, error);
      throw error;
    }
  }

  // Método para obtener programaciones por sede Fontibón
  static async getProgramacionesBySedeFontibon() {
    try {
      return await sequelize.query(
        "CALL ObtenerProgramacionPorSedeFontibon()",
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por sede Fontibón:`,
        error
      );
      throw error;
    }
  }

  static async updateProgramacionCT(id_procaptall, update_programacionCT) {
    try {
      const {
        sede_procaptall,
        descripcion_procaptall,
        ambiente_procaptall,
        fecha_procaptall,
        horaInicio_procaptall,
        horaFin_procaptall,
        nombreTaller,
        nombreCapacitador,
        numero_FichaFK,
        nombreInstructor,
      } = update_programacionCT;

      // Llamar al procedimiento almacenado
      const result = await sequelize.query(
        `CALL sp_actualizarProgramacion(
                :id_procaptall, 
                :sede_procaptall, 
                :descripcion_procaptall, 
                :ambiente_procaptall, 
                :fecha_procaptall, 
                :horaInicio_procaptall, 
                :horaFin_procaptall, 
                :nombreTaller, 
                :nombreCapacitador, 
                :numero_FichaFK, 
                :nombreInstructor
            )`,
        {
          replacements: {
            id_procaptall,
            sede_procaptall,
            descripcion_procaptall: descripcion_procaptall.trim(),
            ambiente_procaptall,
            fecha_procaptall,
            horaInicio_procaptall,
            horaFin_procaptall,
            nombreTaller,
            nombreCapacitador,
            numero_FichaFK,
            nombreInstructor,
          },
        }
      );
      // Extraer los correos devueltos por el procedimiento almacenado
      const correos = result[0]; // Asegurarse que el procedimiento retorna datos correctos
      console.log("correos :", correos);
      if (!correos || !correos.correoCapacitador || !correos.correoInstructor) {
        throw new Error("No se pudieron obtener los correos.");
      }

      // Devolver un resultado exitoso
      return { success: true, correos };
    } catch (error) {
      console.error(`Error al actualizar la programación: ${error.message}`);
      throw new Error("Error al actualizar la programación: " + error.message);
    }
  }

  static async eliminarProgramacionCT(id_procaptall) {
    try {
        // Ejecutar el procedimiento almacenado y obtener los correos junto con los detalles de la programación
        const result = await sequelize.query(
            `CALL sp_eliminarProgramacion(:id_procaptall)`, 
            {
                replacements: { id_procaptall }, // Paso de parámetros
                type: sequelize.QueryTypes.SELECT // Definir el tipo de consulta
            }
        );

        // Devolver un resultado exitoso
        return result[0];
    } catch (error) {
        console.error(`Error al eliminar la programación y obtener los correos: ${error.message}`);
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
    ambiente_procaptall: { type: DataTypes.STRING(80), allowNull: false },
    fecha_procaptall: { type: DataTypes.DATE, allowNull: false },
    horaInicio_procaptall: { type: DataTypes.TIME, allowNull: false },
    horaFin_procaptall: { type: DataTypes.TIME, allowNull: false },
    id_TallerFK: { type: DataTypes.INTEGER, allowNull: false },
    id_CapacFK: { type: DataTypes.INTEGER, allowNull: false },
    numero_FichaFK: { type: DataTypes.INTEGER, allowNull: false },
    id_InstrucFK: { type: DataTypes.STRING(85), allowNull: false },
  },
  {
    sequelize,
    tableName: "ProgramacionCapaTaller",
    timestamps: false,
    underscored: false,
  }
);

// Definir la asociación aquí
ProgramacionCapaTaller.belongsTo(Capacitador, {
  foreignKey: "id_CapacFK",
  targetKey: "id_Capac",
});

// Función para obtener y mostrar la programación
(async () => {
  const ficha = 2902081;
  const cordinacion = "Análisis y desarrollo de software";
  try {
    const programacion = await ProgramacionCapaTaller.getProgramacionPorFicha(
      ficha,
      cordinacion
    );
    console.log(programacion); // Aquí se mostrarán los datos obtenidos
  } catch (error) {
    console.error("Error al obtener programación:", error);
  }
})();

export { ProgramacionCapaTaller };
