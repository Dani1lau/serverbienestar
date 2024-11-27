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
  static async getProgramacionPorFicha(ficha) {
    try {
      // Ejecutar el procedimiento almacenado sin el parámetro de coordinación
      const programaciones = await sequelize.query(
        "CALL ObtenerProgramacionPorFicha(:ficha)",
        {
          replacements: { ficha },
        }
      );

      // Filtrar duplicados por 'fecha_procaptall' y 'horaInicio_procaptall'
      const uniqueProgramaciones = programaciones.filter(
        (programacion, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.fecha_procaptall === programacion.fecha_procaptall &&
              p.horaInicio_procaptall === programacion.horaInicio_procaptall
          )
      );

      return uniqueProgramaciones;
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
// Método para obtener programaciones por sede 52
static async getProgramacionesBySede52() {
  try {
    const results = await sequelize.query(
      'CALL ObtenerProgramacionPorSede52()', 
      {
        type: this.sequelize.QueryTypes.SELECT
      }
    );
    // Extraer solo el primer conjunto de resultados
    return results[0] || []; // Si no hay resultados, devolver un arreglo vacío
  } catch (error) {
    console.error('Error al obtener las programaciones por sede 52:', error);
    throw error;
  }
}



// Método para obtener programaciones por sede 64
static async getProgramacionesBySede64() {
  try {
    return await sequelize.query(
      'CALL ObtenerProgramacionPorSede64()',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );
  } catch (error) {
    console.error(`Error al obtener las programaciones por sede 64:` , error);
    throw error;
  }
}

// Método para obtener programaciones por sede Fontibón
static async getProgramacionesBySedeFontibon() {
  try {
    return await sequelize.query(
      'CALL ObtenerProgramacionPorSedeFontibon()',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );
  } catch (error) {
    console.error(`Error al obtener las programaciones por sede Fontibón:` , error);
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
          type: sequelize.QueryTypes.SELECT, // Definir el tipo de consulta
        }
      );

      // Devolver un resultado exitoso
      return result[0];
    } catch (error) {
      console.error(
        `Error al eliminar la programación y obtener los correos: ${error.message}`
      );
      throw error;
    }
  }

// Método para obtener el informe
static async getInforme(fecha, sede, coordinacion, numeroFicha, ambiente) {
  try {
    // Realizamos la consulta SQL
    const result = await sequelize.query(
      "CALL ObtenerProgramacionPorFicha1(:numeroFicha, :coordinacion, :fecha, :sede, :ambiente)",
      {
        replacements: { numeroFicha, coordinacion, fecha, sede, ambiente },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("Resultado de la consulta:", result); // Verifica los datos que estamos obteniendo

    // Si hay resultados, retornar el primer objeto
    if (result.length > 0) {
      return result[0]; // Devuelve el primer resultado
    } else {
      return null; // Si no hay resultados, devuelve null
    }
  } catch (error) {
    console.error(
      "Error al obtener el informe desde el modelo:",
      error.message
    );
    throw error;
  }
}

/*
static async generarInformePDF(informe) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Configuración inicial del documento
    doc.fontSize(12).fillColor("black");

    // Título un poco más a la izquierda
    const title = "Informe de Programación";
    const titleX = 50; // Desplazado un poco hacia la izquierda
    doc.fontSize(18).fillColor("black").text(title, titleX, 30); // Título más a la izquierda

    // Línea verde debajo del título
    doc
      .moveTo(50, 60) // Posición de la línea
      .lineTo(doc.page.width - 50, 60) // Longitud de la línea
      .strokeColor("#5cb85c") // Color verde
      .lineWidth(2) // Grosor de la línea
      .stroke();

    // Espacio después de la línea
    doc.moveDown(1.5);

    // Obtén la ruta del archivo actual y su directorio
    const __filename = fileURLToPath(import.meta.url); // Convierte la URL del módulo en una ruta de archivo
    const _dirname = path.dirname(_filename); // Obtén el directorio del archivo

    // Ruta de la imagen en el servidor
    const imagePath = path.join(
      "C:",
      "AVA 1.0",
      "serverbienestar",
      "server",
      "img",
      "logoSena.png"
    ); // Ruta local de la imagen
    const imageWidth = 70; // Ancho de la imagen
    const imageHeight = 70; // Alto de la imagen

    // Ubicamos la imagen en la esquina superior derecha
    doc.image(imagePath, doc.page.width - imageWidth - 30, 20, {
      width: imageWidth,
      height: imageHeight,
    });

    // Verifica que el informe tenga datos
    if (!informe || !informe[0]) {
      doc
        .fontSize(12)
        .text("No se encontraron datos para generar el informe.");
      doc.end();
      return;
    }

    // Accede al primer objeto dentro del array de resultados
    const data = informe[0];

    // Comienza a agregar los datos de forma estructurada, alineados a la izquierda
    doc.fontSize(12).fillColor("black");

    // Establecemos un margen para los datos (alineado a la izquierda)
    const marginLeft = 50;
    const lineHeight = 1.5; // Espaciado entre líneas

    // Agregar cada línea de datos con un margen a la izquierda
    doc.text(
      Sede: ${data.sede_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Descripción: ${data.descripcion_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Ambiente: ${data.ambiente_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Fecha: ${data.fecha_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Hora de Inicio: ${data.horaInicio_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Hora de Fin: ${data.horaFin_procaptall || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Número de Ficha: ${data.numero_FichaFK || "No disponible"},
      marginLeft,
      doc.y
    );
    doc.moveDown(lineHeight);
    doc.text(
      Coordinación: ${data.cordinacion_Ficha || "No disponible"},
      marginLeft,
      doc.y
    );

    // Espacio después del último dato antes de agregar la segunda imagen
    doc.moveDown(2);

    // Segunda imagen (logoBienestar.png, ubicada al final del PDF)
    const secondImagePath = path.join(
      "C:",
      "AVA 1.0",
      "serverbienestar",
      "server",
      "img",
      "logoBienestar.png"
    ); // Ruta local de la segunda imagen
    const secondImageWidth = 200; // Ancho de la segunda imagen
    const secondImageHeight = 150; // Alto de la segunda imagen

    // Calcular la posición X para centrar la imagen
    const centerX = (doc.page.width - secondImageWidth) / 2;

    // Obtener la posición Y de la última línea
    const positionY = doc.y;

    // Agregar la segunda imagen centrada
    doc.image(secondImagePath, centerX, positionY, { width: secondImageWidth, height: secondImageHeight });

    // Finaliza el documento
    doc.end();
  });
}
*/

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

export { ProgramacionCapaTaller };
