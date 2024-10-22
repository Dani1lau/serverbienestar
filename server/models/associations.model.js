import {Usuario} from './usuario.model.js';
import {Capacitador} from './capacitador.model.js';
import{ Instructor} from './instructor.model.js';

function defineAssociations() {
  Usuario.hasOne(Capacitador, {
    foreignKey: 'id_Usua1FK',
    sourceKey: 'id_Usua',
  });

  Capacitador.belongsTo(Usuario, {
    foreignKey: 'id_Usua1FK',
    targetKey: 'id_Usua',
  });

  Usuario.hasOne(Instructor, {
    foreignKey: 'id_Usua3FK',
    sourceKey: 'id_Usua',
  });

  Instructor.belongsTo(Usuario, {
    foreignKey: 'id_Usua3FK',
    targetKey: 'id_Usua',
  });
}

// Llama a la función para definir las asociaciones
defineAssociations();

module.exports = defineAssociations;
