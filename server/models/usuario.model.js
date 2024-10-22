import { DataTypes, INTEGER, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import { Capacitador } from "./capacitador.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; // Para generar claves seguras
import { Instructor } from "./instructor.model.js";

class Usuario extends Model {
  static async registrarUsuario(usuario) {
    // Generar una clave aleatoria
    const claveGenerada = crypto.randomBytes(8).toString("hex"); // Cambia el tamaño según lo necesites

    try {
      // Encriptar la clave generada
      const salt = await bcrypt.genSalt(10); // Genera un salt
      const claveEncriptada = await bcrypt.hash(claveGenerada, salt); // Encripta la clave generada

      // Llamar al procedimiento almacenado
      const query = `
        CALL RegistrarUsuario(
          :correo,
          :rol,
          :nombre,
          :apellido,
          :genero,
          :tipoDocumento,
          :documento,
          :clave
        )`;

      await sequelize.query(query, {
        replacements: {
          correo: usuario.correo_Usua,
          rol: usuario.id_Rol1FK,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          genero: usuario.genero,
          tipoDocumento: usuario.tipodoc,
          documento: usuario.documento,
          clave: claveEncriptada, // Aquí guardas la clave encriptada
        },
      });

      console.log("Clave generada:", claveGenerada); // Mostrar la clave generada
      return claveGenerada; // Retornar la clave generada en texto plano para enviar por correo
    } catch (error) {
      if (error.original && error.original.sqlState === "45000") {
        // Manejar el error de duplicado
        console.error("Error de duplicado:", error.original.message);
        throw new Error(error.original.message); // Lanza el mensaje de error específico
      } else {
        console.error("Error al registrar el usuario:", error);
        throw error; // Lanzar otros errores
      }
    }
  }

  static async obtenerPorCorreo(correo) {
    const query = "SELECT * FROM Usuario WHERE correo_Usua = ?";
    const [result] = await sequelize.query(query, {
      replacements: [correo],
    });
    return result.length > 0 ? result[0] : null;
  }

  static async obtenerPorDocumento(documento) {
    const query = "SELECT * FROM Usuario WHERE documento = ?";
    const [result] = await sequelize.query(query, {
      replacements: [documento],
    });
    return result.length > 0 ? result[0] : null;
  }

  static async obtenerPerfilUsuario(id_Usua) {
    try {
      const perfil = await sequelize.query(
        `SELECT u.correo_Usua, u.estado_Usua, u.clave_Usua,
                r.nombre_Rol, 
                c.nombre_Capac, c.apellidos_Capac, c.genero_Capac, c.tipodoc_Capac, c.documento_Capac,
                a.nombre_Admin, a.apellido_Admin, a.genero_Admin, a.tipodoc_Admin, a.documento_Admin,
                i.nombre_Instruc, i.apellido_Instruc, i.genero_Instruc, i.tipodoc_Instruc, i.documento_Instruc
         FROM Usuario u
         INNER JOIN Rol r ON u.id_Rol1FK = r.id_Rol
         LEFT JOIN Capacitador c ON u.id_Usua = c.id_Usua1FK
         LEFT JOIN Administrador a ON u.id_Usua = a.id_Usua2FK
         LEFT JOIN Instructor i ON u.id_Usua = i.id_Usua3FK
         WHERE u.id_Usua = :id_Usua`,
        {
          replacements: { id_Usua },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Procesar los resultados para eliminar campos nulos
      const perfilLimpiado = perfil.length ? perfil[0] : null;

      if (perfilLimpiado) {
        // Eliminar campos nulos
        const {
          nombre_Capac,
          apellidos_Capac,
          genero_Capac,
          tipodoc_Capac,
          documento_Capac,
          nombre_Admin,
          apellido_Admin,
          genero_Admin,
          tipodoc_Admin,
          documento_Admin,
          nombre_Instruc,
          apellido_Instruc,
          genero_Instruc,
          tipodoc_Instruc,
          documento_Instruc,
          ...resto
        } = perfilLimpiado;

        // Filtrar campos nulos
        const perfilFiltrado = {
          ...resto,
          ...(nombre_Capac && { nombre_Capac }),
          ...(apellidos_Capac && { apellidos_Capac }),
          ...(genero_Capac && { genero_Capac }),
          ...(tipodoc_Capac && { tipodoc_Capac }),
          ...(documento_Capac && { documento_Capac }),
          ...(nombre_Admin && { nombre_Admin }),
          ...(apellido_Admin && { apellido_Admin }),
          ...(genero_Admin && { genero_Admin }),
          ...(tipodoc_Admin && { tipodoc_Admin }),
          ...(documento_Admin && { documento_Admin }),
          ...(nombre_Instruc && { nombre_Instruc }),
          ...(apellido_Instruc && { apellido_Instruc }),
          ...(genero_Instruc && { genero_Instruc }),
          ...(tipodoc_Instruc && { tipodoc_Instruc }),
          ...(documento_Instruc && { documento_Instruc }),
        };

        return perfilFiltrado;
      }

      return null;
    } catch (error) {
      console.error(`Error al obtener el perfil del usuario: ${error}`);
      throw error;
    }
  }

  static async alternarEstadoUsuario(id_Usua) {
    try {
      const result = await sequelize.query(
        "CALL AlternarEstadoUsuario(:id_Usua)",
        { replacements: { id_Usua }, type: sequelize.QueryTypes.RAW }
      );
      return result;
    } catch (error) {
      console.error(`Error al alternar estado del usuario: ${error}`);
      throw error;
    }
  }

  static async getUsuarios() {
    try {
      return await this.findAll();
    } catch (error) {
      console.error(`error al encontrar los usuarios: ${error}`);
      throw error;
    }
  }

  // UsuarioModel.js

  static async getbuscarUsuario(tipoDoc, documento, nombre) {
    try {
      const result = await sequelize.query(
        `CALL ObtenerUsuario(:tipoDoc, :documento, :nombre)`,
        {
          replacements: {
            tipoDoc,
            documento,
            nombre: nombre !== "" ? nombre : null,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      console.log("Resultado del procedimiento almacenado:", result);
      return result;
    } catch (error) {
      console.error(`Error al buscar usuario: ${error}`);
      throw error;
    }
  }

  static async updateUsuario(id_Usuario, update_usuario) {
    const saltRounds = 10; // Definir el número de rondas de sal
    const {
      nombre,
      apellido,
      correo_Usua,
      clave_Usua,
      genero,
      id_Rol1FK,
      estado,
    } = update_usuario;

    try {
      // Si se proporciona una nueva clave, encríptala
      let hashedClave = null;
      if (clave_Usua) {
        hashedClave = await bcrypt.hash(clave_Usua, saltRounds);
      }

      // Ejecutar el procedimiento almacenado
      await sequelize.query(
        `CALL actualizarUsuario(:p_id_Usua, :p_nombre, :p_apellido, :p_correo, :p_clave, :p_estado, :p_genero, :p_id_Rol)`,
        {
          replacements: {
            p_id_Usua: id_Usuario,
            p_nombre: nombre,
            p_apellido: apellido,
            p_correo: correo_Usua,
            p_clave: hashedClave || null, // Utiliza la clave encriptada o null si no se proporciona
            p_estado: estado, // Asegúrate de pasar el estado
            p_genero: genero,
            p_id_Rol: id_Rol1FK,
          },
        }
      );

      return { message: "Usuario actualizado con éxito" };
    } catch (error) {
      console.error(
        `Error al actualizar el usuario con el procedimiento almacenado: ${error.message}`
      );
      throw error;
    }
  }

  async comparar_clave(clave) {
    console.log("Comparando", clave, "con", this.clave_Usua); // Log para verificar lo que se está comparando
    return await bcrypt.compare(clave, this.clave_Usua);
  }
}

Usuario.init(
  {
    id_Usua: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    correo_Usua: { type: DataTypes.STRING(35), allowNull: false },
    clave_Usua: { type: DataTypes.TEXT, allowNull: false, unique: true },
    estado_Usua: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    id_Rol1FK: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "Usuario",
    timestamps: false,
    underscored: false,
  }
);



export { Usuario };
