const { HttpError } = require('../../utils/httpError');

/**
 * Settings por defecto (si la tabla no existe)
 */
const DEFAULT_SETTINGS = {
  idSetting: 1,
  brandName: 'EQUIPAMIENTO EDUCATIVO Y DE INGENIERÍA',
  brandEmail: 'servicios@tecnoequip.com.bo',
  brandPhone: '(4)4292937',
  brandPhone2: '70769521',
  brandAddress: 'Av. Circunvalación entre Vaticano y C.F. Pérez Saavedra',
  brandWebsite: 'www.jdblab.com.bo',
  brandTagline: '',
};

/**
 * Obtener configuración de brand (crear si no existe)
 */
async function getSettings() {
  try {
    let { prisma } = require('../../db/prisma');
    
    if (!prisma) {
      // Fallback si prisma no está disponible
      return DEFAULT_SETTINGS;
    }

    let settings = await prisma.settings.findUnique({
      where: { idSetting: 1 },
    });

    // Si no existe, crear con valores por defecto
    if (!settings) {
      settings = await prisma.settings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return settings;
  } catch (err) {
    // Si hay error (tabla no existe, etc), devolver defaults
    return DEFAULT_SETTINGS;
  }
}

/**
 * Actualizar configuración de brand
 */
async function updateSettings(data) {
  try {
    let { prisma } = require('../../db/prisma');
    
    if (!prisma) return data; // Fallback

    const settings = await prisma.settings.update({
      where: { idSetting: 1 },
      data,
    });

    return settings;
  } catch (err) {
    // Si falla (tabla no existe), simplemente retornar los datos
    return { ...DEFAULT_SETTINGS, ...data };
  }
}

/**
 * Convertir settings a formato compatibke con PDF
 */
function settingsToBrand(settings) {
  return {
    brandName: settings.brandName,
    brandTagline: settings.brandTagline,
    brandEmail: settings.brandEmail,
    brandPhone: settings.brandPhone,
    brandPhone2: settings.brandPhone2,
    brandAddress: settings.brandAddress,
    brandWebsite: settings.brandWebsite,
  };
}

module.exports = {
  getSettings,
  updateSettings,
  settingsToBrand,
};
