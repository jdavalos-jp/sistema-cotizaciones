/**
 * Configuración del tema de Ant Design v5
 * Todos los componentes usan automáticamente estos tokens
 */

export const antTheme = {
  token: {
    // Colores primarios
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',

    // Secundario/Accent
    colorPrimaryText: '#aa3bff',
    colorLink: '#1890ff',
    colorLinkHover: '#40a9ff',
    colorLinkActive: '#096dd9',

    // Bordes y fondos
    colorBorder: '#e5e4e7',
    colorBgBase: '#ffffff',
    colorBgContainer: '#fafafa',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // Textos
    colorText: '#6b6375',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',
    colorTextDisabled: '#d9d9d9',
    colorTextHeading: '#08060d',

    // Espaciado
    marginXS: 8,
    marginSM: 12,
    marginMD: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,

    // Tamaños de fuente
    fontSize: 16,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeSM: 14,
    fontSizeXS: 12,

    // Pesos de fuente
    fontWeightStrong: 600,

    // Bordes redondeados
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Sombras
    boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // Alturas de componentes
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,

    // Transiciones
    motionUnit: 0.1,
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },

  components: {
    // Configuración por componente
    Button: {
      controlHeight: 35,
      fontWeight: 450,
      borderRadiusLG: 8,
    },
    Card: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      boxShadowSecondary: '0 3px 6px rgba(0, 0, 0, 0.08)',
    },
    Input: {
      controlHeight: 40,
      borderRadiusLG: 6,
    },
    Select: {
      controlHeight: 40,
      borderRadiusLG: 6,
    },
    DatePicker: {
      controlHeight: 40,
      borderRadiusLG: 6,
    },
    Table: {
      borderRadiusLG: 8,
    },
    Modal: {
      borderRadiusLG: 8,
      boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    },
  },
}

export default antTheme
